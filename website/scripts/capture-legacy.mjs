// Screenshot of the OLD extension (Fox Auto Clicker 2.0.2, git branch `legacy`) for
// /moved/ step 2:   cd website && node scripts/capture-legacy.mjs
//   assets/web/export-old.png  the old popup's "Fox has moved" box with Export marked
import { chromium } from "playwright";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { root } from "./fox-browser.mjs";

const ext = realpathSync(mkdtempSync(join(tmpdir(), "fox-legacy-")));
execSync(`git -C "${root}" archive legacy | tar -x -C "${ext}"`);
// unpacked extension id = sha256(path), hex digits 0-f mapped to a-p
const id = [...createHash("sha256").update(ext).digest("hex").slice(0, 32)]
  .map((c) => String.fromCharCode(97 + parseInt(c, 16))).join("");

const ctx = await chromium.launchPersistentContext("", {
  channel: "chromium", headless: true, viewport: { width: 320, height: 400 }, deviceScaleFactor: 2,
  args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`],
});
const page = await ctx.newPage();
await page.goto(`chrome-extension://${id}/popup/popup.html`);
await page.waitForSelector("#exportBtn");
await page.addStyleTag({ content: "#exportBtn { outline: 4px solid #FF004D; outline-offset: 2px; }" });
const box = await page.locator(".moved").boundingBox();
const header = await page.locator(".header").boundingBox();
await page.screenshot({
  path: join(root, "assets/web/export-old.png"),
  clip: { x: 0, y: header.y, width: box.x + box.width + 12, height: box.y + box.height + 12 - header.y },
});
await ctx.close();
console.log("capture: assets/web/export-old.png");
