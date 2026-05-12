import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, Terminal } from "lucide-react";

/**
 * BLOOMBERG TERMINAL DESIGN PRINCIPLES:
 *
 * 1. DATA DENSITY: Multiple information streams visible simultaneously
 * 2. MONOSPACE TYPOGRAPHY: Terminal aesthetic with fixed-width fonts
 * 3. GRID SYSTEM: Rigid 4-column layout like terminal windows
 * 4. STATUS INDICATORS: Live dots, ticker-style updates
 * 5. DARK THEME: Pure black with amber/white accents only
 * 6. NO DECORATION: All business, zero marketing fluff
 */

const TYPING_EXAMPLES = [
  "FINTECH PAYMENT INFRA | $10M ARR TARGET",
  "SAAS LOGISTICS PLATFORM | B2B ENTERPRISE",
  "AI HEALTHCARE DIAGNOSTIC | FDA COMPLIANT",
];

// Mock real-time stock data
const STOCKS = [
  { symbol: "MSFT", price: 412.38, change: 2.14, pct: 0.52 },
  { symbol: "GOOGL", price: 178.92, change: -1.23, pct: -0.68 },
  { symbol: "AAPL", price: 226.50, change: 3.42, pct: 1.53 },
  { symbol: "NVDA", price: 138.75, change: 5.21, pct: 3.90 },
  { symbol: "META", price: 563.28, change: -2.87, pct: -0.51 },
  { symbol: "AMZN", price: 218.44, change: 1.92, pct: 0.89 },
  { symbol: "TSLA", price: 345.67, change: -8.34, pct: -2.36 },
  { symbol: "NFLX", price: 712.89, change: 4.56, pct: 0.64 },
  { symbol: "CRM", price: 312.45, change: 6.78, pct: 2.22 },
  { symbol: "ORCL", price: 167.23, change: 1.45, pct: 0.87 },
  { symbol: "ADBE", price: 478.90, change: -3.21, pct: -0.67 },
  { symbol: "CSCO", price: 57.82, change: 0.92, pct: 1.62 },
];

