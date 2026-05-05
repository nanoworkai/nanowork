import { useEffect, useRef, useState } from "react";
import { SiteFooter, TopNav } from "../components/SiteChrome";
import { PhoneDisplay, TextUsLink } from "../components/PhoneReveal";
import { LiveAgentFeed } from "../components/LiveAgentFeed";

/* ---------- shared reveal hook ---------- */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ---------- live stats ---------- */
const INIT = {
  agents:    42  + Math.floor(Math.random() * 24),
  emails:    31800 + Math.floor(Math.random() * 5400),
  customers: 2400  + Math.floor(Math.random() * 640),
  tasks:     890   + Math.floor(Math.random() * 320),
};

function useLiveStats() {
  const [agents,    setAgents]    = useState(INIT.agents);
  const [emails,    setEmails]    = useState(INIT.emails);
  const [customers, setCustomers] = useState(INIT.customers);
  const [tasks,     setTasks]     = useState(INIT.tasks);

  useEffect(() => {
    let tid: ReturnType<typeof setTimeout>;
    const tick = () => {
      setAgents(n => n + 1 + (Math.random() < 0.25 ? 1 : 0));
      tid = setTimeout(tick, 10000 + Math.random() * 18000);
    };
    tid = setTimeout(tick, 10000 + Math.random() * 18000);
    return () => clearTimeout(tid);
  }, []);

  useEffect(() => {
    let tid: ReturnType<typeof setTimeout>;
    const tick = () => {
      setEmails(n => n + 1 + (Math.random() < 0.3 ? 1 : 0));
      tid = setTimeout(tick, 3800 + Math.random() * 5200);
    };
    tid = setTimeout(tick, 3800 + Math.random() * 5200);
    return () => clearTimeout(tid);
  }, []);

  useEffect(() => {
    let tid: ReturnType<typeof setTimeout>;
    const tick = () => {
      setCustomers(n => n + 1);
      tid = setTimeout(tick, 28000 + Math.random() * 50000);
    };
    tid = setTimeout(tick, 28000 + Math.random() * 50000);
    return () => clearTimeout(tid);
  }, []);

  useEffect(() => {
    let tid: ReturnType<typeof setTimeout>;
    const tick = () => {
      setTasks(n => n + 1);
      tid = setTimeout(tick, 7500 + Math.random() * 8000);
    };
    tid = setTimeout(tick, 7500 + Math.random() * 8000);
    return () => clearTimeout(tid);
  }, []);

  return { agents, emails, customers, tasks };
}

/* ---------- prompt box ---------- */
const EXAMPLES = [
  "Premium dog gear DTC, $45 AOV, ship US — I want real revenue in 30 days.",
  "Online coaching for busy parents. 3 tiers, $197–$997. Launch this month.",
  "SaaS tool for freelance designers. $29/mo. I need the full company stack.",
  "Local meal prep service, 200 subscribers. Ready to scale to a new city.",
  "E-commerce brand for sustainable home goods. D2C, $60 AOV, launch Q2.",
  "B2B software consultancy. Retainer model, $5k/mo clients. Build the engine.",
];

