import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, Terminal, Building2, Shield, Crown, Users } from "lucide-react";

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
  "Build a social network where creators own their content and earn directly from fans. Think Patreon meets Instagram with web3 payments and zero platform fees.",
  "Launch an AI fitness coach that creates personalized workout plans, tracks progress with computer vision, and adapts in real-time. Target busy professionals, $29/month.",
  "Create a sustainable fashion marketplace connecting eco-conscious brands with millennial shoppers. Verified supply chains, carbon-neutral shipping, curated collections.",
];

// Mock stock data for NYSE crawl
const STOCKS = [
  { symbol: "MSFT", price: 412.38, change: 2.14, pct: 0.52 },
  { symbol: "GOOGL", price: 178.92, change: -1.23, pct: -0.68 },
  { symbol: "AAPL", price: 226.50, change: 3.42, pct: 1.53 },
  { symbol: "NVDA", price: 138.75, change: 5.21, pct: 3.90 },
  { symbol: "META", price: 563.28, change: -2.87, pct: -0.51 },
  { symbol: "AMZN", price: 218.44, change: 1.92, pct: 0.89 },
  { symbol: "TSLA", price: 345.67, change: -8.34, pct: -2.36 },
  { symbol: "NFLX", price: 712.89, change: 4.56, pct: 0.64 },
];

// ──────────────────────────────────────────────────────────────────────────────
// STOCK TICKER - NYSE-style crawl
// ──────────────────────────────────────────────────────────────────────────────

