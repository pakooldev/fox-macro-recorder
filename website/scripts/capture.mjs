// Screenshots of the real extension for the site (not run by the build; rerun after a
// visible change to the panel):   cd website && npm run build && node scripts/capture.mjs
//   assets/web/panel.png   playground tiles + the panel playing a macro (landing page)
//   assets/web/import.png  Settings -> Macros with Import marked (/moved/ step 3)
// (/moved/ step 2, the OLD extension, is scripts/capture-legacy.mjs)
import { join } from "node:path";
import { launchFox, root } from "./fox-browser.mjs";

const fox = await launchFox({ width: 1100, height: 640, scale: 2 });
const page = await fox.openPanel("/playground/");

await fox.record(page, "Daily check-in", ["#pg-red", "#pg-blue"]);
await fox.record(page, "Tiles 1 to 5", ["#pg-tile-1", "#pg-tile-2", "#pg-tile-3", "#pg-tile-4", "#pg-tile-5"]);
await fox.settle(page);
await page.locator(".fox-macro-card", { hasText: "Tiles" }).locator("button").first().click();
await page.waitForTimeout(1150); // mid-run: a click ripple and "STEP n/5" on screen
{
  // the tiles + the panel, without the site's own header (a site inside the site confuses)
  await page.addStyleTag({ content: ".navbar, .page-head { visibility: hidden; }" });
  const tiles = await page.locator(".playground .card").nth(1).boundingBox();
  const panel = await page.locator("#fox-panel").boundingBox();
  const x = tiles.x - 16, y = panel.y - 12;
  await page.screenshot({
    path: join(root, "assets/web/panel.png"),
    clip: { x, y, width: panel.x + panel.width + 16 - x, height: Math.max(tiles.y + tiles.height, panel.y + panel.height) + 16 - y },
  });
}
await page.waitForSelector('.fox-toast.visible:has-text("Playback complete")', { timeout: 20000 });
await fox.settle(page);

await page.click('.fox-tab-btn[data-tab="settings"]');
await page.waitForSelector("#fox-import-btn");
await page.evaluate(() => {
  const s = document.createElement("style");
  s.textContent = "#fox-import-btn { outline: 4px solid #FF004D; outline-offset: 2px; }";
  document.querySelector("#fox-macro-shadow-host").shadowRoot.append(s);
});
await page.waitForTimeout(200);
{
  // panel header down to the Macros card: just what step 3 points at
  const panel = await page.locator("#fox-panel").boundingBox();
  const card = await page.locator(".fox-settings-card").nth(1).boundingBox();
  await page.screenshot({
    path: join(root, "assets/web/import.png"),
    clip: { x: panel.x, y: panel.y, width: panel.width, height: card.y + card.height + 10 - panel.y },
  });
}

await fox.close();
console.log("capture: assets/web/panel.png, assets/web/import.png");
