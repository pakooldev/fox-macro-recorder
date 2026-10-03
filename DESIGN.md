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
6. **One light theme.** Cream panel, white cards/inputs, black text (an earlier dark navy theme was hard to read). The hard black outline and drop shadow separate the panel from both light and dark pages. Colors are semantic tokens, so a dark variant could be added later without touching components.

---

## 2. Tokens

All tokens are CSS custom properties declared on `:host` at the top of `getFoxStyles()` in `content/styles.js`, the only stylesheet.

### 2.1 Palette

The PICO-8 16-color palette. Its orange/brown/peach/cream give the fox; red, blue and green map directly onto record, play and success.

| Token | Hex | Role |
|---|---|---|
| `--px-black` | `#000000` | Primary text, outline of every box, hard shadows |
| `--px-navy` | `#1D2B53` | Bevel shade on blue buttons; the sprite prompts' backdrop |
| `--px-plum` | `#7E2553` | Bevel shade on red (record/danger) elements |
| `--px-pine` | `#008751` | Bevel shade on green elements |
| `--px-brown` | `#AB5236` | Links, inspector tag, settings icons (orange on cream is only 1.9:1); bevel shade on orange |
| `--px-stone` | `#5F574F` | Secondary text and labels (6.4:1 on cream), rules, scrollbar thumb, bevel shade on neutral buttons |
| `--px-silver` | `#C2C3C7` | Neutral button fill, inset/bevel shade on light surfaces, disabled border |
| `--px-cream` | `#FFF1E8` | Panel / toast background |
| `--px-red` | `#FF004D` | Record, REC indicator, delete/danger, error |
| `--px-orange` | `#FFA300` | Brand/fox, primary action, active tab, focus |
| `--px-yellow` | `#FFEC27` | Warning, "paused between loops" |
| `--px-green` | `#00E436` | Success, toggle "on" |
| `--px-blue` | `#29ADFF` | Play, playback indicator, info |
| `--px-lavender` | `#83769C` | Input placeholders only |
| `--px-pink` | `#FF77A8` | Reserved (mascot blush only) |
| `--px-peach` | `#FFCCAA` | Delete-confirm card fill, FAB bevel |

Semantic aliases (components use these, not raw colors):

```css
--px-white: #FFFFFF;                  /* the one non-PICO-8 UI color */
--fox-bg: var(--px-cream);            /* panel body */
--fox-surface: var(--px-white);       /* cards, inputs, lists, status strip */
--fox-bevel-hi: var(--px-white);      --fox-bevel-lo: var(--px-silver);
--fox-line: var(--px-stone);          /* rules, grips, scrollbar thumb */
--fox-text: var(--px-black);          --fox-text-2: var(--px-stone);
--fox-placeholder: var(--px-lavender);
--fox-link: var(--px-brown);
```

Accent fills (record red, play blue, save green, brand orange) are used directly by the button rules.

**Sprite colors.** The mascot/logo sprites use the PICO-8 accents (black, plum, cream, red, yellow, green, blue, pink) plus 12 fur shades extracted from the generated art (oranges, peaches, rust, browns, e.g. `#FD8D02`, `#FCC39A`, `#BB4624`, `#5C3E32`). PICO-8's own orange `#FFA300` turned the fox yellow, so sprites keep the deeper orange. These are sprite-only; UI elements never use them. The exact list is printed by `python3 assets/clean.py`.

Contrast rules: text is black or stone on cream/white. Text and icons *on* a colored fill (orange, red, green, blue, yellow) are `--px-black`. Never use orange, red, green, yellow or blue as text on the light background (all below 4.5:1): links use brown, "REC" is black next to a red dot, toast icons sit on a colored square. Check any new pairing reaches 4.5:1. Minimum pixel-font size is 14px.

### 2.2 Typography

| Token | Value | Used for |
|---|---|---|
| `--fox-font-pixel` | `'FoxPixel', var(--fox-font-ui)` | Panel title, tab labels, button labels, section labels, status strip, counters, coordinates, toasts |
| `--fox-font-ui` | `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans Thai', sans-serif` | Macro names, domains, recorded element text, input values |
| `--fox-font-mono` | `ui-monospace, 'SF Mono', Consolas, monospace` | Element tag/id in the inspector, selectors |

`FoxPixel` is **Tiny5** (OFL), bundled in `assets/fonts/tiny5.woff2`. (Pixelify Sans was used first, but its C/O, 5/S and 2/Z are indistinguishable at UI sizes; the 2026-10-03 review read "500" as "S00".) It is never loaded from Google Fonts at runtime (page CSPs block it and it would leak page visits). It is registered under the private family name `FoxPixel` so it can't collide with a page's fonts.

