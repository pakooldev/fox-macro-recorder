// Screenshots of the real extension for the site (not run by the build; rerun after a
// visible change to the panel):   cd website && npm run build && node scripts/capture.mjs
//   assets/web/panel.png   playground tiles + the panel playing a macro (landing page)
//   assets/web/import.png  Settings -> Macros with Import marked (/moved/ step 3)
// Uses the extension's dev dependency playwright (../node_modules), and the same
// temp-copy + host_permissions trick as tests/e2e.mjs in place of a toolbar click.
import { chromium } from "playwright";
import { cpSync, mkdtempSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";

const root = new URL("../../", import.meta.url).pathname;
const site = join(root, "website/out");
if (!existsSync(site)) throw new Error("run `npm run build` first");

const ext = mkdtempSync(join(tmpdir(), "fox-ext-"));
for (const p of ["manifest.json", "background.js", "content", "icons", "assets/fonts", "assets/sprites"]) {
  cpSync(join(root, p), join(ext, p), { recursive: true });
}
const manifest = JSON.parse(readFileSync(join(ext, "manifest.json")));
writeFileSync(join(ext, "manifest.json"), JSON.stringify({ ...manifest, host_permissions: ["<all_urls>"] }));

const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".woff2": "font/woff2" };
const server = createServer((req, res) => {
  let p = join(site, decodeURIComponent(req.url.split("?")[0]));
  if (p.endsWith("/")) p += "index.html";
  if (!existsSync(p)) return res.writeHead(404).end();
  res.setHeader("content-type", TYPES[extname(p)] ?? "application/octet-stream");
  res.end(readFileSync(p));
});
await new Promise((r) => server.listen(0, r));

const ctx = await chromium.launchPersistentContext("", {
  channel: "chromium", headless: true, viewport: { width: 1100, height: 640 }, deviceScaleFactor: 2,
  args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`],
});
const sw = ctx.serviceWorkers()[0] || (await ctx.waitForEvent("serviceworker"));
const page = await ctx.newPage();
await page.goto(`http://localhost:${server.address().port}/playground/`, { waitUntil: "networkidle" });
await sw.evaluate(async (url) => { const [t] = await chrome.tabs.query({ url }); await togglePanel(t.id); }, page.url());
await page.waitForSelector("#fox-panel:not(.hidden)");

const clickCenter = async (sel) => {
  const b = await page.locator(sel).boundingBox();
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  await page.waitForTimeout(250);
};
const record = async (name, targets) => {
  await page.click("#fox-record-btn");
  for (const t of targets) await clickCenter(t);
  await page.click("#fox-stop-btn");
  await page.fill("#fox-save-input", name);
  await page.click("#fox-save-btn");
  await page.waitForTimeout(300);
};
await record("Daily check-in", ["#pg-red", "#pg-blue"]);
await record("Tiles 1 to 5", ["#pg-tile-1", "#pg-tile-2", "#pg-tile-3", "#pg-tile-4", "#pg-tile-5"]);
await page.waitForSelector(".fox-toast.visible", { state: "detached", timeout: 10000 }).catch(() => {});
await page.waitForTimeout(300);
await page.locator(".fox-macro-card", { hasText: "Tiles" }).locator("button").first().click();
await page.waitForTimeout(1150); // mid-run: a click ripple and "STEP n/5" on screen
// the tiles + the panel, without the site's own header (a site inside the site confuses)
{
  await page.addStyleTag({ content: ".navbar, .page-head { visibility: hidden; }" });
  const tiles = await page.locator(".playground .card").nth(1).boundingBox();
  const fox = await page.locator("#fox-panel").boundingBox();
  const x = tiles.x - 16, y = fox.y - 12;
  await page.screenshot({
    path: join(root, "assets/web/panel.png"),
    clip: { x, y, width: fox.x + fox.width + 16 - x, height: Math.max(tiles.y + tiles.height, fox.y + fox.height) + 16 - y },
  });
}
await page.waitForSelector('.fox-toast.visible:has-text("Playback complete")', { timeout: 20000 });
await page.waitForTimeout(1600);

await page.click('.fox-tab-btn[data-tab="settings"]');
await page.waitForSelector("#fox-import-btn");
await page.evaluate(() => {
  const root = document.querySelector("#fox-macro-shadow-host").shadowRoot;
  const s = document.createElement("style");
  s.textContent = "#fox-import-btn { outline: 4px solid #FF004D; outline-offset: 2px; }";
  root.append(s);
});
await page.waitForTimeout(200);
// panel header down to the Macros card: just what step 3 points at
const panel = await page.locator("#fox-panel").boundingBox();
const card = await page.locator(".fox-settings-card").nth(1).boundingBox();
await page.screenshot({
  path: join(root, "assets/web/import.png"),
  clip: { x: panel.x, y: panel.y, width: panel.width, height: card.y + card.height + 10 - panel.y },
});

await ctx.close();
server.close();
console.log("capture: assets/web/panel.png, assets/web/import.png");
