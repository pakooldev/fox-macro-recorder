// Fox Macro Recorder - Storage (the only file that touches chrome.storage)
// Keys and shapes are the same as v2.0.x, so existing/imported data keeps working.

const DEFAULT_SETTINGS = { randomDelayEnabled: false, randomDelayMin: 100, randomDelayMax: 500 };

async function getMacros() {
  return (await chrome.storage.local.get({ macros: [] })).macros;
}

async function getMacro(id) {
  return (await getMacros()).find(m => m.id === id);
}

// What this tab last wrote, so watchStore() can ignore its own echoes
let lastWrittenMacros = null;

// fn receives the current list and returns the new one
async function updateMacros(fn) {
  const macros = fn(await getMacros());
  lastWrittenMacros = JSON.stringify(macros);
  await chrome.storage.local.set({ macros });
}

function loadSettings() {
  return chrome.storage.local.get(DEFAULT_SETTINGS);
}

function saveSetting(key, value) {
  return chrome.storage.local.set({ [key]: value });
}

// Changes made in OTHER tabs: onMacros() when the list changed, onSettings(changed)
// with the changed setting values. This tab's own writes are skipped, so a re-render
// never steals focus from an input the user is editing here.
function watchStore({ onMacros, onSettings }) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.macros && JSON.stringify(changes.macros.newValue ?? []) !== lastWrittenMacros) {
      lastWrittenMacros = null;
      onMacros();
    }
    const settings = {};
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
      if (changes[key] && changes[key].newValue !== state.settings[key]) settings[key] = changes[key].newValue;
    }
    if (Object.keys(settings).length) onSettings(settings);
  });
}
