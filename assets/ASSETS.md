# Fox Macro — Asset list

What [`DESIGN.md`](../DESIGN.md) needs that can't be written as CSS/code. Three kinds:

| Kind | Who makes it | Items |
|---|---|---|
| **Generate** | Another AI (prompts below) → raw PNGs (done) | App icon, mascot sprites, store promo tile |
| **Download** | Existing free assets (done) | Pixelify Sans font, Pixelarticons icon set |
| **Capture** | Us, after the refactor | Store screenshots |

Everything else in the design (borders, shadows, toggle, click feedback, resize grips, scrollbars, dots) is pure CSS — no asset.

## Status (2026-10-03): all generated and cleaned

Raw images are in `assets/raw/` (git-ignored). `python3 assets/clean.py` rebuilds everything below from them (`--check` runs the grid-detector self-check):

| Output | Size | From |
|---|---|---|
| `assets/sprites/mascot.png` | 232×348, 58×58 frames (layout in DESIGN.md §5) | G2–G7 |
| `assets/sprites/logo.png` | 32×32 | G8 |
| `icons/icon16.png` | 16×16 (box-downscaled from the 32px head) | G8 |
| `icons/icon48.png` | 48×48 | G9 |
| `icons/icon128.png` | 96px art + 16px padding | G9 |
| `assets/store/promo-small-440x280.png` | 440×280 | G10 (resized, not palette-snapped) |
| `assets/store/promo-marquee-1400x560.png` | 1400×560 | G11 (resized, not palette-snapped) |

Differences from the plan below: the AI drew the fox on a ~40–50 cell grid, not 24×24, and the "16×16" icon on ~32. Those native grids were kept (downscaling to 24 would turn the eyes into single pixels), so the mascot frame is 58×58 and the sprites use a fur ramp extracted from the art instead of strict PICO-8 (see DESIGN.md §2.1). Small cream specks floating apart from the fox (the sleeping "z"s) are redrawn in black so they show on the light panel. If a pose is regenerated, drop it into `assets/raw/` with the same name and rerun the script.

---

## How to hand generated images back

AI image models don't produce true pixel art: they paint "fake pixels" at high resolution, off-grid, with extra colors. So:

1. Generate big (the prompts ask for each art pixel to be a large solid square).
2. Drop the raw outputs, unedited, into `assets/raw/` with the file name from the table (e.g. `assets/raw/mascot-idle.png`). Several candidates per item is fine: `mascot-idle-1.png`, `mascot-idle-2.png`.
3. Claude does the cleanup: downscale to the exact grid (nearest neighbor), snap every pixel to the 16-color palette, remove the background, assemble sprite sheets, export the final sizes into `assets/sprites/` and `icons/`.

**Consistency tip:** generate the *character reference* (G1) first, pick the best one, and attach it as a reference image to every other mascot prompt (G2–G7) so the fox looks the same in every pose.

### Shared style block

Paste this at the end of every prompt below:

> Style: authentic 16-bit pixel art sprite, drawn on an exact pixel grid, each art pixel rendered as a large solid square with no anti-aliasing, no blur, no gradients, no soft shading, at most light ordered dithering. Use ONLY these 16 colors (PICO-8 palette): #000000 #1D2B53 #7E2553 #008751 #AB5236 #5F574F #C2C3C7 #FFF1E8 #FF004D #FFA300 #FFEC27 #00E436 #29ADFF #83769C #FF77A8 #FFCCAA. 1-pixel black (#000000) outline around the character. Light from the top-left. Plain flat single-color background (#1D2B53) that can be removed, no scenery, no text, no watermark, no border. Centered, front-facing three-quarter view.

---

## Generate

