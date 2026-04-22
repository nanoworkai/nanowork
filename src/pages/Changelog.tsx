import { useEffect, useRef, useState } from "react";
import { CHANGELOG_ENTRIES, type EntryTag } from "../changelog/loader";
import { SiteFooter, TopNav } from "../components/SiteChrome";
import { TextUsLink } from "../components/PhoneReveal";

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
          <TextUsLink>Text us</TextUsLink> — we only message back when there’s
          something real.
        </p>
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
        <Hero />
        <Timeline />
      </main>
      <SiteFooter />
    </>
  );
}
