import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* ── Feed data ─────────────────────────────────────────── */

const FEED_EVENTS = [
  { emoji: "🚀", name: "Jordan P.", action: "just launched", highlight: "Premium Dog Gear DTC", meta: "Legal + Brand + Site live" },
  { emoji: "💰", name: "Sarah M.", action: "got their first customer", highlight: "$297 sale", meta: "Coaching for busy parents" },
  { emoji: "⚡", name: "Marcus T.", action: "went live with", highlight: "SaaS for designers", meta: "$29/mo · 3 paying users today" },
  { emoji: "🏪", name: "Priya K.", action: "is scaling", highlight: "Meal prep to City 2", meta: "212 subscribers migrated" },
  { emoji: "📈", name: "Alex R.", action: "hit", highlight: "$4,800 MRR", meta: "Sustainable home goods · month 3" },
  { emoji: "🤝", name: "Diana W.", action: "landed", highlight: "first retainer client", meta: "$5k/mo · B2B consultancy" },
  { emoji: "🌐", name: "Tom S.", action: "deployed", highlight: "custom domain", meta: "fincraft.io is live" },
  { emoji: "📬", name: "Keiko L.", action: "sent", highlight: "2,400 outreach emails", meta: "42% open rate this week" },
  { emoji: "⚙️", name: "Ryan B.", action: "set up", highlight: "7 agent departments", meta: "All running in parallel" },
  { emoji: "🎯", name: "Nina F.", action: "converted", highlight: "14 free → paid", meta: "Email tool · $49/mo tier" },
  { emoji: "🏆", name: "Carlos V.", action: "crossed", highlight: "$10k revenue", meta: "Month 2 · Pet accessories brand" },
  { emoji: "📊", name: "Jasmine H.", action: "shared", highlight: "live revenue dashboard", meta: "Investors can see it in real time" },
];

/* ── Prompts ────────────────────────────────────────────── */

const EXAMPLES = [
  "Premium dog gear DTC, $45 AOV, ship US — I want real revenue in 30 days.",
  "Online coaching for busy parents. 3 tiers, $197–$997. Launch this month.",
  "SaaS tool for freelance designers. $29/mo. I need the full company stack.",
  "Local meal prep service, 200 subscribers. Ready to scale to a new city.",
  "E-commerce brand for sustainable home goods. D2C, $60 AOV, launch Q2.",
  "B2B software consultancy. Retainer model, $5k/mo clients. Build the engine.",
];

/* ── Live counter ───────────────────────────────────────── */

