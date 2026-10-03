// Fox Macro Recorder - FAB (Floating Action Button), shown while the panel is minimized

let foxFab = null;

function createFab() {
  foxFab = document.createElement('button');
  foxFab.id = 'fox-fab';
  foxFab.textContent = '🦊';
  foxFab.title = 'Open Fox Macro';
  foxFab.addEventListener('click', expandPanel);
  makeDraggable(foxFab);
  state.root.appendChild(foxFab);
}

function hideFab() {
  foxFab.classList.remove('visible');
}

function minimizePanel() {
  state.panel.classList.add('hidden');
  state.isPanelMinimized = true;
  foxFab.classList.add('visible');
  renderMode();
}

function expandPanel() {
  state.panel.classList.remove('hidden');
  state.isPanelMinimized = false;
  hideFab();
}
