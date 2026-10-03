# 🦊 Fox Macro Recorder

> Cleverly record and replay your clicks like a sly fox - automate repetitive tasks with precision!

[![Version](https://img.shields.io/badge/version-2.0.0-blue?style=for-the-badge)](https://github.com/panat54083/fox-macro-recorder)
[![Vibe Coding Project](https://img.shields.io/badge/vibe-coding%20project-ff69b4?style=for-the-badge)](https://github.com/panat54083/fox-macro-recorder)

**Note:** This is a vibe coding project - built for fun, experimentation, and learning! While it's fully functional, it was created with a focus on exploring ideas and enjoying the development process. 🎨✨

---

## 📋 Table of Contents
- [What's New](#-whats-new-in-v200)
- [Single Purpose](#single-purpose)
- [What is Fox Macro Recorder?](#what-is-fox-macro-recorder)
- [Complete Features List](#complete-features-list) ⭐ **60+ Features**
- [Why Install?](#why-should-you-install-fox-macro-recorder)
- [Installation](#installation)
- [How to Use](#how-to-use)
- [Tips & Tricks](#tips--tricks)
- [Technical Details](#technical-details)
- [Privacy & Chrome Web Store](#chrome-web-store-submission)
- [Support](#support)

---

## 🆕 What's New in v2.0.0

- **🌐 Domain-Based Macro Organization**: Macros now store a domain field (auto-detected from current page), grouped by domain in the macro list with a filter dropdown
- **🔲 Minimal Mode**: Toggle button to show only the control bar (record, stop, select, play) for a compact footprint
- **↔️ Edit Panel Resize**: Dual corner grips (bottom-left and bottom-right) with correct anchoring for intuitive resizing
- **🪟 Floating Panel Architecture**: Edit and inspector panels are now standalone draggable floating panels
- **⏺️ Recording Mode**: Minimal panel during recording showing only status and stop button
- **🧹 Streamlined UI**: Removed export/import features, cleaned up dead code

## Single Purpose

**Record and replay mouse click sequences on web pages to automate repetitive clicking tasks.**

This extension has one clear purpose: to help users save time by recording their click actions and playing them back automatically, eliminating the need to manually repeat the same clicks over and over.

## What is Fox Macro Recorder?

Fox Macro Recorder is a Chrome extension that helps you automate repetitive clicking tasks on websites. Like a clever fox, it watches and learns your actions, then replays them exactly when you need them.

### What Can It Do?

In short: **Record → Save → Replay → Automate!**

- **📹 Record** - Capture click sequences with coordinates, timing, and element info
- **▶️ Replay** - Play back clicks with original timing or custom loops
- **💾 Manage** - Save, edit, delete macros with domain grouping and filtering
- **🎯 Visualize** - See ripple effects, highlights, and progress during playback
- **⚙️ Configure** - Random delays, loop counts, timing adjustments
- **🔍 Inspect** - Real-time coordinate tracking and element inspection
- **✏️ Edit** - Fine-tune positions, delays, and domain in a resizable floating panel
- **🔒 Privacy** - 100% local storage, no servers, no tracking

**See the [Complete Features List](#complete-features-list) below for 60+ detailed features organized by category.**

<details open>
<summary><b>📊 Features Overview (Click to expand/collapse)</b></summary>

| Category | Features |
|----------|----------|
| 📹 **Recording** | Click capture, coordinate tracking, timing preservation, element detection, visual feedback |
| ▶️ **Playback** | Accurate replay, visual effects, progress tracking, stop/resume, element highlighting |
| 🔄 **Automation** | Multi-loop playback, loop delays, random delays, pause controls |
| 💾 **Management** | Save/load/delete, domain grouping, domain filtering, local storage, metadata tracking |
| ✏️ **Editing** | Position adjustment, timing editor, domain editing, resizable floating panel |
| 🔍 **Inspector** | Real-time tracking, element info, snapshot capture, history |
| ⚙️ **Settings** | Random delays, min/max range, persistent config |
| 🎨 **Interface** | Draggable panels, minimal mode, collapsible, mini-bar, status indicators |
| 🛡️ **Privacy** | 100% local, no tracking, no servers, open source |
| 🔧 **Technical** | Manifest V3, pure JS, modular, cross-browser, JSON format |

**Total: 60+ Features** | See detailed list below ↓
</details>

### Why Should You Install Fox Macro Recorder?

**Save Time on Repetitive Tasks**
- Filling out similar forms repeatedly
- Testing website functionality with the same click sequences
- Navigating through multi-step processes
- Performing repetitive data entry tasks

**Perfect for:**
- 🧪 **QA Testers**: Automate repetitive test cases and click sequences
- 💼 **Office Workers**: Speed up repetitive web-based workflows
- 🎓 **Students**: Automate repetitive online tasks
- 👨‍💻 **Developers**: Test user interactions and UI flows quickly
- 🎮 **Power Users**: Anyone who does the same clicks over and over

**Key Benefits:**
- ✅ No coding required - just click and record
- ✅ Works on any website
- ✅ Hidden by default - won't clutter your screen
- ✅ Precise coordinate-based clicking for accuracy
- ✅ Preserves original timing between clicks
- ✅ Lightweight and fast

## Installation

### From Source

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `fox-macro-recorder` folder
6. The Fox Macro Recorder icon will appear in your extensions

### Required Files

Make sure these icon files exist in the `icons/` folder:
- `icon16.png` (16x16px)
- `icon48.png` (48x48px)
- `icon128.png` (128x128px)

## How to Use

### Recording a Macro

1. Click the Fox Macro Recorder extension icon, or press `Alt+Shift+F` (`Option+Shift+F` on Mac): the control panel opens on the page (do it again to hide it)
2. Click the **Record** button
3. Perform your click actions on the webpage
4. Click **Stop** when finished
5. Enter a name for your macro, adjust the domain if needed, and click **Save**

### Playing Back a Macro

1. Open the Fox Macro Recorder panel
2. Find your saved macro in the list
3. Click the **Play** button
4. Watch as your clicks are replayed with visual effects
5. Click **Stop** to interrupt playback if needed

### Managing Macros

- **Domain Filter**: Use the domain dropdown to filter macros by website
- **Edit**: Click the edit button to adjust name, domain, positions, and timing
- **Delete**: Remove macros you no longer need

### Panel Controls

- **Show/Hide Panel**: Click the extension icon or press `Alt+Shift+F` / `Option+Shift+F` (change it at `chrome://extensions/shortcuts`) (pages like `chrome://` show a `!` badge: extensions can't run there)
- **Drag to Move**: Click and drag any panel header to reposition it
- **Minimal Mode**: Click ▪ button to toggle compact control-bar-only mode
- **Settings Button**: Access random delay and other settings via ⚙️ button
- **Inspector Tool**: Use 🔍 button to inspect coordinates and element details
- **Collapse Panel**: Minimize the main panel to save screen space
- **Status Indicator**: See real-time status (Ready, Recording, Playing)

### Advanced Features

#### Settings Panel (v1.1.0+)
Access via the ⚙️ button in the main panel:
- **Random Delay**: Enable natural-looking delays between clicks
- **Min/Max Range**: Configure random delay range (milliseconds)
- **Help Text**: Built-in explanations for each setting

#### Loop Controls
- **Loop Count**: Run macros multiple times automatically
- **Loop Delay**: Add delays between loop iterations
- **Progress Tracking**: See current loop and click number during playback

#### Macro Editor
- **Edit Names**: Rename your macros
- **Edit Domain**: Change the domain a macro is grouped under
- **Adjust Timing**: Change delays between individual clicks
- **Edit Coordinates**: Fine-tune X/Y positions
- **Resizable Panel**: Drag bottom corner grips to resize the edit panel

#### Position Inspector
- **Real-time Tracking**: See coordinates as you move your mouse
- **Element Info**: View tag names, IDs, classes, and text content
- **Save Snapshots**: Click to save positions for reference
- **Snapshot History**: Review all saved positions with timestamps

## Complete Features List

### 📹 Recording Features
- **Click Recording** - Captures every mouse click with pixel-perfect accuracy
- **Coordinate Tracking** - Records exact X/Y coordinates for precise replay
- **Element Detection** - Captures element information (tag, text, selector) for context
- **Timing Preservation** - Records exact delays between each click
- **Visual Feedback** - Real-time ripple effects during recording to confirm captured clicks
- **Smart Filtering** - Automatically ignores clicks on the extension panel itself

### ▶️ Playback Features
- **Accurate Replay** - Plays back clicks with original timing and coordinates
- **Visual Effects** - Animated ripple effects, glowing dots, and element highlights during playback
- **Progress Tracking** - Real-time status showing current click number and loop iteration
- **Stop/Resume Control** - Interrupt playback at any time with the stop button
- **Auto-Focus** - Automatically clicks on detected elements at recorded coordinates
- **Element Highlighting** - Visual outline shows which element is being clicked

### 🔄 Loop & Automation
- **Multi-Loop Playback** - Repeat macros 1-999+ times automatically
- **Loop Delays** - Configure delays between loop iterations (milliseconds)
- **Random Delays** - Add natural variation with configurable min/max random delays
- **Progress Display** - Shows current loop count and click progress (e.g., "3/10 · 5/12")
- **Pause Between Loops** - Optional delays between iterations for rate limiting

### 💾 Macro Management
- **Save Macros** - Store unlimited macros with custom names and domain tags
- **Domain Grouping** - Macros automatically grouped by website domain
- **Domain Filter** - Dropdown to show only macros from a selected domain
- **Load Macros** - Quick access to all saved macros from dropdown (with domain label)
- **Delete Macros** - Remove unwanted macros with confirmation prompt
- **Local Storage** - All macros stored securely in browser (no cloud/server)
- **Macro Metadata** - Tracks creation date, click count, and macro details

### ✏️ Advanced Editing
- **Macro Name Editor** - Rename macros for better organization
- **Domain Editor** - Change the domain a macro is associated with
- **Position Adjustment** - Fine-tune X/Y coordinates for each click
- **Timing Editor** - Modify delays between individual clicks
- **Action Inspector** - View all click details in a scrollable list
- **Resizable Edit Panel** - Dual corner grips for intuitive panel resizing

### 🔍 Position Inspector Tool
- **Real-Time Tracking** - Live X/Y coordinates as you move your mouse
- **Element Information** - Displays tag name, ID, classes, and text content
- **Snapshot Capture** - Click to save specific positions for reference
- **Snapshot History** - Review all saved positions with timestamps
- **Element Preview** - Shows element details under cursor
- **Toggle On/Off** - Activate/deactivate with inspector button

### ⚙️ Settings & Configuration
- **Random Delay Toggle** - Enable/disable random delays for natural playback
- **Min/Max Delay Range** - Configure random delay bounds (0-10000ms)
- **Settings Panel** - Dedicated floating panel for all configurations
- **Persistent Settings** - Settings saved across browser sessions
- **Instant Apply** - Changes take effect immediately without reload

### 🎨 User Interface
- **Floating Control Panel** - Non-intrusive overlay that stays on top
- **Draggable Panels** - Move any panel by dragging the header
- **Minimal Mode** - Toggle to show only control bar for compact operation
- **Collapsible Design** - Minimize to compact mini-bar to save screen space
- **Mini Control Bar** - Quick access to record/play/stop when collapsed
- **Status Indicators** - Color-coded status dots (gray=ready, red=recording, blue=playing)
- **Multiple Panels** - Main panel, edit panel, inspector panel, settings panel
- **Hide by Default** - Nothing appears on a page until you click the extension icon
- **Gradient Headers** - Beautiful purple gradient design
- **Responsive Layout** - Adapts to different screen sizes

### 🎯 Smart Controls
- **Quick Select Dropdown** - Choose macros from mini-bar dropdown (when collapsed)
- **One-Click Play** - Play selected macro directly from mini-bar
- **Stop During Playback** - Interrupt running macros instantly
- **Keyboard Shortcuts** - Enter key submits in save dialog
- **Button State Management** - Buttons disable/enable based on current state
- **Auto-Expand** - Panel expands automatically when saving a recording

### 🛡️ Privacy & Security
- **100% Local Storage** - No cloud servers or external connections
- **No Data Collection** - Zero tracking, analytics, or telemetry
- **No External Scripts** - All code self-contained in extension
- **Browser-Only Storage** - Uses chrome.storage.local API
- **Minimal Permissions** - `storage`, `activeTab`, `scripting`; no access to any site until you open the panel there
- **Open Source** - All code visible and reviewable
- **No Login Required** - Works completely offline after installation

### 🔧 Technical Features
- **Manifest V3** - Latest Chrome extension standard
- **Pure JavaScript** - No external dependencies or frameworks
- **Modular Architecture** - Organized into separate modules (recording, playback, panels, macros)
- **Event-Driven** - Efficient event handling for clicks and UI interactions
- **Cross-Browser Compatible** - Works on Chrome and Firefox
- **JSON Format** - Simple, readable export/import format
- **Coordinate-Based** - Uses screen coordinates (not DOM selectors) for accuracy
- **Element Detection** - Falls back to elementFromPoint for reliability

### 📊 Visual Feedback
- **Recording Indicator** - Pulsing red dot shows active recording
- **Playback Indicator** - Pulsing blue dot shows active playback
- **Click Ripples** - Animated circles at each click location
- **Glowing Dots** - Persistent markers at click coordinates
- **"CLICK" Labels** - Text labels for maximum visibility
- **Element Outlines** - Blue border highlights clicked elements
- **Status Text Updates** - Real-time text status in panel
- **Progress Counters** - Shows X/Y click and loop/total loop

### 🌐 Domain Organization
- **Auto-Detection** - Domain auto-filled from current page when saving
- **Editable Domain** - Change domain in save bar or edit panel
- **Grouped List** - Macros visually grouped under domain headers
- **Filter Dropdown** - Show only macros for a specific domain
- **Ungrouped Section** - Macros without a domain appear under "Ungrouped"
- **Backward Compatible** - Existing macros work without a domain field

## Tips & Tricks

**🦊 Clever Fox Tip**: Make sure the page layout stays the same between recording and playback for best results. If the page scrolls or elements move, coordinates may not match.

**🎯 Accuracy**: For best accuracy, record at the same browser zoom level you'll use for playback.

**⏱️ Timing**: If a website is slow, the original timing might not be enough. Re-record during slower conditions for better results.

**📦 Organize**: Use descriptive names and domains for your macros. The domain is auto-detected, but you can edit it to group macros however you like.

## Technical Details

- **Manifest Version**: 3 (Latest Chrome Extension standard)
- **Permissions**: `storage` (save macros), `activeTab` + `scripting` (inject the panel into the current tab when you click the extension icon)
- **Works On**: All URLs (you choose where to use it)
- **Storage**: Chrome local storage API

## File Structure

```
fox-macro-recorder/
├── manifest.json          # Extension configuration
├── content/               # Injected into the current tab on demand
│   ├── main.js            # Entry point: shared state, shadow root, renderMode()
│   ├── store.js           # The only code touching chrome.storage
│   ├── utils.js           # html`` escaping, dragging, selectors, click feedback
│   ├── icons.js           # Inline pixel SVG icons
│   ├── styles.js          # "Pixel Fox" CSS (see DESIGN.md)
│   ├── recording.js       # Recording logic
│   ├── playback.js        # Playback logic
│   ├── macros.js          # Macro list + CRUD
│   ├── panels/            # main, edit, inspector, settings
│   └── components/        # fab, toast
├── background.js          # Icon click toggles the panel; injects content/ (file list lives here)
├── tests/                 # node --test tests/*.test.mjs
├── assets/                # Font, sprites, icon sources, store art (see assets/ASSETS.md)
├── DESIGN.md              # Design system
└── icons/
    ├── icon16.png        # Extension icons
    ├── icon48.png
    └── icon128.png
```

## Version

**Current Version**: 2.0.0

### Version History
- **v2.0.0** (2026-02-07): Domain-based macro organization, minimal mode, edit panel resize, floating panels, UI streamlining
- **v1.1.0** (2026-01-28): Settings panel, UI improvements, code refactoring
- **v1.0.0** (2026-01): Initial release

## Chrome Web Store Submission

### Single Purpose Statement
**Record and replay mouse click sequences on web pages to automate repetitive clicking tasks.**

### Privacy & Permissions Justification

**Permissions Requested:**
1. **`storage`** - Required to save user-recorded macros locally in the browser's storage. Users can create, save, and manage multiple macros that persist across browser sessions.

2. **`activeTab` + `scripting`** - When the user clicks the extension icon, the recorder panel is injected into that one tab so they can record and replay clicks there. Nothing is injected into any page until the user does this, and the extension has no standing access to any website.

**Privacy Guarantees:**
- ✅ All data stored locally in browser (chrome.storage.local)
- ✅ No external servers or network connections
- ✅ No data collection, tracking, or analytics
- ✅ No user data sharing or transmission
- ✅ Nothing runs on a page until the user clicks the extension icon

**Remote Code:**
- ❌ **NO remote code used** - All code is packaged within the extension
- ❌ No external scripts loaded from CDNs or remote servers
- ❌ No code execution from external sources
- ✅ Completely self-contained and reviewable

### Privacy Policy

**Required:** Chrome Web Store requires a publicly accessible privacy policy URL.

**Privacy Policy Location:** See [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for the full privacy policy.

**For Chrome Web Store Submission:**
You need to host this privacy policy at a publicly accessible URL. Options:
1. **GitHub (Recommended):** If your repository is public, use:
   ```
   https://github.com/YOUR_USERNAME/fox-macro-recorder/blob/main/PRIVACY_POLICY.md
   ```
2. **GitHub Pages:** Host it as a webpage
3. **Your Website:** Upload to your personal/company website
4. **Google Docs:** Create a public Google Doc with the privacy policy

**Key Points:**
- ✅ We only store data locally (no transmission)
- ✅ No personal information collected
- ✅ No third-party services or analytics
- ✅ Users have full control over their data

### Recommended Categories
- Primary: Productivity
- Secondary: Developer Tools

### Keywords
macro, automation, click recorder, task automation, productivity, testing, QA, workflow

## License

This project is open source and available for personal and commercial use.

## Support

For issues, suggestions, or contributions, please create an issue in the repository.

### ☕ Support This Project

If you find Fox Macro Recorder helpful, consider buying me a coffee! Your support helps keep this project maintained and improved.

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/panat.siriwong)

---

**🦊 Happy automating, clever fox!**
