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
  if (countEl) {
    countEl.textContent = state.recordedActions.length;
    countEl.classList.remove('bump');
    void countEl.offsetWidth; // restart the bump animation
    countEl.classList.add('bump');
  }

  showClickFeedback(event.clientX, event.clientY, '#FF004D');
}

// An unsaved recording blocks a new one: save or discard it first
function hasUnsavedRecording() {
  return q('.fox-save-bar').classList.contains('visible');
}

function startRecording() {
  if (hasUnsavedRecording()) {
    showToast('Save or discard the last recording first', 'error');
    q('#fox-save-input').focus();
    return;
  }
  state.isRecording = true;
  state.recordingStartTime = Date.now();
  state.recordedActions = [];
  renderMode();
  showToast('Recording started', 'info');
}

function stopRecording() {
  state.isRecording = false;
  renderMode();
  if (state.recordedActions.length === 0) {
    showToast('Nothing recorded', 'info');
    return;
  }

  q('.fox-save-bar').classList.add('visible');
  q('#fox-save-domain').value = window.location.hostname;
  const saveInput = q('#fox-save-input');
  saveInput.value = '';

  if (state.isPanelMinimized) expandPanel();
  if (state.activeTab !== 'home') switchTab('home');
  saveInput.focus();
}

function discardRecording() {
  state.recordedActions = [];
  q('.fox-save-bar').classList.remove('visible');
  showToast('Recording discarded', 'info');
}
