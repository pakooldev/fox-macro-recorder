// Fox Macro Recorder - Export / import file format (pure functions, no chrome.* or DOM)
//
// Export: { app: 'fox-macro-recorder', format: 1, exportedAt, macros: [...] }
// Import accepts that, a bare array of macros (the raw storage value), or one macro
// object (what v1.x exported, one file per macro). Files come from outside, so every
// macro is rebuilt from validated fields only; anything unusable is counted, not kept.

const EXPORT_APP = 'fox-macro-recorder';
const EXPORT_FORMAT = 1;
const IMPORT_LIMITS = { macros: 1000, actions: 10000, text: 200 };

function buildExport(macros, now = new Date()) {
  return JSON.stringify({ app: EXPORT_APP, format: EXPORT_FORMAT, exportedAt: now.toISOString(), macros }, null, 2);
}

function exportFileName(now = new Date()) {
  return `fox-macros-${now.toISOString().slice(0, 10)}.json`;
}

const finite = (v, fallback = 0) => (Number.isFinite(Number(v)) ? Number(v) : fallback);
const text = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');

// One action: numbers are required, extras are optional and clamped
function cleanAction(a) {
  if (!a || typeof a !== 'object' || !Number.isFinite(Number(a.x)) || !Number.isFinite(Number(a.y))) return null;
  return {
    type: 'click',
    selector: text(a.selector, 1000),
    x: finite(a.x), y: finite(a.y),
    pageX: finite(a.pageX, finite(a.x)), pageY: finite(a.pageY, finite(a.y)),
    elementX: finite(a.elementX), elementY: finite(a.elementY),
    timestamp: Math.max(0, finite(a.timestamp)),
    tagName: text(a.tagName, 40),
    text: text(a.text, 50)
  };
}

function cleanMacro(m) {
  if (!m || typeof m !== 'object' || !Array.isArray(m.actions)) return null;
  const actions = m.actions.slice(0, IMPORT_LIMITS.actions).map(cleanAction);
  if (actions.length === 0 || actions.includes(null)) return null;
  // timestamps must not go backwards (playback uses the differences as delays)
  for (let i = 1; i < actions.length; i++) {
    if (actions[i].timestamp < actions[i - 1].timestamp) actions[i].timestamp = actions[i - 1].timestamp;
  }
  return {
    id: text(m.id, 40) || null,
    name: text(m.name, IMPORT_LIMITS.text).trim() || 'Imported macro',
    domain: text(m.domain, IMPORT_LIMITS.text).trim(),
    createdAt: text(m.createdAt, 40) || new Date().toISOString(),
    loopCount: Math.min(999, Math.max(1, Math.round(finite(m.loopCount, 1)))),
    loopDelay: Math.max(0, Math.round(finite(m.loopDelay, 0))),
    actions
  };
}

// Text of a file -> { macros, invalid }. Throws Error('…') when it isn't a Fox file at all.
function parseImport(fileText) {
  let data;
  try {
    data = JSON.parse(fileText);
  } catch {
    throw new Error('Not a JSON file');
  }
  let list;
  if (Array.isArray(data)) list = data;
  else if (data && Array.isArray(data.macros)) list = data.macros;
  else if (data && Array.isArray(data.actions)) list = [data];
  else throw new Error('No macros in this file');

  const macros = [], seen = new Set();
  let invalid = 0;
  for (const raw of list.slice(0, IMPORT_LIMITS.macros)) {
    const m = cleanMacro(raw);
    if (!m) { invalid++; continue; }
    if (m.id && seen.has(m.id)) m.id = null;
    if (m.id) seen.add(m.id);
    macros.push(m);
  }
  invalid += Math.max(0, list.length - IMPORT_LIMITS.macros);
  if (macros.length === 0) throw new Error(invalid ? 'None of the macros in this file are valid' : 'No macros in this file');
  return { macros, invalid };
}

// Add imported macros to the existing list. A macro whose id is already there is the
// same macro (e.g. the file was imported before) and is skipped; missing ids get new ones.
function mergeImported(existing, imported, makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`) {
  const ids = new Set(existing.map(m => m.id));
  const added = [];
  let skipped = 0;
  for (const m of imported) {
    if (m.id && ids.has(m.id)) { skipped++; continue; }
    const id = m.id || makeId();
    ids.add(id);
    added.push({ ...m, id });
  }
  return { macros: [...existing, ...added], added: added.length, skipped };
}