function StockTicker() {
  const [stocks, setStocks] = useState(STOCKS);

  useEffect(() => {
    const interval = setInterval(() => {
      setStocks((prev) =>
        prev.map((stock) => {
          const volatility = Math.random() * 0.5 - 0.25;
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
        {[...stocks, ...stocks].map((stock, i) => (
          <div
            key={i}
            className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2.5 border-r border-white/5 whitespace-nowrap flex-shrink-0"
          >
            <span className="text-[10px] sm:text-xs font-mono font-bold text-white">{stock.symbol}</span>
            <span className="text-[10px] sm:text-xs font-mono text-white tabular-nums">
              ${stock.price.toFixed(2)}
            </span>
            <span
              className={`text-[10px] sm:text-xs font-mono tabular-nums ${
                stock.change >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {stock.change >= 0 ? "+" : ""}
              {stock.change.toFixed(2)}
            </span>
            <span
              className={`text-[10px] sm:text-xs font-mono tabular-nums ${
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
      <div className="border-b border-white/10 px-4 sm:px-6 py-3 bg-surface-1">
        <div className="flex items-center gap-2 sm:gap-3">
          <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/60" />
          <span className="text-[10px] sm:text-xs font-mono font-bold text-white/60 uppercase tracking-wider">
            Build Command
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-mono text-white/40">READY</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="relative mb-4">
          <div className="flex items-start gap-2 sm:gap-3">
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
                className="w-full min-h-[80px] max-h-[200px] bg-transparent border-none outline-none resize-none text-white placeholder-transparent font-mono text-xs sm:text-sm leading-relaxed"
              />
              {!value && (
                <div className="absolute top-0 left-7 sm:left-9 right-0 pointer-events-none">
                  <div className="font-mono text-xs sm:text-sm text-white/70 leading-relaxed flex">
                    {placeholder}
                    {!focused && <span className="inline-block w-2 h-5 bg-white/80 ml-1 animate-pulse" />}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 sm:gap-6 text-[10px] sm:text-xs font-mono text-white/40 flex-wrap">
            <span>7 DEPARTMENTS</span>
            <span className="hidden sm:inline">|</span>
            <span>PARALLEL EXECUTION</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden md:inline">AUTONOMOUS AGENTS</span>
          </div>

          <button
            onClick={submit}
            disabled={loading || !value.trim()}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 rounded-none bg-white hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors"
          >
            {loading ? "BUILDING..." : "BUILD MY COMPANY"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// DATA GRID - Infrastructure specs
// ──────────────────────────────────────────────────────────────────────────────

function DepartmentGrid() {
  const departments = [
    {
      name: "Legal",
      description: "Sets up your company, writes terms and privacy policies, drafts contractor agreements, and keeps you compliant with regulations.",
    },
    {
      name: "Brand",
      description: "Designs your logo, builds brand guidelines, defines your voice and colors, and creates a visual identity people remember.",
    },
    {
      name: "Web",
      description: "Builds your website, sets up e-commerce and checkout, hosts everything, and ships updates that actually work in production.",
    },
    {
      name: "Marketing",
      description: "Plans content, writes for SEO, runs email campaigns, manages social media, and tracks what's actually driving growth.",
    },
    {
      name: "Sales",
      description: "Reaches out to prospects, manages your pipeline, qualifies leads, tracks deals, and turns conversations into customers.",
    },
    {
      name: "Finance",
      description: "Tracks revenue, manages expenses, sends invoices, processes payments, and keeps your books accurate and up to date.",
    },
    {
      name: "Operations",
      description: "Automates workflows, manages deployments, monitors uptime, coordinates vendors, and makes sure everything runs smoothly.",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {departments.map((dept, i) => (
        <div key={i} className="card rounded-none border border-white/10 p-4 sm:p-6 hover:bg-surface-3 transition-colors">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-base font-mono font-bold text-white">
              {dept.name}
            </h3>
            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-mono text-green-400">ACTIVE</span>
            </div>
          </div>

          <p className="text-xs text-white/60 leading-relaxed">
            {dept.description}
          </p>
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
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 h-12 sm:h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white hover:opacity-70 transition-opacity">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-none bg-white flex items-center justify-center">
              <Terminal className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-black" />
            </div>
            <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider">Nanowork</span>
          </Link>

          <nav className="flex items-center gap-1">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-none bg-white text-black text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider hover:bg-white/90 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <a
                href="https://calendly.com/jordan_plows"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-none bg-white text-black text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider hover:bg-white/90 transition-colors"
              >
                Request Access
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Stock Ticker */}
      <StockTicker />

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6">
        {/* Hero Section - Dense, terminal-style */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-white uppercase tracking-tight mb-3 sm:mb-4">
              Turn Your Idea Into a Company
            </h1>
            <p className="text-xs sm:text-sm font-mono text-white/70 max-w-3xl leading-relaxed mb-4">
              Seven AI departments work 24/7 to build your business. Legal, brand, web, marketing, sales, finance, and ops—all autonomous, all running in parallel. One prompt starts everything.
            </p>
            <p className="text-xs sm:text-sm font-mono text-white/80 max-w-3xl leading-relaxed">
              Try building something below to see what we can create for you. No commitment—just explore the possibilities.
            </p>
          </div>

          <TerminalPrompt />
        </section>

        {/* Department Grid */}
        <section className="py-8 sm:py-12">
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-[10px] sm:text-xs font-mono font-bold text-white/40 uppercase tracking-wider">
                Your Autonomous Team
              </span>
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] sm:text-xs font-mono text-green-400 whitespace-nowrap">7 DEPARTMENTS</span>
            </div>
          </div>

          <DepartmentGrid />
        </section>

        {/* Enterprise Section */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="card-lg rounded-none border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="border-b border-white/10 px-6 sm:px-8 py-4 bg-surface-1">
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
                <span className="text-xs sm:text-sm font-mono font-bold text-white uppercase tracking-wider">
                  Enterprise Solution
                </span>
                <div className="flex-1" />
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-white/60" />
                  <span className="text-[10px] sm:text-xs font-mono text-white/40">ENTERPRISE READY</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 lg:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left: Description */}
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-mono font-bold text-white uppercase tracking-tight mb-4">
                    Deploy AI Departments<br />Across Your Organization
                  </h2>
                  <p className="text-sm sm:text-base font-mono text-white/70 mb-6 leading-relaxed">
                    VCs, holding companies, and large enterprises use Nanowork to scale AI departments across portfolio companies and business units. White-label deployment, centralized billing, and dedicated support.
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                      <div>
                        <h3 className="text-xs sm:text-sm font-mono font-bold text-white mb-1">Portfolio Management</h3>
                        <p className="text-xs font-mono text-white/60 leading-relaxed">
                          Deploy across unlimited companies with unified dashboard and cross-portfolio analytics
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                      <div>
                        <h3 className="text-xs sm:text-sm font-mono font-bold text-white mb-1">White-Label & Custom Training</h3>
                        <p className="text-xs font-mono text-white/60 leading-relaxed">
                          Your brand, your processes. Train AI departments on your specific business rules and workflows
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                      <div>
                        <h3 className="text-xs sm:text-sm font-mono font-bold text-white mb-1">Enterprise Security & Controls</h3>
                        <p className="text-xs font-mono text-white/60 leading-relaxed">
                          SSO, SAML, audit logs, role-based access controls, and dedicated infrastructure options
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/pricing"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-none bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-colors"
                  >
                    View Enterprise Pricing
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Right: Stats Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="card rounded-none border border-white/10 p-4 sm:p-6 bg-surface-2">
                    <div className="text-2xl sm:text-3xl font-mono font-bold text-white mb-2">Unlimited</div>
                    <div className="text-xs font-mono text-white/60 uppercase tracking-wider">Companies</div>
                  </div>

                  <div className="card rounded-none border border-white/10 p-4 sm:p-6 bg-surface-2">
                    <div className="text-2xl sm:text-3xl font-mono font-bold text-white mb-2">99.9%</div>
                    <div className="text-xs font-mono text-white/60 uppercase tracking-wider">Uptime SLA</div>
                  </div>

                  <div className="card rounded-none border border-white/10 p-4 sm:p-6 bg-surface-2">
                    <div className="text-2xl sm:text-3xl font-mono font-bold text-white mb-2">24/7</div>
                    <div className="text-xs font-mono text-white/60 uppercase tracking-wider">Dedicated Support</div>
                  </div>

                  <div className="card rounded-none border border-white/10 p-4 sm:p-6 bg-surface-2">
                    <div className="text-2xl sm:text-3xl font-mono font-bold text-white mb-2">Custom</div>
                    <div className="text-xs font-mono text-white/60 uppercase tracking-wider">AI Training</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA - Friendly approach */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="card-lg rounded-none border border-white/10 p-6 sm:p-8 lg:p-12 text-center">
            <div className="text-[10px] sm:text-xs font-mono text-white/40 uppercase tracking-wider mb-3 sm:mb-4">
              Ready to Build
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-mono font-bold text-white uppercase mb-3 sm:mb-4 tracking-tight">
              We're Here to Help You Launch
            </h2>
            <p className="text-xs sm:text-sm font-mono text-white/70 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              $497 one-time setup gets you everything you need to launch—complete company infrastructure, personal onboarding call, and a full month of support as you get started. Then just $99/month to keep everything running smoothly.
            </p>
            <a
              href="https://calendly.com/jordan_plows"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-none bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-colors"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </a>
            <p className="text-xs font-mono text-amber-400/80 mt-4 font-medium">
              Next available: May 20, 2026 • 3 spots remaining
            </p>
          </div>
        </section>
      </main>

      {/* Footer - Professional with competitors section */}
      <footer className="border-t border-white/10 mt-8 sm:mt-12 lg:mt-16">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Competitors Section */}
          <div className="mb-8 sm:mb-12 pb-8 sm:pb-12 border-b border-white/10">
            <div className="text-center mb-6 sm:mb-8">
              <div className="text-[10px] sm:text-xs font-mono text-white/40 uppercase tracking-wider mb-2">
                Compare
              </div>
              <h3 className="text-lg sm:text-xl font-mono font-bold text-white uppercase tracking-tight">
                Why Nanowork
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto mb-6 sm:mb-8">
              {/* Polis */}
              <div className="card rounded-none border border-white/10 p-4 sm:p-6 hover:bg-surface-1 transition-colors">
                <h4 className="text-sm font-mono font-bold text-white mb-2">Nano vs Polis</h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  Polis focuses on community governance and coordination. Nanowork handles the full company stack—legal, finance, sales, and operations—not just collaboration tools.
                </p>
              </div>

              {/* Nanocorp */}
              <div className="card rounded-none border border-white/10 p-4 sm:p-6 hover:bg-surface-1 transition-colors">
                <h4 className="text-sm font-mono font-bold text-white mb-2">Nano vs Nanocorp</h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  Nanocorp offers agent templates for specific tasks. Nanowork provides seven full departments that coordinate autonomously and scale with your business from day one.
                </p>
              </div>

              {/* Nanoagents */}
              <div className="card rounded-none border border-white/10 p-4 sm:p-6 hover:bg-surface-1 transition-colors">
                <h4 className="text-sm font-mono font-bold text-white mb-2">Nano vs Nanoagents</h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  Nanoagents specializes in single-function automation. Nanowork orchestrates cross-functional teams that execute complex, multi-step business operations in parallel.
                </p>
              </div>

              {/* Openclaw */}
              <div className="card rounded-none border border-white/10 p-4 sm:p-6 hover:bg-surface-1 transition-colors">
                <h4 className="text-sm font-mono font-bold text-white mb-2">Nano vs Openclaw</h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  Openclaw is an open-source framework for building agents. Nanowork is a production platform with managed infrastructure, compliance, and departments ready to work.
                </p>
              </div>
            </div>
          </div>

          {/* Main Footer Content */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,2fr,1fr] gap-8 sm:gap-12 items-start">
            {/* Logo Section - Left */}
            <div>
              <Link to="/" className="inline-flex items-center gap-2 mb-3 sm:mb-4 hover:opacity-70 transition-opacity">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-none bg-white flex items-center justify-center">
                  <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
                </div>
                <span className="text-sm sm:text-base font-mono font-bold text-white uppercase tracking-wider">
                  Nanowork
                </span>
              </Link>
              <p className="text-xs font-mono text-white/40 leading-relaxed max-w-xs">
                AI agents that build companies. Seven departments, one prompt.
              </p>
            </div>

            {/* Links Section - Center */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">Product</h3>
                <ul className="space-y-2 text-xs font-mono text-white/40">
                  <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                  <li><Link to="/revenue" className="hover:text-white transition-colors">Revenue</Link></li>
                  <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                  <li><a href="#docs" className="hover:text-white transition-colors">Docs</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">Company</h3>
                <ul className="space-y-2 text-xs font-mono text-white/40">
                  <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#blog" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#careers" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">Legal</h3>
                <ul className="space-y-2 text-xs font-mono text-white/40">
                  <li><a href="#privacy" className="hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#terms" className="hover:text-white transition-colors">Terms</a></li>
                  <li><a href="#security" className="hover:text-white transition-colors">Security</a></li>
                </ul>
              </div>
            </div>

            {/* Social/Status - Right */}
            <div className="flex flex-col items-start lg:items-end">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-mono text-green-400 uppercase tracking-wider">
                  All Systems Operational
                </span>
              </div>
              <p className="text-xs font-mono text-white/40 lg:text-right">
                Built on Cloudflare
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 sm:mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[10px] sm:text-xs font-mono text-white/30">
              © {new Date().getFullYear()} NANOWORK INC · ALL RIGHTS RESERVED
            </div>
            <div className="flex items-center gap-4 text-[10px] sm:text-xs font-mono text-white/30">
              <span>MADE IN SAN FRANCISCO</span>
              <span>·</span>
              <span>EST. 2026</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