// Tech news feed for valuations
const NEWS_FEED = [
  {
    time: "09:42",
    source: "BLOOMBERG",
    headline: "AI Infrastructure Spending Hits $127B as Enterprise Adoption Accelerates",
    impact: "BULLISH",
  },
  {
    time: "09:38",
    source: "WSJ",
    headline: "SaaS Multiples Compress to 8.2x as Interest Rates Hold at 5.25%",
    impact: "NEUTRAL",
  },
  {
    time: "09:31",
    source: "FT",
    headline: "Payment Processing Volume Up 18% QoQ Driven by B2B Transactions",
    impact: "BULLISH",
  },
  {
    time: "09:24",
    source: "CNBC",
    headline: "Healthcare Tech M&A Activity Surges 34% YoY with $14B in Deals",
    impact: "BULLISH",
  },
  {
    time: "09:15",
    source: "REUTERS",
    headline: "Cloud Infrastructure ARR Growth Decelerates to 22% from 28% Previous Quarter",
    impact: "BEARISH",
  },
  {
    time: "09:08",
    source: "BLOOMBERG",
    headline: "Fintech Valuations Recover as Fed Signals Potential Rate Cuts in H2",
    impact: "BULLISH",
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// STOCK TICKER - Scrolling market data
// ──────────────────────────────────────────────────────────────────────────────

function StockTicker() {
  const [stocks, setStocks] = useState(STOCKS);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks((prev) =>
        prev.map((stock) => {
          const volatility = Math.random() * 0.5 - 0.25; // -0.25% to +0.25%
          const priceChange = stock.price * (volatility / 100);
          const newPrice = stock.price + priceChange;
          const newChange = stock.change + priceChange;
          const newPct = (newChange / (newPrice - newChange)) * 100;

          return {
            ...stock,
            price: newPrice,
            change: newChange,
            pct: newPct,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-surface-1 border-b border-white/10 overflow-hidden">
      <div className="flex animate-scroll">
        {/* Duplicate stocks for seamless loop */}
        {[...stocks, ...stocks].map((stock, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-6 py-2.5 border-r border-white/5 whitespace-nowrap flex-shrink-0"
          >
            <span className="text-xs font-mono font-bold text-white">{stock.symbol}</span>
            <span className="text-xs font-mono text-white tabular-nums">
              ${stock.price.toFixed(2)}
            </span>
            <span
              className={`text-xs font-mono tabular-nums ${
                stock.change >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {stock.change >= 0 ? "+" : ""}
              {stock.change.toFixed(2)}
            </span>
            <span
              className={`text-xs font-mono tabular-nums ${
                stock.pct >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {stock.pct >= 0 ? "+" : ""}
              {stock.pct.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// LIVE TICKER - Shows real-time metrics
// ──────────────────────────────────────────────────────────────────────────────

function LiveTicker() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const metrics = [
    { label: "COMPANIES", value: "2,847", change: "+12" },
    { label: "REVENUE", value: "$847M", change: "+$2.4M" },
    { label: "TXN/SEC", value: "148", change: "+3" },
    { label: "UPTIME", value: "99.98%", change: "—" },
  ];

  return (
    <div className="card rounded-none border-b border-white/10">
      <div className="grid grid-cols-5 divide-x divide-white/10">
        {/* Clock */}
        <div className="px-6 py-4">
          <div className="text-xs font-mono text-white/40 mb-1">UTC</div>
          <div className="text-base font-mono font-bold text-white tabular-nums">
            {time.toUTCString().slice(17, 25)}
          </div>
        </div>

        {/* Metrics */}
        {metrics.map((m, i) => (
          <div key={i} className="px-6 py-4">
            <div className="text-xs font-mono text-white/40 mb-1">{m.label}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-mono font-bold text-white tabular-nums">{m.value}</span>
              <span className="text-xs font-mono text-green-400">{m.change}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// TERMINAL PROMPT INPUT
// ──────────────────────────────────────────────────────────────────────────────

function TerminalPrompt() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [exampleIndex, setExampleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Typewriter
  useEffect(() => {
    if (focused || value) return;
    const currentExample = TYPING_EXAMPLES[exampleIndex];

    if (!isDeleting && charIndex < currentExample.length) {
      const timeout = setTimeout(() => {
        setPlaceholder(currentExample.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 40);
      return () => clearTimeout(timeout);
    } else if (!isDeleting && charIndex === currentExample.length) {
      const timeout = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(timeout);
    } else if (isDeleting && charIndex > 0) {
      const timeout = setTimeout(() => {
        setPlaceholder(currentExample.slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      }, 20);
      return () => clearTimeout(timeout);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setExampleIndex((exampleIndex + 1) % TYPING_EXAMPLES.length);
    }
  }, [charIndex, isDeleting, exampleIndex, focused, value]);

  async function submit() {
    const text = value.trim();
    if (!text) return;
    setLoading(true);

    try {
      // Call preview build endpoint (no auth required)
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/build/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });

      if (!response.ok) {
        throw new Error('Failed to create preview');
      }

      const data = await response.json();

      // Redirect to preview page
      navigate(`/preview/${data.build_id}`);
    } catch (error) {
      console.error('Preview build failed:', error);
      // Fallback to old flow
      if (isAuthenticated) navigate(`/dashboard?p=${encodeURIComponent(text)}`);
      else navigate(`/login?redirect=/dashboard&p=${encodeURIComponent(text)}`);
    }
  }

  return (
    <div className="card-lg rounded-none border border-white/10">
      <div className="border-b border-white/10 px-6 py-3 bg-surface-1">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-white/60" />
          <span className="text-xs font-mono font-bold text-white/60 uppercase tracking-wider">
            Build Command
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-mono text-white/40">READY</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="relative mb-4">
          <div className="flex items-start gap-3">
            <span className="text-white/60 font-mono text-sm mt-1 select-none">$</span>
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={value}
                onChange={e => setValue(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                disabled={loading}
                className="w-full min-h-[80px] max-h-[200px] bg-transparent border-none outline-none resize-none text-white placeholder-transparent font-mono text-sm leading-relaxed"
              />
              {!value && (
                <div className="absolute top-0 left-9 right-0 pointer-events-none">
                  <div className="font-mono text-sm text-white/70 leading-relaxed flex">
                    {placeholder}
                    {!focused && <span className="inline-block w-2 h-5 bg-white/80 ml-1 animate-pulse" />}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-6 text-xs font-mono text-white/40">
            <span>7 DEPARTMENTS</span>
            <span>|</span>
            <span>PARALLEL EXECUTION</span>
            <span>|</span>
            <span>FDIC INSURED</span>
          </div>

          <button
            onClick={submit}
            disabled={loading || !value.trim()}
            className="px-6 py-2.5 rounded-none bg-white hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors"
          >
            {loading ? "EXECUTING..." : "EXECUTE"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// NEWS FEED - Tech news for valuations
// ──────────────────────────────────────────────────────────────────────────────

function NewsFeed() {
  return (
    <div className="card-lg rounded-none border border-white/10">
      <div className="border-b border-white/10 px-6 py-3 bg-surface-1">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-white/60 uppercase tracking-wider">
            Market Intelligence Feed
          </span>
          <div className="flex-1" />
          <span className="text-xs font-mono text-white/40">LIVE</span>
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {NEWS_FEED.map((item, i) => (
          <div
            key={i}
            className="px-6 py-4 hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-end gap-1 w-12 flex-shrink-0">
                <span className="text-xs font-mono text-white/40 tabular-nums">{item.time}</span>
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-none ${
                    item.impact === "BULLISH"
                      ? "bg-green-400/10 text-green-400 border border-green-400/20"
                      : item.impact === "BEARISH"
                      ? "bg-red-400/10 text-red-400 border border-red-400/20"
                      : "bg-white/5 text-white/40 border border-white/10"
                  }`}
                >
                  {item.impact}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono text-white/40 mb-1 uppercase tracking-wider">
                  {item.source}
                </div>
                <p className="text-xs font-mono text-white/80 leading-relaxed">
                  {item.headline}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 px-6 py-3 bg-surface-1">
        <button className="text-xs font-mono text-white/40 hover:text-white transition-colors uppercase tracking-wider">
          View All Intelligence →
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// DATA GRID - Infrastructure specs
// ──────────────────────────────────────────────────────────────────────────────

function InfrastructureGrid() {
  const items = [
    {
      code: "PAYMENT",
      title: "Virtual Payment Cards",
      specs: ["PCI DSS LVL 1", "FDIC $250K", "SOC 2 TYPE II"],
      status: "OPERATIONAL",
    },
    {
      code: "BANKING",
      title: "Department Accounts",
      specs: ["FDIC INSURED", "ACH/WIRE", "REAL-TIME"],
      status: "OPERATIONAL",
    },
    {
      code: "COMMS",
      title: "Email Infrastructure",
      specs: ["GDPR", "HIPAA READY", "ISO 27001"],
      status: "OPERATIONAL",
    },
    {
      code: "ANALYTICS",
      title: "Real-Time Dashboards",
      specs: ["SUB-100MS", "99.99% SLA", "ENCRYPTED"],
      status: "OPERATIONAL",
    },
    {
      code: "COMPLIANCE",
      title: "SOC 2 Framework",
      specs: ["TYPE II", "ANNUAL AUDIT", "CONTINUOUS"],
      status: "OPERATIONAL",
    },
    {
      code: "AGENTS",
      title: "Autonomous Operations",
      specs: ["24/7/365", "MULTI-DEPT", "PARALLEL"],
      status: "OPERATIONAL",
    },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
      {items.map((item, i) => (
        <div key={i} className="card rounded-none border-0 p-6 hover:bg-surface-3 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="text-xs font-mono font-bold text-white/40">{item.code}</div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-[10px] font-mono text-green-400">{item.status}</span>
            </div>
          </div>

          <h3 className="text-sm font-mono font-bold text-white mb-3 leading-tight">
            {item.title}
          </h3>

          <div className="flex flex-wrap gap-1.5">
            {item.specs.map((spec, j) => (
              <span
                key={j}
                className="px-2 py-0.5 rounded-none bg-white/5 text-[10px] font-mono text-white/60 border border-white/10"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header - Terminal style */}
      <header className="sticky top-0 z-50 bg-surface-0 border-b border-white/10">
        <div className="max-w-[1800px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white hover:opacity-70 transition-opacity">
            <div className="w-6 h-6 rounded-none bg-white flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="text-sm font-mono font-bold uppercase tracking-wider">Nanowork</span>
          </Link>

          <nav className="flex items-center gap-1">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-5 py-2 rounded-none bg-white text-black text-xs font-mono font-bold uppercase tracking-wider hover:bg-white/90 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider text-white/60 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-none bg-white text-black text-xs font-mono font-bold uppercase tracking-wider hover:bg-white/90 transition-colors"
                >
                  Start
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Stock Ticker */}
      <StockTicker />

      {/* Live Metrics Ticker */}
      <LiveTicker />

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6">
        {/* Hero Section - Dense, terminal-style */}
        <section className="py-16">
          <div className="mb-8">
            <h1 className="text-4xl font-mono font-bold text-white uppercase tracking-tight mb-4">
              Enterprise Agent Infrastructure
            </h1>
            <p className="text-sm font-mono text-white/70 max-w-3xl leading-relaxed">
              Autonomous agents with real bank accounts, payment cards, and institutional-grade infrastructure.
              One command launches seven departments working in parallel. IPO-ready from day one.
            </p>
          </div>

          <TerminalPrompt />
        </section>

        {/* Two Column Layout: News Feed + Infrastructure */}
        <section className="py-12">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: News Feed */}
            <div className="lg:col-span-1">
              <NewsFeed />
            </div>

            {/* Right: Infrastructure Grid */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-white/40 uppercase tracking-wider">
                    Infrastructure Matrix
                  </span>
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs font-mono text-green-400">6 SYSTEMS OPERATIONAL</span>
                </div>
              </div>

              <InfrastructureGrid />
            </div>
          </div>
        </section>

        {/* Stats Bar - Bloomberg style */}
        <section className="py-12">
          <div className="card-lg rounded-none border border-white/10 p-8">
            <div className="grid grid-cols-4 gap-8">
              {[
                { metric: "COMPANIES BUILT", value: "2,847", delta: "+127 THIS MONTH" },
                { metric: "TOTAL REVENUE", value: "$847M", delta: "+$2.4M TODAY" },
                { metric: "TRANSACTIONS", value: "12.8M", delta: "+148/SEC" },
                { metric: "GLOBAL REACH", value: "67 COUNTRIES", delta: "+3 THIS QUARTER" },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-xs font-mono text-white/40 mb-2 uppercase tracking-wider">
                    {stat.metric}
                  </div>
                  <div className="text-3xl font-mono font-bold text-white mb-1 tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-xs font-mono text-green-400">
                    {stat.delta}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA - Terminal command style */}
        <section className="py-16">
          <div className="card-lg rounded-none border border-white/10 p-12 text-center">
            <div className="text-xs font-mono text-white/40 uppercase tracking-wider mb-4">
              Begin Execution
            </div>
            <h2 className="text-3xl font-mono font-bold text-white uppercase mb-4 tracking-tight">
              Start Building Today
            </h2>
            <p className="text-sm font-mono text-white/60 mb-8 max-w-2xl mx-auto leading-relaxed">
              From zero to revenue in days. From revenue to scale with agents that never stop working.
              Enterprise infrastructure from the first command.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-none bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-colors"
            >
              Initialize System
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer - Minimal terminal footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-[1800px] mx-auto px-6 py-12">
          <div className="grid grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Terminal className="w-4 h-4 text-white/60" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Nanowork</span>
              </div>
              <p className="text-xs font-mono text-white/40 leading-relaxed">
                Enterprise agent infrastructure
              </p>
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">Product</h3>
              <ul className="space-y-2 text-xs font-mono text-white/40">
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link to="/revenue" className="hover:text-white transition-colors">Revenue</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">Company</h3>
              <ul className="space-y-2 text-xs font-mono text-white/40">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#blog" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">Legal</h3>
              <ul className="space-y-2 text-xs font-mono text-white/40">
                <li><a href="#privacy" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#terms" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-white/5 text-center text-xs font-mono text-white/30">
            © {new Date().getFullYear()} NANOWORK INC · ALL RIGHTS RESERVED
          </div>
        </div>
      </footer>
    </div>
  );
}
