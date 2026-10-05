import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { Mascot } from "@/components/pixel";
import { StoreButton } from "@/components/store-button";

export const metadata: Metadata = {
  title: "Fox has moved",
  description: "Fox Auto Clicker is now Fox Macro Recorder. Move your macros in 3 steps.",
};

// The illustration is optional (assets/ASSETS.md W1); the running fox stands in until it exists
const hasArt = existsSync(join(process.cwd(), "public/assets/web/moving.png"));

export default function Moved() {
  return (
    <main className="container">
      <div className="page-head">
        {hasArt ? (
          <img className="moved-art" src="/assets/web/moving.png" width={460} height={264} alt="The fox carrying a moving box to its new house" />
        ) : (
          <Mascot state="play" big />
        )}
        <h1>Fox has moved house</h1>
        <p>Fox Auto Clicker is now Fox Macro Recorder. It’s a new install, so bring your macros over in 3 steps.</p>
      </div>

      <ol className="howto">
        <li className="raised">
          <div>
            <h2>Install the new Fox</h2>
            <StoreButton small />
          </div>
        </li>
        <li className="raised">
          <div>
            <h2>Export from the old Fox</h2>
            <p>
              Click the old Fox’s toolbar icon and press <strong>Export macros</strong>.
            </p>
            <img className="howto-shot" src="/assets/web/export-old.png" width={236} height={235} alt="The Export macros button in the old Fox's popup" />
          </div>
        </li>
        <li className="raised">
          <div>
            <h2>Import into the new Fox</h2>
            <p>
              <strong>Settings → Macros → Import…</strong>, then pick the file.
            </p>
            <img className="howto-shot" src="/assets/web/import.png" width={360} height={362} alt="The Import button in the new Fox's Settings tab" />
          </div>
        </li>
      </ol>
      <p className="howto-after">All there? Now you can remove the old Fox. Keep it until then.</p>

      <section className="faq">
        <details className="raised">
          <summary>I don’t see Export in the old Fox</summary>
          <p>
            Chrome updates it on its own, usually within a few hours. Then reload the page you’re on.
            In a hurry? Open chrome://extensions, turn on Developer mode, press Update.
          </p>
        </details>
        <details className="raised">
          <summary>Why a new install?</summary>
          <p>Chrome can’t move users between store listings.</p>
        </details>
      </section>
    </main>
  );
}
