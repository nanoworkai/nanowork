import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  BUSINESSES,
  businessStyle,
  formatPrice,
  type Business,
} from "../data/businesses";
import { ThemeToggle } from "../components/ThemeToggle";

const NANOWORK_SMS_E164 = "+16506740193";
const NANOWORK_SMS_DISPLAY = "(650) 674-0193";
const NANOWORK_SMS_HREF = `sms:${NANOWORK_SMS_E164}`;


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
        <Link to="/gallery" aria-current="page" className="is-active">
          Gallery
        </Link>
        <Link to="/#agents">API</Link>
        <Link to="/changelog">Changelog</Link>
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

function StatusTag({ status }: { status: Business["status"] }) {
  const label =
    status === "available"
      ? "Available"
      : status === "pending"
        ? "In escrow"
        : "Sold";
  return (
    <span className={`status-tag status-tag--${status}`}>
      <span className="status-tag__dot" aria-hidden />
      {label}
    </span>
  );
}

type PreviewOf<K extends Business["preview"]["kind"]> = Extract<
  Business["preview"],
  { kind: K }
>;

function SaasPreview({ p }: { p: PreviewOf<"saas"> }) {
  return (
    <div className="gpreview gpreview--saas">
      <div className="gpreview__nav">
        <span className="gpreview__brand">{p.brand}</span>
        <span className="gpreview__navlinks">
          <span>Product</span>
          <span>Pricing</span>
          <span className="gpreview__pill">Start</span>
        </span>
      </div>
      <div className="gpreview__body">
        <p className="gpreview__eyebrow">v2 · Shipped Tuesday</p>
        <h4 className="gpreview__headline">{p.headline}</h4>
        <p className="gpreview__sub">{p.sub}</p>
        <div className="gpreview__stats">
          <div>
            <strong>{p.metric}</strong>
            <span>{p.metricLabel}</span>
          </div>
          <div>
            <strong>4.9★</strong>
            <span>customer rating</span>
          </div>
        </div>
        <div className="gpreview__bars" aria-hidden>
          <span style={{ width: "72%" }} />
          <span style={{ width: "48%" }} />
          <span style={{ width: "88%" }} />
          <span style={{ width: "34%" }} />
          <span style={{ width: "60%" }} />
        </div>
      </div>
    </div>
  );
}

function CommercePreview({ p }: { p: PreviewOf<"commerce"> }) {
  return (
    <div className="gpreview gpreview--commerce">
      <div className="gpreview__nav">
        <span className="gpreview__brand">{p.brand}</span>
        <span className="gpreview__navlinks">
          <span>Menu</span>
          <span>Pickup</span>
          <span className="gpreview__pill">Cart · 2</span>
        </span>
      </div>
      <div className="gpreview__body gpreview__body--grid">
        <p className="gpreview__eyebrow">{p.headline}</p>
        <div className="gpreview__tile" aria-hidden>
          <div className="gpreview__tile-img" />
          <div className="gpreview__tile-meta">
            <span className="gpreview__tile-name">{p.product}</span>
            <span className="gpreview__tile-price">{p.price}</span>
          </div>
        </div>
        <div className="gpreview__row" aria-hidden>
          <span className="gpreview__chip" />
          <span className="gpreview__chip" />
          <span className="gpreview__chip" />
        </div>
      </div>
    </div>
  );
}

function NewsletterPreview({ p }: { p: PreviewOf<"newsletter"> }) {
  return (
    <div className="gpreview gpreview--newsletter">
      <div className="gpreview__nav">
        <span className="gpreview__brand">{p.brand}</span>
        <span className="gpreview__navlinks">
          <span>Archive</span>
          <span className="gpreview__pill">Subscribe</span>
        </span>
      </div>
      <div className="gpreview__body">
        <p className="gpreview__eyebrow">{p.subs}</p>
        <h4 className="gpreview__headline gpreview__headline--serif">
          {p.headline}
        </h4>
        <p className="gpreview__issue">{p.issue}</p>
        <div className="gpreview__lines" aria-hidden>
          <span style={{ width: "94%" }} />
          <span style={{ width: "86%" }} />
          <span style={{ width: "92%" }} />
          <span style={{ width: "42%" }} />
        </div>
      </div>
    </div>
  );
}

