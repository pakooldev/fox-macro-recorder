// Fox Macro Recorder - Macro list (render + CRUD)
// Clicks/changes in the list are handled once by bindMacroListEvents(), not per render.

let deleteConfirmMacroId = null;
let deleteConfirmTimer = null;

async function loadMacros() {
  const list = q('#fox-macros-list');
  const allMacros = await getMacros();

  // Domain filter dropdown
  const domainFilter = q('#fox-domain-filter');
  const allDomains = [...new Set(allMacros.map(m => m.domain || ''))].sort(compareDomains);
  const selectedDomain = allDomains.includes(domainFilter.value) ? domainFilter.value : '__all__';
  domainFilter.innerHTML = html`
    <option value="__all__">All domains</option>
    ${allDomains.map(d => html`<option value="${d}" ${d === selectedDomain ? 'selected' : ''}>${d || 'Ungrouped'}</option>`)}
  `;

  const macros = selectedDomain === '__all__'
    ? allMacros
    : allMacros.filter(m => (m.domain || '') === selectedDomain);

  updateMacroSelect(macros);

  if (macros.length === 0) {
    list.innerHTML = '<div class="fox-empty">No macros saved</div>';
  } else {
    const groups = {};
    macros.forEach(m => (groups[m.domain || ''] ??= []).push(m));

    list.innerHTML = html`${Object.keys(groups).sort(compareDomains).map(domain => html`
      <div class="fox-domain-group-header">${domain || 'Ungrouped'}</div>
      ${groups[domain].map(renderMacroCard)}
    `)}`;
  }

  renderMode();
}

function renderMacroCard(m) {
  if (deleteConfirmMacroId === m.id) {
    return html`
      <div class="fox-macro-card confirm-delete" data-id="${m.id}">
        <div class="fox-macro-row">
          <span class="fox-macro-name">Delete "${m.name}"?</span>
        </div>
        <div class="fox-delete-confirm">
          <button class="fox-btn-cancel-delete" data-action="cancel-delete">Cancel</button>
          <button class="fox-btn-confirm-delete" data-action="confirm-delete">Confirm Delete</button>
        </div>
      </div>
    `;
  }

  const totalTime = m.actions.length > 0 ? m.actions[m.actions.length - 1].timestamp : 0;
  return html`
    <div class="fox-macro-card" data-id="${m.id}">
      <div class="fox-macro-row">
        <span class="fox-macro-name">${m.name}</span>
        <span class="fox-macro-info">${formatMacroInfo(m.actions.length, totalTime)}</span>
      </div>
      <div class="fox-macro-row2">
        <div class="fox-macro-actions">
          <button class="fox-action-btn fox-abtn-play" data-action="play" title="Play">▶</button>
          <button class="fox-action-btn fox-abtn-edit" data-action="edit" title="Edit">✎</button>
          <button class="fox-action-btn fox-abtn-delete" data-action="delete" title="Delete">🗑</button>
        </div>
        <div class="fox-loop-controls">
          <div class="fox-loop-item" title="Loop count">
            <span>🔁</span>
            <input type="number" class="fox-loop-input" data-field="loopCount" value="${m.loopCount || 1}" min="1" max="999">
          </div>
          <div class="fox-loop-item" title="Delay between loops (ms)">
            <span>⏱</span>
            <input type="number" class="fox-loop-input" data-field="loopDelay" value="${m.loopDelay || 0}" min="0">
          </div>
        </div>
      </div>
    </div>
  `;
}

function bindMacroListEvents() {
  const list = q('#fox-macros-list');

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    const id = btn?.closest('.fox-macro-card')?.dataset.id;
    if (!id) return;

    switch (btn.dataset.action) {
      case 'play': togglePlayback(id); break;
      case 'edit': openEditPanel(id); break;
      case 'delete': showDeleteConfirm(id); break;
      case 'cancel-delete': cancelDeleteConfirm(); break;
      case 'confirm-delete': confirmDelete(id); break;
    }
  });

  list.addEventListener('change', (e) => {
    const input = e.target.closest('[data-field]');
    const id = input?.closest('.fox-macro-card')?.dataset.id;
    if (!id) return;

    const field = input.dataset.field;
    const value = field === 'loopCount' ? (parseInt(input.value) || 1) : (parseInt(input.value) || 0);
    updateMacros(macros => macros.map(m => m.id === id ? { ...m, [field]: value } : m));
  });
}

function updateMacroSelect(macros) {
  const select = q('#fox-macro-select');
  select.innerHTML = macros.length > 0
    ? html`${macros.map(m => html`<option value="${m.id}">${m.name}${m.domain ? ` (${m.domain})` : ''}</option>`)}`
    : '<option value="">No macros</option>';
}

function showDeleteConfirm(id) {
  clearTimeout(deleteConfirmTimer);
  deleteConfirmMacroId = id;
  loadMacros();

  // Auto-cancel after 5 seconds
  deleteConfirmTimer = setTimeout(() => {
    if (deleteConfirmMacroId === id) cancelDeleteConfirm();
  }, 5000);
}

function cancelDeleteConfirm() {
  clearTimeout(deleteConfirmTimer);
  deleteConfirmMacroId = null;
  loadMacros();
}

async function confirmDelete(id) {
  clearTimeout(deleteConfirmTimer);
  deleteConfirmMacroId = null;
  await updateMacros(macros => macros.filter(m => m.id !== id));
  loadMacros();
  showToast('✓ Macro deleted', 'success');
}

async function saveMacro() {
  const macro = {
    id: Date.now().toString(),
    name: q('#fox-save-input').value.trim() || `Macro ${Date.now()}`,
    domain: q('#fox-save-domain').value.trim(),
    createdAt: new Date().toISOString(),
    actions: state.recordedActions
  };

  await updateMacros(macros => [...macros, macro]);

  q('.fox-save-bar').classList.remove('visible');
  state.recordedActions = [];
  loadMacros();
  showToast('✓ Macro saved', 'success');
}
