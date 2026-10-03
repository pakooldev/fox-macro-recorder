// Fox Macro Recorder - Inspector Panel (Standalone Floating Panel)

let isInspectorActive = false;
let inspectorSnapshots = [];
let foxInspectorPanel = null;

function openInspectorPanel() {
  if (foxInspectorPanel) return; // already open

  foxInspectorPanel = document.createElement('div');
  foxInspectorPanel.id = 'fox-inspector-panel';

  foxInspectorPanel.innerHTML = html`
    <div class="fox-inspector-panel-header">
      <div class="fox-inspector-panel-title">${icon('target')} Inspector</div>
      <button class="fox-icon-btn" id="fox-inspector-close" title="Close">${icon('close')}</button>
    </div>
    <div id="fox-inspector-content"></div>
  `;

  state.root.appendChild(foxInspectorPanel);

  // Make draggable by header
  makeDraggable(foxInspectorPanel, foxInspectorPanel.querySelector('.fox-inspector-panel-header'));

  // Close button
  foxInspectorPanel.querySelector('#fox-inspector-close').addEventListener('click', closeInspectorPanel);

  // Render initial content and activate
  updateInspectorContent(null);
  activateInspector();
}

function closeInspectorPanel() {
  deactivateInspector();
  if (foxInspectorPanel) {
    foxInspectorPanel.remove();
    foxInspectorPanel = null;
  }
}

function toggleInspectorPanel() {
  if (foxInspectorPanel) {
    closeInspectorPanel();
  } else {
    openInspectorPanel();
  }
}

function activateInspector() {
  if (isInspectorActive) return;
  isInspectorActive = true;
  document.addEventListener('mousemove', trackMousePosition);
  document.addEventListener('click', captureSnapshot, true);
  showToast('Inspector activated', 'info');
}

function deactivateInspector() {
  if (!isInspectorActive) return;
  isInspectorActive = false;
  document.removeEventListener('mousemove', trackMousePosition);
  document.removeEventListener('click', captureSnapshot, true);
}

function trackMousePosition(e) {
  if (!isInspectorActive) return;
  if (isOwnUi(e.target)) return;

  const element = e.target;
  const data = {
    x: e.clientX,
    y: e.clientY,
    pageX: e.pageX,
    pageY: e.pageY,
    element: element.tagName.toLowerCase(),
    elementId: element.id || ''
  };

  updateInspectorContent(data);
}

function captureSnapshot(e) {
  if (!isInspectorActive) return;
  if (isOwnUi(e.target)) return;

  e.preventDefault();
  e.stopPropagation();

  const element = e.target;
  inspectorSnapshots.push({
    time: new Date().toLocaleTimeString(),
    x: e.clientX,
    y: e.clientY,
    pageX: e.pageX,
    pageY: e.pageY,
    element: element.tagName.toLowerCase(),
    elementId: element.id || '',
    elementText: element.textContent?.slice(0, 30) || ''
  });

  updateInspectorContent(null);
}

function updateInspectorContent(currentData) {
  const container = foxInspectorPanel?.querySelector('#fox-inspector-content');
  if (!container) return;

  const currentHTML = currentData ? html`
    <div class="fox-insp-current">
      <div class="fox-insp-coords">
        <span class="fox-insp-icon">${icon('target')}</span>
        <span>${currentData.x}, ${currentData.y}</span>
      </div>
      <div class="fox-insp-element">
        <span class="fox-insp-tag">&lt;${currentData.element}&gt;</span>${currentData.elementId ? html`<span class="fox-insp-id">#${currentData.elementId}</span>` : ''}
      </div>
    </div>
  ` : html`
    <div class="fox-insp-current">
      <div class="fox-insp-empty">Move mouse to track position</div>
    </div>
  `;

  const snapshotsHTML = inspectorSnapshots.length > 0 ?
    inspectorSnapshots.map((snap, idx) => html`
      <div class="fox-snap-item">
        <span class="fox-snap-num">${idx + 1}</span>
        <span class="fox-snap-coords">${snap.x}, ${snap.y}</span>
        <span class="fox-snap-time">${snap.time}</span>
      </div>
    `) : html`<div class="fox-insp-empty">Click to capture snapshots</div>`;

  container.innerHTML = html`
    <div class="fox-inspector-body">
      ${currentHTML}
      <div class="fox-insp-note">${icon('info')}<span>While the Inspector is open, clicks on the page are captured as snapshots and don't reach the page.</span></div>
      <div class="fox-snap-header">
        <span class="fox-section-label">SNAPSHOTS</span>
        ${inspectorSnapshots.length > 0 ? html`<button class="fox-snap-clear" id="fox-snap-clear">Clear</button>` : ''}
      </div>
      <div class="fox-snap-list">${snapshotsHTML}</div>
    </div>
  `;

  // Bind clear
  const clearBtn = container.querySelector('#fox-snap-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      inspectorSnapshots = [];
      updateInspectorContent(null);
    });
  }
}
