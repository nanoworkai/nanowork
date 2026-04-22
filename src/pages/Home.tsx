import { useEffect, useRef, useState } from "react";

/** Nanowork SMS / iMessage line — E.164 for sms: links; display for humans. */
const NANOWORK_SMS_E164 = "+16506740193";
const NANOWORK_SMS_DISPLAY = "(650) 674-0193";
const NANOWORK_SMS_HREF = `sms:${NANOWORK_SMS_E164}`;

type ChatMessage = {
  from: "user" | "nanowork";
  text: string;
  meta?: string;
};

const CHAT_SCRIPT: ChatMessage[] = [
  {
    from: "user",
    text: "I keep thinking about a tiny tool that emails me a morning brief tailored to my calendar.",
  },
  {
    from: "nanowork",
    text: "Love it. That's a real pain — most briefings ignore what you're actually doing that day.",
  },
  {
    from: "nanowork",
    text: "I drafted a name, a one-line pitch, and a $9/mo pricing test. Want me to spin up a waitlist page and start collecting signups tonight?",
  },
  {
    from: "user",
    text: "Yes. Let's go.",
  },
  {
    from: "nanowork",
    text: "Shipping. I'll text you when the page is live and when the first signup lands.",
    meta: "Delivered",
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
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
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
      <a href="#top" className="site-nav__brand" aria-label="Nanowork home">
        <BrandMark />
      </a>
      <nav className="site-nav__links" aria-label="Primary">
        <a href="#how-it-works">Process</a>
        <a href="#build">Ideas</a>
        <a href="#philosophy">Why</a>
        <a href="#faq">FAQ</a>
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
    <section className="hero" id="top">
      <div className="hero__inner">
        <div className="hero__copy">
          <span className="platform-pill">
            <span className="status-dot" aria-hidden />
            In early beta · Invite only
          </span>
          <h1 className="display-headline">
            From idea to revenue,
            <br />
            <span className="display-headline__accent">over text.</span>
          </h1>
          <p className="lede">
            Nanowork lives inside your messages. Text an idea. We help you
            shape it, ship it, and find your first customers — without the
            capital cost of a typical startup.
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
            <a className="btn btn--ghost" href="#how-it-works">
              See how it works
            </a>
          </div>
          <dl className="hero__stats" aria-label="What you get">
            <div>
              <dt>No deck</dt>
              <dd>Just a message</dd>
            </div>
            <div>
              <dt>No code required</dt>
              <dd>We build alongside you</dd>
            </div>
            <div>
              <dt>Keep ownership</dt>
              <dd>It's your company</dd>
            </div>
          </dl>
        </div>
        <div className="hero__visual" aria-hidden>
          <ChatMock />
        </div>
      </div>
    </section>
  );
}

