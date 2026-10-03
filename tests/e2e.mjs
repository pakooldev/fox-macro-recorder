// End-to-end check of the real extension in Chromium.   npm install && npm run e2e
//
// Loads a temp copy of the extension with host_permissions <all_urls>: that stands in
// for the activeTab grant a real toolbar click gives (automation can't click the
// toolbar). The "icon click" is background.js's own togglePanel(), run in the service
// worker. Every user-facing flow and each review fix (B3–B10, domain filter) has a step.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const ext = mkdtempSync(join(tmpdir(), 'fox-ext-'));
for (const p of ['manifest.json', 'background.js', 'content', 'icons', 'assets/fonts', 'assets/sprites']) {
  cpSync(join(root, p), join(ext, p), { recursive: true });
}
const manifest = JSON.parse(readFileSync(join(ext, 'manifest.json')));
writeFileSync(join(ext, 'manifest.json'), JSON.stringify({ ...manifest, host_permissions: ['<all_urls>'] }));

const pageHtml = readFileSync(join(root, 'tests/fixtures/page.html'));
const server = createServer((_, res) => { res.setHeader('content-type', 'text/html'); res.end(pageHtml); });
await new Promise(r => server.listen(0, r));
const ORIGIN = `http://localhost:${server.address().port}`;

const ctx = await chromium.launchPersistentContext('', {
  channel: 'chromium', headless: true, viewport: { width: 1200, height: 800 },
  args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`]
});
const sw = ctx.serviceWorkers()[0] || await ctx.waitForEvent('serviceworker');
const errors = [];

async function openPage(path = '/') {
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  await page.goto(ORIGIN + path);
  return page;
}

// Toolbar click on the tab showing `page`
const clickIcon = page => sw.evaluate(async (url) => {
  const [tab] = await chrome.tabs.query({ url });
  await togglePanel(tab.id);
}, page.url());

const toastText = page => page.locator('.fox-toast.visible').last().textContent();

let step = 0;
const check = async (name, fn) => { step++; await fn(); console.log(`ok ${step} - ${name}`); };

try {
  const page = await openPage();

  await check('nothing is injected until the icon is clicked', async () => {
    assert.equal(await page.$('#fox-macro-shadow-host'), null);
    await clickIcon(page);
    await page.waitForSelector('#fox-panel:not(.hidden)');
    await page.waitForSelector('.fox-empty');
  });

  await check('record two clicks, save with an HTML-looking name', async () => {
    await page.click('#fox-record-btn');
    await page.mouse.click(200, 320);
    await page.mouse.click(450, 320);
    assert.equal(await page.textContent('.fox-rec-count'), '2');
    await page.click('#fox-stop-btn');
    assert.deepEqual(await page.evaluate(() => window.clicks), ['a', 'b']);
    assert.equal(await page.inputValue('#fox-save-domain'), 'localhost');
    await page.fill('#fox-save-input', '<img src=x onerror="window.__xss=2">');
    await page.click('#fox-save-btn');
    await page.waitForSelector('.fox-macro-card');
    assert.equal(await page.textContent('.fox-macro-name'), '<img src=x onerror="window.__xss=2">');
  });

  await check('B5: an unsaved recording is never thrown away silently', async () => {
    await page.click('#fox-record-btn');
    await page.click('#fox-stop-btn');
    assert.equal(await toastText(page), 'Nothing recorded');
    await page.click('#fox-record-btn');
    await page.mouse.click(450, 320);
    await page.click('#fox-stop-btn');
    await page.click('#fox-record-btn'); // save bar still open
    assert.equal(await toastText(page), 'Save or discard the last recording first');
    assert.equal(await page.isDisabled('#fox-record-btn'), false, 'did not start recording');
    await page.click('#fox-discard-btn');
    await page.waitForSelector('.fox-save-bar:not(.visible)', { state: 'attached' });
    assert.equal(await page.locator('.fox-macro-card').count(), 1);
  });

  await check('edit: page text stays text; rename and change a delay', async () => {
    await page.click('[data-action="edit"]');
    await page.waitForSelector('#fox-edit-panel');
    assert.equal((await page.textContent('.fox-action-text')).trim(), '<img src=x onerror="window.__xss=1">');
    await page.fill('.fox-delay-input[data-index="1"]', '100');
    await page.fill('#fox-edit-name', 'M1');
    await page.click('#fox-edit-save');
    await page.waitForSelector('#fox-edit-panel', { state: 'detached' });
    await page.waitForFunction(() => document.querySelector('#fox-macro-shadow-host').shadowRoot.querySelector('.fox-macro-name')?.textContent === 'M1');
  });

  await check('play 2 loops from the card', async () => {
    await page.fill('.fox-loop-input[data-field="loopCount"]', '2');
    await page.press('.fox-loop-input[data-field="loopCount"]', 'Tab');
    await page.evaluate(() => { window.clicks = []; });
    await page.click('[data-action="play"]');
    await page.waitForSelector('.fox-abtn-stop');
    await page.waitForSelector('.fox-abtn-play', { timeout: 10000 });
    assert.deepEqual(await page.evaluate(() => window.clicks), ['a', 'b', 'a', 'b']);
  });

  await check('B3: Stop works during a long loop delay', async () => {
    await page.fill('.fox-loop-input[data-field="loopDelay"]', '15000');
    await page.press('.fox-loop-input[data-field="loopDelay"]', 'Tab');
    await page.click('#fox-play-btn');
    await page.waitForFunction(() => document.querySelector('#fox-macro-shadow-host').shadowRoot.querySelector('.fox-play-progress')?.textContent.includes(' IN '), null, { timeout: 5000 });
    const t = Date.now();
    await page.click('#fox-play-btn');
    await page.waitForSelector('.fox-btn-play-main', { timeout: 2000 });
    assert(Date.now() - t < 1500, `stopped after ${Date.now() - t} ms`);
  });

  await check('settings: version, shortcut, random delay (accessible switch) persist after reload', async () => {
    await page.click('.fox-tab-btn[data-tab="settings"]');
    assert.match(await page.textContent('.fox-about'), new RegExp(`v${manifest.version.replace(/\./g, '\\.')}`));
    assert.match(await page.textContent('.fox-about'), /Show\/hide: \S/);
    await page.focus('#fox-random-delay-toggle');
    await page.keyboard.press('Space');
    assert.equal(await page.getAttribute('#fox-random-delay-toggle', 'aria-checked'), 'true');
    await page.fill('#fox-delay-min', '0');
    await page.press('#fox-delay-min', 'Tab');
    await page.waitForTimeout(200);
    await page.reload();
    await clickIcon(page);
    await page.click('.fox-tab-btn[data-tab="settings"]');
    await page.waitForSelector('#fox-random-delay-toggle.active');
    assert.equal(await page.inputValue('#fox-delay-min'), '0');
    await page.click('.fox-tab-btn[data-tab="home"]');
  });

  await check('B10: the panel cannot be dragged off screen', async () => {
    const h = await page.locator('.fox-title').boundingBox();
    await page.mouse.move(h.x + 5, h.y + 5);
    await page.mouse.down();
    await page.mouse.move(-500, -500, { steps: 4 });
    await page.mouse.up();
    const box = await page.locator('#fox-panel').boundingBox();
    assert(box.x >= 0 && box.y >= 0, JSON.stringify(box));
  });

  // ---- UX review 2 (reviews/2026-10-03-ux-review-2.md), round 1 ----
  const rect = async (sel) => { await page.waitForTimeout(160); return page.locator(sel).boundingBox(); }; // after the 120ms entrance animations
  const clientWidth = () => page.evaluate(() => document.documentElement.clientWidth);

  await check('H1: dragged flush right, the panel stays clear of the page scrollbar', async () => {
    const h = await rect('.fox-title');
    await page.mouse.move(h.x + 5, h.y + 5);
    await page.mouse.down();
    await page.mouse.move(await clientWidth() - 2, h.y + 5, { steps: 4 }); // past the clamp, still inside the page
    await page.mouse.up();
    const box = await rect('#fox-panel');
    assert(box.x + box.width <= await clientWidth() - 4, `panel right ${box.x + box.width} vs clientWidth ${await clientWidth()}`);
  });

  await check('H3: a drag released off the panel does not eat the next click', async () => {
    // pointer ran past the clamped panel, so the mouseup/click happened elsewhere
    await page.click('#fox-minimal-btn');
    assert(await page.locator('#fox-panel.minimal-mode').count() === 1, 'minimal toggle click was swallowed');
  });

  await check('2.1: in minimal mode the title-bar buttons stay right-aligned', async () => {
    const panel = await rect('#fox-panel');
    const actions = await rect('.fox-header-actions');
    assert(panel.x + panel.width - (actions.x + actions.width) < 12, `gap ${panel.x + panel.width - (actions.x + actions.width)}`);
    await page.click('#fox-minimal-btn');
  });

  await check('H2: after recording in the narrow mode, the full panel is pulled back on screen; the drag recorded nothing', async () => {
    await page.click('#fox-record-btn');
    const h = await rect('.fox-title');
    await page.mouse.move(h.x + 5, h.y + 5);
    await page.mouse.down();
    await page.mouse.move(await clientWidth() - 2, h.y + 5, { steps: 4 });
    await page.mouse.up(); // released on the page: must not be recorded as a click
    await page.click('#fox-stop-btn');
    const box = await rect('#fox-panel');
    assert(box.x >= 0 && box.x + box.width <= await clientWidth(), JSON.stringify(box));
    assert.equal(await toastText(page), 'Nothing recorded');
  });

  await check('2.2: playback never leaves a dashed outline on the page', async () => {
    await sw.evaluate(() => chrome.storage.local.get({ macros: [] }).then(({ macros }) => chrome.storage.local.set({
      macros: [...macros, { id: 'twice', name: 'Same button twice', domain: 'localhost', actions: [{ x: 450, y: 320, timestamp: 0 }, { x: 450, y: 320, timestamp: 100 }] }]
    })));
    await page.waitForSelector('.fox-macro-card[data-id="twice"]');
    await page.click('.fox-macro-card[data-id="twice"] [data-action="play"]');
    await page.waitForSelector('.fox-macro-card[data-id="twice"] .fox-abtn-play', { timeout: 5000 });
    await page.waitForTimeout(700);
    assert.equal(await page.evaluate(() => document.getElementById('b').style.outline), '');
    assert.equal(await page.evaluate(() => [...document.body.children].filter(e => e.style.border.includes('dashed')).length), 0);
    await page.locator('.fox-macro-card[data-id="twice"] [data-action="delete"]').click();
    await page.click('[data-action="confirm-delete"]');
  });

  await check('2.3: inspector and edit panel open next to the main panel; Esc closes them', async () => {
    await page.click('#fox-inspector-toggle');
    assert.equal(await page.locator('#fox-inspector-toggle.pressed').count(), 1);
    const main = await rect('#fox-panel');
    const insp = await rect('#fox-inspector-panel');
    assert(Math.abs(insp.x + insp.width + 12 - main.x) <= 2 || Math.abs(main.x + main.width + 12 - insp.x) <= 2, `inspector at ${insp.x}, main at ${main.x}`);
    await page.click('#fox-inspector-close');
    assert.equal(await page.locator('#fox-inspector-toggle.pressed').count(), 0);
    await page.locator('[data-action="edit"]').first().click();
    const edit = await rect('#fox-edit-panel');
    assert(Math.abs(edit.y - main.y) <= 2 && edit.x + edit.width <= main.x, `edit at ${edit.x},${edit.y}`);
    await page.focus('#fox-edit-name');
    await page.keyboard.press('Escape');
    await page.waitForSelector('#fox-edit-panel', { state: 'detached' });
    // both open: the second one cascades, still clear of the main panel
    await page.click('#fox-inspector-toggle');
    await page.locator('[data-action="edit"]').first().click();
    const edit2 = await rect('#fox-edit-panel');
    assert(edit2.x + edit2.width <= main.x, `edit overlaps main: ${edit2.x + edit2.width} > ${main.x}`);
    await page.click('#fox-edit-close');
    await page.click('#fox-inspector-close');
  });

  // ---- UX review 2, round 2 ----
  await check('2.4: toasts hang under the main panel, same width', async () => {
    await page.click('#fox-record-btn');
    await page.click('#fox-stop-btn'); // "Nothing recorded"
    const panel = await rect('#fox-panel');
    await page.waitForSelector('.fox-toast.visible');
    await page.waitForTimeout(200);
    const toast = await rect('.fox-toast.visible');
    assert(Math.abs(toast.x - panel.x) <= 1 && Math.abs(toast.width - panel.width) <= 1, JSON.stringify({ toast, panel }));
    assert(toast.y >= panel.y + panel.height && toast.y - (panel.y + panel.height) < 20, JSON.stringify({ toast, panel }));
  });

  await check('M2/M3: hiding the panel mid-recording leaves the FAB at the panel corner', async () => {
    const panel = await rect('#fox-panel');
    await page.click('#fox-record-btn');
    await clickIcon(page);
    await page.waitForSelector('#fox-fab.visible.recording');
    const fab = await rect('#fox-fab');
    assert(Math.abs(fab.y - panel.y) <= 8 && fab.x + fab.width <= panel.x + panel.width + 8, JSON.stringify({ fab, panel }));
    await page.click('#fox-fab');
    await page.click('#fox-stop-btn');
  });

  await check('M1: with many macros the controls stay visible while the list scrolls', async () => {
    await sw.evaluate(() => chrome.storage.local.get({ macros: [] }).then(({ macros }) => chrome.storage.local.set({
      macros: [...macros, ...Array.from({ length: 12 }, (_, i) => ({ id: 'many' + i, name: 'Many ' + i, domain: 'localhost', actions: [{ x: 1, y: 1, timestamp: 0 }] }))]
    })));
    await page.waitForSelector('.fox-macro-card[data-id="many11"]');
    await page.locator('.fox-macro-card[data-id="many11"]').scrollIntoViewIfNeeded();
    const rec = await rect('#fox-record-btn');
    const panel = await rect('#fox-panel');
    assert(rec && rec.y > panel.y && rec.y < panel.y + 100, `record button at ${rec?.y}`);
    await sw.evaluate(() => chrome.storage.local.get({ macros: [] }).then(({ macros }) => chrome.storage.local.set({ macros: macros.filter(m => !m.id.startsWith('many')) })));
    await page.waitForFunction(() => !document.querySelector('#fox-macro-shadow-host').shadowRoot.querySelector('[data-id="many0"]'));
  });

  await check('M6: the edit panel warns once before discarding changes', async () => {
    await page.locator('[data-action="edit"]').first().click();
    await page.fill('#fox-edit-name', 'changed');
    await page.click('#fox-edit-close');
    assert.equal(await page.locator('#fox-edit-panel').count(), 1);
    assert.equal(await toastText(page), 'Unsaved changes: close again to discard');
    await page.click('#fox-edit-close');
    await page.waitForSelector('#fox-edit-panel', { state: 'detached' });
  });

  await check('B4: minimize, drag the FAB from its middle, then restore', async () => {
    await page.click('#fox-minimize-btn');
    const before = await page.locator('#fox-fab').boundingBox();
    await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
    await page.mouse.down();
    await page.mouse.move(before.x - 200, before.y - 200, { steps: 5 });
    await page.mouse.up();
    const after = await page.locator('#fox-fab').boundingBox();
    assert(after.x < before.x - 150, `FAB moved ${before.x - after.x}px`);
    await page.waitForSelector('#fox-panel.hidden', { state: 'attached' }); // drop is not a click
    await page.click('#fox-fab');
    await page.waitForSelector('#fox-panel:not(.hidden)');
  });

  await check('domain filter: this site by default, "All domains" shows the rest', async () => {
    await sw.evaluate(() => chrome.storage.local.get({ macros: [] }).then(({ macros }) =>
      chrome.storage.local.set({ macros: [...macros, { id: 'x', name: 'Other site', domain: 'example.com', actions: [{ x: 1, y: 1, timestamp: 0 }] }] })));
    await page.waitForFunction(() => document.querySelector('#fox-macro-shadow-host').shadowRoot.querySelector('#fox-domain-filter').options.length === 3);
    assert.equal(await page.locator('.fox-macro-card').count(), 1);
    assert.equal(await page.inputValue('#fox-domain-filter'), 'localhost');
    await page.selectOption('#fox-domain-filter', '__all__');
    assert.equal(await page.locator('.fox-macro-card').count(), 2);
  });

  await check('B9: a macro saved in another tab shows up here', async () => {
    const page2 = await openPage('/?tab=2'); // distinct URL: clickIcon() finds the tab by URL
    await clickIcon(page2);
    await page2.waitForSelector('#fox-panel:not(.hidden)');
    await page2.click('#fox-record-btn');
    await page2.mouse.click(450, 320);
    await page2.click('#fox-stop-btn');
    await page2.fill('#fox-save-input', 'From tab 2');
    await page2.click('#fox-save-btn');
    await page.waitForFunction(() => [...document.querySelector('#fox-macro-shadow-host').shadowRoot.querySelectorAll('.fox-macro-name')].some(n => n.textContent === 'From tab 2'));
    await page2.close();
  });

  await check('delete with confirm', async () => {
    const n = await page.locator('.fox-macro-card').count();
    await page.locator('.fox-macro-card').last().locator('[data-action="delete"]').click();
    await page.click('[data-action="confirm-delete"]');
    await page.waitForFunction(m => document.querySelector('#fox-macro-shadow-host').shadowRoot.querySelectorAll('.fox-macro-card').length === m, n - 1);
  });

  await check('B8: inspector explains that it captures page clicks', async () => {
    await page.click('#fox-inspector-toggle');
    await page.mouse.move(450, 320);
    await page.waitForSelector('.fox-insp-id');
    assert.match(await page.textContent('.fox-insp-note'), /don't reach the page/);
    await page.click('#fox-inspector-close');
  });

  await check('B6: navigating while recording cancels it and says so', async () => {
    await page.click('#fox-record-btn');
    await page.click('#nav');
    await page.waitForURL(/page=2/);
    // background.js sets the badge asynchronously after the old page's pagehide
    const badge = await sw.evaluate(async (url) => {
      const [tab] = await chrome.tabs.query({ url });
      for (let i = 0; i < 20; i++) {
        const text = await chrome.action.getBadgeText({ tabId: tab.id });
        if (text) return text;
        await new Promise(r => setTimeout(r, 100));
      }
      return '';
    }, page.url());
    assert.equal(badge, '!');
    await clickIcon(page);
    await page.waitForSelector('.fox-toast.visible');
    assert.equal(await toastText(page), 'Recording cancelled: the page changed');
  });

  await check('a second icon click hides the panel without re-injecting', async () => {
    await clickIcon(page);
    await page.waitForSelector('#fox-panel.hidden', { state: 'attached' });
    assert.equal(await page.evaluate(() => document.querySelectorAll('#fox-macro-shadow-host').length), 1);
  });

  await check('restricted pages fail (background.js shows a "!" badge)', async () => {
    const err = await sw.evaluate(async () => {
      const t = await chrome.tabs.create({ url: 'chrome://version' });
      await new Promise(r => setTimeout(r, 500));
      try { await togglePanel(t.id); return null; } catch (e) { return String(e); }
    });
    assert(err);
  });

  await check('no injected markup ran, no console errors', async () => {
    assert.equal(await page.evaluate(() => window.__xss), undefined);
    assert.deepEqual(errors, []);
  });

  console.log(`\nPASS: ${step} checks`);
} finally {
  await ctx.close();
  server.close();
  rmSync(ext, { recursive: true, force: true });
}
