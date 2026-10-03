// Fox Macro Recorder - "Pixel Fox" styles (see DESIGN.md)
// The only stylesheet: injected into the Shadow DOM, so nothing leaks to or from the page.

function getFoxStyles() {
  const asset = path => `url("${chrome.runtime.getURL(path)}")`;

  return `
    /* ==========================================
       Tokens (DESIGN.md §2)
       ========================================== */
    :host {
      /* PICO-8 palette */
      --px-black: #000000;    --px-navy: #1D2B53;     --px-plum: #7E2553;    --px-pine: #008751;
      --px-brown: #AB5236;    --px-stone: #5F574F;    --px-silver: #C2C3C7;  --px-cream: #FFF1E8;
      --px-red: #FF004D;      --px-orange: #FFA300;   --px-yellow: #FFEC27;  --px-green: #00E436;
      --px-blue: #29ADFF;     --px-lavender: #83769C; --px-pink: #FF77A8;    --px-peach: #FFCCAA;

      --fox-bg: var(--px-navy);
      --fox-inset: var(--px-black);
      --fox-line: var(--px-lavender);
      --fox-text: var(--px-cream);
      --fox-text-2: var(--px-silver);
      --fox-text-muted: var(--px-lavender);

      --fox-font-pixel: 'FoxPixel', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      --fox-font-ui: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans Thai', sans-serif;
      --fox-font-mono: ui-monospace, 'SF Mono', Consolas, monospace;

      --fox-step-fast: 80ms steps(2);
      --fox-step: 160ms steps(4);

      --fox-mascot: ${asset('assets/sprites/mascot.png')};
      --fox-logo: ${asset('assets/sprites/logo.png')};
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    button { font: inherit; color: inherit; background: none; border: none; cursor: pointer; }

    .fox-icon { width: 24px; height: 24px; display: block; flex: none; shape-rendering: crispEdges; }

    /* ==========================================
       Windows: main panel, edit panel, inspector
       ========================================== */
    #fox-panel, #fox-edit-panel, #fox-inspector-panel {
      position: fixed;
      display: flex;
      flex-direction: column;
      max-width: 90vw;
      background: var(--fox-bg);
      color: var(--fox-text);
      border: 2px solid var(--px-black);
      box-shadow: inset 2px 2px 0 var(--px-lavender), inset -2px -2px 0 var(--px-black), 6px 6px 0 var(--px-black);
      font: 14px/1.4 var(--fox-font-pixel);
      z-index: 2147483647;
    }

    #fox-panel { top: 20px; right: 20px; width: 360px; min-width: 280px; max-height: 90vh; }
    #fox-panel.hidden { display: none; }
    #fox-edit-panel { top: 60px; right: 400px; width: 340px; max-height: 80vh; }
    #fox-inspector-panel { top: 60px; left: 20px; width: 300px; max-height: 80vh; }

    /* Title bars */
    .fox-header, .fox-edit-panel-header, .fox-inspector-panel-header {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 40px;
      flex: none;
      padding: 0 4px 0 6px;
      color: var(--px-black);
      cursor: move;
      user-select: none;
    }
    .fox-header { background: var(--px-orange); box-shadow: inset 0 -2px 0 var(--px-brown); }
    .fox-edit-panel-header, .fox-inspector-panel-header { background: var(--px-silver); box-shadow: inset 0 -2px 0 var(--px-stone); }

    .fox-header-left { display: flex; align-items: center; gap: 6px; }
    .fox-logo {
      width: 32px; height: 32px; flex: none;
      background: var(--fox-logo) no-repeat;
      image-rendering: pixelated;
    }
    .fox-title { font-size: 16px; font-weight: 700; letter-spacing: 1px; }

    .fox-edit-panel-title, .fox-inspector-panel-title {
      display: flex; align-items: center; gap: 6px;
      flex: 1; min-width: 0;
      font-size: 14px; font-weight: 700; text-transform: uppercase;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .fox-tabs { display: flex; gap: 2px; margin: 0 auto; }
    .fox-header-actions, .fox-edit-panel-actions { display: flex; align-items: center; gap: 2px; }

    .fox-tab-btn, .fox-icon-btn {
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      color: var(--px-black);
    }
    .fox-tab-btn:hover, .fox-icon-btn:hover { box-shadow: inset 0 0 0 2px var(--px-black); }
    .fox-tab-btn.active { background: var(--fox-bg); color: var(--fox-text); box-shadow: inset 2px 2px 0 var(--px-lavender); }

    /* Tabs */
    .fox-tab-content { display: none; flex: 1; min-height: 0; overflow-y: auto; }
    .fox-tab-content.active { display: flex; flex-direction: column; }

    /* ==========================================
       Buttons (raised) — DESIGN.md §3 states
       ========================================== */
    .fox-ctrl-btn, .fox-action-btn, .fox-save-btn, .fox-edit-save-btn,
    .fox-btn-cancel-delete, .fox-btn-confirm-delete, .fox-snap-clear {
      --fill: var(--px-silver); --hi: var(--px-cream); --lo: var(--px-stone);
      display: flex; align-items: center; justify-content: center; gap: 4px;
      flex: none;
      background: var(--fill);
      color: var(--px-black);
      border: 2px solid var(--px-black);
      box-shadow: inset 2px 2px 0 var(--hi), inset -2px -2px 0 var(--lo), 2px 2px 0 var(--px-black);
      font: 700 12px var(--fox-font-pixel);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .fox-ctrl-btn { width: 40px; height: 40px; }
    .fox-action-btn { width: 32px; height: 32px; }
    .fox-save-btn, .fox-edit-save-btn, .fox-btn-cancel-delete, .fox-btn-confirm-delete { height: 32px; padding: 0 10px; }
    .fox-snap-clear { height: 24px; padding: 0 8px; font-size: 10px; }

    .fox-btn-record, .fox-btn-confirm-delete { --fill: var(--px-red); --hi: var(--px-pink); --lo: var(--px-plum); }
    .fox-btn-play-main, .fox-abtn-play { --fill: var(--px-blue); --hi: var(--px-cream); --lo: var(--px-navy); }
    .fox-save-btn, .fox-edit-save-btn { --fill: var(--px-green); --hi: var(--px-cream); --lo: var(--px-pine); }
    .fox-abtn-delete:hover { --fill: var(--px-red); --hi: var(--px-pink); --lo: var(--px-plum); }

    :is(.fox-ctrl-btn, .fox-action-btn, .fox-save-btn, .fox-edit-save-btn,
        .fox-btn-cancel-delete, .fox-btn-confirm-delete, .fox-snap-clear):not(:disabled):hover {
      outline: 2px solid var(--px-cream);
      outline-offset: -6px;
    }
    :is(.fox-ctrl-btn, .fox-action-btn, .fox-save-btn, .fox-edit-save-btn,
        .fox-btn-cancel-delete, .fox-btn-confirm-delete, .fox-snap-clear):not(:disabled):active {
      transform: translate(2px, 2px);
      box-shadow: inset 2px 2px 0 var(--hi), inset -2px -2px 0 var(--lo);
    }
    :is(.fox-ctrl-btn, .fox-action-btn):disabled {
      --fill: var(--px-stone); --hi: var(--px-stone); --lo: var(--px-stone);
      color: var(--px-silver);
      box-shadow: none;
      cursor: not-allowed;
    }

    button:focus-visible, input:focus-visible, select:focus-visible, .fox-toggle:focus-visible {
      outline: 2px dashed var(--px-orange);
      outline-offset: 2px;
    }

    /* ==========================================
       Inputs (inset)
       ========================================== */
    input, select {
      height: 32px;
      min-width: 0;
      padding: 0 8px;
      background: var(--fox-inset);
      color: var(--fox-text);
      border: 2px solid var(--px-black);
      box-shadow: inset 2px 2px 0 var(--px-stone);
      font: 14px var(--fox-font-ui);
      border-radius: 0;
      outline: none;
    }
    input::placeholder { color: var(--fox-text-muted); }
    input[type="number"] { font: 12px var(--fox-font-pixel); text-align: right; -moz-appearance: textfield; }
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }

    .fox-select { position: relative; display: flex; flex: 1; min-width: 0; }
    .fox-select select { flex: 1; appearance: none; padding-right: 32px; cursor: pointer; }
    .fox-select select:disabled { color: var(--fox-text-muted); cursor: not-allowed; }
    .fox-select .fox-icon { position: absolute; right: 4px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--fox-text-2); }
    .fox-control-bar .fox-select select { height: 40px; }

    /* ==========================================
       Home tab
       ========================================== */
    .fox-control-bar { display: flex; align-items: center; gap: 8px; padding: 10px 8px 8px; }

    .fox-status-strip {
      display: none;
      align-items: center;
      justify-content: space-between;
      height: 28px;
      margin: 0 8px 8px;
      padding: 0 8px;
      background: var(--fox-inset);
      border: 2px solid var(--px-black);
      box-shadow: inset 2px 2px 0 var(--px-stone);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .fox-status-strip.visible { display: flex; }
    .fox-status-left { display: flex; align-items: center; gap: 8px; }
    .fox-status-dot { width: 8px; height: 8px; background: var(--px-blue); }
    .fox-status-strip.recording .fox-status-left { color: var(--px-red); }
    .fox-status-strip.recording .fox-status-dot { background: var(--px-red); animation: fox-blink 1s steps(2, jump-none) infinite; }
    .fox-status-strip.playing .fox-status-left { color: var(--px-blue); }

    .fox-save-bar { display: none; flex-direction: column; gap: 8px; padding: 0 8px 8px; }
    .fox-save-bar.visible { display: flex; }
    .fox-save-domain-row { display: flex; gap: 8px; }
    .fox-save-domain-row input { flex: 1; }

    .fox-domain-filter-bar { display: flex; padding: 0 8px 8px; }

    .fox-macros { padding: 0 8px 8px; }

    .fox-domain-group-header {
      display: flex; align-items: center; gap: 8px;
      margin: 4px 0 8px;
      color: var(--fox-text-muted);
      font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
    }
    .fox-domain-group-header::after { content: ''; flex: 1; height: 2px; background: var(--fox-line); }

    .fox-macro-card {
      display: flex; flex-direction: column; gap: 8px;
      margin-bottom: 8px;
      padding: 8px;
      background: var(--fox-bg);
      border: 2px solid var(--fox-line);
      box-shadow: 2px 2px 0 var(--px-black);
    }
    .fox-macro-card:has(.fox-abtn-stop) { border-color: var(--px-blue); }
    .fox-macro-card.confirm-delete { background: var(--px-plum); border-color: var(--px-red); }

    .fox-macro-row { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
    .fox-macro-name {
      min-width: 0;
      font: 14px var(--fox-font-ui);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .fox-macro-info { flex: none; color: var(--fox-text-2); font-size: 12px; }

    .fox-macro-row2 { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .fox-macro-actions { display: flex; gap: 6px; }
    .fox-loop-controls { display: flex; gap: 8px; }
    .fox-loop-item { display: flex; align-items: center; gap: 2px; color: var(--fox-text-2); }
    .fox-loop-input { width: 56px; }

    .fox-delete-confirm { display: flex; justify-content: flex-end; gap: 8px; }

    .fox-empty {
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      padding: 16px 8px 8px;
      font-size: 12px; font-weight: 700; letter-spacing: 1px;
    }
    .fox-empty-hint {
      display: flex; align-items: center; gap: 2px;
      color: var(--fox-text-2); font-weight: 400; letter-spacing: 0;
    }
    .fox-empty-hint .fox-icon { color: var(--px-red); }

    /* ==========================================
       Settings tab
       ========================================== */
    .fox-settings-body { display: flex; flex-direction: column; gap: 16px; padding: 10px 8px 12px; }
    .fox-settings-group { display: flex; flex-direction: column; gap: 8px; }
    .fox-section-label { color: var(--fox-text-muted); font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
    .fox-settings-row { display: flex; align-items: center; justify-content: space-between; }
    .fox-settings-label { display: flex; align-items: center; gap: 8px; }
    .fox-settings-icon { color: var(--px-orange); }

    .fox-toggle {
      position: relative;
      width: 36px; height: 20px;
      flex: none;
      background: var(--fox-inset);
      border: 2px solid var(--px-black);
      box-shadow: inset 2px 2px 0 var(--px-stone);
      cursor: pointer;
    }
    .fox-toggle-knob {
      position: absolute; top: 2px; left: 2px;
      width: 12px; height: 12px;
      background: var(--px-stone);
      transition: left var(--fox-step-fast);
    }
    .fox-toggle.active { background: var(--px-green); box-shadow: inset 2px 2px 0 var(--px-pine); }
    .fox-toggle.active .fox-toggle-knob { left: 18px; background: var(--px-cream); }

    .fox-range-row { display: flex; align-items: center; gap: 8px; }
    .fox-range-input { width: 64px; }
    .fox-range-sep, .fox-range-unit { color: var(--fox-text-2); font-size: 12px; }

    .fox-about { display: flex; flex-direction: column; gap: 6px; }
    .fox-version { color: var(--fox-text-2); font-size: 12px; }
    .fox-about-link {
      display: inline-flex; align-items: center; gap: 4px;
      color: var(--px-orange); font-size: 12px; text-decoration: none;
      border-bottom: 2px solid transparent;
      align-self: flex-start;
    }
    .fox-about-link:hover { border-bottom: 2px dotted var(--px-orange); }

    /* ==========================================
       Edit panel
       ========================================== */
    .fox-edit-body { display: flex; flex-direction: column; gap: 8px; flex: 1; min-height: 0; padding: 10px 8px 16px; overflow-y: auto; }
    .fox-actions-list {
      display: flex; flex-direction: column;
      background: var(--fox-inset);
      border: 2px solid var(--px-black);
      box-shadow: inset 2px 2px 0 var(--px-stone);
      padding: 2px 2px 2px 4px;
    }
    .fox-action-item { display: flex; align-items: center; gap: 6px; padding: 4px 0; }
    .fox-action-item + .fox-action-item { box-shadow: 0 -2px 0 var(--fox-bg); }
    .fox-action-num {
      width: 24px; height: 24px; flex: none;
      display: flex; align-items: center; justify-content: center;
      background: var(--px-orange); color: var(--px-black);
      font-size: 12px; font-weight: 700;
    }
    .fox-action-text { flex: 1; min-width: 0; font: 13px var(--fox-font-ui); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .fox-action-coords, .fox-delay-chip { display: flex; align-items: center; gap: 2px; color: var(--fox-text-2); font-size: 12px; }
    .fox-coord-input, .fox-delay-input { width: 48px; height: 28px; padding: 0 4px; }

    .fox-resize-grip { position: absolute; bottom: 4px; width: 12px; height: 12px; }
    .fox-resize-grip::before {
      content: ''; position: absolute; width: 4px; height: 4px; top: 0;
      background: var(--fox-line);
    }
    .fox-resize-grip-br { right: 4px; cursor: nwse-resize; }
    .fox-resize-grip-br::before { right: 0; box-shadow: 0 4px 0 var(--fox-line), -4px 4px 0 var(--fox-line), 0 8px 0 var(--fox-line), -4px 8px 0 var(--fox-line), -8px 8px 0 var(--fox-line); }
    .fox-resize-grip-bl { left: 4px; cursor: nesw-resize; }
    .fox-resize-grip-bl::before { left: 0; box-shadow: 0 4px 0 var(--fox-line), 4px 4px 0 var(--fox-line), 0 8px 0 var(--fox-line), 4px 8px 0 var(--fox-line), 8px 8px 0 var(--fox-line); }

    /* ==========================================
       Inspector
       ========================================== */
    .fox-inspector-body { display: flex; flex-direction: column; gap: 8px; padding: 10px 8px 8px; }
    .fox-insp-current {
      display: flex; flex-direction: column; gap: 4px;
      padding: 8px;
      background: var(--fox-inset);
      border: 2px solid var(--px-black);
      box-shadow: inset 2px 2px 0 var(--px-stone);
    }
    .fox-insp-coords { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; }
    .fox-insp-icon { color: var(--px-orange); }
    .fox-insp-element { font: 12px var(--fox-font-mono); }
    .fox-insp-tag { color: var(--px-orange); }
    .fox-insp-id { color: var(--fox-text-2); }
    .fox-insp-empty { color: var(--fox-text-2); font-size: 12px; }
    .fox-snap-header { display: flex; align-items: center; justify-content: space-between; min-height: 24px; }
    .fox-snap-list { display: flex; flex-direction: column; gap: 4px; max-height: 200px; overflow-y: auto; }
    .fox-snap-item { display: flex; align-items: center; gap: 8px; font-size: 12px; }
    .fox-snap-num {
      width: 20px; height: 20px; flex: none;
      display: flex; align-items: center; justify-content: center;
      background: var(--px-orange); color: var(--px-black); font-weight: 700;
    }
    .fox-snap-coords { flex: 1; }
    .fox-snap-time { color: var(--fox-text-2); }

    /* ==========================================
       Mascot sprite (assets/sprites/mascot.png, 58×58 frames, DESIGN.md §5)
       ========================================== */
    /* --f = one frame on screen: 58px at 1×, 116px at 2× */
    .fox-mascot {
      --f: 58px;
      display: block; flex: none;
      width: var(--f); height: var(--f);
      background: var(--fox-mascot) 0 0 / calc(var(--f) * 4) calc(var(--f) * 6) no-repeat;
      image-rendering: pixelated;
    }
    .fox-mascot-2x { --f: 116px; }
    .fox-m-idle { background-position-y: 0; animation: fox-blink-frame 3s step-end infinite; }
    .fox-m-record { background-position-y: calc(var(--f) * -1); animation: fox-frames-2 0.8s steps(2) infinite; }
    .fox-m-play { background-position-y: calc(var(--f) * -2); animation: fox-frames-4 0.6s steps(4) infinite; }
    .fox-m-success { background-position-y: calc(var(--f) * -3); }
    .fox-m-error { background-position-y: calc(var(--f) * -4); }
    .fox-m-sleep { background-position-y: calc(var(--f) * -5); animation: fox-frames-2 1.6s steps(2) infinite; }

    /* ==========================================
       FAB (shown while minimized)
       ========================================== */
    #fox-fab {
      position: fixed; bottom: 24px; right: 24px;
      width: 68px; height: 68px;
      display: none; align-items: center; justify-content: center;
      background: var(--px-orange);
      border: 2px solid var(--px-black);
      box-shadow: inset 2px 2px 0 var(--px-peach), inset -2px -2px 0 var(--px-brown), 4px 4px 0 var(--px-black);
      cursor: grab;
      z-index: 2147483647;
      user-select: none;
    }
    #fox-fab.visible { display: flex; }
    #fox-fab:hover { outline: 2px solid var(--px-cream); outline-offset: -6px; }
    #fox-fab.recording { outline: 2px solid var(--px-red); outline-offset: 2px; }
    #fox-fab.playing { outline: 2px solid var(--px-blue); outline-offset: 2px; }
    #fox-fab.recording .fox-mascot { background-position-y: calc(var(--f) * -1); animation: fox-frames-2 0.8s steps(2) infinite; }
    #fox-fab.playing .fox-mascot { background-position-y: calc(var(--f) * -2); animation: fox-frames-4 0.6s steps(4) infinite; }

    /* ==========================================
       Toast
       ========================================== */
    .fox-toast {
      --type: var(--px-blue);
      position: fixed; bottom: 24px; left: 50%;
      display: flex; align-items: center; gap: 8px;
      max-width: 380px;
      padding: 6px 12px 6px 8px;
      background: var(--fox-bg);
      color: var(--fox-text);
      border: 2px solid var(--type);
      box-shadow: 4px 4px 0 var(--px-black);
      font: 700 12px var(--fox-font-pixel);
      letter-spacing: 1px;
      white-space: nowrap;
      cursor: pointer;
      opacity: 0;
      transform: translate(-50%, 8px);
      transition: opacity var(--fox-step), transform var(--fox-step);
      z-index: 2147483647;
    }
    .fox-toast.visible { opacity: 1; transform: translate(-50%, 0); }
    .fox-toast.success { --type: var(--px-green); }
    .fox-toast.error { --type: var(--px-red); }
    .fox-toast-icon { display: flex; color: var(--type); }

    /* ==========================================
       Minimal mode: control bar only
       ========================================== */
    #fox-panel.minimal-mode { width: auto; min-width: 0; }
    #fox-panel.minimal-mode :is(.fox-tabs, .fox-save-bar, .fox-domain-filter-bar, .fox-macros, .fox-status-strip),
    #fox-panel.minimal-mode .fox-tab-content[data-tab="settings"] { display: none !important; }
    #fox-panel.minimal-mode .fox-tab-content[data-tab="home"] { display: flex; }
    #fox-panel.minimal-mode .fox-select { width: 200px; flex: none; }

    /* Recording mode: title + status + stop only */
    #fox-panel.recording-mode { width: auto; min-width: 0; max-height: none; }
    #fox-panel.recording-mode :is(.fox-tabs, .fox-header-actions, .fox-btn-record, .fox-select,
      .fox-btn-play-main, .fox-save-bar, .fox-domain-filter-bar, .fox-macros),
    #fox-panel.recording-mode .fox-tab-content[data-tab="settings"] { display: none !important; }
    #fox-panel.recording-mode .fox-tab-content[data-tab="home"] { display: flex; }
    #fox-panel.recording-mode .fox-header { padding-right: 12px; }
    #fox-panel.recording-mode .fox-control-bar { justify-content: center; }

    /* ==========================================
       Scrollbars
       ========================================== */
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: var(--px-black); }
    ::-webkit-scrollbar-thumb { background: var(--fox-line); box-shadow: inset 2px 2px 0 var(--px-cream); }
    ::-webkit-scrollbar-button { display: none; }

    /* ==========================================
       Motion
       ========================================== */
    @keyframes fox-blink { from { visibility: visible; } to { visibility: hidden; } }
    @keyframes fox-frames-2 { from { background-position-x: 0; } to { background-position-x: calc(var(--f) * -2); } }
    @keyframes fox-frames-4 { from { background-position-x: 0; } to { background-position-x: calc(var(--f) * -4); } }
    @keyframes fox-blink-frame { 0% { background-position-x: 0; } 92% { background-position-x: calc(var(--f) * -1); } 100% { background-position-x: calc(var(--f) * -1); } }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation: none !important; transition: none !important; }
    }
  `;
}