function ChatMock() {
  return (
    <div className="chat" role="img" aria-label="Example conversation with Nanowork">
      <div className="chat__chrome">
        <div className="chat__bar">
          <span className="chat__dots">
            <span /> <span /> <span />
          </span>
          <span className="chat__title">
            <span className="chat__avatar" aria-hidden>
              N
            </span>
            Nanowork
          </span>
          <span className="chat__time">iMessage</span>
        </div>
      </div>
      <ol className="chat__stream">
        {CHAT_SCRIPT.map((m, i) => (
          <li
            key={i}
            className={`bubble bubble--${m.from}`}
            style={{ animationDelay: `${i * 300 + 200}ms` }}
          >
            <p>{m.text}</p>
            {m.meta ? <span className="bubble__meta">{m.meta}</span> : null}
          </li>
        ))}
        <li className="bubble bubble--nanowork bubble--typing" aria-hidden>
          <span className="typing">
            <span /> <span /> <span />
          </span>
        </li>
      </ol>
      <div className="chat__compose" aria-hidden>
        <span className="chat__compose-field">iMessage</span>
        <span className="chat__compose-send">
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12l14-7-7 14-2-5-5-2z" />
          </svg>
        </span>
      </div>
    </div>
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
        <h2 className="section__title">
          Three messages between you and your next company.
        </h2>
        <p className="section__lede">
          No dashboards to learn. No forms to fill out. You text, we respond,
          and the work starts happening in the background — the moment the idea
          leaves your head.
        </p>

        <ol className="steps">
          <li className="step">
            <span className="step__num">01</span>
            <h3 className="step__title">Send us the spark</h3>
            <p className="step__body">
              A sentence is enough. A voice memo works too. Describe the
              problem, the person, or the outcome — whichever is clearest in
              your head right now.
            </p>
          </li>
          <li className="step">
            <span className="step__num">02</span>
            <h3 className="step__title">We pressure-test and plan</h3>
            <p className="step__body">
              We sharpen the pitch, scope the smallest version that can earn
              revenue, and lay out a tight path: what to build, what to buy,
              and what to skip.
            </p>
          </li>
          <li className="step">
            <span className="step__num">03</span>
            <h3 className="step__title">We ship, you decide</h3>
            <p className="step__body">
              Landing pages, waitlists, payment links, ad creative, small
              tools — built and launched within days. You stay the final call
              on everything that ships in your name.
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
      title: "Productized services",
      body: "Turn what you're already good at into a $X/mo offer with a waitlist, pricing, and a real payment link.",
    },
    {
      title: "Niche software",
      body: "Small, sharp tools for a specific audience — built from a spec, launched with a real page and first users.",
    },
    {
      title: "Content → commerce",
      body: "If you already have an audience, we help you turn it into a product, a course, or a subscription that pays.",
    },
    {
      title: "Local + physical",
      body: "Cleaning, events, coaching, curated goods. We handle the site, the booking flow, and the launch playbook.",
    },
    {
      title: "B2B experiments",
      body: "Validate a wedge with a short pilot, a clear price, and 3–5 design partners before writing real code.",
    },
    {
      title: "Newsletters & media",
      body: "From a cold domain to a paid list with real distribution — landing page, signup, and week-one cadence.",
    },
  ];
  return (
    <section className="section section--muted" id="build">
      <div
        ref={ref}
        className={`section__inner reveal ${visible ? "is-visible" : ""}`}
      >
        <p className="eyebrow">What you can build</p>
        <h2 className="section__title">
          Small companies, shipped in the open.
        </h2>
        <p className="section__lede">
          Nanowork is built for the kind of founder who would rather test a
          real offer this week than raise a round next year. Here's the range
          of things people bring us.
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
    <section className="section" id="philosophy">
      <div
        ref={ref}
        className={`section__inner reveal ${visible ? "is-visible" : ""}`}
      >
        <p className="eyebrow">Why Nanowork</p>
        <div className="philosophy">
          <div className="philosophy__col">
            <h2 className="section__title section__title--editorial">
              Most startups die waiting
              <br />
              <span className="muted-title">
                for permission, capital, or the perfect time.
              </span>
            </h2>
          </div>
          <div className="philosophy__col">
            <p className="philosophy__body">
              We believe the next generation of companies will be small,
              focused, and profitable from the first month. They won't be built
              in 18-month stealth runs or 90-slide decks — they'll be built in
              conversations, shipped in weeks, and iterated in public.
            </p>
            <p className="philosophy__body">
              Nanowork is the tissue between a good idea and a real company.
              You bring the taste, the judgment, and the customer relationship.
              We bring the operators, the tooling, and the relentless pace.
            </p>
            <ul className="tenets">
              <li>
                <strong>Text is the interface.</strong> If it doesn't work in a
                thread with a friend, it's too heavy.
              </li>
              <li>
                <strong>Revenue is the receipt.</strong> A paying customer is
                worth more than a hundred signups.
              </li>
              <li>
                <strong>You keep the upside.</strong> Your idea, your company,
                your name on the door.
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
      q: "Is Nanowork actually just a phone number?",
      a: "That's the front door. Behind it is a small, opinionated team plus a set of internal tools that help us move from idea to live product fast. You won't need to learn any of it.",
    },
    {
      q: "Who's it for?",
      a: "Operators, designers, engineers, and domain experts who have ideas they've been sitting on — and who would rather test one in the open than talk about it for another quarter.",
    },
    {
      q: "What does it cost?",
      a: "A flat $99 per month. No tiers, no per-seat upsells, no usage meters, no equity. One price, cancel any time.",
    },
    {
      q: "Who owns what we build?",
      a: "You do. The company is yours. We help you set it up clean from day one, including entity, payments, and IP.",
    },
    {
      q: "Is this a fund or an accelerator?",
      a: "Neither. We don't take equity, we don't take board seats, and we don't pressure you toward venture scale. We're here to help you build something real and durable for a flat monthly fee.",
    },
  ];
  return (
    <section className="section section--muted" id="faq">
      <div
        ref={ref}
        className={`section__inner reveal ${visible ? "is-visible" : ""}`}
      >
        <p className="eyebrow">FAQ</p>
        <h2 className="section__title">Questions people text us first.</h2>
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
    <section className="section section--cta">
      <div
        ref={ref}
        className={`section__inner reveal ${visible ? "is-visible" : ""}`}
      >
        <p className="eyebrow">The next move</p>
        <h2 className="cta-title">
          Text us the thing you've been thinking about.
        </h2>
        <p className="cta-sub">
          One sentence is enough. We'll take it from there — and you'll hear
          back today.
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
                <a href="#how-it-works">How it works</a>
              </li>
              <li>
                <a href="#build">What you can build</a>
              </li>
              <li>
                <a href="#philosophy">Why Nanowork</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
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

export default function Home() {
  return (
    <>
      <TopNav />
      <main className="page page--pro">
        <Hero />
        <HowItWorks />
        <BuildGrid />
        <Philosophy />
        <FAQ />
        <ClosingCTA />
      </main>
      <SiteFooter />
    </>
  );
}
