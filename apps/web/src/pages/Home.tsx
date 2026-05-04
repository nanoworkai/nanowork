import { useEffect, useRef, useState } from "react";
import HomeHero from "../components/HomeHero";
import { SiteFooter, TopNav } from "../components/SiteChrome";
import { PhoneDisplay, TextUsLink } from "../components/PhoneReveal";

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
          One membership. We help you turn texts into live pages, payments, and launches. Cancel
          anytime — no equity, no tiers.
        </p>
        <div className="pricing-band__cta">
          <TextUsLink className="btn btn--primary">Text us to subscribe</TextUsLink>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section className="section" id="how-it-works">
      <div
        ref={ref}
        className={`section__inner reveal ${visible ? "is-visible" : ""}`}
      >
        <p className="eyebrow">How it works</p>
        <h2 className="section__title">Three beats: text, subscribe, ship.</h2>
        <p className="section__lede">
          No forms. No backlog tickets. You describe what you want in plain language — we respond in
          the thread and start building.
        </p>

        <ol className="steps">
          <li className="step">
            <span className="step__num">01</span>
            <h3 className="step__title">Text your idea</h3>
            <p className="step__body">
              One sentence or a voice memo. Who it’s for and what “paid” looks like is enough.
            </p>
          </li>
          <li className="step">
            <span className="step__num">02</span>
            <h3 className="step__title">Subscribe when it clicks</h3>
            <p className="step__body">
              $99/mo — flat and simple. We align on scope in thread, then you turn it on when you’re
              ready.
            </p>
          </li>
          <li className="step">
            <span className="step__num">03</span>
            <h3 className="step__title">We ship in days</h3>
            <p className="step__body">
              Landing pages, checkout, creative, small tools — whatever earns your first dollars
              fastest.
            </p>
          </li>
        </ol>
      </div>
    </section>
  );
}

function BuildGrid() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const items = [
    {
      title: "Paid offers",
      body: "Pricing page, checkout, and the smallest funnel that takes money this week.",
    },
    {
      title: "Tiny products",
      body: "Focused tools for one audience — shipped with a real URL and first users.",
    },
    {
      title: "Audience → cash",
      body: "Turn subscribers or followers into something people actually buy.",
    },
    {
      title: "Local services",
      body: "Bookings, deposits, and a clean presence without wrestling the stack solo.",
    },
    {
      title: "B2B pilots",
      body: "Short wedge, clear price, a handful of design partners before heavy build.",
    },
    {
      title: "Newsletters & media",
      body: "Landing page, signup, and week-one cadence so attention turns into revenue.",
    },
  ];
  return (
    <section className="section" id="build">
      <div
        ref={ref}
        className={`section__inner reveal ${visible ? "is-visible" : ""}`}
      >
        <p className="eyebrow">What we ship</p>
        <h2 className="section__title">If it can earn, we can help you launch it.</h2>
        <p className="section__lede">
          Bring something sized for your life — not a ten-year roadmap. Common starting points:
        </p>

        <ul className="cards">
          {items.map((item, i) => (
            <li className="card" key={item.title}>
              <span className="card__index" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="card__title">{item.title}</h3>
              <p className="card__body">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Philosophy() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section className="section section--muted" id="philosophy">
      <div
        ref={ref}
        className={`section__inner reveal ${visible ? "is-visible" : ""}`}
      >
        <p className="eyebrow">Why Nanowork</p>
        <div className="philosophy">
          <div className="philosophy__col">
            <h2 className="section__title section__title--editorial">
              Built for revenue,
              <br />
              <span className="muted-title">not slide decks.</span>
            </h2>
          </div>
          <div className="philosophy__col">
            <p className="philosophy__body">
              Most ideas die waiting for permission or perfect decks. We’re for operators who want a
              paying customer, a live URL, and momentum — for one predictable monthly fee.
            </p>
            <ul className="tenets">
              <li>
                <strong>Text is the door.</strong> Fast answers, no ticket queues.
              </li>
              <li>
                <strong>You keep the company.</strong> Your name, your upside.
              </li>
              <li>
                <strong>We chase first dollars.</strong> Launch lean, iterate in public.
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
      q: "How do I pay?",
      a: "Text us from this site. We confirm scope, walk you through billing, and you subscribe at $99/mo — cancel anytime.",
    },
    {
      q: "What’s included?",
      a: "Hands-on help turning your thread into something live: pages, payments, creative, and iteration toward revenue — one monthly price, no equity.",
    },
    {
      q: "Why is the number gated?",
      a: "We route regional lines and verify server-side so founders get the right number — not bots scraping the site.",
    },
    {
      q: "Who owns what we build?",
      a: "You do. We help keep entity, payments, and IP clean from day one.",
    },
  ];
  return (
    <section className="section" id="faq">
      <div
        ref={ref}
        className={`section__inner reveal ${visible ? "is-visible" : ""}`}
      >
        <p className="eyebrow">FAQ</p>
        <h2 className="section__title">Before you text.</h2>
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
        <p className="eyebrow">Ready</p>
        <h2 className="cta-title">Text us — become a paying member today.</h2>
        <p className="cta-sub">
          Same-day reply · $99/mo · Tap below for your region’s line.
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
      <main className="page page--pro">
        <HomeHero />
        <HowItWorks />
        <PricingBand />
        <BuildGrid />
        <Philosophy />
        <FAQ />
        <ClosingCTA />
      </main>
      <SiteFooter />
    </>
  );
}
