import Link from "next/link";
import { APP_NAME, REPO_URL, STORE_URL, VERSION } from "./site";
import { StoreButton } from "./store-button";

// `wide` = the long label, swapped for `label` on phones so the header stays one row
const LINKS = [
  { href: "/playground/", label: "Playground" },
  { href: "/moved/", label: "Moved?", wide: "Moving from old Fox" },
];

// No client JS: on narrow screens the links wrap under the logo instead of a burger menu
export function Navbar() {
  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link href="/" className="brand">
          <span className="brand-logo" aria-hidden="true" />
          <span>FOX MACRO</span>
        </Link>
        <nav className="nav-links" aria-label="Main">
          {LINKS.map(({ href, label, wide }) => (
            <Link key={href} href={href}>
              {wide ? (
                <>
                  <span className="wide">{wide}</span>
                  <span className="narrow">{label}</span>
                </>
              ) : (
                label
              )}
            </Link>
          ))}
          {STORE_URL ? <StoreButton small /> : null}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>
          {APP_NAME} v{VERSION} · © {new Date().getFullYear()}
        </p>
        <nav className="footer-links" aria-label="Footer">
          <Link href="/privacy/">Privacy</Link>
          <a href={REPO_URL} target="_blank" rel="noopener">
            Source
          </a>
        </nav>
      </div>
    </footer>
  );
}
