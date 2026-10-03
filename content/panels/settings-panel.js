// Fox Macro Recorder - Settings Tab

// "Alt+Shift+F" or the Mac form "⌥⇧F" -> ['Alt', 'Shift', 'F'] / ['⌥', '⇧', 'F']
function shortcutKeys(shortcut) {
  return shortcut.includes('+') ? shortcut.split('+') : [...shortcut];
}

function renderSettingsTab() {
  const container = q('#fox-settings-content');
  const s = state.settings;

  container.innerHTML = html`
    <div class="fox-settings-body">
      <section class="fox-settings-card">
        <h3 class="fox-settings-card-title">${icon('shuffle')}<span>Playback</span></h3>
        <div class="fox-settings-row">
          <span class="fox-settings-name">Random delay</span>
          <button class="fox-toggle${s.randomDelayEnabled ? ' active' : ''}" id="fox-random-delay-toggle" role="switch"
            aria-checked="${s.randomDelayEnabled}" aria-label="Random delay" title="Add random delays between clicks">
            <span class="fox-toggle-knob"></span>
          </button>
        </div>
        <p class="fox-settings-hint">Adds a random pause between clicks so replays don't look robotic.</p>
        <div class="fox-range-row${s.randomDelayEnabled ? '' : ' off'}">
          <label class="fox-range-field"><span>Min</span>
            <input type="number" id="fox-delay-min" class="fox-range-input" aria-label="Random delay minimum (ms)" value="${s.randomDelayMin}" min="0" max="10000" ${s.randomDelayEnabled ? '' : 'disabled'}>
          </label>
          <label class="fox-range-field"><span>Max</span>
            <input type="number" id="fox-delay-max" class="fox-range-input" aria-label="Random delay maximum (ms)" value="${s.randomDelayMax}" min="0" max="10000" ${s.randomDelayEnabled ? '' : 'disabled'}>
          </label>
          <span class="fox-range-unit">ms</span>
        </div>
      </section>

      <section class="fox-settings-card">
        <h3 class="fox-settings-card-title">${icon('archive')}<span>Macros</span></h3>
        <p class="fox-settings-hint">Back up your macros, or move them from another browser or from the old Fox Auto Clicker.</p>
        <div class="fox-transfer-row">
          <button class="fox-snap-clear" id="fox-export-btn">${icon('download')}<span>Export all</span></button>
          <button class="fox-snap-clear" id="fox-import-btn">${icon('upload')}<span>Import…</span></button>
          <input type="file" id="fox-import-file" accept=".json,application/json" hidden>
        </div>
      </section>

      <section class="fox-settings-card">
        <h3 class="fox-settings-card-title">${icon('keyboard')}<span>Shortcut</span></h3>
        <div class="fox-settings-row">
          <span class="fox-settings-name">Show / hide panel</span>
          <span class="fox-keys">${state.shortcut
            ? shortcutKeys(state.shortcut).map(k => html`<kbd>${k}</kbd>`)
            : html`<span class="fox-settings-hint">Not set</span>`}</span>
        </div>
        <button class="fox-snap-clear fox-shortcut-change" id="fox-shortcut-change">Change shortcut</button>
      </section>

      <section class="fox-settings-card fox-about">
        <span class="fox-mascot fox-m-idle"></span>
        <div class="fox-about-text">
          <div class="fox-about-name">Fox Macro Recorder <span class="fox-version-chip">v${chrome.runtime.getManifest().version}</span></div>
          <div class="fox-settings-hint" id="fox-about-stats">&nbsp;</div>
          <a class="fox-coffee-btn" href="https://buymeacoffee.com/panat.siriwong" target="_blank" rel="noopener">${icon('coffee')}<span>Buy me a coffee</span></a>
        </div>
      </section>
    </div>
  `;

  getMacros().then(macros => {
    const sites = new Set(macros.map(m => m.domain).filter(Boolean)).size;
    const el = container.querySelector('#fox-about-stats');
    if (el) el.textContent = `${macros.length} macro${macros.length === 1 ? '' : 's'} saved · ${sites} site${sites === 1 ? '' : 's'}`;
  });

  container.querySelector('#fox-export-btn').addEventListener('click', exportMacros);
  const fileInput = container.querySelector('#fox-import-file');
  container.querySelector('#fox-import-btn').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) importMacros(fileInput.files[0]);
  });

  // chrome:// pages can't be linked from a web page; background.js opens it
  container.querySelector('#fox-shortcut-change').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openShortcuts' }).catch(() => {});
  });

  const set = (key, value) => {
    s[key] = value;
    return saveSetting(key, value);
  };

  const toggle = container.querySelector('#fox-random-delay-toggle');
  toggle.addEventListener('click', async () => {
    toggle.classList.toggle('active', !s.randomDelayEnabled);
    toggle.setAttribute('aria-checked', String(!s.randomDelayEnabled));
    await set('randomDelayEnabled', !s.randomDelayEnabled);
    renderSettingsTab(); // min/max enable with it; the switch itself is the feedback
    container.querySelector('#fox-random-delay-toggle').focus();
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

async function exportMacros() {
  const macros = await getMacros();
  if (macros.length === 0) {
    showToast('No macros to export yet', 'info');
    return;
  }
  const url = URL.createObjectURL(new Blob([buildExport(macros)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = exportFileName();
  state.root.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast(`Exported ${macros.length} macro${macros.length === 1 ? '' : 's'}`, 'success');
}

async function importMacros(file) {
  let parsed;
  try {
    if (file.size > 5 * 1024 * 1024) throw new Error('File is too big');
    parsed = parseImport(await file.text());
  } catch (e) {
    showToast(`Import failed: ${e.message}`, 'error', 4000);
    return;
  }
  let result;
  await updateMacros(existing => {
    result = mergeImported(existing, parsed.macros);
    return result.macros;
  });
  const notes = [
    result.skipped && `${result.skipped} already here`,
    parsed.invalid && `${parsed.invalid} invalid`
  ].filter(Boolean);
  // imported macros are often for other sites: show everything
  state.domainFilter = '__all__';
  await loadMacros();
  renderSettingsTab();
  showToast(`Imported ${result.added} macro${result.added === 1 ? '' : 's'}${notes.length ? ` (${notes.join(', ')})` : ''}`,
    result.added ? 'success' : 'info', 4000);
}
