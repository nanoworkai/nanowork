import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, Terminal } from "lucide-react";
import BusinessShowcase from "../components/BusinessShowcase";
import Footer from "../components/Footer";

/**
 * MODERN FINTECH DESIGN PRINCIPLES:
 *
 * 1. CLARITY & TRUST: Clean hierarchy, professional typography
 * 2. DATA VISUALIZATION: Real-time information with clear indicators
 * 3. RESPONSIVE GRID: Flexible layout that scales beautifully
 * 4. STATUS FEEDBACK: Subtle animations and state indicators
 * 5. LIGHT THEME: Bright, accessible with strong blue accents
 * 6. PURPOSEFUL DESIGN: Every element serves user understanding
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
    <div className="bg-surface-0 border-b border-fintech-divider overflow-hidden">
      <div className="flex animate-scroll">
        {[...stocks, ...stocks].map((stock, i) => (
          <div
            key={i}
            className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-2.5 border-r border-fintech-divider whitespace-nowrap flex-shrink-0"
          >
            <span className="text-xs font-mono font-semibold text-fintech-navy">{stock.symbol}</span>
            <span className="text-xs font-mono text-fintech-slate tabular-nums">
              ${stock.price.toFixed(2)}
            </span>
            <span
              className={`text-xs font-mono tabular-nums ${
                stock.change >= 0 ? "text-fintech-green" : "text-fintech-red"
              }`}
            >
              {stock.change >= 0 ? "+" : ""}
              {stock.change.toFixed(2)}
            </span>
            <span
              className={`text-xs font-mono tabular-nums ${
                stock.pct >= 0 ? "text-fintech-green" : "text-fintech-red"
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
    <div className="border border-fintech-border bg-surface-1 shadow-card hover:shadow-card-lg transition-shadow">
      <div className="border-b border-fintech-divider px-6 py-4 bg-surface-0">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-fintech-slate" />
          <span className="text-sm font-medium text-fintech-slate">
            Describe your business idea
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="relative mb-6">
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
            placeholder={focused || value ? "" : placeholder}
            className="w-full min-h-[120px] max-h-[240px] bg-transparent border-none outline-none resize-none text-fintech-navy placeholder:text-fintech-slate/40 text-base leading-relaxed"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-fintech-divider">
          <div className="flex items-center gap-6 text-xs text-fintech-slate/70">
            <span>7 departments</span>
            <span>•</span>
            <span>AI-powered</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Production ready</span>
          </div>

          <button
            onClick={submit}
            disabled={loading || !value.trim()}
            className="w-full sm:w-auto px-6 py-2.5 bg-fintech-navy hover:bg-fintech-navy/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium shadow-button transition-colors"
          >
            {loading ? "Building..." : "Start building"}
          </button>
        </div>
      </div>
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
      {/* Header - Enterprise fintech */}
      <header className="sticky top-0 z-50 bg-surface-1/80 backdrop-blur-xl border-b border-fintech-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-fintech-navy hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-fintech-navy flex items-center justify-center">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Nanowork</span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              to="/demo"
              className="px-5 py-2 text-sm font-medium text-fintech-slate hover:text-fintech-navy transition-colors"
            >
              View demo
            </Link>
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-5 py-2 bg-fintech-navy text-white text-sm font-medium hover:bg-fintech-navy/90 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:block px-5 py-2 text-sm font-medium text-fintech-slate hover:text-fintech-navy transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-2 bg-fintech-navy text-white text-sm font-medium hover:bg-fintech-navy/90 transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Stock Ticker */}
      <StockTicker />

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6">
        {/* Hero Section - Enterprise fintech */}
        <section className="py-16 sm:py-20 lg:py-28">
          <div className="mb-12 text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-fintech-navy tracking-tight mb-6 leading-tight">
              Build your business with AI
            </h1>
            <p className="text-lg sm:text-xl text-fintech-slate max-w-2xl mx-auto leading-relaxed">
              From idea to revenue in days
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <TerminalPrompt />
          </div>
        </section>

        {/* Business Showcase */}
        <BusinessShowcase />


        {/* Two-Path CTA */}
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-fintech-navy tracking-tight mb-4">
              Two ways to get started
            </h2>
            <p className="text-lg text-fintech-slate max-w-2xl mx-auto">
              Build a custom business from scratch or claim a pre-built one
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Build Custom */}
            <div className="border border-fintech-border bg-surface-1 p-8 hover:border-fintech-navy transition-colors group">
              <h3 className="text-xl font-semibold text-fintech-navy mb-3">
                Build from scratch
              </h3>
              <p className="text-base text-fintech-slate mb-8 leading-relaxed">
                Describe your vision and AI creates everything from brand identity to deployment. Full customization, zero limitations.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-fintech-navy text-white text-sm font-medium hover:bg-fintech-navy/90 transition-colors"
              >
                Start building
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Claim Pre-Built */}
            <div className="border border-fintech-border bg-surface-1 p-8 hover:border-fintech-navy transition-colors group">
              <h3 className="text-xl font-semibold text-fintech-navy mb-3">
                Claim pre-built business
              </h3>
              <p className="text-base text-fintech-slate mb-8 leading-relaxed">
                Browse proven business models ready to launch. Customize branding and settings, then go live in minutes.
              </p>
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-fintech-navy text-white text-sm font-medium hover:bg-fintech-navy/90 transition-colors"
              >
                Browse marketplace
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
