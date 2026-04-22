import { useEffect, useMemo, useRef, useState } from "react";
import {
  NANOWORK_SMS_DISPLAY,
  NANOWORK_SMS_HREF,
  SiteFooter,
  TopNav,
} from "../components/SiteChrome";

type ChangeKind = "new" | "improved" | "fixed" | "note";

type ChangeItem = {
  kind: ChangeKind;
  text: string;
};

type Release = {
  version: string;
  date: string; // ISO yyyy-mm-dd
  title: string;
  summary?: string;
  highlight?: boolean;
  items: ChangeItem[];
};

/**
 * Release history — newest first. Dates/titles are illustrative of the
 * Nanowork product cadence and can be edited freely by the team.
 */
const RELEASES: Release[] = [
  {
    version: "0.9.0",
    date: "2026-04-18",
    title: "The API, in early access.",
    summary:
      "Every agent that powers the iMessage experience is now a typed HTTP endpoint. Six agents live today; more each month.",
    highlight: true,
    items: [
      {
        kind: "new",
        text: "Public API under api.nanowork.ai/v1 with bearer auth. Sharpener, Namer, Researcher, Landing, Launch, and Ads are live.",
      },
      {
        kind: "new",
        text: "Typed contracts — JSON in, JSON out — with schema docs for every agent.",
      },
      {
        kind: "improved",
        text: "Agent latency median is now sub-500ms across the initial six.",
      },
      {
        kind: "note",
        text: "Text us for an API key. We're onboarding one builder at a time while we harden rate limits.",
      },
    ],
  },
  {
    version: "0.8.2",
    date: "2026-04-04",
    title: "Launch playbooks, tightened.",
    items: [
      {
        kind: "improved",
        text: "Launch agent now generates a seven-day cadence with channel-by-channel copy variants.",
      },
      {
        kind: "improved",
        text: "Ads agent rewrites the same angle across hook/body/CTA so you can A/B three at once.",
      },
      {
        kind: "fixed",
        text: "Pricing links sometimes opened Stripe in test mode on first-run projects. Now live mode by default, always.",
      },
    ],
  },
  {
    version: "0.8.0",
    date: "2026-03-21",
    title: "Idea → live page, in a single thread.",
    summary:
      "We rebuilt the hand-off between Sharpener and Landing so a sentence can become a real waitlist page in under an hour.",
    highlight: true,
    items: [
      {
        kind: "new",
        text: "One-tap landing page: text an idea, reply \"ship it\", and a page is live at a nanowork.page/* URL within the hour.",
      },
      {
        kind: "new",
        text: "Automatic waitlist with passwordless email capture and a daily digest of signups to your thread.",
      },
      {
        kind: "improved",
        text: "Sharpener now returns ICP and wedge alongside the pitch, so Landing has everything it needs first try.",
      },
    ],
  },
  {
    version: "0.7.1",
    date: "2026-03-07",
    title: "Voice memos, understood.",
    items: [
      {
        kind: "new",
        text: "Send a voice memo. We transcribe, sharpen, and reply in thread — no app, no uploads.",
      },
      {
        kind: "improved",
        text: "Researcher now attaches incumbents and pricing references as part of every pitch review.",
      },
      {
        kind: "fixed",
        text: "Rare case where a long thread would reset context after a week. Threads now persist for 90 days minimum.",
      },
    ],
  },
  {
    version: "0.7.0",
    date: "2026-02-18",
    title: "Flat pricing. One number. No tiers.",
    summary:
      "We moved to a single $99/mo price for everything Nanowork does. No seats, no meters, no equity.",
    items: [
      {
        kind: "new",
        text: "Flat $99/mo across all agents and all ideas. Cancel any time from the thread.",
      },
      {
        kind: "improved",
        text: "Billing lives inside iMessage. Reply \"receipt\" for the current month or \"pause\" to stop.",
      },
    ],
  },
  {
    version: "0.6.3",
    date: "2026-02-01",
    title: "Better names, faster.",
    items: [
      {
        kind: "improved",
        text: "Namer now checks .com, .ai, .co, and social handles in parallel. Shortlists arrive in seconds.",
      },
      {
        kind: "fixed",
        text: "Shortlists occasionally included taken domains on slow DNS. Double-verified on every reply now.",
      },
    ],
  },
  {
    version: "0.6.0",
    date: "2026-01-12",
    title: "The first three agents ship.",
    summary:
      "Sharpener, Namer, and Researcher graduated from internal tools to thread-native agents.",
    highlight: true,
    items: [
      {
        kind: "new",
        text: "Sharpener: turns a rough idea into a tight pitch, an ICP, and a wedge worth attacking.",
      },
      {
        kind: "new",
        text: "Namer: brandable name shortlists with .com and handle availability.",
      },
      {
        kind: "new",
        text: "Researcher: a one-page report on the market, incumbents, pricing, and the gap.",
      },
    ],
  },
  {
    version: "0.5.0",
    date: "2025-12-02",
    title: "Nanowork opens the phone line.",
    summary:
      "The front door — a single phone number that lives in your messages — opens to early beta.",
    items: [
      {
        kind: "new",
        text: `Text ${NANOWORK_SMS_DISPLAY}. First replies within minutes during working hours.`,
      },
      {
        kind: "note",
        text: "Invite-only beta. Founders with a clear wedge and the appetite to ship in the open.",
      },
    ],
  },
];