function useLiveCount(init: number, intervalMs: number, step = 1) {
  const [count, setCount] = useState(init);
  useEffect(() => {
    const id = setInterval(() => setCount((n) => n + step), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, step]);
  return count;
}

/* ── Activity feed item ─────────────────────────────────── */

function FeedItem({
  item,
  delay,
}: {
  item: (typeof FEED_EVENTS)[0];
  delay: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`flex gap-3 p-3 rounded-xl bg-surface-2 border border-white/5 transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <span className="text-xl leading-none mt-0.5 flex-shrink-0">{item.emoji}</span>
      <div className="min-w-0">
        <p className="text-sm text-zinc-300 leading-snug">
          <span className="font-semibold text-white">{item.name}</span>{" "}
          {item.action}{" "}
          <span className="font-semibold text-brand-400">{item.highlight}</span>
        </p>
        <p className="text-xs text-zinc-500 mt-0.5">{item.meta}</p>
      </div>
    </div>
  );
}

/* ── Animated feed ──────────────────────────────────────── */

function ActivityFeed() {
  const [items, setItems] = useState(FEED_EVENTS.slice(0, 5));
  const [key, setKey] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setItems((prev) => {
        const nextIdx = (FEED_EVENTS.indexOf(prev[0]) + prev.length) % FEED_EVENTS.length;
        return [FEED_EVENTS[nextIdx], ...prev.slice(0, 4)];
      });
      setKey((k) => k + 1);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <FeedItem key={`${key}-${i}`} item={item} delay={i * 80} />
      ))}
    </div>
  );
}

/* ── Prompt box ─────────────────────────────────────────── */

function PromptBox() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [exIdx, setExIdx] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const id = setInterval(() => setExIdx((i) => (i + 1) % EXAMPLES.length), 4500);
    return () => clearInterval(id);
  }, []);

  function handleSubmit() {
    const text = prompt.trim() || EXAMPLES[exIdx];
    if (isAuthenticated) {
      navigate(`/dashboard?p=${encodeURIComponent(text)}`);
    } else {
      navigate(`/login?redirect=/dashboard&p=${encodeURIComponent(text)}`);
    }
  }

  return (
    <div className="w-full">
      <div className="relative rounded-2xl bg-surface-2 border border-white/10 focus-within:border-brand-500/60 transition-colors shadow-2xl">
        <textarea
          ref={textareaRef}
          className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 resize-none text-base leading-relaxed px-4 pt-4 pb-16 rounded-2xl outline-none"
          placeholder={EXAMPLES[exIdx]}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
          }}
          rows={3}
          aria-label="Describe your business idea"
        />
        <div className="absolute bottom-3 left-4 right-3 flex items-center justify-between">
          <span className="text-xs text-zinc-600">
            Who pays · for what · what "done" looks like in 30 days
          </span>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-colors"
          >
            Build it
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <p className="text-center text-xs text-zinc-600 mt-3">
        Free preview · $99/mo to subscribe · You own the entity and upside
      </p>
    </div>
  );
}

/* ── Stats strip ─────────────────────────────────────────── */

function StatStrip() {
  const agents = useLiveCount(47, 12000);
  const emails = useLiveCount(31847, 4200);
  const customers = useLiveCount(2463, 30000);

  const stats = [
    { label: "Agents running", value: agents.toLocaleString() },
    { label: "Emails sent this month", value: emails.toLocaleString() },
    { label: "Customers reached", value: customers.toLocaleString() },
    { label: "Flat monthly price", value: "$99" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border-y border-white/5">
      {stats.map((s) => (
        <div key={s.label} className="bg-surface-1 px-5 py-4 text-center">
          <div className="text-2xl font-bold text-white tabular-nums">{s.value}</div>
          <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Departments ─────────────────────────────────────────── */

const DEPARTMENTS = [
  { icon: "⚖️", label: "Legal", desc: "Entity formation, agreements, and compliance from day one." },
  { icon: "🎨", label: "Brand", desc: "Name, voice, visuals, and narrative that converts." },
  { icon: "🌐", label: "Web", desc: "Live site, checkout, and product flows." },
  { icon: "📣", label: "Marketing", desc: "Launch campaigns, creative, and distribution." },
  { icon: "💼", label: "Sales", desc: "Sequences, CRM, and daily pipeline motion." },
  { icon: "💳", label: "Finance", desc: "Books, invoicing, and margin visibility." },
  { icon: "⚙️", label: "Ops", desc: "Delivery, vendors, and 24/7 floor coverage." },
];

/* ── Nav ─────────────────────────────────────────────────── */

function Nav() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-surface-0/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg tracking-tight">
          <span className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-sm">N</span>
          Nanowork
        </Link>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ── Page ─────────────────────────────────────────────────── */

export default function Home() {
  return (
    <div className="min-h-screen bg-surface-0 text-zinc-100">
      <Nav />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: headline + prompt */}
          <div className="animate-slide-up">
            {/* Live pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-2 border border-white/10 text-xs text-zinc-400 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-dot" />
              <span>47 agents running for Nanowork right now</span>
              <span className="text-green-500 font-semibold">LIVE</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-5 text-balance">
              What will you
              <br />
              <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
                build today?
              </span>
            </h1>

            <p className="text-zinc-400 text-lg leading-relaxed mb-8 text-balance">
              Type one prompt. Get a full AI-run company — legal, brand, web, marketing,
              sales, finance, and ops — all spinning up in parallel toward real revenue.
            </p>

            <PromptBox />
          </div>

          {/* Right: live feed */}
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot" />
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Live activity
              </span>
            </div>
            <ActivityFeed />
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatStrip />

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3">
            How it works
          </p>
          <h2 className="text-3xl font-bold text-white mb-4">
            From one line of intent to an earning system
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-balance">
            You are not configuring integrations. You are giving a clear commercial thesis
            and letting agents race to make it real.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              num: "01",
              title: "Drop the prompt",
              body: "One coherent ask: who pays, for what, by when. Text is enough for agents to parallelize all seven departments simultaneously.",
            },
            {
              num: "02",
              title: "Subscribe at $99/mo",
              body: "We align scope in-thread; you subscribe when the shape of the business feels right. No equity taken, no tier maze.",
            },
            {
              num: "03",
              title: "Watch the floor run",
              body: "Filings, brand, site, campaigns, pipeline, books, runbooks — shipping toward revenue you can read on a dashboard.",
            },
          ].map((step) => (
            <div
              key={step.num}
              className="p-6 rounded-2xl bg-surface-1 border border-white/5 hover:border-white/10 transition-colors"
            >
              <span className="text-xs font-mono font-bold text-brand-400">{step.num}</span>
              <h3 className="text-lg font-semibold text-white mt-2 mb-2">{step.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Departments */}
      <section className="bg-surface-1 border-y border-white/5 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3">
              The full company
            </p>
            <h2 className="text-3xl font-bold text-white mb-4">
              Seven agent departments. One prompt. All in parallel.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEPARTMENTS.map((d) => (
              <div
                key={d.label}
                className="p-5 rounded-xl bg-surface-2 border border-white/5 hover:border-brand-500/30 hover:bg-surface-3 transition-all group"
              >
                <span className="text-2xl mb-3 block">{d.icon}</span>
                <h3 className="font-semibold text-white mb-1.5 group-hover:text-brand-400 transition-colors">
                  {d.label}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{d.desc}</p>
              </div>
            ))}
            {/* 8th card: CTA */}
            <div className="p-5 rounded-xl bg-brand-600/10 border border-brand-500/20 hover:bg-brand-600/20 transition-all flex flex-col justify-between">
              <p className="text-sm text-zinc-300 leading-relaxed flex-1">
                All seven running at once — not a waterfall, not a suite of disconnected tools.
              </p>
              <Link
                to="/login"
                className="mt-4 text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors"
              >
                Start building →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3">
          Pricing
        </p>
        <div className="inline-flex items-baseline gap-1 mb-4">
          <span className="text-7xl font-bold text-white">$99</span>
          <span className="text-2xl text-zinc-500">/mo</span>
        </div>
        <p className="text-zinc-400 max-w-md mx-auto mb-8 text-balance">
          One membership for an AI-run company across all seven departments. Cancel anytime.
          No equity. No tier maze.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors text-base"
        >
          Start for free
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <span className="font-semibold text-zinc-400">Nanowork</span>
          <span>© {new Date().getFullYear()} Nanowork. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-zinc-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
