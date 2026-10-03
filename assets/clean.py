"""Turn AI "fake pixel art" from assets/raw/ into real pixel art.

    python3 assets/clean.py            # build everything
    python3 assets/clean.py --check    # self-check of the grid detector

For each raw image: find the pixel grid the AI painted on (it drifts a little, so
the grid lines are taken from the image's own edges, not assumed uniform), take
one color per cell, snap it to the PICO-8 palette, make the navy background
transparent, then cut frames and pack sprite sheets / icons.
Needs numpy + Pillow. Not shipped in the extension zip.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent
RAW = ROOT / 'raw'

PALETTE = np.array([
    (0x00, 0x00, 0x00), (0x1D, 0x2B, 0x53), (0x7E, 0x25, 0x53), (0x00, 0x87, 0x51),
    (0xAB, 0x52, 0x36), (0x5F, 0x57, 0x4F), (0xC2, 0xC3, 0xC7), (0xFF, 0xF1, 0xE8),
    (0xFF, 0x00, 0x4D), (0xFF, 0xA3, 0x00), (0xFF, 0xEC, 0x27), (0x00, 0xE4, 0x36),
    (0x29, 0xAD, 0xFF), (0x83, 0x76, 0x9C), (0xFF, 0x77, 0xA8), (0xFF, 0xCC, 0xAA),
], dtype=float)
NAVY = 1  # backdrop color in the prompts (PICO-8 navy)


# ---------------------------------------------------------------- grid detection

def edge_profile(img, axis):
    """Sum of color change between neighbouring columns (axis=1) or rows (axis=0)."""
    d = np.abs(np.diff(img.astype(float), axis=axis)).sum(axis=2)
    return d.sum(axis=0 if axis == 1 else 1)


def estimate_pitch(profile, lo=6, hi=90):
    """Cell size: the smallest lag whose autocorrelation is near the strongest peak
    (multiples of the true pitch score just as high, so take the first one)."""
    p = profile - profile.mean()
    ac = np.correlate(p, p, 'full')[len(p) - 1:]
    lags = np.arange(lo, min(hi, len(ac) - 1))
    vals = ac[lags]
    # local maxima only
    peaks = [i for i in range(1, len(lags) - 1) if vals[i] >= vals[i - 1] and vals[i] >= vals[i + 1]]
    best = max(vals[i] for i in peaks)
    first = next(i for i in peaks if vals[i] >= 0.8 * best)
    # refine to sub-pixel with a parabola through the peak
    i = first
    y0, y1, y2 = vals[i - 1], vals[i], vals[i + 1]
    denom = y0 - 2 * y1 + y2
    return lags[i] + (0.5 * (y0 - y2) / denom if denom else 0)


def grid_lines(profile, pitch):
    """Cell boundaries: strong edges, with gaps filled at the estimated pitch."""
    n = len(profile)
    thr = np.percentile(profile, 75)
    cand = [i for i in range(1, n - 1)
            if profile[i] > thr and profile[i] >= profile[i - 1] and profile[i] >= profile[i + 1]]
    # keep the strongest edge inside each half-pitch window
    picked = []
    for i in sorted(cand, key=lambda i: -profile[i]):
        if all(abs(i - j) > 0.6 * pitch for j in picked):
            picked.append(i)
    picked = sorted(picked)
    if not picked:
        return list(np.arange(0, n, pitch)) + [n]
    lines = []
    pts = [picked[0] - pitch * round(picked[0] / pitch)] + picked + [n]
    for a, b in zip(pts, pts[1:]):
        k = max(1, round((b - a) / pitch))
        lines += [a + (b - a) * j / k for j in range(k)]
    lines = [max(0, min(n + 1, round(x + 1))) for x in lines]  # diff index i = edge between i and i+1
    # drop slivers: lines closer than half a cell to the previous one (or to the image ends)
    out = [0]
    for x in lines:
        if x - out[-1] >= 0.5 * pitch and n + 1 - x >= 0.5 * pitch:
            out.append(x)
    return out + [n + 1]


def to_cells(img):
    """Downsample to one pixel per painted cell (median color of the cell's middle)."""
    py = estimate_pitch(edge_profile(img, 0))
    px = estimate_pitch(edge_profile(img, 1))
    ys = sorted(set(grid_lines(edge_profile(img, 0), py)))
    xs = sorted(set(grid_lines(edge_profile(img, 1), px)))
    out = np.zeros((len(ys) - 1, len(xs) - 1, 3))
    for r, (y0, y1) in enumerate(zip(ys, ys[1:])):
        for c, (x0, x1) in enumerate(zip(xs, xs[1:])):
            my, mx = max(1, (y1 - y0) // 4), max(1, (x1 - x0) // 4)
            cell = img[y0 + my:max(y0 + my + 1, y1 - my), x0 + mx:max(x0 + mx + 1, x1 - mx)]
            out[r, c] = np.median(cell.reshape(-1, 3), axis=0)
    return out, (px, py)


def is_background(cells):
    """Cells close to the navy backdrop the prompts asked for."""
    return np.abs(cells - PALETTE[NAVY]).sum(-1) < 60


def snap(cells, palette):
    """Nearest palette index per cell (weighted RGB distance)."""
    w = np.array([0.30, 0.59, 0.11]) ** 0.5
    d = (((cells[..., None, :] - palette) * w) ** 2).sum(-1)
    return d.argmin(-1)


# PICO-8 colors the sprites use as small accents (record ball, sparkles, speed lines,
# outline, highlights). Always kept: they are too rare to survive color extraction.
ACCENTS = PALETTE[[0, 2, 7, 8, 10, 11, 12, 14]]


def shared_palette(cell_sets, n=12):
    """One palette for every sprite, so all frames use exactly the same colors:
    the fixed accents + n colors extracted from the remaining (fur) cells.
    Index 0 is reserved for transparent."""
    fg = np.concatenate([c[~is_background(c)] for c in cell_sets])
    near_accent = (np.abs(fg[:, None, :] - ACCENTS).sum(-1) < 60).any(1)
    fur = fg[~near_accent].astype(np.uint8)
    q = Image.fromarray(fur[None, :, :], 'RGB').quantize(colors=n, method=Image.Quantize.MEDIANCUT, kmeans=4)
    fur_pal = np.array(q.getpalette()[:n * 3], dtype=float).reshape(n, 3)
    return np.vstack([[0, 0, 0], ACCENTS, fur_pal])


def index(cells, palette):
    """Palette index per cell, 0 = transparent background."""
    idx = snap(cells, palette[1:]) + 1
    idx[is_background(cells)] = 0
    return idx


def to_rgba(idx, palette):
    rgba = np.zeros(idx.shape + (4,), dtype=np.uint8)
    rgba[..., :3] = palette[idx]
    rgba[..., 3] = np.where(idx == 0, 0, 255)
    return rgba


def load_cells(name):
    img = np.asarray(Image.open(RAW / f'{name}.png').convert('RGB'))
    return to_cells(img)


# ---------------------------------------------------------------- frames

def bbox(mask):
    ys, xs = np.nonzero(mask)
    return ys.min(), ys.max() + 1, xs.min(), xs.max() + 1


def split_frames(idx, n):
    """Cut a horizontal strip into n frames at the n-1 widest empty column gaps."""
    if n == 1:
        y0, y1, x0, x1 = bbox(idx != 0)
        return [idx[y0:y1, x0:x1]]
    used = (idx != 0).any(axis=0)
    gaps, start = [], None
    for x, u in enumerate(used):
        if not u and start is None:
            start = x
        if u and start is not None:
            gaps.append((x - start, start, x))
            start = None
    inner = [g for g in gaps if g[1] > 0]  # ignore the left margin
    cuts = sorted((s + e) // 2 for _, s, e in sorted(inner, reverse=True)[:n - 1])
    frames = []
    for a, b in zip([0] + cuts, cuts + [idx.shape[1]]):
        part = idx[:, a:b]
        y0, y1, x0, x1 = bbox(part != 0)
        frames.append(part[y0:y1, x0:x1])
    return frames


def ink_floating_cream(frame, palette, max_cells=40):
    """Small detached cream specks (the sleeping "z"s) vanish on the light panel:
    redraw them in black. The fox's own cream fur is attached to the body, so it stays."""
    # light, low-saturation colors (cream/peach); excludes yellow sparkles and the red ball
    cream = {i for i, c in enumerate(palette) if i and c.min() > 140 and c.max() - c.min() < 110}
    black = int(np.abs(palette[1:]).sum(1).argmin()) + 1
    seen = np.zeros(frame.shape, bool)
    h, w = frame.shape
    for y0 in range(h):
        for x0 in range(w):
            if frame[y0, x0] == 0 or seen[y0, x0]:
                continue
            comp, stack = [], [(y0, x0)]
            seen[y0, x0] = True
            while stack:
                y, x = stack.pop()
                comp.append((y, x))
                for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                    if 0 <= ny < h and 0 <= nx < w and frame[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        stack.append((ny, nx))
            # mostly cream: edge cells of a letter can snap to a blended darker shade
            if len(comp) <= max_cells and sum(frame[c] in cream for c in comp) * 2 >= len(comp):
                for c in comp:
                    frame[c] = black
    return frame


def place(frame, w, h, align='bottom'):
    """Center frame horizontally in a w×h canvas, bottom-aligned (shared baseline)."""
    out = np.zeros((h, w), dtype=int)
    fh, fw = frame.shape
    x = (w - fw) // 2
    y = h - fh if align == 'bottom' else (h - fh) // 2
    out[y:y + fh, x:x + fw] = frame
    return out


def save(idx, palette, path, scale=1):
    im = Image.fromarray(to_rgba(idx, palette), 'RGBA')
    if scale != 1:
        im = im.resize((im.width * scale, im.height * scale), Image.Resampling.NEAREST)
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, optimize=True)
    return im


# ---------------------------------------------------------------- build

WEB_NIGHT = [0x12, 0x29, 0x65]  # website --web-night (sampled from the marquee sky)
MASCOT = [('idle', 2), ('record', 2), ('play', 4), ('success', 1), ('error', 1), ('sleep', 2)]
OUT = ROOT / 'sprites'
ICONS = ROOT.parent / 'icons'


def build():
    names = [f'mascot-{s}' for s, _ in MASCOT] + ['icon-16', 'icon-32']
    cells = {n: load_cells(n)[0] for n in names}
    palette = shared_palette(cells.values())

    # Mascot sheet: one row per state, frames left to right, shared frame size + baseline
    rows = [split_frames(index(cells[f'mascot-{s}'], palette), n) for s, n in MASCOT]
    fw = max(f.shape[1] for r in rows for f in r)
    fh = max(f.shape[0] for r in rows for f in r)
    fw, fh = fw + fw % 2, fh + fh % 2  # even, so a 0.5× preview stays on-grid
    cols = max(n for _, n in MASCOT)
    sheet = np.zeros((fh * len(rows), fw * cols), dtype=int)
    for r, frames in enumerate(rows):
        for c, f in enumerate(frames):
            sheet[r * fh:(r + 1) * fh, c * fw:(c + 1) * fw] = place(ink_floating_cream(f, palette), fw, fh)
    save(sheet, palette, OUT / 'mascot.png')

    # Logo (header/popup, shown 1×) from the simpler head; toolbar 16px from the same art
    head = split_frames(index(cells['icon-16'], palette), 1)[0]
    side = max(head.shape) + max(head.shape) % 2
    logo = save(place(head, side, side, 'center'), palette, OUT / 'logo.png')
    small = logo.resize((16, 16), Image.Resampling.BOX)
    small_idx = index(np.asarray(small.convert('RGB'), dtype=float), palette)
    small_idx[np.asarray(small)[..., 3] < 128] = 0
    save(small_idx, palette, ICONS / 'icon16.png')

    # Detailed head: 48px at 1×, store icon = 2× (96px) centered in 128 with 16px padding
    detail = split_frames(index(cells['icon-32'], palette), 1)[0]
    d48 = save(place(detail, 48, 48, 'center') if max(detail.shape) <= 48 else detail, palette, ICONS / 'icon48.png')
    if d48.size != (48, 48):
        d48 = d48.resize((48, 48), Image.Resampling.NEAREST)
        d48.save(ICONS / 'icon48.png')
    store = Image.new('RGBA', (128, 128))
    store.paste(d48.resize((96, 96), Image.Resampling.NEAREST), (16, 16))
    store.save(ICONS / 'icon128.png', optimize=True)

    # Store promo art: not palette-snapped (scene colors), just resized to the exact store sizes
    for raw, out, size in [('promo-small', 'promo-small-440x280.png', (440, 280)),
                           ('promo-marquee', 'promo-marquee-1400x560.png', (1400, 560))]:
        Image.open(RAW / f'{raw}.png').convert('RGB').resize(size, Image.Resampling.LANCZOS).save(ROOT / 'store' / out)

    # Website art (ASSETS.md W1): a night-sky scene shown like the landing hero, so the
    # navy backdrop stays (the dark-blue cursors on the cards would vanish with it);
    # it is flattened to the hero's --web-night and the empty sky cropped to 4 cells
    if (RAW / 'web-moving.png').exists():
        scene = load_cells('web-moving')[0]
        sky = is_background(scene)
        q = Image.fromarray(scene[~sky].astype(np.uint8)[None], 'RGB').quantize(colors=32, method=Image.Quantize.MEDIANCUT, kmeans=4)
        scene_pal = np.vstack([WEB_NIGHT, np.array(q.getpalette()[:96], dtype=float).reshape(32, 3)])
        idx = snap(scene, scene_pal[1:]) + 1
        idx[sky] = 0
        y0, y1, x0, x1 = bbox(idx != 0)
        y0, x0 = max(0, y0 - 4), max(0, x0 - 4)
        y1, x1 = min(idx.shape[0], y1 + 4), min(idx.shape[1], x1 + 4)
        im = Image.fromarray(scene_pal[idx[y0:y1, x0:x1]].astype(np.uint8), 'RGB')
        (ROOT / 'web').mkdir(exist_ok=True)
        im.save(ROOT / 'web' / 'moving.png', optimize=True)
        print(f'web/moving.png: {im.width}x{im.height}')

    print(f'mascot.png: frames {fw}x{fh}, {cols} columns, rows', ', '.join(f'{s}({n})' for s, n in MASCOT))
    print(f'logo.png: {side}x{side}; detail head {detail.shape[1]}x{detail.shape[0]}')
    print('palette:', ' '.join('#%02X%02X%02X' % tuple(int(v) for v in c) for c in palette[1:]))


# ---------------------------------------------------------------- self-check

def self_check():
    """A known 13×9 grid, painted at an uneven ~23.4px pitch with noise, must come back exact."""
    rng = np.random.default_rng(1)
    truth = rng.integers(0, 16, (9, 13))
    truth[0, :] = truth[-1, :] = NAVY
    edges_x = np.round(np.cumsum([0] + [23.4 + rng.normal(0, 0.6) for _ in range(13)])).astype(int)
    edges_y = np.round(np.cumsum([0] + [23.4 + rng.normal(0, 0.6) for _ in range(9)])).astype(int)
    img = np.zeros((edges_y[-1], edges_x[-1], 3))
    for r in range(9):
        for c in range(13):
            img[edges_y[r]:edges_y[r + 1], edges_x[c]:edges_x[c + 1]] = PALETTE[truth[r, c]]
    img = np.clip(img + rng.normal(0, 6, img.shape), 0, 255).astype(np.uint8)
    cells, _ = to_cells(img)
    got = snap(cells, PALETTE)
    assert got.shape == truth.shape, (got.shape, truth.shape)
    assert (got == truth).mean() > 0.97, (got == truth).mean()
    print('self-check ok', got.shape, f'{(got == truth).mean():.0%} cells exact')


if __name__ == '__main__':
    if '--check' in sys.argv:
        self_check()
        sys.exit()
    build()
