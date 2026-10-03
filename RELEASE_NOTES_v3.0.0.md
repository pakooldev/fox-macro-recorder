# Release Notes - Version 3.0.0

Fox Auto Clicker is now **Fox Macro Recorder**, published as a new Chrome Web Store listing. Moving from the old one: https://fox-macro.pakool.com/moved/

## What's New

### New look: "Pixel Fox"
- Light pixel-art theme (cream panel, hard pixel borders), Tiny5 pixel font, pixel icon set
- An animated fox mascot shows what Fox is doing (idle, recording, playing, done, error, asleep)
- Short stepped animations that never make you wait; all motion off under "reduce motion"

### Opening Fox
- Clicking the toolbar icon shows or hides the panel on the current page (no popup)
- Keyboard shortcut **Alt+Shift+F** (Option+Shift+F on Mac), changeable in Settings
- On Chrome's own pages, where Fox can't run, the icon shows a "!" instead of failing silently

### Macros
- **Export and import are back** (Settings → Macros): one JSON file with all macros; also reads files from older versions
- The domain filter starts on the current site, with an "All domains" option for macros that work across sites
- Macros stay in sync between open tabs

### Safer recording and playback
- An unsaved recording is never thrown away: save it or press Discard first
- Navigating away mid-recording or mid-playback cancels it and tells you why on the next open
- Stop also cuts short the wait between loops
- Playback shows loop and step progress; dragging the panel is never recorded as a click

### Privacy and security
- Nothing is injected into any page until you open Fox there (`activeTab` + `scripting`, no access to all sites)
- Text recorded from web pages is always shown as text, never as markup

## Known limits
- Clicks only (no typing, scrolling or dragging)
- Clicks replay at the recorded window position: keep the same scroll, zoom and window size