function LocalPreview({ p }: { p: PreviewOf<"local"> }) {
  return (
    <div className="gpreview gpreview--local">
      <div className="gpreview__nav">
        <span className="gpreview__brand">{p.brand}</span>
        <span className="gpreview__navlinks">
          <span>Stays</span>
          <span>Guide</span>
          <span className="gpreview__pill">{p.cta}</span>
        </span>
      </div>
      <div className="gpreview__body">
        <h4 className="gpreview__headline gpreview__headline--serif">
          {p.headline}
        </h4>
        <p className="gpreview__sub">{p.sub}</p>
        <div className="gpreview__gallery" aria-hidden>
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

function DirectoryPreview({ p }: { p: PreviewOf<"directory"> }) {
  return (
    <div className="gpreview gpreview--directory">
      <div className="gpreview__nav">
        <span className="gpreview__brand">{p.brand}</span>
        <span className="gpreview__navlinks">
          <span>Browse</span>
          <span className="gpreview__pill">Search</span>
        </span>
      </div>
      <div className="gpreview__body">
        <h4 className="gpreview__headline">{p.headline}</h4>
        <p className="gpreview__eyebrow gpreview__eyebrow--low">{p.count}</p>
        <ul className="gpreview__list" aria-hidden>
          <li>
            <span /> <em />
          </li>
          <li>
            <span /> <em />
          </li>
          <li>
            <span /> <em />
          </li>
          <li>
            <span /> <em />
          </li>
        </ul>
      </div>
    </div>
  );
}

function DemoPreview({ b }: { b: Business }) {
  return (
    <div className="gbrowser" style={businessStyle(b)} aria-hidden>
      <div className="gbrowser__chrome">
        <span className="gbrowser__dots">
          <span />
          <span />
          <span />
        </span>
        <span className="gbrowser__url">
          <span className="gbrowser__lock" aria-hidden>
            <svg
              viewBox="0 0 24 24"
              width="10"
              height="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </span>
          nanowork.ai/{b.slug}
        </span>
      </div>
      <div className="gbrowser__surface">
        {b.preview.kind === "saas" && <SaasPreview p={b.preview} />}
        {b.preview.kind === "commerce" && <CommercePreview p={b.preview} />}
        {b.preview.kind === "newsletter" && <NewsletterPreview p={b.preview} />}
        {b.preview.kind === "local" && <LocalPreview p={b.preview} />}
        {b.preview.kind === "directory" && <DirectoryPreview p={b.preview} />}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="gallery-hero" id="top">
      <div className="gallery-hero__inner">
        <span className="platform-pill">
          <span className="status-dot" aria-hidden />
          Gallery · {BUSINESSES.filter((b) => b.status === "available").length}{" "}
          available now
        </span>
        <h1 className="display-headline gallery-hero__title">
          Buy a business
          <br />
          <span className="display-headline__accent">
            already built by Nanowork.
          </span>
        </h1>
        <p className="lede gallery-hero__lede">
          Every listing here is a complete, working company — designed,
          engineered, and launched by our team. Skip the cold start. Take over
          the codebase, the domain, the revenue, and the launch plan from day
          one.
        </p>
        <div className="hero__cta-row">
          <a className="btn btn--primary" href="#listings">
            Browse the gallery
          </a>
          <a className="btn btn--ghost" href={NANOWORK_SMS_HREF}>
            Text us about a listing
          </a>
        </div>
        <dl className="hero__stats gallery-hero__stats" aria-label="What's included">
          <div>
            <dt>Full transfer</dt>
            <dd>Code, domain, assets</dd>
          </div>
          <div>
            <dt>Live revenue</dt>
            <dd>Where noted, in MRR</dd>
          </div>
          <div>
            <dt>30-day support</dt>
            <dd>From the team that built it</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

type FilterKey = "all" | "saas" | "commerce" | "media" | "tools";

function filterMatch(b: Business, f: FilterKey) {
  if (f === "all") return true;
  const cat = b.category.toLowerCase();
  if (f === "saas") return cat.includes("saas");
  if (f === "commerce") return cat.includes("commerce");
  if (f === "media") return cat.includes("media") || cat.includes("newsletter");
  if (f === "tools") return cat.includes("tools") || cat.includes("dev");
  return true;
}

function Listings() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [filter, setFilter] = useState<FilterKey>("all");
  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "saas", label: "SaaS" },
    { key: "commerce", label: "Commerce" },
    { key: "media", label: "Media" },
    { key: "tools", label: "Tools" },
  ];

  const filtered = BUSINESSES.filter((b) => filterMatch(b, filter));

  return (
    <section className="section section--gallery" id="listings">
      <div
        ref={ref}
        className={`section__inner reveal ${visible ? "is-visible" : ""}`}
      >
        <div className="gallery-head">
          <div>
            <p className="eyebrow">Gallery · Ready to transfer</p>
            <h2 className="section__title">
              Live businesses.
              <br />
              <span className="muted-title">One-time price. Full ownership.</span>
            </h2>
          </div>
          <div className="gallery-filters" role="tablist" aria-label="Filter listings">
            {filters.map((f) => (
              <button
                key={f.key}
                role="tab"
                aria-selected={filter === f.key}
                className={`gallery-filter ${filter === f.key ? "is-active" : ""}`}
                onClick={() => setFilter(f.key)}
                type="button"
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <ul className="listings">
          {filtered.map((b, i) => (
            <li key={b.slug} className="listing">
              <div className="listing__preview-col">
                <DemoPreview b={b} />
                <span className="listing__index" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="listing__body">
                <div className="listing__row listing__row--head">
                  <span className="listing__category">{b.category}</span>
                  <StatusTag status={b.status} />
                </div>
                <h3 className="listing__name">{b.name}</h3>
                <p className="listing__tagline">{b.tagline}</p>
                <p className="listing__description">{b.description}</p>

                <dl className="listing__meta">
                  <div>
                    <dt>Price</dt>
                    <dd className="listing__price">{formatPrice(b.price)}</dd>
                  </div>
                  {b.mrr && (
                    <div>
                      <dt>Current revenue</dt>
                      <dd>{b.mrr}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Stack</dt>
                    <dd className="listing__stack">
                      {b.stack.map((s) => (
                        <span key={s} className="chip">
                          {s}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>

                <div className="listing__includes">
                  <p className="listing__includes-heading">What's included</p>
                  <ul>
                    {b.includes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="listing__actions">
                  {b.status === "available" ? (
                    <>
                      <a
                        className="btn btn--primary"
                        href={`${NANOWORK_SMS_HREF}&body=${encodeURIComponent(
                          `Hey Nanowork — I want to buy ${b.name} (${formatPrice(
                            b.price,
                          )}). What are the next steps?`,
                        )}`}
                      >
                        Buy {b.name} · {formatPrice(b.price)}
                      </a>
                      <Link
                        className="btn btn--ghost"
                        to={`/${b.slug}`}
                      >
                        Open live demo →
                      </Link>
                    </>
                  ) : b.status === "pending" ? (
                    <>
                      <a
                        className="btn btn--ghost"
                        href={`${NANOWORK_SMS_HREF}&body=${encodeURIComponent(
                          `Hey — put me on the waitlist for ${b.name} if ${formatPrice(
                            b.price,
                          )} falls through.`,
                        )}`}
                      >
                        Join waitlist
                      </a>
                      <Link
                        className="btn btn--ghost"
                        to={`/${b.slug}`}
                      >
                        Open live demo →
                      </Link>
                    </>
                  ) : (
                    <>
                      <span className="listing__sold">
                        Sold {b.mrr ? `— was generating ${b.mrr}` : ""}
                      </span>
                      <a className="btn btn--ghost" href={NANOWORK_SMS_HREF}>
                        Commission similar
                      </a>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {filtered.length === 0 && (
          <p className="listings__empty">
            Nothing in that category right now — text us and we'll build one for
            you.
          </p>
        )}
      </div>
    </section>
  );
}

function HowItWorks() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section className="section section--muted" id="how-it-works">
      <div
        ref={ref}
        className={`section__inner reveal ${visible ? "is-visible" : ""}`}
      >
        <p className="eyebrow">How a purchase works</p>
        <h2 className="section__title">
          From text to transfer in under a week.
        </h2>
        <p className="section__lede">
          Buying a Nanowork business is closer to acquiring a tiny, already-
          shipped company than buying a template. Every listing has been
          operated, pressure-tested, and handed over dozens of times.
        </p>

        <ol className="steps">
          <li className="step">
            <span className="step__num">01</span>
            <h3 className="step__title">Text us the listing</h3>
            <p className="step__body">
              Send us the name from the gallery. We'll walk you through what's
              real, what's working, and what to watch out for — in plain
              language, not a pitch deck.
            </p>
          </li>
          <li className="step">
            <span className="step__num">02</span>
            <h3 className="step__title">Escrow &amp; transfer</h3>
            <p className="step__body">
              Pay through Escrow.com. We transfer the codebase, domain, Stripe
              account, and customer list. If anything is off, nothing moves.
            </p>
          </li>
          <li className="step">
            <span className="step__num">03</span>
            <h3 className="step__title">Run it, your way</h3>
            <p className="step__body">
              You keep 100% of the upside, the brand, and the roadmap. We stay
              on-call for 30 days so the thing keeps humming while you settle
              in.
            </p>
          </li>
        </ol>
      </div>
    </section>
  );
}

function ProofStrip() {
  return (
    <section className="section section--proof">
      <div className="section__inner proof">
        <div className="proof__item">
          <strong>100%</strong>
          <span>of the code, assets, and accounts transfer</span>
        </div>
        <div className="proof__item">
          <strong>0%</strong>
          <span>equity or ongoing revenue share — ever</span>
        </div>
        <div className="proof__item">
          <strong>30d</strong>
          <span>of included post-launch support</span>
        </div>
        <div className="proof__item">
          <strong>1</strong>
          <span>flat price, no hidden fees or tiers</span>
        </div>
      </div>
    </section>
  );
}

function ClosingCTA() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section className="section section--cta">
      <div
        ref={ref}
        className={`section__inner reveal ${visible ? "is-visible" : ""}`}
      >
        <p className="eyebrow">Don't see it?</p>
        <h2 className="cta-title">Text us the shape of the business you want.</h2>
        <p className="cta-sub">
          We build two to four new gallery listings a month. If you have a
          specific wedge in mind, we'll build it around you — and give you first
          right of refusal at the listing price.
        </p>
        <a
          className="cta-number"
          href={NANOWORK_SMS_HREF}
          aria-label={`Text Nanowork at ${NANOWORK_SMS_DISPLAY}`}
        >
          {NANOWORK_SMS_DISPLAY}
        </a>
        <p className="cta-note">iMessage or SMS · Tap to chat</p>
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

export default function Gallery() {
  return (
    <>
      <TopNav />
      <main className="page page--pro page--gallery">
        <Hero />
        <Listings />
        <HowItWorks />
        <ProofStrip />
        <ClosingCTA />
      </main>
      <SiteFooter />
    </>
  );
}
