// Chrome Web Store images, from the real extension on the playground page:
//   cd website && npm run build && node scripts/store-shots.mjs
//   assets/store/screenshots/1-record.png … 4-settings.png   1280×800 (store size)
//   assets/store/promo-small-440x280-title.png, promo-marquee-1400x560-title.png
// Each screenshot is a 1120×600 browser shot at 1× (pixel art stays crisp: never
// scaled) inside a night-sky frame with a caption, like the website hero.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { launchFox, root } from "./fox-browser.mjs";

const SHOT = { width: 1120, height: 600 };
const OUT = join(root, "assets/store");
const fox = await launchFox(SHOT);
const shots = [];

// ---- 1. Recording in progress
{
  const page = await fox.openPanel("/playground/");
  await page.click("#fox-record-btn");
  await fox.settle(page);
  for (const t of ["#pg-red", "#pg-tile-1", "#pg-tile-2"]) await fox.clickCenter(page, t);
  const b = await page.locator("#pg-tile-3").boundingBox();
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  await page.waitForTimeout(60); // the red click ring is still on screen
  shots.push({ file: "1-record", title: "Record your clicks", sub: "Press Record, click around the page, press Stop.", png: await page.screenshot() });
  await page.close();
}

// ---- 2. Playback on a loop (a new tab starts with no recording; macros persist)
{
  const page = await fox.openPanel("/playground/");
  await fox.record(page, "Tiles 1 to 5", ["#pg-tile-1", "#pg-tile-2", "#pg-tile-3", "#pg-tile-4", "#pg-tile-5"]);
  await fox.record(page, "Daily check-in", ["#pg-red", "#pg-blue", "#pg-feed"]);
  const card = page.locator(".fox-macro-card", { hasText: "Tiles" });
  await card.locator('[data-field="loopCount"]').fill("3");
  await card.locator('[data-field="loopCount"]').dispatchEvent("change");
  await card.locator('[data-field="loopDelay"]').fill("400");
  await card.locator('[data-field="loopDelay"]').dispatchEvent("change");
  await fox.settle(page);
  await card.locator("button").first().click();
  await page.waitForSelector('.fox-play-progress:has-text("LOOP 2/3 · STEP 3")', { timeout: 20000 });
  await page.waitForTimeout(40);
  shots.push({ file: "2-play", title: "Replay them on a loop", sub: "Up to 999 loops, with a pause between them.", png: await page.screenshot() });
  await page.waitForSelector('.fox-toast.visible:has-text("Playback complete")', { timeout: 30000 });
  await page.close();
}

// ---- 3. Many macros, grouped by site
{
  const page = await fox.openPanel("/playground/");
  await fox.record(page, "Claim daily reward", ["#pg-orange", "#pg-grey"], "game.example.com");
  await fox.record(page, "Approve all requests", ["#pg-blue", "#pg-red"], "admin.example.com");
  await fox.record(page, "Refresh report", ["#pg-feed"], "admin.example.com");
  await page.selectOption("#fox-domain-filter", "__all__");
  await fox.settle(page);
  shots.push({ file: "3-macros", title: "Every macro, sorted by site", sub: "Fox shows this site's macros first. All domains is one click away.", png: await page.screenshot() });
  await page.close();
}

// ---- 4. Settings
{
  const page = await fox.openPanel("/playground/");
  await page.click('.fox-tab-btn[data-tab="settings"]');
  await page.click('.fox-settings-card [role="switch"]');
  await fox.settle(page);
  shots.push({ file: "4-settings", title: "Random delay, export, import", sub: "Human-like timing. Back up or move your macros as a file.", png: await page.screenshot() });
  await page.close();
}

// ---- Compose: caption + shot in the store size
// the frame page is about:blank, so the font is inlined (a cross-origin font needs CORS)
const font = readFileSync(join(root, "assets/fonts/tiny5.woff2")).toString("base64");
const css = `
  @font-face { font-family: FoxPixel; src: url("data:font/woff2;base64,${font}"); }
  * { margin: 0; box-sizing: border-box; }
  body { background: #122965; color: #FFF1E8; font-synthesis: none; overflow: hidden; }
  h1 { font: 44px/1 FoxPixel; letter-spacing: 1px; }
  p { font: 22px/1.3 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #C2C3C7; }
  .px { image-rendering: pixelated; }
`;
const frame = await fox.ctx.newPage();
await frame.setViewportSize({ width: 1280, height: 800 });
const dataUrl = (buf) => `data:image/png;base64,${buf.toString("base64")}`;

for (const s of shots) {
  await frame.setContent(`<style>${css}
      header { height: 170px; display: flex; align-items: center; gap: 28px; padding: 0 80px; }
      header div { display: grid; gap: 14px; }
      .shot { position: absolute; left: 80px; top: 170px; border: 4px solid #000; box-shadow: 8px 8px 0 #000; }
    </style>
    <header><img class="px" src="${dataUrl(readFileSync(join(root, "assets/sprites/logo.png")))}" width="64" height="64">
      <div><h1>${s.title}</h1><p>${s.sub}</p></div></header>
    <img class="shot" src="${dataUrl(s.png)}" width="${SHOT.width}" height="${SHOT.height}">`);
  await frame.evaluate(() => document.fonts.ready);
  await frame.screenshot({ path: join(OUT, "screenshots", `${s.file}.png`) });
}

// Promo tiles: the art keeps its left part empty for this title (ASSETS.md G10/G11)
const tiles = [
  { src: "promo-small-440x280", w: 440, h: 280, title: 34, sub: 0, left: 24 },
  { src: "promo-marquee-1400x560", w: 1400, h: 560, title: 76, sub: 28, left: 96 },
];
for (const t of tiles) {
  await frame.setViewportSize({ width: t.w, height: t.h });
  const art = readFileSync(join(OUT, `${t.src}.png`));
  await frame.setContent(`<style>${css}
      body { background: url("${dataUrl(art)}") 0 0 / 100% 100%; }
      main { position: absolute; left: ${t.left}px; top: 0; bottom: 0; width: 46%; display: flex; flex-direction: column; justify-content: center; gap: ${t.title / 3}px; }
      h1 { font-size: ${t.title}px; line-height: 1.05; text-shadow: ${t.title / 12}px ${t.title / 12}px 0 #000; }
      p { font-size: ${t.sub}px; color: #FFF1E8; }
    </style>
    <main><h1>Fox Macro<br>Recorder</h1>${t.sub ? "<p>Record clicks. Replay them.</p>" : ""}</main>`);
  await frame.evaluate(() => document.fonts.ready);
  await frame.screenshot({ path: join(OUT, `${t.src}-title.png`) });
}

await fox.close();
console.log(`store-shots: ${shots.map((s) => s.file).join(", ")} + 2 titled promo tiles`);
