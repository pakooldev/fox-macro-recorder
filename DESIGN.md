# Fox Macro — Design System ("Pixel Fox")

Single source of truth for how every Fox surface looks: the in-page panel (and its edit/inspector panels, FAB, toasts, click feedback), the toolbar icon and the store listing. There is no extension popup: clicking the toolbar icon toggles the panel. The current indigo/rounded "SaaS" look in `content/styles.js` is replaced wholesale by this.

Assets this design needs (sprites, icon set, font) are listed with generation prompts in [`assets/ASSETS.md`](assets/ASSETS.md).

---

## 1. Concept

A tiny 16-bit game UI that floats over any web page, with a pixel fox as the mascot whose pose tells you what the extension is doing (idle, recording, playing, done, error, sleeping).

Principles, in priority order:

1. **Readable first, retro second.** Pixel styling goes on the *chrome* (frames, buttons, labels, numbers, mascot). Anything the user or the page wrote — macro names, domains, recorded element text, element ids — is set in the system font, because pixel fonts have no Thai glyphs and are hard to read in long strings.
2. **Whole-pixel scaling only.** UI chrome uses a 2px art pixel: borders, shadows and offsets are multiples of 2px. Sprites are shown at exactly 1× or 2× (`image-rendering: pixelated`), never at fractional scales. The mascot and logo are detailed enough (58px / 32px frames) to be shown at 1× in small spots.
3. **Hard edges only.** No `border-radius`, no blur in shadows, no gradients, no transparency in surfaces. Depth = hard offset shadows + bevel lines.
4. **Limited palette.** UI uses only the 16 colors in §2.1. No tints, no alpha (except the `focus` outline and the disabled state). Sprites add their own fur ramp (§2.1, "Sprite colors").
5. **Motion moves in steps.** Animations use `steps()`, not easing curves, and are short. `prefers-reduced-motion` turns off loops (state changes still swap the sprite frame).
6. **One theme.** The panel floats over arbitrary light and dark pages, so it has one dark theme with a hard black outline that separates it from any background. No light mode.

---

## 2. Tokens

All tokens are CSS custom properties declared on `:host` at the top of `getFoxStyles()` in `content/styles.js`, the only stylesheet.

### 2.1 Palette

The PICO-8 16-color palette. Its orange/brown/peach/cream give the fox; red, blue and green map directly onto record, play and success.

| Token | Hex | Role |
|---|---|---|
| `--px-black` | `#000000` | Outer outline of every box, hard shadows, inset (input) backgrounds |
| `--px-navy` | `#1D2B53` | Panel / toast background |
| `--px-plum` | `#7E2553` | Bevel shade on red (record/danger) elements |
| `--px-pine` | `#008751` | Bevel shade on green elements |
| `--px-brown` | `#AB5236` | Fox shading; bevel shade on orange elements |
| `--px-stone` | `#5F574F` | Disabled fill, bevel shade on neutral buttons |
| `--px-silver` | `#C2C3C7` | Secondary text, neutral button fill |
| `--px-cream` | `#FFF1E8` | Primary text, bevel highlight |
| `--px-red` | `#FF004D` | Record, REC indicator, delete/danger, error |
| `--px-orange` | `#FFA300` | Brand/fox, primary action, active tab, focus |
| `--px-yellow` | `#FFEC27` | Warning, "paused between loops" |
| `--px-green` | `#00E436` | Success, toggle "on" |
| `--px-blue` | `#29ADFF` | Play, playback indicator, info |
| `--px-lavender` | `#83769C` | Card borders, dividers, muted text (non-essential only) |
| `--px-pink` | `#FF77A8` | Reserved (mascot blush only) |
| `--px-peach` | `#FFCCAA` | Fox muzzle; hover fill on cream elements |

Semantic aliases (components use these, not raw colors):

```css
--fox-bg: var(--px-navy);        --fox-text: var(--px-cream);
--fox-inset: var(--px-black);    --fox-text-2: var(--px-silver);
--fox-line: var(--px-lavender);  --fox-text-muted: var(--px-lavender);
--fox-brand: var(--px-orange);   --fox-brand-shade: var(--px-brown);
--fox-rec: var(--px-red);        --fox-rec-shade: var(--px-plum);
--fox-play: var(--px-blue);      --fox-ok: var(--px-green);
--fox-warn: var(--px-yellow);    --fox-disabled: var(--px-stone);
```

