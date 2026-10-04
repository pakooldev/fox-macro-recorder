const toggleBtn = document.getElementById('toggleBtn');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

function updateUI(isHidden) {
  if (isHidden) {
    toggleBtn.className = 'btn btn-toggle';
    statusDot.className = 'status-dot hidden';
    statusText.textContent = 'Hidden';
  } else {
    toggleBtn.className = 'btn btn-toggle active';
    statusDot.className = 'status-dot visible';
    statusText.textContent = 'Visible';
  }
}

function showMessage(msg, isError = false) {
  statusDot.className = isError ? 'status-dot hidden' : 'status-dot visible';
  statusText.textContent = msg;
}

// Get current state on popup open
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  try {
    const response = await chrome.tabs.sendMessage(tabs[0].id, { action: 'getPanelState' });
    updateUI(response.isHidden);
  } catch (e) {
    showMessage('Refresh page', true);
  }
});

// Toggle button click
toggleBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'togglePanel' });
    updateUI(response.isHidden);
  } catch (e) {
    showMessage('Refresh page', true);
  }
});

// "Fox has moved" (migrate.js)
document.getElementById('movedLink').href = FOX_MOVED_URL;
document.getElementById('exportBtn').addEventListener('click', async () => {
  const note = document.getElementById('exportNote');
  const count = await exportMacrosFile();
  note.textContent = count ? `Saved ${count} macro${count === 1 ? '' : 's'} to Downloads.` : 'No macros to export.';
  note.hidden = false;
});
