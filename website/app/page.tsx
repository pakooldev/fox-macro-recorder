import Link from "next/link";
import { Icon, Keys, Mascot, type IconName } from "@/components/pixel";
import { SHORTCUT, STORE_URL } from "@/components/site";
import { StoreButton } from "@/components/store-button";

const STEPS: { fox: "idle" | "record" | "play"; title: string; body: React.ReactNode }[] = [
  { fox: "idle", title: "Open", body: <Keys combo={SHORTCUT} /> },
  { fox: "record", title: "Record", body: "Click around, then Stop" },
  { fox: "play", title: "Play", body: "Loop it up to 999×" },
];

const FEATURES: { icon: IconName; color: string; title: string }[] = [
  { icon: "record", color: "var(--px-red)", title: "Keeps click timing" },
  { icon: "repeat", color: "var(--px-blue)", title: "Loops with delays" },
  { icon: "download", color: "var(--px-peach)", title: "Export to a file" },
  { icon: "archive", color: "var(--px-silver)", title: "No account, no tracking" },
];

const LIMITS = ["Clicks only, no typing", "Same window size and scroll", "Not on chrome:// pages"];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <h1>Record clicks. Replay them.</h1>
            <p>A Chrome extension that repeats your clicks on any page.</p>
            <div className="hero-actions">
              {STORE_URL ? <StoreButton /> : null}
              <Link className={`btn ${STORE_URL ? "btn-blue" : "btn-primary"}`} href="/playground/">
                <Icon name="play" /> Try the playground
              </Link>
            </div>
            {STORE_URL ? null : <span className="label hero-soon">Coming soon to the Chrome Web Store</span>}
          </div>
          <img
            className="hero-art"
            src="/assets/store/promo-marquee-1400x560.png"
            width={1400}
            height={560}
            alt="Pixel fox at a computer with macro cards"
          />
        </div>
      </section>

      <section className="section" id="features">
        <div className="container demo">
          <img
            className="demo-shot"
            src="/assets/web/panel.png"
            width={732}
            height={502}
            alt="The Fox panel replaying a macro on the playground page"
          />
          <ol className="steps">
            {STEPS.map((s) => (
              <li key={s.title}>
                <Mascot state={s.fox} />
                <div>
                  <h2 className="step-title">{s.title}</h2>
                  <span>{s.body}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <ul className="features">
            {FEATURES.map((f) => (
              <li className="raised" key={f.title}>
                <span className="chip" style={{ "--chip": f.color } as React.CSSProperties}>
                  <Icon name={f.icon} />
                </span>
                {f.title}
              </li>
            ))}
          </ul>
          <p className="also">Also: random delay, element inspector, keyboard shortcut.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container grid grid-2">
          <article className="card raised">
            <h2 className="card-title">Good to know</h2>
            <ul className="limits">
              {LIMITS.map((l) => (
                <li key={l}>
                  <Icon name="info" size={20} /> {l}
                </li>
              ))}
            </ul>
          </article>
          <Link href="/moved/" className="callout raised">
            <Mascot state="play" big />
            <div>
              <h2 className="card-title">Used Fox Auto Clicker?</h2>
              <span className="callout-link">Move your macros →</span>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
