// node --test tests/*.test.mjs
// html`` is what keeps page text and macro names from becoming markup.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const ctx = vm.createContext({});
vm.runInContext(readFileSync(new URL('../content/utils.js', import.meta.url), 'utf8'), ctx);
const html = vm.runInContext('html', ctx);

test('escapes interpolated values, including attribute quotes', () => {
  const name = '<img src=x onerror="alert(1)">';
  assert.equal(String(html`<b title="${name}">${name}</b>`),
    '<b title="&lt;img src=x onerror=&quot;alert(1)&quot;&gt;">&lt;img src=x onerror=&quot;alert(1)&quot;&gt;</b>');
});

test('nested html`` and arrays of it are not double-escaped', () => {
  const items = ['a&b', '<c>'].map(x => html`<li>${x}</li>`);
  assert.equal(String(html`<ul>${items}</ul>`), '<ul><li>a&amp;b</li><li>&lt;c&gt;</li></ul>');
});

test('null/undefined render as empty, numbers as text', () => {
  assert.equal(String(html`${null}|${undefined}|${0}`), '||0');
});
