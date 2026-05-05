import { useEffect, useRef, useState } from "react";
import { SiteFooter, TopNav } from "../components/SiteChrome";
import { PhoneDisplay, TextUsLink } from "../components/PhoneReveal";
import { LiveAgentFeed } from "../components/LiveAgentFeed";

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

const FLOOR_TICKS = [
  "Legal · formation pack filed · EIN route",
  "Brand · voice + visuals locked",
  "Web · pricing page + checkout live",
  "Marketing · launch sequence running",
  "Sales · pipeline + sequences warm",
  "Finance · books + tax calendar set",
  "Ops · SLAs + vendor loop active",
  "Growth · cohort A converting",
  "Product · mobile margins tuned",
  "Legal · contractor agreements out",
];

function LiveFloorHero() {
  return (
    <section className="lp-hero" id="top" aria-labelledby="lp-hero-heading">
      <div className="lp-hero__grid" aria-hidden />
      <div className="lp-hero__inner">
        <div className="lp-hero__copy">
          <div className="lp-live-pill">
            <span className="lp-live-pill__dot" aria-hidden />
            <span>Parallel agents · one membership</span>
          </div>

          <h1 className="lp-hero__title" id="lp-hero-heading">
            Type one prompt.
            <br />
            Get{" "}
            <span className="lp-hero__title-accent">a whole company</span>{" "}
            built to earn.
          </h1>

          <p className="lp-hero__lede">
            Nanowork is not another tool or office suite. It is an AI-run business: legal structure,
            branding, website, marketing, sales, finance, and operations — spinning up together,
            on your behalf, toward revenue you can measure.
          </p>

          <div className="lp-hero__cta">
            <TextUsLink className="btn btn--primary">Start with a prompt — text us</TextUsLink>
            <a className="btn btn--ghost" href="#company">
              What gets built
            </a>
          </div>

          <p className="lp-hero__fine">
            Same-day reply · $99/mo · Cancel anytime · You own the entity and upside
          </p>
        </div>

        <div className="lp-hero__stage">
          <div className="lp-desk" role="img" aria-label="Stylized prompt spawning parallel agent work">
            <div className="lp-desk__bar">
              <span className="lp-desk__dots" aria-hidden>
                <span />
                <span />
                <span />
              </span>
              <span className="lp-desk__title">nanowork · genesis</span>
              <span className="lp-desk__clock" aria-hidden>
                SYNC
              </span>
            </div>

            <div className="lp-desk__metrics">
              <div className="lp-metric">
                <span className="lp-metric__label">Prompt</span>
                <strong className="lp-metric__value lp-metric__value--up">1</strong>
                <span className="lp-metric__hint">your line in</span>
              </div>
              <div className="lp-metric">
                <span className="lp-metric__label">Agents live</span>
                <strong className="lp-metric__value">7+</strong>
                <span className="lp-metric__hint">parallel</span>
              </div>
              <div className="lp-metric">
                <span className="lp-metric__label">Surface area</span>
                <strong className="lp-metric__value">Full co.</strong>
                <span className="lp-metric__hint">not a feature</span>
              </div>
            </div>

            <div className="lp-desk__feed">
              <div className="lp-desk__feed-head">
                <span>Prompt & parallel outs</span>
                <span className="lp-desk__pulse">simultaneous</span>
              </div>
              <ul className="lp-desk__rows">
                {[
                  {
                    who: "You",
                    what: "“Premium dog gear DTC, $45 AOV, ship US — I want real revenue in 30 days.”",
                    tone: "in",
                  },
                  {
                    who: "Legal agent",
                    what: "Entity path + compliance checklist drafted",
                    tone: "out",
                  },
                  {
                    who: "Brand + Web",
                    what: "Name system, site shell, checkout stub — linked",
                    tone: "out",
                  },
                  {
                    who: "Growth + Sales",
                    what: "Funnel + outbound skeleton live · tracking on",
                    tone: "out",
                  },
                  {
                    who: "Finance + Ops",
                    what: "Chart of accounts template · ops runbook queued",
                    tone: "out",
                  },
                ].map((row, i) => (
                  <li key={i} className={`lp-feed-row lp-feed-row--${row.tone}`}>
                    <span className="lp-feed-row__who">{row.who}</span>
                    <span className="lp-feed-row__what">{row.what}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lp-marquee" aria-hidden>
            <div className="lp-marquee__track">
              {[...FLOOR_TICKS, ...FLOOR_TICKS].map((t, i) => (
                <span key={i} className="lp-marquee__item">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NotATool() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const retired = [
    { name: "One more AI tool", sub: "Tabs, tokens, homework for you" },
    { name: "An office suite", sub: "Docs, slides, pretend progress" },
    { name: "A brittle template", sub: "Pretty shell, no business inside" },
    { name: "Founder-as-janitor", sub: "You glue everything by hand" },
  ];
  return (
    <section className="lp-section lp-section--rim" id="not-a-tool">
      <div
        ref={ref}
        className={`section__inner reveal ${visible ? "is-visible" : ""}`}
      >
        <p className="eyebrow">What it is not</p>
        <h2 className="section__title section__title--wide">
          This is not software to “help you work.”
          <span className="lp-muted-italic"> It is the work — as a company.</span>
        </h2>
        <p className="section__lede">
          You are not buying a smarter document editor. You are standing up revenue machinery:
          the legal, brand, commercial, and back-office spine — coordinated by agents at the same
          time, not one department waiting on another.
        </p>

        <div className="lp-retire-grid">
          {retired.map((item) => (
            <div key={item.name} className="lp-retire-card">
              <span className="lp-retire-card__strike" aria-hidden />
              <h3 className="lp-retire-card__title">{item.name}</h3>
              <p className="lp-retire-card__sub">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CompanySpine() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const pillars = [
    {
      tag: "Legal",
      pulse: "⊕",
      title: "Structure & compliance",
      body: "Entity formation path, agreements, and the boring rails that keep you sellable and defensible.",
    },
    {
      tag: "Brand",
      pulse: "◇",
      title: "Identity & story",
      body: "Name, voice, visuals, and narrative — sharp enough to market, humble enough to iterate.",
    },
    {
      tag: "Web",
      pulse: "●",
      title: "Site & product surface",
      body: "The live property: pages, flows, checkout, and the product edges that turn traffic into money.",
    },
    {
      tag: "Marketing",
      pulse: "◆",
      title: "Demand & narrative",
      body: "Launch beats, creative, and distribution — built to learn from real customers, not slides.",
    },
    {
      tag: "Sales",
      pulse: "→",
      title: "Pipeline & motion",
      body: "Sequences, CRM hygiene, and the commercial rhythm that chases qualified revenue.",
    },
    {
      tag: "Finance",
      pulse: "¤",
      title: "Money & reporting",
      body: "Books-minded setup, invoicing flows, and visibility so margins are a decision, not a mystery.",
    },
    {
      tag: "Ops",
      pulse: "▣",
      title: "Delivery & vendors",
      body: "How things ship, who does what, and the operational glue so the machine keeps running.",
    },
  ];
  return (
    <section className="lp-section" id="company">
      <div
        ref={ref}
        className={`section__inner reveal ${visible ? "is-visible" : ""}`}
      >
        <p className="eyebrow">The whole company</p>
        <h2 className="section__title section__title--wide">
          Seven fronts. One prompt. Agents in parallel.
        </h2>
        <p className="section__lede">
          Each strand is staffed by agents working at once — not a waterfall of freelancers, not a
          stack of disconnected SaaS. You describe the business; they divide the labor like a team
          that never sleeps.
        </p>

        <ul className="lp-agent-list lp-agent-list--seven">
          {pillars.map((a) => (
            <li key={a.tag} className="lp-agent-card">
              <div className="lp-agent-card__top">
                <span className="lp-agent-card__pulse" aria-hidden>
                  {a.pulse}
                </span>
                <span className="lp-agent-card__tag">{a.tag}</span>
              </div>
              <h3 className="lp-agent-card__title">{a.title}</h3>
              <p className="lp-agent-card__body">{a.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section className="lp-section lp-section--muted" id="how-it-works">
      <div
        ref={ref}
        className={`section__inner reveal ${visible ? "is-visible" : ""}`}
      >
        <p className="eyebrow">Flow</p>
        <h2 className="section__title">From one line of intent to an earning system.</h2>
        <p className="section__lede">
          You are not “configuring integrations.” You are giving a clear commercial thesis — and
          letting agents race to make it real while you stay in the thread that matters.
        </p>

        <ol className="steps">
          <li className="step">
            <span className="step__num">01</span>
            <h3 className="step__title">Drop the prompt</h3>
            <p className="step__body">
              One coherent ask: who pays, for what, by when, and what “good” looks like. Text or
              voice — enough for agents to parallelize legal, brand, web, GTM, finance, and ops.
            </p>
          </li>
          <li className="step">
            <span className="step__num">02</span>
            <h3 className="step__title">Turn the company on</h3>
            <p className="step__body">
              $99/mo membership. We align scope in-thread; you subscribe when the shape of the
              business feels right.
            </p>
          </li>
          <li className="step">
            <span className="step__num">03</span>
            <h3 className="step__title">Let the floor run hot</h3>
            <p className="step__body">
              Agents ship in parallel — filings, brand, site, campaigns, pipeline, books, runbooks —
              toward revenue you can read on a dashboard, not a wish in a doc.
            </p>
          </li>
        </ol>
      </div>
    </section>
  );
}

function PricingBand() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section className="section section--muted" id="pricing">
      <div
        ref={ref}
        className={`section__inner reveal ${visible ? "is-visible" : ""}`}
      >
        <p className="eyebrow">Pricing</p>
        <h2 className="pricing-band__title" id="pricing-headline">
          <span className="pricing-band__amount">$99</span>
          <span className="pricing-band__period">/mo</span>
        </h2>
        <p className="section__lede">
          One membership for an AI-run company: parallel agents across legal, brand, web, GTM,
          sales, finance, and ops — not seat licenses for another toolbelt. Cancel anytime — no
          equity, no tier maze.
        </p>
        <div className="pricing-band__cta">
          <TextUsLink className="btn btn--primary">Text us to subscribe</TextUsLink>
        </div>
      </div>
    </section>
  );
}

function Inhabited() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section className="section" id="philosophy">
      <div
        ref={ref}
        className={`section__inner reveal ${visible ? "is-visible" : ""}`}
      >
        <p className="eyebrow">Why Nanowork</p>
        <div className="philosophy">
          <div className="philosophy__col">
            <h2 className="section__title section__title--editorial">
              A business, not a bundle of apps.
              <br />
              <span className="muted-title">Built to collect dollars, not demos.</span>
            </h2>
          </div>
          <div className="philosophy__col">
            <p className="philosophy__body">
              Most products stop at “assistance.” Nanowork is aimed at a full commercial organism:
              the paperwork, the presence, the funnel, the money rails — because partial companies
              starve in the wild.
            </p>
            <ul className="tenets">
              <li>
                <strong>One prompt in.</strong> Many agents out — simultaneously, not sequentially.
              </li>
              <li>
                <strong>Yours on paper.</strong> Entity, brand, revenue — you hold title; we run the
                pit.
              </li>
              <li>
                <strong>Revenue as north star.</strong> We chase paying reality, not productivity
                theater.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const faqs = [
    {
      q: "Is Nanowork really building a whole company?",
      a: "Yes — that is the ambition: parallel AI agents working legal, brand, website, marketing, sales, finance, and operations toward a revenue-ready business, not a single-purpose widget.",
    },
    {
      q: "Is this the same as a chatbot or Copilot?",
      a: "No. Those sit beside your work. Nanowork is the work product: filings, brand, site, GTM, pipeline, and ops artifacts produced together — you steer with prompts and judgment, not tool configuration.",
    },
    {
      q: "How detailed does my first prompt need to be?",
      a: "Clear enough to name the customer, the offer, and what “paid” means. We tighten the rest in-thread before agents spin up in parallel.",
    },
    {
      q: "How do I pay?",
      a: "Text us from this site. We confirm scope, walk you through billing, and you subscribe at $99/mo — cancel anytime.",
    },
    {
      q: "Who owns what gets built?",
      a: "You do. Entity, IP, and payments should stay clean in your name from day one.",
    },
  ];
  return (
    <section className="section" id="faq">
      <div
        ref={ref}
        className={`section__inner reveal ${visible ? "is-visible" : ""}`}
      >
        <p className="eyebrow">FAQ</p>
        <h2 className="section__title">Straight answers.</h2>
        <ul className="faq">
          {faqs.map((item) => (
            <li key={item.q}>
              <details>
                <summary>
                  <span>{item.q}</span>
                  <span className="faq__chev" aria-hidden>
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
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </summary>
                <p>{item.a}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ClosingCTA() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section className="section section--cta" id="text-us">
      <div
        ref={ref}
        className={`section__inner reveal ${visible ? "is-visible" : ""}`}
      >
        <p className="eyebrow">Your prompt</p>
        <h2 className="cta-title">Text us — one line of intent, full company out.</h2>
        <p className="cta-sub">
          Same-day reply · $99/mo · Your region’s line unlocks on tap
        </p>
        <PhoneDisplay className="cta-number" />
        <p className="cta-note">iMessage or SMS</p>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <TopNav onHome />
      <main className="page page--pro page--landing">
        <LiveFloorHero />
        <LiveAgentFeed />
        <NotATool />
        <CompanySpine />
        <HowItWorks />
        <PricingBand />
        <Inhabited />
        <FAQ />
        <ClosingCTA />
      </main>
      <SiteFooter onHome />
    </>
  );
}
