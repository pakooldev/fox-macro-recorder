// Fox Macro Recorder - FAB (Floating Action Button), shown while the panel is minimized

let foxFab = null;

function createFab() {
  foxFab = document.createElement('button');
  foxFab.id = 'fox-fab';
  foxFab.innerHTML = '<span class="fox-mascot fox-m-idle"></span>';
  foxFab.title = 'Open Fox Macro Recorder';
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
  clampIntoView(state.panel);
}
