import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { Icon, Mascot } from "@/components/pixel";
import { StoreButton } from "@/components/store-button";

export const metadata: Metadata = {
  title: "Fox has moved",
  description: "Fox Auto Clicker is now Fox Macro Recorder, on a new Chrome Web Store listing. How to move your macros.",
};

// The illustration is optional (assets/ASSETS.md W1); the running fox stands in until it exists
const hasArt = existsSync(join(process.cwd(), "public/assets/web/moving.png"));

export default function Moved() {
  return (
    <main className="container">
      <div className="page-head">
        {hasArt ? (
          <img className="moved-art" src="/assets/web/moving.png" alt="The fox carrying a moving box to its new house" />
        ) : (
          <Mascot state="play" big />
        )}
        <span className="label">For Fox Auto Clicker users</span>
        <h1>Fox has moved house</h1>
        <p>
          “Fox Auto Clicker” is now <strong>Fox Macro Recorder</strong>, with a new look and a new home on the Chrome
          Web Store. Chrome can’t move an extension between store listings, so the new Fox is a separate install and
          starts empty. Your macros come along in a minute:
        </p>
      </div>

      <ol className="howto">
        <li className="raised">
          <div>
            <h3>Install the new Fox</h3>
            <p>Keep the old one for now: your macros are still inside it.</p>
            <p style={{ marginTop: 12 }}>
              <StoreButton small />
            </p>
          </div>
        </li>
        <li className="raised">
          <div>
            <h3>Export from the old Fox</h3>
            <p>
              Open the old Fox on any page and press <strong>Export macros</strong> in its banner. A file named like{" "}
              <code>fox-macros-2026-10-03.json</code> is saved to your Downloads.
            </p>
          </div>
        </li>
        <li className="raised">
          <div>
            <h3>Import into the new Fox</h3>
            <p>
              Open the new Fox, go to <Icon name="settings" size={16} /> <strong>Settings → Macros → Import…</strong> and pick
              that file. Macros already there are skipped, so importing twice is harmless.
            </p>
          </div>
        </li>
        <li className="raised">
          <div>
            <h3>Remove the old Fox</h3>
            <p>
              Check your macros are all in the new Fox, then remove the old one from <code>chrome://extensions</code>.
              Removing it deletes the copy inside it.
            </p>
          </div>
        </li>
      </ol>

      <section className="faq">
        <h2 style={{ marginBottom: 8 }}>Questions</h2>
        <details className="raised">
          <summary>Why not just update the old one?</summary>
          <p>The extension moved to a new developer account, and the Chrome Web Store has no way to transfer an existing listing’s users to another one.</p>
        </details>
        <details className="raised">
          <summary>Will I lose my macros?</summary>
          <p>No. They stay in the old Fox until you remove it, so you can export again any time before that.</p>
        </details>
        <details className="raised">
          <summary>I don’t see an Export button in the old Fox</summary>
          <p>Chrome updates extensions on its own every few hours. To get it now, open chrome://extensions, turn on Developer mode and press Update.</p>
        </details>
        <details className="raised">
          <summary>Do my macros work the same in the new Fox?</summary>
          <p>Yes. The file format is the same, and every macro keeps its clicks, timing, loops and delay.</p>
        </details>
      </section>
    </main>
  );
}
