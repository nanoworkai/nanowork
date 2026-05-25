import { Link } from "react-router-dom";
import { Terminal, ArrowLeft } from "lucide-react";
import ARRDisplay, { CompanyShowcaseCard, type ARRData } from "../components/ARRDisplay";

/**
 * ARR Showcase Demo Page
 *
 * Demonstrates all variants of the ARR display component
 * with realistic data for AI-generated businesses
 */

// ──────────────────────────────────────────────────────────────────────────────
// SAMPLE DATA
// ──────────────────────────────────────────────────────────────────────────────

const SAMPLE_ARR_DATA: ARRData[] = [
  {
    min: 5000,
    max: 10000,
    tier: "starter",
    monthly: 800,
    growth: 15,
    confidence: 72,
  },
  {
    min: 20000,
    max: 50000,
    tier: "growth",
    monthly: 3500,
    growth: 35,
    confidence: 85,
  },
  {
    min: 100000,
    max: 250000,
    tier: "scale",
    monthly: 15000,
    growth: 50,
    confidence: 91,
  },
  {
    min: 500000,
    max: 1000000,
    tier: "enterprise",
    monthly: 70000,
    growth: 65,
    confidence: 88,
  },
];

const SAMPLE_COMPANIES = [
  {
    company: {
      name: "TaskFlow AI",
      description: "Automated workflow management for remote teams. AI-powered task assignment, smart scheduling, and productivity insights.",
      category: "Productivity SaaS",
    },
    arr: SAMPLE_ARR_DATA[1],
  },
  {
    company: {
      name: "HealthSync",
      description: "Personal health tracking and telemedicine platform. Connect patients with doctors, track vitals, and manage prescriptions.",
      category: "HealthTech",
    },
    arr: SAMPLE_ARR_DATA[2],
  },
  {
    company: {
      name: "CodeReview Pro",
      description: "AI-powered code review and security scanning. Catch bugs before production and improve code quality across your team.",
      category: "Developer Tools",
    },
    arr: SAMPLE_ARR_DATA[1],
  },
  {
    company: {
      name: "EcoCommerce",
      description: "Sustainable product marketplace connecting eco-conscious consumers with verified green brands. Carbon tracking on every purchase.",
      category: "E-Commerce",
    },
    arr: SAMPLE_ARR_DATA[2],
  },
  {
    company: {
      name: "LearnPath",
      description: "Personalized online learning platform. AI-curated courses, skill assessments, and career path recommendations.",
      category: "EdTech",
    },
    arr: SAMPLE_ARR_DATA[0],
  },
  {
    company: {
      name: "FinanceFlow",
      description: "Automated bookkeeping and financial reporting for small businesses. Connect your bank, get insights, stay compliant.",
      category: "FinTech",
    },
    arr: SAMPLE_ARR_DATA[3],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

export default function ARRShowcase() {
  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface-0 border-b border-white/10">
        <div className="max-w-[1800px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-white hover:opacity-70 transition-opacity">
              <div className="w-6 h-6 rounded-none bg-white flex items-center justify-center">
                <Terminal className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="text-sm font-mono font-bold uppercase tracking-wider">Nanowork</span>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-xs font-mono text-white/40 uppercase tracking-wider">ARR Display System</span>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-mono text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-12">
        {/* Hero */}
        <section className="mb-16">
          <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-4">
            Component Library
          </div>
          <h1 className="text-4xl font-mono font-bold text-white uppercase tracking-tight mb-4">
            ARR Display System
          </h1>
          <p className="text-sm font-mono text-white/70 max-w-3xl leading-relaxed">
            Bloomberg Terminal-inspired components for displaying Annual Recurring Revenue potential.
            Four variants, multiple tiers, built for the showcase marketplace.
          </p>
        </section>

        {/* Tier Overview */}
        <section className="mb-16">
          <div className="border-b border-white/10 pb-4 mb-6">
            <h2 className="text-lg font-mono font-bold text-white uppercase tracking-tight">
              Revenue Tiers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card rounded-none border border-blue-500/30 bg-blue-500/5 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl text-blue-400">◆</span>
                <span className="text-sm font-mono font-bold text-blue-400">STARTER</span>
              </div>
              <div className="text-2xl font-mono font-bold text-white mb-2 tabular-nums">
                $5-10K
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Side project revenue. Perfect for solo founders and MVPs testing market fit.
              </p>
            </div>

            <div className="card rounded-none border border-green-500/30 bg-green-500/5 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl text-green-400">▲</span>
                <span className="text-sm font-mono font-bold text-green-400">GROWTH</span>
              </div>
              <div className="text-2xl font-mono font-bold text-white mb-2 tabular-nums">
                $20-50K
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Full-time founder income. Sustainable business with proven product-market fit.
              </p>
            </div>

            <div className="card rounded-none border border-emerald-500/30 bg-emerald-500/5 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl text-emerald-400">★</span>
                <span className="text-sm font-mono font-bold text-emerald-400">SCALE</span>
              </div>
              <div className="text-2xl font-mono font-bold text-white mb-2 tabular-nums">
                $100-250K
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Small team revenue. Ready to hire, scale operations, and expand market reach.
              </p>
            </div>

            <div className="card rounded-none border border-amber-500/30 bg-amber-500/5 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl text-amber-400">◉</span>
                <span className="text-sm font-mono font-bold text-amber-400">ENTERPRISE</span>
              </div>
              <div className="text-2xl font-mono font-bold text-white mb-2 tabular-nums">
                $500K-1M+
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Serious business. Multiple teams, enterprise customers, venture-backable scale.
              </p>
            </div>
          </div>
        </section>

        {/* Variant Examples */}
        <section className="mb-16">
          <div className="border-b border-white/10 pb-4 mb-6">
            <h2 className="text-lg font-mono font-bold text-white uppercase tracking-tight">
              Display Variants
            </h2>
          </div>

          <div className="space-y-8">
            {/* Compact */}
            <div>
              <div className="text-xs font-mono text-white/60 uppercase tracking-wider mb-3">
                Variant: Compact (Default)
              </div>
              <div className="card rounded-none p-6 space-y-3">
                {SAMPLE_ARR_DATA.map((data, i) => (
                  <ARRDisplay key={i} data={data} variant="compact" />
                ))}
              </div>
              <p className="text-xs text-white/40 font-mono mt-2">
                Use in: Card headers, list items, navigation
              </p>
            </div>

            {/* Badge */}
            <div>
              <div className="text-xs font-mono text-white/60 uppercase tracking-wider mb-3">
                Variant: Badge
              </div>
              <div className="card rounded-none p-6 flex flex-wrap items-center gap-3">
                {SAMPLE_ARR_DATA.map((data, i) => (
                  <ARRDisplay key={i} data={data} variant="badge" />
                ))}
              </div>
              <p className="text-xs text-white/40 font-mono mt-2">
                Use in: Inline text, filters, tags
              </p>
            </div>

            {/* Detailed */}
            <div>
              <div className="text-xs font-mono text-white/60 uppercase tracking-wider mb-3">
                Variant: Detailed
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SAMPLE_ARR_DATA.slice(0, 2).map((data, i) => (
                  <ARRDisplay
                    key={i}
                    data={data}
                    variant="detailed"
                    showBreakdown
                    showGrowth
                  />
                ))}
              </div>
              <p className="text-xs text-white/40 font-mono mt-2">
                Use in: Detail pages, modals, focus areas
              </p>
            </div>

            {/* Chart */}
            <div>
              <div className="text-xs font-mono text-white/60 uppercase tracking-wider mb-3">
                Variant: Chart
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SAMPLE_ARR_DATA.slice(1, 3).map((data, i) => (
                  <ARRDisplay key={i} data={data} variant="chart" />
                ))}
              </div>
              <p className="text-xs text-white/40 font-mono mt-2">
                Use in: Analytics, comparisons, visual emphasis
              </p>
            </div>
          </div>
        </section>

        {/* Company Showcase Cards */}
        <section className="mb-16">
          <div className="border-b border-white/10 pb-4 mb-6">
            <h2 className="text-lg font-mono font-bold text-white uppercase tracking-tight">
              Company Showcase Cards
            </h2>
            <p className="text-xs font-mono text-white/40 mt-2">
              Complete card component with integrated ARR display. Ready for marketplace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SAMPLE_COMPANIES.map((item, i) => (
              <CompanyShowcaseCard key={i} {...item} />
            ))}
          </div>
        </section>

        {/* Usage Guide */}
        <section className="mb-16">
          <div className="border-b border-white/10 pb-4 mb-6">
            <h2 className="text-lg font-mono font-bold text-white uppercase tracking-tight">
              Implementation Guide
            </h2>
          </div>

          <div className="card-lg rounded-none p-8 space-y-6">
            <div>
              <h3 className="text-sm font-mono font-bold text-white mb-3 uppercase tracking-wider">
                Basic Usage
              </h3>
              <div className="bg-surface-0 border border-white/5 rounded p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-white/70">
{`import ARRDisplay from "@/components/ARRDisplay";

const arrData = {
  min: 20000,
  max: 50000,
  tier: "growth",
  monthly: 3500,
  growth: 35,
  confidence: 85,
};

<ARRDisplay data={arrData} variant="compact" />`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-mono font-bold text-white mb-3 uppercase tracking-wider">
                Showcase Card Usage
              </h3>
              <div className="bg-surface-0 border border-white/5 rounded p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-white/70">
{`import { CompanyShowcaseCard } from "@/components/ARRDisplay";

<CompanyShowcaseCard
  company={{
    name: "TaskFlow AI",
    description: "Automated workflow management...",
    category: "Productivity SaaS",
  }}
  arr={arrData}
/>`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-mono font-bold text-white mb-3 uppercase tracking-wider">
                Props Reference
              </h3>
              <div className="space-y-3 text-xs font-mono">
                <div className="grid grid-cols-[120px,1fr] gap-4 pb-3 border-b border-white/5">
                  <span className="text-white/60">variant</span>
                  <span className="text-white/80">"compact" | "badge" | "detailed" | "chart"</span>
                </div>
                <div className="grid grid-cols-[120px,1fr] gap-4 pb-3 border-b border-white/5">
                  <span className="text-white/60">showBreakdown</span>
                  <span className="text-white/80">boolean - Shows monthly/per-customer split</span>
                </div>
                <div className="grid grid-cols-[120px,1fr] gap-4 pb-3 border-b border-white/5">
                  <span className="text-white/60">showGrowth</span>
                  <span className="text-white/80">boolean - Displays growth percentage</span>
                </div>
                <div className="grid grid-cols-[120px,1fr] gap-4">
                  <span className="text-white/60">animated</span>
                  <span className="text-white/80">boolean - Enables live indicator pulse</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Design Notes */}
        <section>
          <div className="border-b border-white/10 pb-4 mb-6">
            <h2 className="text-lg font-mono font-bold text-white uppercase tracking-tight">
              Design System Notes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card rounded-none p-6">
              <h3 className="text-sm font-mono font-bold text-white mb-3 uppercase tracking-wider">
                Color Coding
              </h3>
              <ul className="space-y-2 text-xs text-white/70 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span><span className="text-blue-400">Blue</span> - Entry level, safe bets, testing phase</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span><span className="text-green-400">Green</span> - Growth mode, proven model, sustainable</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span><span className="text-emerald-400">Emerald</span> - Scaling phase, team-ready, expanding</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span><span className="text-amber-400">Amber</span> - Enterprise scale, serious business</span>
                </li>
              </ul>
            </div>

            <div className="card rounded-none p-6">
              <h3 className="text-sm font-mono font-bold text-white mb-3 uppercase tracking-wider">
                Typography
              </h3>
              <ul className="space-y-2 text-xs text-white/70 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  <span>Monospace font for all financial data (terminal aesthetic)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  <span>Tabular numerals for proper number alignment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  <span>Uppercase tracking for labels and metadata</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  <span>Bold weights for primary metrics, regular for context</span>
                </li>
              </ul>
            </div>

            <div className="card rounded-none p-6">
              <h3 className="text-sm font-mono font-bold text-white mb-3 uppercase tracking-wider">
                Animation
              </h3>
              <ul className="space-y-2 text-xs text-white/70 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  <span>Pulsing dots indicate live/real-time data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  <span>Progress bars animate on mount (1s duration)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  <span>Fade-in for expandable sections</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  <span>Minimal, purposeful motion only</span>
                </li>
              </ul>
            </div>

            <div className="card rounded-none p-6">
              <h3 className="text-sm font-mono font-bold text-white mb-3 uppercase tracking-wider">
                Interaction
              </h3>
              <ul className="space-y-2 text-xs text-white/70 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  <span>Showcase cards expand to show breakdown on click</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  <span>Hover states are subtle, no dramatic transforms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  <span>All interactive elements have focus states</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  <span>Data density over whitespace</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between text-xs font-mono text-white/30">
            <div>© 2026 NANOWORK INC</div>
            <div>COMPONENT LIBRARY v1.0</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
