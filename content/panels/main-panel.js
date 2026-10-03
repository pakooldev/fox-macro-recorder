// Fox Macro Recorder - Unified Panel with Tab-Based Layout

function createPanel() {
  const panel = document.createElement('div');
  panel.id = 'fox-panel';
  panel.innerHTML = `
    <div class="fox-header">
      <div class="fox-header-left">
        <span class="fox-logo">\uD83E\uDD8A</span>
        <span class="fox-title">Fox</span>
      </div>
      <div class="fox-tabs">
        <button class="fox-tab-btn active" data-tab="home" title="Home">\uD83C\uDFE0</button>
        <button class="fox-tab-btn" id="fox-inspector-toggle" title="Inspector">\uD83D\uDD0D</button>
        <button class="fox-tab-btn" data-tab="settings" title="Settings">\u2699\uFE0F</button>
      </div>
      <div class="fox-header-actions">
        <button class="fox-icon-btn" id="fox-minimal-btn" title="Minimal mode">\u25A0</button>
        <button class="fox-icon-btn" id="fox-minimize-btn" title="Minimize">\u2212</button>
        <button class="fox-icon-btn" id="fox-close-btn" title="Close">\u00D7</button>
      </div>
    </div>

    <!-- Home Tab -->
    <div class="fox-tab-content active" data-tab="home">
      <div class="fox-control-bar">
        <button class="fox-ctrl-btn fox-btn-record" id="fox-record-btn" title="Record">\u23FA</button>
        <button class="fox-ctrl-btn fox-btn-stop" id="fox-stop-btn" title="Stop" disabled>\u23F9</button>
        <select class="fox-macro-select" id="fox-macro-select" title="Select macro">
          <option value="">No macros</option>
        </select>
        <button class="fox-ctrl-btn fox-btn-play-main" id="fox-play-btn" title="Play" disabled>\u25B6</button>
      </div>
      <div class="fox-status-strip"></div>
      <div class="fox-save-bar">
        <input type="text" class="fox-save-input" id="fox-save-input" placeholder="Macro name...">
        <div class="fox-save-domain-row">
          <input type="text" class="fox-save-domain" id="fox-save-domain" placeholder="Domain...">
          <button class="fox-save-btn" id="fox-save-btn" title="Save">\u2713</button>
        </div>
      </div>
      <div class="fox-domain-filter-bar">
        <select class="fox-domain-filter" id="fox-domain-filter" title="Filter by domain">
          <option value="__all__">All domains</option>
        </select>
      </div>
      <div class="fox-macros" id="fox-macros-list">
        <div class="fox-empty">No macros saved</div>
      </div>
    </div>

    <!-- Settings Tab -->
    <div class="fox-tab-content" data-tab="settings">
      <div id="fox-settings-content"></div>
    </div>
  `;

  panel.classList.add('hidden');
  state.root.appendChild(panel);
  state.panel = panel;

  makeDraggable(panel, panel.querySelector('.fox-header'));
  bindPanelEvents();
  loadMacros();
  renderSettingsTab();
}

function bindPanelEvents() {
  const macroSelect = q('#fox-macro-select');
  const minimalBtn = q('#fox-minimal-btn');

  qa('.fox-tab-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  q('#fox-inspector-toggle').addEventListener('click', toggleInspectorPanel);

  q('#fox-record-btn').addEventListener('click', startRecording);
  q('#fox-stop-btn').addEventListener('click', () => {
    if (state.isRecording) stopRecording();
    if (state.isPlaying) state.shouldStop = true;
  });
  q('#fox-play-btn').addEventListener('click', () => togglePlayback(macroSelect.value));

  q('#fox-save-btn').addEventListener('click', saveMacro);
  q('#fox-save-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveMacro();
  });

  q('#fox-domain-filter').addEventListener('change', loadMacros);
  bindMacroListEvents();

  minimalBtn.addEventListener('click', () => {
    const minimal = state.panel.classList.toggle('minimal-mode');
    minimalBtn.textContent = minimal ? '\u25A1' : '\u25A0';
    minimalBtn.title = minimal ? 'Full mode' : 'Minimal mode';
  });
  q('#fox-minimize-btn').addEventListener('click', minimizePanel);
  q('#fox-close-btn').addEventListener('click', () => state.panel.classList.add('hidden'));
}
