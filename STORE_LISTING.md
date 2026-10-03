# Chrome Web Store listing (v3.0.0, new developer account)

Copy-paste source for the store dashboard. Images: `assets/store/` (see the end).

## Store listing

**Name** (from manifest): Fox Macro Recorder

**Summary** (manifest `description`, max 132 chars):
> Create and run browser macros to automate repetitive web tasks.

**Category:** Productivity → Tools (Workflow & planning if asked for a sub-category)

**Language:** English

**Description:**

```
Record your clicks once. Let the fox replay them.

Fox Macro Recorder automates repetitive clicking on any web page. Open the little pixel panel, press Record, click through your task, press Stop, and save it as a macro. Play it back whenever you need, as many times as you want.

FORMERLY "FOX AUTO CLICKER"
This is the new home of Fox Auto Clicker, renamed and redesigned. Move your macros from the old extension in a minute: https://fox-macro.pakool.com/moved/

WHAT IT DOES
• Record clicks, with the timing between them
• Replay once or loop up to 999 times, with a pause between loops
• Random delay: adds a small random wait between clicks
• Macros sorted by website; this site's macros come first
• Edit a macro: its name, site, each click's position and the delay before it
• Element inspector: see an element's tag, id and position
• Export all macros to a file and import them on another computer
• Opens with the toolbar icon or Alt+Shift+F (Option+Shift+F on Mac)

PRIVATE BY DESIGN
• No account, no servers, no analytics
• Macros are stored in your browser only
• Fox has no access to a page until you open it there

GOOD TO KNOW
• Fox records clicks only (no typing, scrolling or dragging yet)
• Clicks replay at the same spot in the window: keep the same scroll, zoom and window size as when you recorded
• Chrome's own pages (chrome://, the Web Store) can't run extensions

Try it on the playground: https://fox-macro.pakool.com/playground/
```

**Homepage URL:** https://fox-macro.pakool.com/

**Support URL:** (leave empty: the store's own Support tab is the contact, see PRIVACY_POLICY.md)

## Privacy practices tab

**Single purpose:**
> Record and replay mouse click sequences on web pages to automate repetitive clicking tasks.

**Permission justifications:**
- `storage`: Saves the user's recorded macros and settings locally in the browser (chrome.storage.local). Nothing is sent anywhere.
- `activeTab`: When the user clicks the toolbar icon or presses the shortcut, Fox gets access to that one tab so it can show its panel there and record or replay clicks. No access to any other tab or site.
- `scripting`: Injects the Fox panel into the active tab, only at the moment the user opens Fox there. Nothing is injected on page load.

**Remote code:** No, I am not using remote code. (All scripts are in the package; no external scripts, fonts or styles are loaded.)

**Data usage:** check nothing (no data collected). Certify the three statements (not sold, not used for unrelated purposes, not used for creditworthiness).

**Privacy policy URL:** https://fox-macro.pakool.com/privacy/

## Images

| Store field | File |
|---|---|
| Icon 128×128 | `icons/icon128.png` (also inside the zip) |
| Screenshots 1280×800 (upload in this order) | `assets/store/screenshots/1-record.png`, `2-play.png`, `3-macros.png`, `4-settings.png` |
| Small promo tile 440×280 | `assets/store/promo-small-440x280-title.png` |
| Marquee promo tile 1400×560 | `assets/store/promo-marquee-1400x560-title.png` |

Rebuild screenshots and titled tiles: `cd website && npm run build && node scripts/store-shots.mjs`.

## Package

`./package.sh` → `dist/fox-macro-recorder-3.0.0.zip` (runtime files only).