Scale (px): `14` small (section labels uppercase with +1px letter-spacing, buttons, card meta, counters, toasts) · `16` body · `20` title and inspector coordinates. Tiny5 has a single weight: `font-synthesis: none`, never a faux bold. Pixel-font text is uppercase for section labels and title case for buttons. Number inputs use the system font with tabular figures.

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
    inset 2px 2px 0 var(--hi, var(--fox-bevel-hi)),  /* top-left bevel */
    inset -2px -2px 0 var(--lo, var(--fox-bevel-lo)), /* bottom-right bevel */
    4px 4px 0 var(--px-black);                       /* hard drop shadow */
}
/* Inset: inputs, selects, lists, status strip */
.px-inset {
  background: var(--fox-surface);
  border: 2px solid var(--px-black);
  box-shadow: inset 2px 2px 0 var(--fox-bevel-lo);
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

`@media (prefers-reduced-motion: reduce)`: every animation and transition is off; live states stay visible as static styles (red outline while recording, blue border on the playing card, REC dot shown), things just appear.

**Motion set** (all in the Motion block at the end of `content/styles.js`; entrances use `@starting-style`, so no JS waits on them):

| What | Motion |
|---|---|
| Main panel open / close | drops in from -12px / lifts out, 120ms steps(3) (`display` transitions with `allow-discrete`) |
| Edit / Inspector open | drop in from -8px, 120ms steps(3) |
| Tab switch | content slides in from +8px, 80ms steps(2) |
| FAB | pops up 8px when it appears, hops 2px on hover; the fox shows its `success` frame for 1s after a playback finishes while minimized |
| Status strip | drops in 4px, 80ms steps(2); the REC counter bumps 2px on each click |
| New macro card | drops in 8px (120ms steps(3)) then its border flashes orange (320ms); only cards that are new, not on every re-render or filter change |
| Delete | confirm card shakes once (160ms); the deleted card slides 16px right and disappears (120ms) before the list updates |
| Recording / playing | red outline around the compact panel and the FAB, blinking 1s steps(1); the playing card's blue border blinks 0.8s |
| Toasts | slide 8px out from behind the panel edge, 120ms steps(3), no fade; errors shake once |
| Buttons | press sinks 2px (existing) |

Positioning code always reads layout boxes (`layoutRect`: `offsetLeft/Top`), never transformed ones, so a panel that is still animating is never placed 12px off.

**Speed rule (user decision 2026-10-03):** every transition is at most 160ms, and no animation ever blocks input: the user can click the next thing immediately. No countdown/progress animations for waits that the user didn't start (e.g. the 5s delete auto-cancel has no visible countdown).

---

## 3. Components

States every interactive element needs: default, hover, pressed, focus-visible, disabled.

- **Hover:** neutral fills go one step lighter (silver → cream); colored fills (orange, red, blue, green) keep their color and get a 2px cream inner outline instead.
- **Pressed:** `transform: translate(2px, 2px)` and drop shadow `0 0 0` — the button "sinks" into its shadow.
- **Focus-visible:** `outline: 2px dashed var(--px-orange); outline-offset: 2px`.
- **Disabled:** flat — panel-colored fill, silver border and icon, no bevel or drop shadow, `cursor: not-allowed`.

### 3.1 Panel (`#fox-panel`)

Raised box, cream fill, 6px shadow. Fixed top-right as today, draggable by the header.

- **Header (title bar):** 40px, orange fill with brown bottom bevel, black text. Left: `assets/sprites/logo.png` at 1× (32px) + "FOX" in pixel 16px. Center: tabs. Right: minimal-mode, minimize, close as 32px icon buttons (black icons on orange, no box until hover).
- **Tabs:** Home / Inspector / Settings as 32px icon buttons. Active tab = cream fill (the panel body color) with a black icon, so it "connects" to the body like a game menu tab.
- **Minimal mode:** only the header + control bar; the macro select is fixed at 200px so long names don't stretch the panel.

### 3.2 Control bar

`[● REC] [■ STOP] [ macro select ▾ ] [▶ PLAY]`

- Record: red fill, black icon, plum bevel. While recording: disabled look but the icon blinks (`REC blink`).
- Stop: neutral silver fill. Enabled while recording *or* playing (current behavior).
- Play: blue fill. While playing it becomes Stop (same slot, silver fill, stop icon).
- Select: inset box, black text in the UI font, pixel chevron icon on the right (native `<select>` kept for accessibility, `appearance: none`).

### 3.3 Status strip

Inset bar under the control bar, only visible while recording/playing.
- Recording: 8px square red dot (blinking) + `REC` (black) in pixel font + click counter on the right.
- Playing: blue square dot + `PLAY` + `LOOP 2/3 · STEP 4/10` (just `STEP 4/10` for one loop); during a loop delay `LOOP 3/3 IN 4s`, counting down. While playing, the Play slot is the Stop button and the control-bar Stop is disabled (it stops recordings).

### 3.4 Save bar

Appears after a recording stops. Two inset inputs (name, domain), a silver "Discard" and a green "Save" button (black text, pine bevel). Enter saves. While it is open, Record refuses to start (toast: save or discard first), so a recording is never lost silently; stopping with no clicks shows "Nothing recorded".

### 3.5 Domain filter + macro list

- Filter: inset select, full width. Defaults to the current site (`(this site)` in its option) when it has macros, otherwise `All domains`; choosing `All domains` lists every macro so one can be played on any site. The play dropdown follows the filter.
- Group header: pixel 14px uppercase stone text with a 2px stone rule to the right (`── EXAMPLE.COM ──────`).
- **Macro card:** white fill, black border, 2px drop shadow.
  - Row 1: name (UI font, 14px, black, ellipsis) + meta `5 · 3.2s` (pixel 13px, stone).
  - Row 2: actions Play (blue) / Edit (silver) / Delete (silver, red on hover) as 32px icon buttons; loop count and loop delay as small inset number inputs, each with a 24px icon (repeat, clock) instead of today's emoji.
  - Playing card: border turns blue and its Play button shows Stop.
  - **Delete confirm:** `DELETE THIS MACRO?` on its own line, then the name (ellipsis) beside Cancel / Delete; peach fill with a red border, black text, text `DELETE "name"?`, buttons CANCEL (silver) / DELETE (red). Auto-cancels after 5s (current behavior).
- **Empty state:** sleeping mascot (2×, `.fox-mascot-2x`) centered, `NO MACROS YET` in pixel 14px, hint `Press ● to record` in stone (`--fox-text-2`).

### 3.6 Settings tab

Three cards, each a little game window: white body, black 2px border, 2px drop shadow, and a silver title strip (icon + pixel 14px uppercase title, stone bottom bevel).

- **Playback** (shuffle icon): "Random delay" (pixel 16px) with the switch on the right; a one-line hint in the UI font (stone, 13px) saying what it does; `MIN [ ] MAX [ ] ms` underneath. While the switch is off, min/max are disabled and drawn in silver. Toggling shows no toast (the switch is the feedback) and keeps focus on the switch.
- **Macros** (archive icon): a hint, then "Export all" (download icon; saves `fox-macros-YYYY-MM-DD.json`) and "Import…" (upload icon; file picker). The result is a toast ("Imported 3 macros (1 already here)"); after an import the domain filter switches to All domains, since imported macros are often for other sites.
- **Shortcut** (keyboard icon): "Show / hide panel" with the current binding as keycaps (`<kbd>`: white, 2px border, 4px bottom edge; `Alt` `Shift` `F` or `⌥` `⇧` `F`), "Not set" if Chrome didn't assign it, and a "Change shortcut" button that asks `background.js` to open `chrome://extensions/shortcuts` (pages can't link to chrome:// URLs).
- **About**: the idle mascot (1×) beside "Fox Macro Recorder", an orange version chip, "N macros saved · M sites" (refreshed whenever the tab opens), and a yellow raised "Buy me a coffee" button.
- **Toggle switch:** a `<button role="switch" aria-checked>` (keyboard: Tab + Space): 36×20 white inset track, 12×12 square knob; off = stone knob on the left, on = green track + white knob with black outline on the right; moves with `--fox-step-fast`.

### 3.7 Edit panel (`#fox-edit-panel`)

Same raised box as the panel, title bar in **silver** (black text) so it's visibly a secondary window. Title `EDIT: name`. Body: name/domain inputs, section label `ACTIONS (n)`, then an inset scrolling list:

`[01] Button text…   x [ 412] , y [ 230]   +[ 350]ms`

Step number in a 24px orange square (black pixel digits). Resize grips: 12×12 stepped-triangle drawn with CSS (three stacked 4px squares) in the two bottom corners.

### 3.8 Inspector panel (`#fox-inspector-panel`)

Silver title bar like the edit panel, crosshair icon. Below the readout, a note says page clicks are captured as snapshots and don't reach the page while it is open. Live readout in an inset box: coordinates in pixel 16px (`412, 230`), element as `<button>#save` in the mono font. Snapshot list rows: index square, coordinates, time; CLEAR button.

### 3.9 FAB (`#fox-fab`)

Shown while the panel is minimized, appearing at the panel's top-right corner (the fox "shrinks into" where the panel was). Hiding the panel (icon/shortcut) while recording or playing minimizes it instead, so the REC/PLAY state stays visible. 68px raised square (orange fill), mascot sprite at 1× (58px frame). The mascot's pose is the state indicator:
- idle → `idle` loop (blink), recording → `record` loop + red outline, playing → `play` loop + blue outline.
Draggable from anywhere on it.

### 3.10 Toast

Docked to the main panel, where the user is looking (not the page): same width, hanging 6px under its bottom edge; if there is no room, above its top edge; if the panel is as tall as the window, inside its bottom edge (8px inset). While minimized it sits by the FAB; with nothing visible, top centre. Cream fill, black text, border colour by type (green success / blue info / red error), 24px black icon on a square of the type colour + pixel 14px message (ellipsis). Slides 8px out from behind the panel edge in 120ms steps(3); no fading. `role="status"` (`alert` for errors).

### 3.11 Click feedback (drawn on the page, outside the shadow root)

Pure CSS, no assets:
- **Recording:** a 12px red square that expands to 36px as a 2px hollow square ring in 4 steps and disappears (`240ms steps(4)`).
- **Playback:** same ring in blue, plus four 4px "spark" squares that fly out diagonally 16px in 4 steps, and a `2px dashed` blue box drawn over the target element for 500ms. The box is Fox's own overlay clipped to the viewport; the page element's style is never touched (changing it could leave the outline stuck when one element was hit twice within 500ms).

### 3.12 Scrollbars

Inside the panel (`::-webkit-scrollbar`): 10px wide, silver track, stone square thumb with a white top-left bevel, no arrows.

### 3.13 Toolbar icon (no popup)

Clicking the icon, or pressing the shortcut (`Alt+Shift+F`, `Option+Shift+F` on Mac; `_execute_action` in the manifest, user-changeable at `chrome://extensions/shortcuts`), toggles the panel on the current tab (`background.js`). The close button's tooltip shows the shortcut. On pages extensions can't touch (`chrome://`, the Web Store) the icon gets a `!` badge and the tooltip "Fox can't run on this page", scoped to that tab. The coffee link lives in Settings → About. The mascot `error` frame is kept in the sheet for a future error state but is unused for now.

### 3.14 Positioning and stacking

- All floating parts are `position: fixed` inside the shadow host and are kept inside the **visible** viewport: `document.documentElement.clientWidth/Height` (which excludes page scrollbars; `innerWidth` does not) with a 6px margin so the hard shadow is never cut (`moveTo` / `clampIntoView` in `content/utils.js`). They are re-clamped on window resize, after the panel changes size (recording mode, minimal mode, tab switch) and after restoring from the FAB.
- The Inspector and the Edit panel open **next to the main panel** (`placeBesideMain`): to its left with a 12px gap, else to its right, else overlapping it at +24px. When one is already open, the second cascades 24px down and away from the main panel.
- Stacking: panels share the shadow host's stacking context; the one last pressed is raised (`bringToFront`). Toasts and the FAB stay on top.
- The click that ends a drag is swallowed wherever it lands, so dropping the panel never presses a button or records a page click.
- Esc (while focus is inside Fox) closes the Edit panel, then the Inspector. The Inspector tab shows a pressed state while the Inspector is open.

---

## 4. Iconography

UI icons come from **Pixelarticons** (MIT, 24×24 pixel grid) — an existing, consistent set, so they are downloaded, not AI-generated. Rendered only at 24px (native) as inline SVG with `fill: currentColor`, so color follows the token. Mapping and the download list are in `assets/ASSETS.md`. No emoji anywhere in the UI after the refactor.

Brand/mascot art (toolbar icon, mascot sprites, store promo art) is custom pixel art — see `assets/ASSETS.md`.

---

## 5. Implementation notes

- **Where things live:** tokens + all component CSS in `content/styles.js` (`:host`); inline SVG icon strings in `content/icons.js` (`icon('play')` returns `html`-safe markup; generated from `assets/icons-src/`); sprite and font files in `assets/`. Mascot sizes use `--f` (one frame on screen: 58px, or 116px with `.fox-mascot-2x`), so the same state classes and keyframes work at both scales.
- **Fonts inside Shadow DOM:** `@font-face` inside a shadow root is ignored by Chrome. Register the font on the document from the content script: `fetch(chrome.runtime.getURL('assets/fonts/tiny5.woff2'))` → `new FontFace('FoxPixel', buffer)` → `document.fonts.add(...)`. Loading from bytes also avoids the page's CSP `font-src`.
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
