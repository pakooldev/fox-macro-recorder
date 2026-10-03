// Fox Macro Recorder - Settings Tab

function renderSettingsTab() {
  const container = q('#fox-settings-content');
  const s = state.settings;

  container.innerHTML = html`
    <div class="fox-settings-body">
      <div class="fox-settings-group">
        <div class="fox-section-label">PLAYBACK</div>
        <div class="fox-settings-row">
          <div class="fox-settings-label">
            <span class="fox-settings-icon">${icon('shuffle')}</span>
            <span>Random Delay</span>
          </div>
          <button class="fox-toggle${s.randomDelayEnabled ? ' active' : ''}" id="fox-random-delay-toggle" role="switch"
            aria-checked="${s.randomDelayEnabled}" aria-label="Random delay" title="Add random delays between clicks">
            <span class="fox-toggle-knob"></span>
          </button>
        </div>
        <div class="fox-range-row" title="Min and max delay range (ms)">
          <input type="number" id="fox-delay-min" class="fox-range-input" aria-label="Random delay minimum (ms)" value="${s.randomDelayMin}" min="0" max="10000">
          <span class="fox-range-sep">—</span>
          <input type="number" id="fox-delay-max" class="fox-range-input" aria-label="Random delay maximum (ms)" value="${s.randomDelayMax}" min="0" max="10000">
          <span class="fox-range-unit">ms</span>
        </div>
      </div>

      <div class="fox-settings-group">
        <div class="fox-section-label">ABOUT</div>
        <div class="fox-about">
          <div class="fox-version">Fox Macro Recorder v${chrome.runtime.getManifest().version}</div>
          <div class="fox-version">Show/hide: ${state.shortcut || 'no shortcut set'} · change at chrome://extensions/shortcuts</div>
          <div class="fox-about-links">
            <a class="fox-about-link" href="https://buymeacoffee.com/panat.siriwong" target="_blank" rel="noopener">${icon('coffee')} Buy me a coffee</a>
          </div>
        </div>
      </div>
    </div>
  `;

  const set = (key, value) => {
    s[key] = value;
    return saveSetting(key, value);
  };

  const toggle = container.querySelector('#fox-random-delay-toggle');
  toggle.addEventListener('click', async () => {
    toggle.classList.toggle('active', !s.randomDelayEnabled);
    toggle.setAttribute('aria-checked', String(!s.randomDelayEnabled));
    await set('randomDelayEnabled', !s.randomDelayEnabled);
    showToast('Settings updated', 'success');
  });

  const minInput = container.querySelector('#fox-delay-min');
  const maxInput = container.querySelector('#fox-delay-max');

  minInput.addEventListener('change', () => {
    minInput.value = Math.max(0, Math.min(parseInt(minInput.value) || 0, s.randomDelayMax));
    set('randomDelayMin', Number(minInput.value));
  });

  maxInput.addEventListener('change', () => {
    maxInput.value = Math.max(s.randomDelayMin, parseInt(maxInput.value) || 0);
    set('randomDelayMax', Number(maxInput.value));
  });
}
