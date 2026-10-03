// Fox Macro Recorder - Service worker
// Clicking the toolbar icon toggles the in-page panel. Content scripts are injected
// on demand (activeTab), not on every page.

// Order matters: main.js runs the init and must come last.
const CONTENT_FILES = [
  'content/utils.js',
  'content/icons.js',
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

async function togglePanel(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { action: 'togglePanel' });
  } catch {
    // Not injected yet on this page
    await chrome.scripting.executeScript({ target: { tabId }, files: CONTENT_FILES });
    await chrome.tabs.sendMessage(tabId, { action: 'togglePanel' });
  }
}

chrome.action.onClicked.addListener(async (tab) => {
  try {
    await togglePanel(tab.id);
    await chrome.action.setBadgeText({ tabId: tab.id, text: '' });
    await chrome.action.setTitle({ tabId: tab.id, title: chrome.runtime.getManifest().name });
  } catch {
    // chrome://, the Web Store, PDF viewer... (tab-scoped, cleared on navigation)
    await chrome.action.setBadgeText({ tabId: tab.id, text: '!' });
    await chrome.action.setTitle({ tabId: tab.id, title: "Fox can't run on this page" });
  }
});

// The panel shows the user's current toggle shortcut (content scripts can't read chrome.commands)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action !== 'getShortcut') return;
  chrome.commands.getAll().then(commands => {
    sendResponse(commands.find(c => c.name === '_execute_action')?.shortcut || '');
  });
  return true;
});
