// Fox Macro Recorder - Entry point (injected last, after every other content file)
// Owns the shared state and the shadow root. renderMode() is the only place that
// turns recording/playing state into UI.

const state = {
  root: null,              // shadow root holding all of our UI
  panel: null,
  isRecording: false,
  isPlaying: false,
  shouldStop: false,
  playingId: null,         // id of the macro being played
  recordingStartTime: 0,
  recordedActions: [],
  activeTab: 'home',
  isPanelMinimized: false,
  domainFilter: null,      // null = this site's macros if it has any, else all
  shortcut: '',            // toolbar toggle shortcut, from background.js
  settings: { ...DEFAULT_SETTINGS }
};

function q(selector) {
  return state.root.querySelector(selector);
}

function qa(selector) {
  return state.root.querySelectorAll(selector);
}

function isOwnUi(target) {
  return !!target.closest?.('#fox-macro-shadow-host');
}

function setPlayButton(btn, showStop, playClass, stopClass) {
  btn.innerHTML = icon(showStop ? 'stop' : 'play');
  btn.className = showStop ? stopClass : playClass;
  btn.title = showStop ? 'Stop' : 'Play';
}

function renderMode() {
  const { isRecording, isPlaying } = state;
  const hasMacros = !!q('#fox-macro-select').value;

  q('#fox-record-btn').disabled = isRecording || isPlaying;
  q('#fox-stop-btn').disabled = !isRecording; // while playing, the Play slot turns into Stop
  q('#fox-macro-select').disabled = isPlaying || !hasMacros;

  const playBtn = q('#fox-play-btn');
  setPlayButton(playBtn, isPlaying, 'fox-ctrl-btn fox-btn-play-main', 'fox-ctrl-btn fox-btn-stop-main');
  playBtn.disabled = !isPlaying && !hasMacros;

  qa('.fox-macro-card [data-action="play"]').forEach(btn => {
    const playingThis = isPlaying && btn.closest('.fox-macro-card').dataset.id === state.playingId;
    setPlayButton(btn, playingThis, 'fox-action-btn fox-abtn-play', 'fox-action-btn fox-abtn-stop');
  });

  const strip = q('.fox-status-strip');
  if (isRecording) {
    strip.className = 'fox-status-strip recording visible';
    strip.innerHTML = html`
      <div class="fox-status-left"><span class="fox-status-dot"></span><span>REC</span></div>
      <span class="fox-rec-count">${state.recordedActions.length}</span>
    `;
  } else if (isPlaying) {
    strip.className = 'fox-status-strip playing visible';
    strip.innerHTML = html`
      <div class="fox-status-left"><span class="fox-status-dot"></span><span>PLAY</span></div>
      <span class="fox-play-progress"></span>
    `;
  } else {
    strip.classList.remove('visible');
  }

  state.panel.classList.toggle('recording-mode', isRecording);
  clampIntoView(state.panel); // it changes width between recording and normal mode
  foxFab?.classList.toggle('recording', isRecording);
  foxFab?.classList.toggle('playing', isPlaying && !isRecording);
}

// Tiny5 pixel font, registered on the document (@font-face inside a shadow root is ignored).
// Loaded from bytes so the page's CSP font-src can't block it; falls back to the system font.
async function loadPixelFont() {
  if ([...document.fonts].some(f => f.family === 'FoxPixel')) return;
  const res = await fetch(chrome.runtime.getURL('assets/fonts/tiny5.woff2'));
  const font = new FontFace('FoxPixel', await res.arrayBuffer());
  document.fonts.add(await font.load());
}

// ==========================================
// Init
// ==========================================
(function initFoxMacroRecorder() {
  const shadowHost = document.createElement('div');
  shadowHost.id = 'fox-macro-shadow-host';
  shadowHost.style.cssText = 'all: initial; position: fixed; top: 0; left: 0; z-index: 2147483647; pointer-events: none;';
  document.body.appendChild(shadowHost);

  state.root = shadowHost.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = ':host { pointer-events: none; } :host > * { pointer-events: auto; }' + getFoxStyles();
  state.root.appendChild(style);

  loadPixelFont().catch(() => {});
  createPanel();
  createFab();

  // Keep everything on screen when the window shrinks
  window.addEventListener('resize', () => [state.panel, foxFab, foxEditPanel, foxInspectorPanel].forEach(clampIntoView));

  // Esc closes the secondary panels (only while focus is inside Fox, so page shortcuts are untouched)
  state.root.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (foxEditPanel) requestCloseEditPanel();
    else if (foxInspectorPanel) closeInspectorPanel();
  });
  document.addEventListener('click', handleClick, true);

  loadSettings().then(settings => {
    state.settings = settings;
    renderSettingsTab();
  });

  // Navigating away ends this page's recording/playback; background.js tells the user
  window.addEventListener('pagehide', () => {
    if (!state.isRecording && !state.isPlaying) return;
    const text = state.isRecording ? 'Recording cancelled: the page changed' : 'Playback stopped: the page changed';
    chrome.runtime.sendMessage({ action: 'interrupted', text }).catch(() => {});
  });

  watchStore({
    onMacros: loadMacros,
    onSettings: changed => {
      Object.assign(state.settings, changed);
      renderSettingsTab();
    }
  });

  chrome.runtime.sendMessage({ action: 'getShortcut' }).then(shortcut => {
    state.shortcut = shortcut;
    q('#fox-close-btn').title = shortcut ? `Close (${shortcut})` : 'Close';
    renderSettingsTab();
  }).catch(() => {});
})();

// ==========================================
// Toolbar icon messages (background.js)
// ==========================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const panel = state.panel;
  if (message.action === 'notice') {
    showToast(message.text, 'error', 5000);
  } else if (message.action === 'togglePanel') {
    if (state.isPanelMinimized) {
      expandPanel();
    } else if (panel.classList.contains('hidden')) {
      panel.classList.remove('hidden');
      hideFab();
      clampIntoView(panel);
    } else if (state.isRecording || state.isPlaying) {
      minimizePanel(); // keep a visible REC/PLAY indicator (the FAB) while it runs
    } else {
      panel.classList.add('hidden');
    }
  }
  sendResponse({ isHidden: panel.classList.contains('hidden') });
});