**Sprite colors.** The mascot/logo sprites use the PICO-8 accents (black, plum, cream, red, yellow, green, blue, pink) plus 12 fur shades extracted from the generated art (oranges, peaches, rust, browns, e.g. `#FD8D02`, `#FCC39A`, `#BB4624`, `#5C3E32`). PICO-8's own orange `#FFA300` turned the fox yellow, so sprites keep the deeper orange. These are sprite-only; UI elements never use them. The exact list is printed by `python3 assets/clean.py`.

Contrast rules: body text is cream or silver on navy/black. Text *on* a colored button (orange, red, green, blue, yellow) is `--px-black`, never cream. Lavender text is only for non-essential hints; check any new pairing reaches 4.5:1 for text.

### 2.2 Typography

| Token | Value | Used for |
|---|---|---|
| `--fox-font-pixel` | `'FoxPixel', var(--fox-font-ui)` | Panel title, tab labels, button labels, section labels, status strip, counters, coordinates, toasts |
| `--fox-font-ui` | `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans Thai', sans-serif` | Macro names, domains, recorded element text, input values |
| `--fox-font-mono` | `ui-monospace, 'SF Mono', Consolas, monospace` | Element tag/id in the inspector, selectors |

`FoxPixel` is **Pixelify Sans** (OFL), bundled in `assets/fonts/` — never loaded from Google Fonts at runtime (page CSPs block it and it would leak page visits). It is registered under the private family name `FoxPixel` so it can't collide with a page's fonts.

Scale (px): `10` micro (section labels, uppercase, +1px letter-spacing) · `12` small (card meta, counters) · `14` body · `16` title. Pixel-font text is uppercase for labels and title-case for buttons.

### 2.3 Spacing, sizing, borders, shadows

- Spacing unit `4px`; use `4 / 8 / 12 / 16 / 24`.
- Control sizes: main control bar buttons `40px`, icon buttons and card actions `32px`, icons `24px`, inputs `32px` tall.
- Panel width `360px` (min `280px`), edit panel `340px`.
- `--fox-radius: 0` everywhere.

Two box recipes cover everything:

```css
/* Raised: panels, buttons, cards, toasts */
.px-raised {
  background: var(--fill, var(--fox-bg));
  border: 2px solid var(--px-black);
  box-shadow:
    inset 2px 2px 0 var(--hi, var(--px-cream)),      /* top-left bevel */
    inset -2px -2px 0 var(--lo, var(--px-stone)),    /* bottom-right bevel */
    4px 4px 0 var(--px-black);                       /* hard drop shadow */
}
/* Inset: inputs, selects, lists, status strip */
.px-inset {
  background: var(--fox-inset);
  border: 2px solid var(--px-black);
  box-shadow: inset 2px 2px 0 var(--px-stone);
}
```

Floating panels use a `6px 6px 0` drop shadow; buttons `2px 2px 0`. Corners stay square (no notched corners: `clip-path` would clip the hard shadow).

### 2.4 Motion

| Token | Value |
|---|---|
| `--fox-step-fast` | `80ms steps(2)` — button press, toggle |
| `--fox-step` | `160ms steps(4)` — panel open/close, toast in/out |
| Sprite loop | 2–4 frames, `steps(N)` over `N × 150ms`–`N × 300ms` |
| REC blink | dot visible/hidden, `1s steps(2) infinite` |

`@media (prefers-reduced-motion: reduce)`: no infinite animations, no panel/toast slide (just appear).

---

## 3. Components

States every interactive element needs: default, hover, pressed, focus-visible, disabled.

- **Hover:** neutral fills go one step lighter (silver → cream); colored fills (orange, red, blue, green) keep their color and get a 2px cream inner outline instead.
- **Pressed:** `transform: translate(2px, 2px)` and drop shadow `0 0 0` — the button "sinks" into its shadow.
- **Focus-visible:** `outline: 2px dashed var(--px-orange); outline-offset: 2px`.
- **Disabled:** fill `--fox-disabled`, icon/text `--px-silver`, no drop shadow, `cursor: not-allowed`.

### 3.1 Panel (`#fox-panel`)

