import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Terminal } from "lucide-react";
import CompanyLibrary from "../components/CompanyLibrary";

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
    <div className="bg-background-subtle border-b border-border-DEFAULT overflow-hidden">
      <div className="flex animate-scroll">
        {[...stocks, ...stocks].map((stock, i) => (
          <div
            key={i}
            className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2.5 border-r border-border-DEFAULT whitespace-nowrap flex-shrink-0"
          >
            <span className="text-[10px] sm:text-xs font-mono font-bold text-content-primary">{stock.symbol}</span>
            <span className="text-[10px] sm:text-xs font-mono text-content-primary tabular-nums">
              ${stock.price.toFixed(2)}
            </span>
            <span
              className={`text-[10px] sm:text-xs font-mono tabular-nums ${
                stock.change >= 0 ? "text-accent-success" : "text-accent-danger"
              }`}
            >
              {stock.change >= 0 ? "+" : ""}
              {stock.change.toFixed(2)}
            </span>
            <span
              className={`text-[10px] sm:text-xs font-mono tabular-nums ${
                stock.pct >= 0 ? "text-accent-success" : "text-accent-danger"
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
    <div className="card-lg rounded-xl border border-border-DEFAULT shadow-xl">
      <div className="border-b border-border-DEFAULT px-4 sm:px-6 py-3 bg-background-subtle">
        <div className="flex items-center gap-2 sm:gap-3">
          <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-content-secondary" />
          <span className="text-[10px] sm:text-xs font-bold text-content-secondary uppercase tracking-wider">
            Build Command
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent-success animate-pulse" />
            <span className="text-[10px] sm:text-xs font-mono text-content-tertiary">READY</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="relative mb-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <span className="text-content-secondary font-mono text-sm mt-1 select-none">$</span>
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
                className="w-full min-h-[80px] max-h-[200px] bg-transparent border-none outline-none resize-none text-content-primary placeholder-transparent text-xs sm:text-sm leading-relaxed"
              />
              {!value && (
                <div className="absolute top-0 left-7 sm:left-9 right-0 pointer-events-none">
                  <div className="text-xs sm:text-sm text-content-secondary leading-relaxed flex">
                    {placeholder}
                    {!focused && <span className="inline-block w-2 h-5 bg-content-primary/80 ml-1 animate-pulse" />}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 pt-4 border-t border-border-DEFAULT">
          <div className="flex items-center gap-2 sm:gap-6 text-[10px] sm:text-xs font-mono text-content-tertiary flex-wrap">
            <span>7 DEPARTMENTS</span>
            <span className="hidden sm:inline">|</span>
            <span>PARALLEL EXECUTION</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden md:inline">AUTONOMOUS AGENTS</span>
          </div>

          <button
            onClick={submit}
            disabled={loading || !value.trim()}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 rounded-md bg-accent-primary hover:bg-accent-primary/90 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            {loading ? "BUILDING..." : "BUILD MY COMPANY"}
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
    <div className="min-h-screen bg-background">
      {/* Header - Terminal style */}
      <header className="sticky top-0 z-50 bg-background-elevated/80 backdrop-blur-lg border-b border-border-DEFAULT">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 h-12 sm:h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-content-primary hover:opacity-70 transition-opacity">
            <Terminal className="w-5 h-5 sm:w-6 sm:h-6 text-accent-primary" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Nanowork</span>
          </Link>

          <nav className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-md bg-accent-primary text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider hover:bg-accent-primary/90 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-md border border-border-DEFAULT text-content-primary text-[10px] sm:text-xs font-bold uppercase tracking-wider hover:bg-background-subtle transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-md bg-accent-primary text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider hover:bg-accent-primary/90 transition-colors"
                >
                  Sign Up
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
        {/* Hero Section - Dense, terminal-style */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-content-primary uppercase tracking-tight mb-3 sm:mb-4">
              Turn Your Idea Into a Company
            </h1>
            <p className="text-xs sm:text-sm text-content-secondary max-w-3xl leading-relaxed mb-4">
              Seven AI departments work 24/7 to build your business. Legal, brand, web, marketing, sales, finance, and ops—all autonomous, all running in parallel. One prompt starts everything.
            </p>
            <p className="text-xs sm:text-sm text-content-primary max-w-3xl leading-relaxed">
              Try building something below to see what we can create for you. No commitment—just explore the possibilities.
            </p>
          </div>

          <TerminalPrompt />
        </section>

        {/* Company Library - Browse pre-built companies */}
        <CompanyLibrary />
      </main>

      {/* Footer */}
      <footer className="border-t border-border-DEFAULT mt-8 sm:mt-12 lg:mt-16">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4">
          <div className="text-[10px] sm:text-xs font-mono text-content-muted text-center">
            © {new Date().getFullYear()} NANOWORK INC · ALL RIGHTS RESERVED
          </div>
        </div>
      </footer>
    </div>
  );
}
