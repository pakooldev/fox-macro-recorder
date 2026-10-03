// Fox Macro Recorder - Storage (the only file that touches chrome.storage)
// Keys and shapes are the same as v2.0.x, so existing/imported data keeps working.

const DEFAULT_SETTINGS = { randomDelayEnabled: false, randomDelayMin: 100, randomDelayMax: 500 };

async function getMacros() {
  return (await chrome.storage.local.get({ macros: [] })).macros;
}

async function getMacro(id) {
  return (await getMacros()).find(m => m.id === id);
}

// fn receives the current list and returns the new one
async function updateMacros(fn) {
  await chrome.storage.local.set({ macros: fn(await getMacros()) });
}

function loadSettings() {
  return chrome.storage.local.get(DEFAULT_SETTINGS);
}

function saveSetting(key, value) {
  return chrome.storage.local.set({ [key]: value });
}