Raised box, navy fill, 6px shadow. Fixed top-right as today, draggable by the header.

- **Header (title bar):** 40px, orange fill with brown bottom bevel, black text. Left: `assets/sprites/logo.png` at 1× (32px) + "FOX" in pixel 16px. Center: tabs. Right: minimal-mode, minimize, close as 32px icon buttons (black icons on orange, no box until hover).
- **Tabs:** Home / Inspector / Settings as 32px icon buttons. Active tab = navy fill with cream icon and the header's bottom bevel removed under it (it "connects" to the body, like a game menu tab).
- **Minimal mode:** only the header + control bar; the macro select is fixed at 200px so long names don't stretch the panel.

### 3.2 Control bar

`[● REC] [■ STOP] [ macro select ▾ ] [▶ PLAY]`

- Record: red fill, black icon, plum bevel. While recording: disabled look but the icon blinks (`REC blink`).
- Stop: neutral silver fill. Enabled while recording *or* playing (current behavior).
- Play: blue fill. While playing it becomes Stop (same slot, silver fill, stop icon).
- Select: inset box, cream text in the UI font, pixel chevron icon on the right (native `<select>` kept for accessibility, `appearance: none`).

### 3.3 Status strip

Inset bar under the control bar, only visible while recording/playing.
- Recording: 8px square red dot (blinking) + `REC` in pixel font + click counter on the right.
- Playing: blue square dot + `PLAY` + progress `2/3 · 4/10`; between loops shows `⏸ 3/5` in yellow.

### 3.4 Save bar

Appears after a recording stops. Two inset inputs (name, domain) and a green "SAVE" button (black text, pine bevel). Enter saves.

### 3.5 Domain filter + macro list

- Filter: inset select, full width, label `ALL DOMAINS`.
- Group header: pixel 10px uppercase lavender text with a 2px lavender rule to the right (`── EXAMPLE.COM ──────`).
- **Macro card:** raised box, navy fill, lavender border instead of black, 2px shadow.
  - Row 1: name (UI font, 14px, cream, ellipsis) + meta `5 clicks · 3.2s` (pixel 12px, silver).
  - Row 2: actions Play (blue) / Edit (silver) / Delete (silver, red on hover) as 32px icon buttons; loop count and loop delay as small inset number inputs, each with a 24px icon (repeat, clock) instead of today's emoji.
  - Playing card: border turns blue and its Play button shows Stop.
  - **Delete confirm:** border and fill switch to red/plum, text `DELETE "name"?`, buttons CANCEL (silver) / DELETE (red). Auto-cancels after 5s (current behavior).
- **Empty state:** sleeping mascot (2×, `.fox-mascot-2x`) centered, `NO MACROS YET` in pixel 12px, hint `Press ● to record` in silver.

### 3.6 Settings tab

- Section label (pixel 10px uppercase lavender).
- **Toggle:** 36×20 inset track, 12×12 square knob; off = stone knob on the left, on = green track fill + cream knob on the right; moves with `--fox-step-fast`.
- Range row: two 64px inset number inputs + `ms`.
- About: version from the manifest in pixel 12px, "Buy me a coffee" as a text link (orange, underline on hover — dotted 2px underline).

### 3.7 Edit panel (`#fox-edit-panel`)

Same raised box as the panel, title bar in **silver** (black text) so it's visibly a secondary window. Title `EDIT: name`. Body: name/domain inputs, section label `ACTIONS (n)`, then an inset scrolling list:

`[01] Button text…   x [ 412] , y [ 230]   +[ 350]ms`

Step number in a 24px orange square (black pixel digits). Resize grips: 12×12 stepped-triangle drawn with CSS (three stacked 4px squares) in the two bottom corners.

### 3.8 Inspector panel (`#fox-inspector-panel`)

Silver title bar like the edit panel, crosshair icon. Live readout in an inset box: coordinates in pixel 16px (`412, 230`), element as `<button>#save` in the mono font. Snapshot list rows: index square, coordinates, time; CLEAR button.

### 3.9 FAB (`#fox-fab`)

Shown while the panel is minimized. 68px raised square (orange fill), mascot sprite at 1× (58px frame). The mascot's pose is the state indicator:
- idle → `idle` loop (blink), recording → `record` loop + red border, playing → `play` loop + blue border.
Draggable as today.

