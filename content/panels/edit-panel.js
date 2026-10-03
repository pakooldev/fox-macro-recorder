// Fox Macro Recorder - Edit Panel (Standalone Floating Panel)

let foxEditPanel = null;

async function openEditPanel(id) {
  closeEditPanel();

  const macro = await getMacro(id);
  if (!macro) {
    showToast('Macro not found', 'error');
    return;
  }

  const panel = document.createElement('div');
  panel.id = 'fox-edit-panel';
  panel.innerHTML = html`
    <div class="fox-edit-panel-header">
      <div class="fox-edit-panel-title">${icon('edit')} Edit: ${macro.name}</div>
      <div class="fox-edit-panel-actions">
        <button class="fox-edit-save-btn" id="fox-edit-save">${icon('check')} Save</button>
        <button class="fox-icon-btn" id="fox-edit-close" title="Close">${icon('close')}</button>
      </div>
    </div>
    <div class="fox-edit-body">
      <input type="text" class="fox-edit-name" id="fox-edit-name" value="${macro.name}" placeholder="Macro name">
      <input type="text" class="fox-edit-domain" id="fox-edit-domain" value="${macro.domain || ''}" placeholder="Domain (e.g. example.com)">
      <div class="fox-section-label">ACTIONS (${macro.actions.length})</div>
      <div class="fox-actions-list">${macro.actions.map((action, index) => html`
        <div class="fox-action-item">
          <div class="fox-action-num">${index + 1}</div>
          <div class="fox-action-text" title="${action.text || 'Click'}">${action.text ? action.text.slice(0, 20) : 'Click'}</div>
          <div class="fox-action-coords">
            <input type="number" class="fox-coord-input fox-x-input" data-index="${index}" value="${Math.round(action.x)}" min="0" title="X">
            <span>,</span>
            <input type="number" class="fox-coord-input fox-y-input" data-index="${index}" value="${Math.round(action.y)}" min="0" title="Y">
          </div>
          ${index > 0 ? html`
            <div class="fox-delay-chip">
              <span>+</span>
              <input type="number" class="fox-delay-input" data-index="${index}" value="${action.timestamp - macro.actions[index - 1].timestamp}" min="0" title="Delay (ms)">
            </div>
          ` : ''}
        </div>
      `)}</div>
    </div>
    <div class="fox-resize-grip fox-resize-grip-bl" data-grip="bl"></div>
    <div class="fox-resize-grip fox-resize-grip-br" data-grip="br"></div>
  `;

  state.root.appendChild(panel);
  foxEditPanel = panel;

  makeDraggable(panel, panel.querySelector('.fox-edit-panel-header'));
  setupEditPanelResize(panel);
  panel.querySelector('#fox-edit-close').addEventListener('click', closeEditPanel);

  panel.querySelector('#fox-edit-save').addEventListener('click', async () => {
    const field = (cls, i) => panel.querySelector(`.${cls}[data-index="${i}"]`).value;
    const name = panel.querySelector('#fox-edit-name').value.trim() || macro.name;
    const domain = panel.querySelector('#fox-edit-domain').value.trim();

    // Each action's timestamp = previous timestamp + its delay input
    let timestamp = 0;
    const actions = macro.actions.map((action, i) => {
      timestamp = i === 0 ? action.timestamp : timestamp + (parseInt(field('fox-delay-input', i)) || 0);
      return {
        ...action,
        x: parseFloat(field('fox-x-input', i)) || 0,
        y: parseFloat(field('fox-y-input', i)) || 0,
        timestamp
      };
    });

    await updateMacros(macros => macros.map(m => m.id === id ? { ...m, name, domain, actions } : m));
    loadMacros();
    showToast('Macro updated', 'success');
    closeEditPanel();
  });
}

function setupEditPanelResize(panel) {
  panel.querySelectorAll('.fox-resize-grip').forEach(grip => {
    grip.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      grip.setPointerCapture(e.pointerId);

      const side = grip.dataset.grip;
      const startX = e.clientX;
      const startY = e.clientY;
      const startW = panel.offsetWidth;
      const startH = panel.offsetHeight;
      const rect = panel.getBoundingClientRect();

      // Anchor the opposite horizontal side
      if (side === 'br') {
        panel.style.left = rect.left + 'px';
        panel.style.right = 'auto';
      } else {
        panel.style.right = (window.innerWidth - rect.right) + 'px';
        panel.style.left = 'auto';
      }

      function onMove(e) {
        const dx = e.clientX - startX;
        const w = side === 'br'
          ? Math.max(260, startW + dx)
          : Math.max(260, startW - dx);
        const h = Math.max(200, startH + e.clientY - startY);
        panel.style.width = w + 'px';
        panel.style.height = h + 'px';
      }

      function onUp() {
        grip.removeEventListener('pointermove', onMove);
        grip.removeEventListener('pointerup', onUp);
      }

      grip.addEventListener('pointermove', onMove);
      grip.addEventListener('pointerup', onUp);
    });
  });
}

function closeEditPanel() {
  foxEditPanel?.remove();
  foxEditPanel = null;
}
