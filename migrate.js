// Fox Auto Clicker 2.0.2 - "Fox has moved": export for the new Fox Macro Recorder.
// Loaded by both the content scripts and the popup. The file format is the one the new
// extension imports (its content/transfer.js buildExport): keep the two in step.

const FOX_MOVED_URL = 'https://fox-macro.pakool.com/moved/';

// Saves every macro to fox-macros-YYYY-MM-DD.json; resolves to how many were saved
async function exportMacrosFile() {
  const { macros = [] } = await chrome.storage.local.get(['macros']);
  if (macros.length === 0) return 0;
  const now = new Date();
  const json = JSON.stringify({ app: 'fox-macro-recorder', format: 1, exportedAt: now.toISOString(), macros }, null, 2);
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `fox-macros-${now.toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return macros.length;
}