### 3.10 Toast

Bottom-center, raised box, navy fill, border color by type (green success / blue info / red error), 24px icon + pixel 12px message. Slides up 8px in `--fox-step`. (The mascot `success` frame is in the sheet but not used in toasts: at 58px it made the toast too tall.)

### 3.11 Click feedback (drawn on the page, outside the shadow root)

Pure CSS, no assets:
- **Recording:** a 12px red square that expands to 36px as a 2px hollow square ring in 4 steps and disappears (`240ms steps(4)`).
- **Playback:** same ring in blue, plus four 4px "spark" squares that fly out diagonally 16px in 4 steps. The target element gets a `2px dashed var(--px-blue)` outline for 500ms (today: solid 3px blue).

### 3.12 Scrollbars

Inside the panel (`::-webkit-scrollbar`): 10px wide, black track, lavender square thumb with a cream top-left bevel, no arrows.

### 3.13 Toolbar icon (no popup)

Clicking the icon toggles the panel on the current tab (`background.js`). On pages extensions can't touch (`chrome://`, the Web Store) the icon gets a `!` badge and the tooltip "Fox can't run on this page", scoped to that tab. The coffee link lives in Settings → About. The mascot `error` frame is kept in the sheet for a future error state but is unused for now.

---

## 4. Iconography

UI icons come from **Pixelarticons** (MIT, 24×24 pixel grid) — an existing, consistent set, so they are downloaded, not AI-generated. Rendered only at 24px (native) as inline SVG with `fill: currentColor`, so color follows the token. Mapping and the download list are in `assets/ASSETS.md`. No emoji anywhere in the UI after the refactor.

Brand/mascot art (toolbar icon, mascot sprites, store promo art) is custom pixel art — see `assets/ASSETS.md`.

---

## 5. Implementation notes

- **Where things live:** tokens + all component CSS in `content/styles.js` (`:host`); inline SVG icon strings in `content/icons.js` (`icon('play')` returns `html`-safe markup; generated from `assets/icons-src/`); sprite and font files in `assets/`. Mascot sizes use `--f` (one frame on screen: 58px, or 116px with `.fox-mascot-2x`), so the same state classes and keyframes work at both scales.
- **Fonts inside Shadow DOM:** `@font-face` inside a shadow root is ignored by Chrome. Register the font on the document from the content script: `fetch(chrome.runtime.getURL('assets/fonts/pixelify-sans.woff2'))` → `new FontFace('FoxPixel', buffer)` → `document.fonts.add(...)`. Loading from bytes also avoids the page's CSP `font-src`.
- **Sprites on pages with strict CSP:** sprites are CSS backgrounds with `chrome-extension://` URLs inside the shadow root. Verified on github.com (2026-10-03): font and sprites load. If a site ever blocks them, decode the PNG with `fetch` + `createImageBitmap` and draw it to a `<canvas>` (canvas isn't subject to `img-src`).
- **`web_accessible_resources`:** `assets/fonts/*`, `assets/sprites/*`, with `"use_dynamic_url": true` so sites can't probe for the extension by a fixed URL. This adds no install warning.
- **Mascot sheet** `assets/sprites/mascot.png` (232×348): 58×58 frames, 4 columns, one row per state in this order, frames left to right, transparent, shared baseline:

  | Row | State | Frames | y offset |
  |---|---|---|---|
  | 0 | idle | 2 | 0 |
  | 1 | record | 2 | 58 |
  | 2 | play | 4 | 116 |
  | 3 | success | 1 | 174 |
  | 4 | error | 1 | 232 |
  | 5 | sleep | 2 | 290 |

  Animate with `background-position-x` from `0` to `-58N px` using `steps(N)`; at 2× use `background-size: 464px 696px` and double the offsets.
- **Other built assets:** `assets/sprites/logo.png` (32×32 head), `icons/icon16|48|128.png` (manifest/store), `assets/store/promo-small-440x280.png`, `assets/store/promo-marquee-1400x560.png`. All are rebuilt from `assets/raw/` by `python3 assets/clean.py`.
- **Keep the existing class names/ids** where possible (`#fox-panel`, `.fox-macro-card`, `#fox-record-btn`, …) so `content/*.js` and the e2e checks don't change; this is a CSS + markup-icon swap, not a logic rewrite.