const KIND_LABEL: Record<ChangeKind, string> = {
  new: "New",
  improved: "Improved",
  fixed: "Fixed",
  note: "Note",
};

function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

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
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function ChangelogHero({ latest }: { latest: Release }) {
  return (
    <section className="section changelog-hero">
      <div className="section__inner changelog-hero__inner">
        <div className="changelog-hero__copy">
          <span className="platform-pill">
            <span className="status-dot" aria-hidden />
            Shipping log · Updated {formatDate(latest.date)}
          </span>
          <h1 className="display-headline changelog-hero__title">
            What we{" "}
            <span className="display-headline__accent">shipped</span>,
            <br />
            when we shipped it.
          </h1>
          <p className="lede">
            Nanowork is built in the open — one small improvement at a time,
            usually in a thread with the person who asked for it. This is the
            running record of what's new, what's better, and what's fixed.
          </p>
          <div className="hero__cta-row">
            <a className="btn btn--primary" href={NANOWORK_SMS_HREF}>
              <span aria-hidden className="btn__icon">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              Text {NANOWORK_SMS_DISPLAY}
            </a>
            <a className="btn btn--ghost" href="#latest">
              Jump to latest
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function KindTag({ kind }: { kind: ChangeKind }) {
  return (
    <span className={`tag tag--${kind}`} aria-label={KIND_LABEL[kind]}>
      <span className="tag__dot" aria-hidden />
      {KIND_LABEL[kind]}
    </span>
  );
}

function ReleaseEntry({ release, index }: { release: Release; index: number }) {
  const { ref, visible } = useReveal<HTMLElement>();
  const isLatest = index === 0;
  return (
    <article
      ref={ref}
      className={`log-entry reveal ${visible ? "is-visible" : ""} ${
        release.highlight ? "log-entry--highlight" : ""
      }`}
      id={isLatest ? "latest" : `v-${release.version}`}
    >
      <aside className="log-entry__rail" aria-hidden>
        <time className="log-entry__date" dateTime={release.date}>
          <span className="log-entry__date-short">
            {formatShortDate(release.date)}
          </span>
          <span className="log-entry__date-year">
            {release.date.slice(0, 4)}
          </span>
        </time>
        <span className="log-entry__node" />
      </aside>
      <div className="log-entry__body">
        <header className="log-entry__head">
          <div className="log-entry__meta">
            <span className="log-entry__version">v{release.version}</span>
            {isLatest ? (
              <span className="log-entry__latest">
                <span className="status-dot" aria-hidden />
                Latest
              </span>
            ) : null}
            <span className="log-entry__datefull">
              <time dateTime={release.date}>{formatDate(release.date)}</time>
            </span>
          </div>
          <h2 className="log-entry__title">{release.title}</h2>
          {release.summary ? (
            <p className="log-entry__summary">{release.summary}</p>
          ) : null}
        </header>
        <ul className="log-entry__items">
          {release.items.map((item, i) => (
            <li className="log-item" key={i}>
              <KindTag kind={item.kind} />
              <p className="log-item__text">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function ChangelogTimeline() {
  const releases = useMemo(() => RELEASES, []);
  return (
    <section className="section changelog-log">
      <div className="section__inner">
        <div className="changelog-log__wrap">
          {releases.map((release, i) => (
            <ReleaseEntry release={release} index={i} key={release.version} />
          ))}
        </div>
        <div className="changelog-log__foot">
          <p>
            Have a feature request, a bug report, or just something you wish we
            shipped next?
          </p>
          <a className="btn btn--primary" href={NANOWORK_SMS_HREF}>
            Text it to us
          </a>
        </div>
      </div>
    </section>
  );
}

export default function Changelog() {
  useEffect(() => {
    const prev = document.title;
    document.title = "Changelog — Nanowork";
    return () => {
      document.title = prev;
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <TopNav />
      <main className="page page--pro page--changelog">
        <ChangelogHero latest={RELEASES[0]} />
        <ChangelogTimeline />
      </main>
      <SiteFooter />
    </>
  );
}
