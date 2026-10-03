import Link from "next/link";
import { Icon, Keys, Mascot, type IconName } from "@/components/pixel";
import { SHORTCUT } from "@/components/site";
import { StoreButton } from "@/components/store-button";

const FEATURES: { icon: IconName; color: string; title: string; text: string }[] = [
  { icon: "record", color: "var(--px-red)", title: "Record clicks", text: "Press Record and click around the page. Fox marks every click and keeps the timing between them." },
  { icon: "repeat", color: "var(--px-blue)", title: "Play and loop", text: "Replay a macro once or up to 999 times, with a pause between loops. Stop cuts it short at any moment." },
  { icon: "shuffle", color: "var(--px-yellow)", title: "Random delay", text: "Add a little random wait to every step so a replay doesn't run like clockwork." },
  { icon: "target", color: "var(--px-green)", title: "Inspector", text: "Point at anything on the page to see its tag, id and position before you record." },
  { icon: "download", color: "var(--px-peach)", title: "Export and import", text: "Save your macros to a file and load them on another computer or browser profile." },
  { icon: "archive", color: "var(--px-silver)", title: "Stays on your device", text: "No account, no servers, no tracking. Macros live in your browser and only run where you open Fox." },
];

const STEPS: { fox: "idle" | "record" | "play"; title: string; text: React.ReactNode }[] = [
  {
    fox: "idle",
    title: "Open Fox",
    text: (
      <>
        Click the fox in the toolbar or press <Keys combo={SHORTCUT} /> (Option on a Mac). The panel opens on that page only.
      </>
    ),
  },
  { fox: "record", title: "Record", text: "Press Record, do your clicks, press Stop, then give the macro a name." },
  { fox: "play", title: "Play", text: "Pick the macro, set how many loops and the delay, and press Play. The fox runs while it works." },
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="label">Chrome extension</span>
            <h1>Record your clicks. Let the fox replay them.</h1>
            <p>Fox Macro Recorder automates repetitive clicking on any web page, right from a little pixel panel.</p>
            <div className="hero-actions">
              <StoreButton />
              <Link className="btn btn-blue" href="/playground/">
                <Icon name="play" /> Try the playground
              </Link>
            </div>
          </div>
          <img
            className="hero-art"
            src="/assets/store/promo-marquee-1400x560.png"
            width={1400}
            height={560}
            alt="The pixel fox at its retro computer, with macro cards floating above the desk"
          />
        </div>
      </section>

      <section className="section" id="features">
        <div className="container">
          <div className="section-head">
            <span className="label">Features</span>
            <h2>Small panel, everything you need</h2>
          </div>
          <div className="grid">
            {FEATURES.map((f) => (
              <article className="card raised" key={f.title}>
                <h3>
                  <span className="chip" style={{ "--chip": f.color } as React.CSSProperties}>
                    <Icon name={f.icon} />
                  </span>
                  {f.title}
                </h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="how-it-works" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <span className="label">How it works</span>
            <h2>Three steps</h2>
          </div>
          <div className="grid steps">
            {STEPS.map((s) => (
              <article className="card raised step" key={s.title}>
                <span className="step-fox">
                  <Mascot state={s.fox} big />
                </span>
                <span className="label">{s.title}</span>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container grid grid-2">
          <article className="card raised">
            <h3>Good to know</h3>
            <ul className="limits">
              <li>Fox records clicks only: no typing, scrolling or dragging yet.</li>
              <li>Clicks are replayed at the same spot in the window, so play a macro with the page scrolled, zoomed and sized as when you recorded it.</li>
              <li>Fox can't run on Chrome's own pages (chrome://, the Web Store); the toolbar icon shows a ! there.</li>
            </ul>
          </article>
          <article className="callout raised">
            <Mascot state="play" big />
            <div>
              <h3>Used “Fox Auto Clicker” before?</h3>
              <p>
                Fox has a new home on the Chrome Web Store. <Link href="/moved/">Here’s how to bring your macros along.</Link>
              </p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
