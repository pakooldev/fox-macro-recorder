// Shared by capture.mjs and store-shots.mjs: the built site (website/out) on a local
// server, and Chromium with the real extension loaded. Uses the extension's dev
// dependency playwright (../node_modules) and the same temp-copy + host_permissions
// trick as tests/e2e.mjs in place of a toolbar click.
import { chromium } from "playwright";
import { cpSync, mkdtempSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";

export const root = new URL("../../", import.meta.url).pathname;

const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".woff2": "font/woff2" };

export async function launchFox({ width, height, scale = 1 }) {
  const site = join(root, "website/out");
  if (!existsSync(site)) throw new Error("run `npm run build` first");

  const ext = mkdtempSync(join(tmpdir(), "fox-ext-"));
  for (const p of ["manifest.json", "background.js", "content", "icons", "assets/fonts", "assets/sprites"]) {
    cpSync(join(root, p), join(ext, p), { recursive: true });
  }
  const manifest = JSON.parse(readFileSync(join(ext, "manifest.json")));
  writeFileSync(join(ext, "manifest.json"), JSON.stringify({ ...manifest, host_permissions: ["<all_urls>"] }));

  const server = createServer((req, res) => {
    let p = join(site, decodeURIComponent(req.url.split("?")[0]));
    if (p.endsWith("/")) p += "index.html";
    if (!existsSync(p)) return res.writeHead(404).end();
    res.setHeader("content-type", TYPES[extname(p)] ?? "application/octet-stream");
    res.end(readFileSync(p));
  });
  await new Promise((r) => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;

  const ctx = await chromium.launchPersistentContext("", {
    channel: "chromium", headless: true, viewport: { width, height }, deviceScaleFactor: scale,
    args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`],
  });
  const sw = ctx.serviceWorkers()[0] || (await ctx.waitForEvent("serviceworker"));

  // A fresh tab on a site page with the Fox panel open
  async function openPanel(path) {
    const page = await ctx.newPage();
    await page.goto(base + path, { waitUntil: "networkidle" });
    await sw.evaluate(async (url) => { const [t] = await chrome.tabs.query({ url }); await togglePanel(t.id); }, page.url());
    await page.waitForSelector("#fox-panel:not(.hidden)");
    return page;
  }

  async function clickCenter(page, sel) {
    const b = await page.locator(sel).boundingBox();
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
    await page.waitForTimeout(250);
  }

  // Record clicks on `targets` and save the macro (domain optional, default: this site)
  async function record(page, name, targets, domain) {
    await page.click("#fox-record-btn");
    for (const t of targets) await clickCenter(page, t);
    await page.click("#fox-stop-btn");
    await page.fill("#fox-save-input", name);
    if (domain) await page.fill("#fox-save-domain", domain);
    await page.click("#fox-save-btn");
    await page.waitForTimeout(300);
  }

  // Let toasts finish so they don't sit in a screenshot
  async function settle(page) {
    await page.waitForSelector(".fox-toast.visible", { state: "detached", timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(300);
  }

  async function close() {
    await ctx.close();
    server.close();
  }

  return { ctx, sw, base, openPanel, clickCenter, record, settle, close };
}
