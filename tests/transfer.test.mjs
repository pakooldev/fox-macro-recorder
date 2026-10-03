// node --test tests/*.test.mjs
// Import files come from outside: only valid, rebuilt macros may get into storage.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const ctx = vm.createContext({});
vm.runInContext(readFileSync(new URL('../content/transfer.js', import.meta.url), 'utf8'), ctx);
const { buildExport, parseImport, mergeImported } = vm.runInContext('({ buildExport, parseImport, mergeImported })', ctx);
const plain = v => JSON.parse(JSON.stringify(v)); // vm-realm objects -> this realm, for deepEqual

const macro = (id, extra = {}) => ({
  id, name: 'M' + id, domain: 'example.com', createdAt: '2026-01-01T00:00:00.000Z',
  actions: [{ type: 'click', x: 10, y: 20, timestamp: 0, text: 'a' }, { type: 'click', x: 30, y: 40, timestamp: 500 }],
  ...extra
});

test('export then import round-trips the macros', () => {
  const file = buildExport([macro('1', { loopCount: 3, loopDelay: 200 })]);
  const { macros, invalid } = parseImport(file);
  assert.equal(invalid, 0);
  assert.equal(macros.length, 1);
  assert.equal(macros[0].id, '1');
  assert.equal(macros[0].loopCount, 3);
  assert.equal(macros[0].actions[1].timestamp, 500);
});

test('accepts a bare array and a v1.x single-macro file', () => {
  assert.equal(parseImport(JSON.stringify([macro('1'), macro('2')])).macros.length, 2);
  assert.equal(parseImport(JSON.stringify(macro('9'))).macros[0].name, 'M9');
});

test('drops invalid macros, keeps only known fields, clamps values', () => {
  const evil = macro('x', { name: '<img onerror=alert(1)>', loopCount: 1e9, __proto__x: 1, extra: 'drop me' });
  evil.actions[0].onclick = 'alert(1)';
  const file = JSON.stringify({ macros: [evil, { name: 'no actions' }, { actions: [{ x: 'NaN?' }] }] });
  const { macros, invalid } = parseImport(file);
  assert.equal(invalid, 2);
  assert.equal(macros[0].loopCount, 999);
  assert.equal('extra' in macros[0], false);
  assert.equal('onclick' in macros[0].actions[0], false);
  assert.equal(macros[0].name, '<img onerror=alert(1)>'); // kept as text; rendering escapes it
});

test('timestamps never go backwards', () => {
  const m = macro('t');
  m.actions[1].timestamp = -5;
  assert.equal(parseImport(JSON.stringify([m])).macros[0].actions[1].timestamp, 0);
});

test('rejects files that are not Fox macros', () => {
  assert.throws(() => parseImport('not json'), /Not a JSON file/);
  assert.throws(() => parseImport('{"hello": 1}'), /No macros/);
  assert.throws(() => parseImport('[{"name": "x"}]'), /None of the macros/);
});

test('merge skips macros that are already there and gives new ids to id-less ones', () => {
  const imported = parseImport(JSON.stringify([macro('1'), macro('2'), { actions: [{ x: 1, y: 1, timestamp: 0 }] }])).macros;
  let n = 0;
  const r = mergeImported([macro('1')], imported, () => 'new' + (++n));
  assert.equal(r.added, 2);
  assert.equal(r.skipped, 1);
  assert.deepEqual(plain(r.macros.map(m => m.id)), ['1', '2', 'new1']);
});