The fox: orange (#FFA300) fur, brown (#AB5236) shading, cream/peach (#FFF1E8, #FFCCAA) muzzle, chest and tail tip, black eyes and nose, big triangular ears, oversized bushy tail. Cute, chunky, readable at tiny sizes.

| # | File (raw) | Final grid | Final output | Frames |
|---|---|---|---|---|
| G1 | `mascot-reference.png` | 24×24 | (reference only) | 1 |
| G2 | `mascot-idle.png` | 24×24 | `sprites/mascot.png` row | 2 |
| G3 | `mascot-record.png` | 24×24 | 〃 | 2 |
| G4 | `mascot-play.png` | 24×24 | 〃 | 4 |
| G5 | `mascot-success.png` | 24×24 | 〃 | 1 |
| G6 | `mascot-error.png` | 24×24 | 〃 | 1 |
| G7 | `mascot-sleep.png` | 24×24 | 〃 | 2 |
| G8 | `icon-16.png` | 16×16 | `icons/icon16.png`, `icon48.png` (3×), header/popup logo (2×) | 1 |
| G9 | `icon-32.png` | 32×32 | `icons/icon128.png` (3× = 96px art + 16px transparent padding, per Chrome Web Store icon guidelines) | 1 |
| G10 | `promo-small.png` | ~110×70 art | Store small promo tile 440×280 (4×) | 1 |
| G11 | `promo-marquee.png` (optional) | ~350×140 art | Store marquee 1400×560 (4×) | 1 |

Final mascot sheet: `assets/sprites/mascot.png`, 24×24 frames, one row per state in the order above (idle, record, play, success, error, sleep), 4 columns, transparent background.

### G1 — Character reference

> A single pixel art sprite of a small cute fox mascot, full body, sitting, facing the viewer in three-quarter view, on a 24×24 pixel grid shown greatly enlarged (each art pixel is a big square). Orange fur, brown shading, cream muzzle, chest and tail tip, big triangular ears, oversized fluffy tail curled beside it, friendly black dot eyes. Simple, iconic, readable at 24×24. [style block]

### G2 — Idle (2 frames)

> Using the attached fox as the exact character design: a pixel art sprite sheet of 2 frames side by side, each frame a 24×24 pixel grid shown greatly enlarged with equal spacing. Frame 1: the fox sitting calmly, eyes open, tail resting. Frame 2: identical pose but eyes closed in a blink and the tail tip raised by one pixel. Everything else identical between frames. [style block]

### G3 — Recording (2 frames)

> Using the attached fox as the exact character design: a pixel art sprite sheet of 2 frames side by side, each frame a 24×24 pixel grid shown greatly enlarged. The fox sits alert with ears straight up, holding up a small round red (#FF004D) record button with one paw. Frame 1: red button bright with a 1-pixel cream highlight. Frame 2: same pose, the red button darker (#7E2553), ears twitch one pixel. [style block]

### G4 — Playing (4 frames)

> Using the attached fox as the exact character design: a pixel art run cycle of 4 frames side by side, each frame a 24×24 pixel grid shown greatly enlarged, the fox running to the right in side view, tail streaming behind, a small blue (#29ADFF) speed line behind it. Classic 4-frame 16-bit run cycle: contact, down, passing, up. Same size and baseline in every frame. [style block]

### G5 — Success (1 frame)

> Using the attached fox as the exact character design: one 24×24 pixel art sprite shown greatly enlarged. The fox jumping happily with both front paws up, eyes as happy closed arcs (^ ^), two small green (#00E436) and yellow (#FFEC27) sparkle pixels around its head. [style block]

### G6 — Error (1 frame)

> Using the attached fox as the exact character design: one 24×24 pixel art sprite shown greatly enlarged. The fox sitting with ears drooped, dizzy swirl eyes, a small red (#FF004D) exclamation mark above its head. Sad but cute, not scary. [style block]

### G7 — Sleeping (2 frames)

> Using the attached fox as the exact character design: a pixel art sprite sheet of 2 frames side by side, each frame a 24×24 pixel grid shown greatly enlarged. The fox curled up asleep in a ball with its big tail wrapped around it, eyes closed. Frame 1: a small cream "z" floating above-right. Frame 2: the "z" one pixel higher and a second smaller "z" appears, the body rises one pixel as it breathes. [style block]

### G8 — App icon, 16×16

> A 16×16 pixel art app icon shown greatly enlarged: the head of the attached fox, facing forward, filling the whole square, big orange triangular ears touching the top edge, cream muzzle, black eyes and nose, 1-pixel black outline. Must read clearly as a fox at 16×16 in a browser toolbar on both light and dark toolbars. No body, no background details. [style block]

### G9 — App icon, 32×32 (store icon)

> The same fox head icon as the attached 16×16 version, redrawn with more detail on a 32×32 pixel grid shown greatly enlarged: ear inner color (#FFCCAA), cheek fur tufts, a 1-pixel cream eye highlight, brown shading under the ears. Same silhouette and colors as the 16×16 version. [style block]

### G10 — Store small promo tile (440×280)

> A wide pixel art scene, about 110×70 art pixels shown enlarged to 440×280: the attached fox sitting at a tiny retro computer on a desk, pressing the mouse, with blue (#29ADFF) click ripples and a small red (#FF004D) record light on the screen. Night-blue (#1D2B53) background with a few cream star pixels. Keep the LEFT 45% of the image mostly empty background for a title to be added later. No text, no letters, no logos. [style block, but ignore the "plain background / no scenery" part]

### G11 — Store marquee (1400×560, optional)

> Same scene and character as the attached promo tile, extended to a wide 350×140 art-pixel banner shown enlarged to 1400×560: the fox at its retro computer on the right third, a row of macro "cards" floating above the desk like game inventory slots, the left half empty night-blue sky for a title. No text, no letters, no logos. [style block, but ignore the "plain background / no scenery" part]

Titles on G10/G11 are added afterwards with the real font (AI-rendered text is unreliable).

---

## Download — done (2026-10-03)

Both are already in the repo; nothing to do here.

### D1 — Font: Pixelify Sans ✅

- `assets/fonts/pixelify-sans.woff2` (11 KB): variable font (weight 400–700), subset to Latin-1 + common punctuation (`·`, `–`, `—`, curly quotes, `…`), converted from `PixelifySans[wght].ttf` in github.com/google/fonts (`ofl/pixelifysans`) with `fontTools.subset`.
- `assets/fonts/OFL.txt`: SIL Open Font License 1.1, must ship with the font.
- Need more characters later? Re-run the subset from the original TTF with a wider `--unicodes`.

### D2 — Icons: Pixelarticons ✅

- From the `pixelarticons` npm package v2.4.1 (MIT, `assets/icons-src/LICENSE`), 24×24 grid. Only the icons below were copied; `content/icons.js` will inline them, the folder isn't shipped in the extension zip.
- `record.svg` and `stop.svg` are not from the set (it has no filled record dot, and its `stop-solid` has a hole); they were drawn on the same grid.

| Use in the UI | File |
|---|---|
| Home tab | `home.svg` |
| Inspector tab / title | `target.svg` |
| Settings tab | `settings-cog.svg` |
| Record | `record.svg` (drawn) |
| Stop | `stop.svg` (drawn) |
| Play | `play.svg` |
| Edit macro | `pencil.svg` |
| Delete macro | `trash.svg` |
| Loop count | `repeat.svg` |
| Loop delay | `clock.svg` |
| Select chevron | `chevron-down.svg` |
| Save / success toast | `check.svg` |
| Close | `close.svg` |
| Minimize | `minus.svg` |
| Minimal mode toggle | `collapse.svg` |
| Info toast | `info-box.svg` |
| Error toast | `square-alert.svg` |
| Random delay setting | `shuffle.svg` |
| Coffee link | `coffee.svg` |

---

## Capture (after the refactor)

| Item | Size | How |
|---|---|---|
| Store screenshots (1–5) | 1280×800 | Playwright on a demo page: panel with a few macros, recording in progress, playback with ripples, edit panel, popup |

---

## Checklist

- [x] G1 reference picked
- [x] G2–G7 mascot poses → `assets/raw/`
- [x] G8, G9 icons → `assets/raw/`
- [x] G10 promo tile + G11 marquee → `assets/raw/`
- [x] D1 font + OFL.txt → `assets/fonts/`
- [x] D2 icons + LICENSE → `assets/icons-src/`
- [x] Claude: clean up, build `assets/sprites/mascot.png`, `icons/icon16|48|128.png`, promo tiles
- [ ] Capture store screenshots after the refactor
