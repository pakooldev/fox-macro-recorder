const toggleBtn = document.getElementById('toggleBtn');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

// Content scripts are injected on demand (activeTab), not on every page.
// Order matters: main.js runs the init and must come last.
const CONTENT_FILES = [
  'content/utils.js',
  'content/store.js',
  'content/styles.js',
  'content/components/toast.js',
  'content/components/fab.js',
  'content/recording.js',
  'content/playback.js',
  'content/macros.js',
  'content/panels/main-panel.js',
  'content/panels/edit-panel.js',
  'content/panels/inspector-panel.js',
  'content/panels/settings-panel.js',
  'content/main.js'
];

function updateUI(isHidden) {
  toggleBtn.className = isHidden ? 'btn btn-toggle' : 'btn btn-toggle active';
  statusDot.className = isHidden ? 'status-dot hidden' : 'status-dot visible';
  statusText.textContent = isHidden ? 'Hidden' : 'Visible';
}

function showError(msg) {
  statusDot.className = 'status-dot hidden';
  statusText.textContent = msg;
}

async function activeTabId() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab.id;
}

// Opening the popup only asks; it never injects into the page
activeTabId()
  .then(tabId => chrome.tabs.sendMessage(tabId, { action: 'getPanelState' }))
  .then(response => updateUI(response.isHidden))
  .catch(() => updateUI(true));

toggleBtn.addEventListener('click', async () => {
  const tabId = await activeTabId();
  try {
    let response;
    try {
      response = await chrome.tabs.sendMessage(tabId, { action: 'togglePanel' });
    } catch {
      // Not injected yet on this page
      await chrome.scripting.executeScript({ target: { tabId }, files: CONTENT_FILES });
      response = await chrome.tabs.sendMessage(tabId, { action: 'togglePanel' });
    }
    updateUI(response.isHidden);
  } catch {
    showError("Can't run on this page");
  }
});