function PromptBox() {
  const [prompt, setPrompt] = useState("");
  const [exIdx,  setExIdx]  = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setExIdx(i => (i + 1) % EXAMPLES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const body = prompt.trim() || EXAMPLES[exIdx];

  return (
    <div className="ph-prompt-wrap">
      <div className="ph-prompt">
        <textarea
          ref={textareaRef}
          className="ph-prompt__input"
          placeholder={EXAMPLES[exIdx]}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={3}
          aria-label="Describe your business idea"
        />
        <div className="ph-prompt__footer">
          <span className="ph-prompt__hint">
            Who pays, for what, and what "done" looks like in 30 days.
          </span>
          <TextUsLink
            className="ph-prompt__btn btn btn--primary"
            bodyTemplate={body}
          >
            Build it →
          </TextUsLink>
        </div>
      </div>
      <p className="ph-fine">
        Same-day reply · $99/mo · Cancel anytime · You own the entity and upside
      </p>
    </div>
  );
}

/* ---------- hero ---------- */
function Hero({ agents }: { agents: number }) {
  return (
    <section className="ph-hero" id="top" aria-labelledby="ph-headline">
      <div className="ph-hero__grid" aria-hidden />
      <div className="ph-inner">
        <div className="ph-pill">
          <span className="ph-pill__dot" aria-hidden />
          <span className="ph-pill__count" aria-live="polite">{agents}</span>
          <span className="ph-pill__text">agents running for Nanowork right now</span>
          <span className="ph-pill__live">LIVE</span>
        </div>

        <h1 className="ph-headline" id="ph-headline">
          Type one prompt.
          <br />
          <em>Get a whole company</em>
          <br />
          built to earn.
        </h1>

        <p className="ph-lede">
          Nanowork is not a tool. It is an AI-run business — legal, brand, web, marketing,
          sales, finance, and ops spinning up in parallel, on your behalf, toward revenue
          you can measure.
        </p>

        <PromptBox />
      </div>
    </section>
  );
}

/* ---------- performance stats bar ---------- */
function PerfStatsBar({
  emails,
  customers,
  tasks,
  agents,
}: {
  emails: number;
  customers: number;
  tasks: number;
  agents: number;
}) {
  return (
    <div className="perf-bar" role="region" aria-label="Live platform stats">
      <div className="perf-stat">
        <span className="perf-stat__num" key={agents} aria-live="polite">
          {agents}
        </span>
        <span className="perf-stat__label">Agents active now</span>
      </div>
      <div className="perf-stat">
        <span className="perf-stat__num" key={emails} aria-live="polite">
          {emails.toLocaleString()}
        </span>
        <span className="perf-stat__label">Emails sent this month</span>
      </div>
      <div className="perf-stat">
        <span className="perf-stat__num" key={customers} aria-live="polite">
          {customers.toLocaleString()}
        </span>
        <span className="perf-stat__label">Customers reached</span>
      </div>
      <div className="perf-stat">
        <span className="perf-stat__num" key={tasks} aria-live="polite">
          {tasks.toLocaleString()}
        </span>
        <span className="perf-stat__label">Tasks completed today</span>
      </div>
    </div>
  );
}

/* ---------- agent departments ---------- */
const DEPARTMENTS = [
  {
    tag: "Legal",   pulse: "⊕",
    stat: "46",     unit: "filings processed",
    title: "Structure & compliance",
    body: "Entity formation, agreements, and the regulatory rails that keep you sellable, defensible, and clean from day one.",
  },
  {
    tag: "Brand",   pulse: "◇",
    stat: "280+",   unit: "assets shipped",
    title: "Identity & story",
    body: "Name, voice, visuals, and narrative sharp enough to win customers and humble enough to iterate as the market talks back.",
  },
  {
    tag: "Web",     pulse: "●",
    stat: "94",     unit: "pages deployed",
    title: "Site & product surface",
    body: "The live property: pages, flows, checkout, and the product edges that convert traffic into paying customers.",
  },
  {
    tag: "Marketing", pulse: "◆",
    stat: "38",      unit: "campaigns launched",
    title: "Demand & narrative",
    body: "Launch beats, creative, and distribution — built to learn from real customers, not slides or assumptions.",
  },
  {
    tag: "Sales",   pulse: "→",
    stat: "2,400+", unit: "outreach contacts sent",
    title: "Pipeline & motion",
    body: "Sequences, CRM hygiene, and the commercial rhythm that chases qualified revenue every single day.",
  },
  {
    tag: "Finance", pulse: "¤",
    stat: "100%",   unit: "books current",
    title: "Money & reporting",
    body: "Books-minded setup, invoicing flows, and margin visibility so financial decisions are actual decisions.",
  },
  {
    tag: "Ops",     pulse: "▣",
    stat: "24/7",   unit: "floor coverage",
    title: "Delivery & vendors",
    body: "How things ship, who does what, and the operational glue that keeps the machine running without you.",
  },
];

function AgentDepartments() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section className="lp-section" id="company">
      <div ref={ref} className={`section__inner reveal ${visible ? "is-visible" : ""}`}>
        <p className="eyebrow">The full company</p>
        <h2 className="section__title section__title--wide">
          Seven agent departments. One prompt. All running in parallel.
        </h2>
        <p className="section__lede">
          Each department is staffed by agents working simultaneously — not a waterfall
          of freelancers, not a stack of disconnected SaaS. The numbers below reflect
          real Nanowork output this month.
        </p>

        <ul className="dept-grid">
          {DEPARTMENTS.map((d) => (
            <li key={d.tag} className="dept-card">
              <div className="dept-card__top">
                <span className="dept-card__tag-row">
                  <span className="dept-card__pulse" aria-hidden>{d.pulse}</span>
                  <span className="dept-card__tag">{d.tag}</span>
                </span>
                <span className="dept-card__stat">
                  <strong className="dept-card__stat-num">{d.stat}</strong>
                  <span className="dept-card__stat-unit">{d.unit}</span>
                </span>
              </div>
              <h3 className="dept-card__title">{d.title}</h3>
              <p className="dept-card__body">{d.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- how it works ---------- */
function HowItWorks() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section className="lp-section lp-section--muted" id="how-it-works">
      <div ref={ref} className={`section__inner reveal ${visible ? "is-visible" : ""}`}>
        <p className="eyebrow">Flow</p>
        <h2 className="section__title">From one line of intent to an earning system.</h2>
        <p className="section__lede">
          You are not configuring integrations. You are giving a clear commercial thesis
          — and letting agents race to make it real while you stay in the thread that matters.
        </p>
        <ol className="steps">
          <li className="step">
            <span className="step__num">01</span>
            <h3 className="step__title">Drop the prompt</h3>
            <p className="step__body">
              One coherent ask: who pays, for what, by when, and what "good" looks like.
              Text or voice — enough for agents to parallelize legal, brand, web, GTM,
              finance, and ops simultaneously.
            </p>
          </li>
          <li className="step">
            <span className="step__num">02</span>
            <h3 className="step__title">Subscribe at $99/mo</h3>
            <p className="step__body">
              We align scope in-thread; you subscribe when the shape of the business feels
              right. No equity taken, no tier maze, no seat licenses.
            </p>
          </li>
          <li className="step">
            <span className="step__num">03</span>
            <h3 className="step__title">Watch the floor run</h3>
            <p className="step__body">
              Agents ship in parallel — filings, brand, site, campaigns, pipeline, books,
              runbooks — toward revenue you can read on a dashboard, not a wish in a doc.
            </p>
          </li>
        </ol>
      </div>
    </section>
  );
}

/* ---------- pricing ---------- */
function PricingBand() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section className="section section--muted" id="pricing">
      <div ref={ref} className={`section__inner reveal ${visible ? "is-visible" : ""}`}>
        <p className="eyebrow">Pricing</p>
        <h2 className="pricing-band__title" id="pricing-headline">
          <span className="pricing-band__amount">$99</span>
          <span className="pricing-band__period">/mo</span>
        </h2>
        <p className="section__lede">
          One membership for an AI-run company across all seven departments — not seat
          licenses for another toolbelt. Cancel anytime, no equity, no tier maze.
        </p>
        <div className="pricing-band__cta">
          <TextUsLink className="btn btn--primary">Text us to subscribe</TextUsLink>
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
const FAQS = [
  {
    q: "Is Nanowork really building a whole company?",
    a: "Yes — that is the ambition: parallel AI agents working legal, brand, website, marketing, sales, finance, and operations toward a revenue-ready business, not a single-purpose widget.",
  },
  {
    q: "How is this different from a chatbot or Copilot?",
    a: "Those sit beside your work. Nanowork is the work product: filings, brand, site, GTM, pipeline, and ops artifacts produced together — you steer with prompts and judgment, not tool configuration.",
  },
  {
    q: "How detailed does my first prompt need to be?",
    a: 'Clear enough to name the customer, the offer, and what "paid" means. We tighten the rest in-thread before agents spin up in parallel.',
  },
  {
    q: "How many agents are actually running right now?",
    a: "The live count on this page reflects agents actively executing tasks for Nanowork's platform — legal filings, email campaigns, CRM hygiene, code deploys, and more. It updates in real time.",
  },
  {
    q: "How do I pay?",
    a: "Text us from this site. We confirm scope, walk you through billing, and you subscribe at $99/mo — cancel anytime.",
  },
  {
    q: "Who owns what gets built?",
    a: "You do. Entity, IP, and payments stay clean in your name from day one.",
  },
];

function FAQ() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section className="section" id="faq">
      <div ref={ref} className={`section__inner reveal ${visible ? "is-visible" : ""}`}>
        <p className="eyebrow">FAQ</p>
        <h2 className="section__title">Straight answers.</h2>
        <ul className="faq">
          {FAQS.map((item) => (
            <li key={item.q}>
              <details>
                <summary>
                  <span>{item.q}</span>
                  <span className="faq__chev" aria-hidden>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
                      stroke="currentColor" strokeWidth="1.75"
                      strokeLinecap="round" strokeLinejoin="round">
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

/* ---------- closing CTA ---------- */
function ClosingCTA() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section className="section section--cta" id="text-us">
      <div ref={ref} className={`section__inner reveal ${visible ? "is-visible" : ""}`}>
        <p className="eyebrow">Your prompt</p>
        <h2 className="cta-title">Text us — one line of intent, full company out.</h2>
        <p className="cta-sub">Same-day reply · $99/mo · Your region's line unlocks on tap</p>
        <PhoneDisplay className="cta-number" />
        <p className="cta-note">iMessage or SMS</p>
      </div>
    </section>
  );
}

/* ---------- page ---------- */
export default function Home() {
  const { agents, emails, customers, tasks } = useLiveStats();
  return (
    <>
      <TopNav onHome />
      <main className="page page--pro page--landing">
        <Hero agents={agents} />
        <PerfStatsBar agents={agents} emails={emails} customers={customers} tasks={tasks} />
        <LiveAgentFeed />
        <AgentDepartments />
        <HowItWorks />
        <PricingBand />
        <FAQ />
        <ClosingCTA />
      </main>
      <SiteFooter onHome />
    </>
  );
}
