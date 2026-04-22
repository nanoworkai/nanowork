import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const NANOWORK_SMS_E164 = "+16506740193";
const NANOWORK_SMS_DISPLAY = "(650) 674-0193";
const NANOWORK_SMS_HREF = `sms:${NANOWORK_SMS_E164}`;

type EntryTag = "new" | "improved" | "fixed" | "shipped";

type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  summary?: string;
  items: { tag: EntryTag; text: string }[];
};

const ENTRIES: ChangelogEntry[] = [
  {
    version: "0.12",
    date: "April 18, 2026",
    title: "Gallery goes live",
    summary:
      "You can now browse — and buy — complete companies already built by the Nanowork team.",
    items: [
      { tag: "new", text: "Launched /gallery with eight listings ready to transfer." },
      {
        tag: "new",
        text: "Live demo previews on each listing, themed to the brand.",
      },
      {
        tag: "improved",
        text: "Escrow, domain, and Stripe transfer now handled in one guided thread.",
      },
    ],
  },
  {
    version: "0.11",
    date: "April 2, 2026",
    title: "Agents API · early access",
    summary:
      "Every agent that powers Nanowork is now exposed as a single HTTP endpoint.",
    items: [
      {
        tag: "new",
        text: "POST /v1/agents/{sharpener,namer,researcher,landing,launch,ads}.",
      },
      { tag: "new", text: "Bearer-key auth and typed JSON contracts per agent." },
      {
        tag: "improved",
        text: "Median agent latency down to 412 ms across the six endpoints.",
      },
    ],
  },
  {
    version: "0.10",
    date: "March 14, 2026",
    title: "iMessage is the front door",
    summary:
      "Text an idea and we text back a plan — no app, no login, no dashboard.",
    items: [
      {
        tag: "shipped",
        text: "One phone number for every Nanowork customer: (650) 674-0193.",
      },
      {
        tag: "new",
        text: "Voice memos accepted — we transcribe and pressure-test the idea in the same thread.",
      },
      {
        tag: "fixed",
        text: "Delivery receipts now match iMessage’s native cadence on iOS 18.",
      },
    ],
  },
  {
    version: "0.9",
    date: "February 26, 2026",
    title: "Flat $99 pricing",
    summary:
      "One price for everything Nanowork does. No tiers, no seats, no usage meters.",
    items: [
      {
        tag: "new",
        text: "Single $99/mo plan replaces every previous bundle and add-on.",
      },
      {
        tag: "improved",
        text: "Cancel any time, from the same thread you signed up in.",
      },
    ],
  },
  {
    version: "0.8",
    date: "February 5, 2026",
    title: "Ship-in-a-week playbook",
    summary:
      "The internal playbook that moves an idea from message to live product in under seven days.",
    items: [
      {
        tag: "new",
        text: "Automatic landing page scaffolds generated from the Sharpener output.",
      },
      {
        tag: "new",
        text: "Stripe + domain + analytics wired on day one of every build.",
      },
      {
        tag: "improved",
        text: "Launch-week cadence now pre-loaded for X, LinkedIn, and cold outreach.",
      },
    ],
  },
  {
    version: "0.7",
    date: "January 12, 2026",
    title: "Public beta",
    summary: "Nanowork opens to its first batch of invited operators.",
    items: [
      { tag: "shipped", text: "First 24 founders onboarded via text." },
      {
        tag: "new",
        text: "Design system and brand finalized — quiet, editorial, dark-first.",
      },
    ],
  },
];

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
        <Link to="/gallery">Gallery</Link>
        <Link to="/#agents">API</Link>
        <Link to="/changelog" aria-current="page" className="is-active">
          Changelog
        </Link>
        <Link to="/#faq">FAQ</Link>
      </nav>
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
          Changelog · Updated {ENTRIES[0].date}
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
        <ol className="log">
          {ENTRIES.map((entry) => (
            <li className="log__entry" key={entry.version}>
              <div className="log__meta">
                <time className="log__date" dateTime={entry.date}>
                  {entry.date}
                </time>
                <span className="log__version mono">v{entry.version}</span>
              </div>
              <div className="log__body">
                <h2 className="log__title">{entry.title}</h2>
                {entry.summary && (
                  <p className="log__summary">{entry.summary}</p>
                )}
                <ul className="log__items">
                  {entry.items.map((item, i) => (
                    <li key={i}>
                      <TagPill tag={item.tag} />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>

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
                <Link to="/gallery">Gallery</Link>
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
