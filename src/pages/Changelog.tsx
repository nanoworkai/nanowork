import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CHANGELOG_ENTRIES, type EntryTag } from "../changelog/loader";
import { ThemeToggle } from "../components/ThemeToggle";

const NANOWORK_SMS_E164 = "+16506740193";
const NANOWORK_SMS_DISPLAY = "(650) 674-0193";
const NANOWORK_SMS_HREF = `sms:${NANOWORK_SMS_E164}`;

const ENTRIES = CHANGELOG_ENTRIES;
const LATEST_DATE = ENTRIES[0]?.date ?? "";

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function BrandMark() {
  return (
    <span className="brand" aria-label="Nanowork">
      <img
        className="brand__logo"
        src="/logo.png"
        alt=""
        width={28}
        height={28}
        aria-hidden
      />
      <span className="brand__word">Nanowork</span>
    </span>
  );
}

function TopNav() {
  return (
    <header className="site-nav">
      <Link to="/" className="site-nav__brand" aria-label="Nanowork home">
        <BrandMark />
      </Link>
      <nav className="site-nav__links" aria-label="Primary">
        <Link to="/#how-it-works">Process</Link>
        <Link to="/#build">Ideas</Link>
        <Link to="/#philosophy">Why</Link>
        <Link to="/#faq">FAQ</Link>
      </nav>
      <ThemeToggle />
      <a className="site-nav__cta" href={NANOWORK_SMS_HREF}>
        <span className="status-dot" aria-hidden />
        Text us
      </a>
    </header>
  );
}

function Hero() {
  return (
    <section className="changelog-hero" id="top">
      <div className="changelog-hero__inner">
        <span className="platform-pill">
          <span className="status-dot" aria-hidden />
          Changelog{LATEST_DATE ? ` · Updated ${LATEST_DATE}` : ""}
        </span>
        <h1 className="display-headline changelog-hero__title">
          What we’ve been
          <br />
          <span className="display-headline__accent">shipping lately.</span>
        </h1>
        <p className="lede changelog-hero__lede">
          A quiet, running list of everything new in Nanowork — the iMessage
          product, the agents API, and the businesses we build with (and for)
          our customers. No roadmaps, no promises. Just receipts.
        </p>
      </div>
    </section>
  );
}

function TagPill({ tag }: { tag: EntryTag }) {
  const label =
    tag === "new"
      ? "New"
      : tag === "improved"
        ? "Improved"
        : tag === "fixed"
          ? "Fixed"
          : "Shipped";
  return <span className={`log-tag log-tag--${tag}`}>{label}</span>;
}

function Timeline() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section className="section section--changelog">
      <div
        ref={ref}
        className={`section__inner reveal ${visible ? "is-visible" : ""}`}
      >
        {ENTRIES.length === 0 ? (
          <p className="log__empty">No changelog entries yet.</p>
        ) : (
          <ol className="log">
            {ENTRIES.map((entry) => (
              <li
                className="log__entry"
                key={`${entry.dateISO}-${entry.title}`}
              >
                <div className="log__meta">
                  <time className="log__date" dateTime={entry.dateISO}>
                    {entry.date}
                  </time>
                  {entry.version && (
                    <span className="log__version mono">v{entry.version}</span>
                  )}
                </div>
                <div className="log__body">
                  <h2 className="log__title">{entry.title}</h2>
                  {entry.summary && (
                    <p className="log__summary">{entry.summary}</p>
                  )}
                  {entry.items.length > 0 && (
                    <ul className="log__items">
                      {entry.items.map((item, i) => (
                        <li key={i}>
                          <TagPill tag={item.tag} />
                          <span>{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}

        <p className="log__foot">
          Want to be the first to know when something ships?{" "}
          <a href={NANOWORK_SMS_HREF}>Text us at {NANOWORK_SMS_DISPLAY}</a> — we
          only message back when there’s something real.
        </p>
      </div>
    </section>
  );
}

function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <BrandMark />
          <p className="footer__tag">
            A new kind of company. Built inside your messages.
          </p>
        </div>
        <div className="footer__cols">
          <div className="footer__col">
            <p className="footer__heading">Company</p>
            <ul>
              <li>
                <Link to="/#how-it-works">How it works</Link>
              </li>
              <li>
                <Link to="/#build">What you can build</Link>
              </li>
              <li>
                <Link to="/#agents">API &amp; agents</Link>
              </li>
              <li>
                <Link to="/changelog">Changelog</Link>
              </li>
              <li>
                <Link to="/#faq">FAQ</Link>
              </li>
            </ul>
          </div>
          <div className="footer__col">
            <p className="footer__heading">Contact</p>
            <ul>
              <li>
                <a href={NANOWORK_SMS_HREF}>Text {NANOWORK_SMS_DISPLAY}</a>
              </li>
              <li>
                <a
                  href="https://x.com/nanoworkai"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/company/nanowork/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <span>© {year} Nanowork, Inc. All rights reserved.</span>
        <span className="footer__made">Made with care in California.</span>
      </div>
    </footer>
  );
}

export default function Changelog() {
  return (
    <>
      <TopNav />
      <main className="page page--pro page--changelog">
        <Hero />
        <Timeline />
      </main>
      <SiteFooter />
    </>
  );
}
