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
  btn.textContent = showStop ? '⏹' : '▶';
  btn.className = showStop ? stopClass : playClass;
  btn.title = showStop ? 'Stop' : 'Play';
}

function renderMode() {
  const { isRecording, isPlaying } = state;
  const hasMacros = !!q('#fox-macro-select').value;

  q('#fox-record-btn').disabled = isRecording || isPlaying;
  q('#fox-stop-btn').disabled = !isRecording && !isPlaying;
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
  foxFab?.classList.toggle('recording', isRecording);
  foxFab?.classList.toggle('playing', isPlaying && !isRecording);
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

  createPanel();
  createFab();
  document.addEventListener('click', handleClick, true);

  loadSettings().then(settings => {
    state.settings = settings;
    renderSettingsTab();
  });
})();

// ==========================================
// Popup messages
// ==========================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const panel = state.panel;
  if (message.action === 'togglePanel') {
    if (state.isPanelMinimized) {
      expandPanel();
    } else if (panel.classList.contains('hidden')) {
      panel.classList.remove('hidden');
      hideFab();
    } else {
      panel.classList.add('hidden');
    }
  }
  sendResponse({ isHidden: panel.classList.contains('hidden') });
});
