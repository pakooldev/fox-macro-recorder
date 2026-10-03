// Fox Macro Recorder - Recording Functionality

function handleClick(event) {
  if (!state.isRecording || isOwnUi(event.target)) return;

  const element = event.target;
  const rect = element.getBoundingClientRect();

  state.recordedActions.push({
    type: 'click',
    selector: getSelector(element),
    x: event.clientX,
    y: event.clientY,
    pageX: event.pageX,
    pageY: event.pageY,
    elementX: event.clientX - rect.left,
    elementY: event.clientY - rect.top,
    timestamp: Date.now() - state.recordingStartTime,
    tagName: element.tagName.toLowerCase(),
    text: element.textContent?.slice(0, 50) || ''
  });

  const countEl = q('.fox-rec-count');
  if (countEl) countEl.textContent = state.recordedActions.length;

  showClickFeedback(event.clientX, event.clientY, '#EF4444');
}

function startRecording() {
  state.isRecording = true;
  state.recordingStartTime = Date.now();
  state.recordedActions = [];
  q('.fox-save-bar').classList.remove('visible');
  renderMode();
  showToast('⏺ Recording started', 'info');
}

function stopRecording() {
  state.isRecording = false;
  renderMode();
  if (state.recordedActions.length === 0) return;

  q('.fox-save-bar').classList.add('visible');
  q('#fox-save-domain').value = window.location.hostname;
  const saveInput = q('#fox-save-input');
  saveInput.value = '';

  if (state.isPanelMinimized) expandPanel();
  if (state.activeTab !== 'home') switchTab('home');
  saveInput.focus();
}
