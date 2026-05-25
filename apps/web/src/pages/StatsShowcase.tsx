import { Link } from "react-router-dom";
import { Terminal, ArrowLeft } from "lucide-react";
import MarketplaceStats from "../components/MarketplaceStats";

/**
 * Stats Showcase Demo Page
 *
 * Demonstrates all variants of the MarketplaceStats component
 * with different layouts and configurations.
 */

export default function StatsShowcase() {
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
            <span className="text-xs font-mono text-white/40 uppercase tracking-wider">Stats Dashboard System</span>
          </div>

          <Link
            to="/marketplace"
            className="flex items-center gap-2 text-xs font-mono text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Marketplace
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
            Marketplace Statistics Dashboard
          </h1>
          <p className="text-sm font-mono text-white/70 max-w-3xl leading-relaxed">
            Bloomberg Terminal-inspired statistics dashboard for the marketplace. Real-time metrics,
            category breakdowns, tech stack popularity, and ARR tier distribution. Three layout variants
            for different use cases.
          </p>
        </section>

        {/* Variant: Full Dashboard */}
        <section className="mb-16">
          <div className="border-b border-white/10 pb-4 mb-6">
            <h2 className="text-lg font-mono font-bold text-white uppercase tracking-tight mb-2">
              Variant: Full Dashboard
            </h2>
            <p className="text-xs font-mono text-white/40">
              Complete statistics dashboard with all metrics, breakdowns, and live activity ticker.
              Best for dedicated marketplace overview pages.
            </p>
          </div>

          <MarketplaceStats variant="full" />
        </section>

        {/* Variant: Compact */}
        <section className="mb-16">
          <div className="border-b border-white/10 pb-4 mb-6">
            <h2 className="text-lg font-mono font-bold text-white uppercase tracking-tight mb-2">
              Variant: Compact
            </h2>
            <p className="text-xs font-mono text-white/40">
              Condensed metrics grid with activity ticker. Perfect for page headers where space is limited
              but key insights are needed.
            </p>
          </div>

          <MarketplaceStats variant="compact" />
        </section>

        {/* Variant: Horizontal */}
        <section className="mb-16">
          <div className="border-b border-white/10 pb-4 mb-6">
            <h2 className="text-lg font-mono font-bold text-white uppercase tracking-tight mb-2">
              Variant: Horizontal Bar
            </h2>
            <p className="text-xs font-mono text-white/40">
              Horizontal stats bar for sticky headers. Shows essential metrics in a single scrollable row.
              Minimal vertical space usage.
            </p>
          </div>

          <div className="border border-white/10">
            <MarketplaceStats variant="horizontal" />
          </div>
        </section>

        {/* Design System Notes */}
        <section className="mb-16">
          <div className="border-b border-white/10 pb-4 mb-6">
            <h2 className="text-lg font-mono font-bold text-white uppercase tracking-tight">
              Design System Notes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Metrics */}
            <div className="card rounded-none p-6 border border-white/10">
              <h3 className="text-sm font-mono font-bold text-white mb-4 uppercase tracking-wider">
                Key Metrics Displayed
              </h3>
              <ul className="space-y-2 text-xs text-white/70 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span><strong className="text-white">Total Businesses:</strong> Available vs. total count with status breakdown</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span><strong className="text-white">Combined ARR:</strong> Sum of all recurring revenue potential across businesses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  <span><strong className="text-white">Price Range:</strong> Min/max/average pricing with distribution</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span><strong className="text-white">Categories:</strong> Business category breakdown with percentages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  <span><strong className="text-white">Tech Stack:</strong> Most popular technologies across all businesses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span><strong className="text-white">ARR Tiers:</strong> Distribution across Starter/Growth/Scale tiers</span>
                </li>
              </ul>
            </div>

            {/* Interactive Elements */}
            <div className="card rounded-none p-6 border border-white/10">
              <h3 className="text-sm font-mono font-bold text-white mb-4 uppercase tracking-wider">
                Interactive Elements
              </h3>
              <ul className="space-y-2 text-xs text-white/70 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  <span><strong className="text-white">Activity Ticker:</strong> Scrolling marquee showing recent businesses and activity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  <span><strong className="text-white">Live Indicators:</strong> Pulsing dots show real-time data updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  <span><strong className="text-white">Progress Bars:</strong> Animated bars for category and tier breakdowns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  <span><strong className="text-white">Hover States:</strong> Cards lift and highlight on interaction</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  <span><strong className="text-white">Click Filters:</strong> Category pills can trigger filter actions (optional prop)</span>
                </li>
              </ul>
            </div>

            {/* Color Coding */}
            <div className="card rounded-none p-6 border border-white/10">
              <h3 className="text-sm font-mono font-bold text-white mb-4 uppercase tracking-wider">
                Color System
              </h3>
              <ul className="space-y-2 text-xs text-white/70 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span><span className="text-green-400 font-bold">Green:</span> Available status, positive metrics, growth indicators</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span><span className="text-emerald-400 font-bold">Emerald:</span> ARR metrics, revenue potential, scale tier</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span><span className="text-amber-400 font-bold">Amber:</span> Pending status, warning states, time-based metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span><span className="text-blue-400 font-bold">Blue:</span> Categories, starter tier, informational data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  <span><span className="text-white font-bold">White:</span> Primary numbers, pricing, neutral metrics</span>
                </li>
              </ul>
            </div>

            {/* Typography & Layout */}
            <div className="card rounded-none p-6 border border-white/10">
              <h3 className="text-sm font-mono font-bold text-white mb-4 uppercase tracking-wider">
                Typography & Layout
              </h3>
              <ul className="space-y-2 text-xs text-white/70 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  <span><strong className="text-white">Monospace Font:</strong> All text uses monospace for terminal aesthetic</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  <span><strong className="text-white">Tabular Numbers:</strong> Financial data aligns perfectly in columns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  <span><strong className="text-white">Dense Layout:</strong> Information-packed like Bloomberg terminals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  <span><strong className="text-white">Responsive Grid:</strong> Adapts from mobile to ultra-wide displays</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-0.5">•</span>
                  <span><strong className="text-white">Border System:</strong> Subtle dividers (white/10) create visual hierarchy</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section className="mb-16">
          <div className="border-b border-white/10 pb-4 mb-6">
            <h2 className="text-lg font-mono font-bold text-white uppercase tracking-tight">
              Implementation Examples
            </h2>
          </div>

          <div className="space-y-6">
            {/* Example 1: Full Dashboard */}
            <div className="card-lg rounded-none p-6 border border-white/10">
              <h3 className="text-sm font-mono font-bold text-white mb-3 uppercase tracking-wider">
                Full Dashboard (Marketplace Page)
              </h3>
              <div className="bg-surface-0 border border-white/5 rounded p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-white/70">
{`import MarketplaceStats from "@/components/MarketplaceStats";

// Use in marketplace overview page
<MarketplaceStats variant="full" />`}
                </pre>
              </div>
            </div>

            {/* Example 2: Compact */}
            <div className="card-lg rounded-none p-6 border border-white/10">
              <h3 className="text-sm font-mono font-bold text-white mb-3 uppercase tracking-wider">
                Compact View (Page Header)
              </h3>
              <div className="bg-surface-0 border border-white/5 rounded p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-white/70">
{`import MarketplaceStats from "@/components/MarketplaceStats";

// Use in page header or sidebar
<MarketplaceStats variant="compact" />`}
                </pre>
              </div>
            </div>

            {/* Example 3: Horizontal */}
            <div className="card-lg rounded-none p-6 border border-white/10">
              <h3 className="text-sm font-mono font-bold text-white mb-3 uppercase tracking-wider">
                Horizontal Bar (Sticky Header)
              </h3>
              <div className="bg-surface-0 border border-white/5 rounded p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-white/70">
{`import MarketplaceStats from "@/components/MarketplaceStats";

// Use in sticky header or above grid
<div className="sticky top-14 z-40">
  <MarketplaceStats variant="horizontal" />
</div>`}
                </pre>
              </div>
            </div>

            {/* Example 4: With Filter Callback */}
            <div className="card-lg rounded-none p-6 border border-white/10">
              <h3 className="text-sm font-mono font-bold text-white mb-3 uppercase tracking-wider">
                Interactive Filtering
              </h3>
              <div className="bg-surface-0 border border-white/5 rounded p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-white/70">
{`import MarketplaceStats from "@/components/MarketplaceStats";

function MarketplacePage() {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  return (
    <>
      <MarketplaceStats
        variant="full"
        onFilterByCategory={setCategoryFilter}
      />
      {/* Category pills in stats dashboard become clickable filters */}
    </>
  );
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Props Reference */}
        <section>
          <div className="border-b border-white/10 pb-4 mb-6">
            <h2 className="text-lg font-mono font-bold text-white uppercase tracking-tight">
              Props Reference
            </h2>
          </div>

          <div className="card-lg rounded-none p-6 border border-white/10">
            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-[180px,1fr] gap-4 pb-4 border-b border-white/5">
                <span className="text-white/60">variant</span>
                <div>
                  <div className="text-white/80 mb-2">"full" | "compact" | "horizontal"</div>
                  <div className="text-white/50">
                    Layout variant. Full shows all metrics, compact for headers, horizontal for bars.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-[180px,1fr] gap-4 pb-4 border-b border-white/5">
                <span className="text-white/60">onFilterByCategory</span>
                <div>
                  <div className="text-white/80 mb-2">(category: string) =&gt; void</div>
                  <div className="text-white/50">
                    Optional callback when user clicks a category pill in the breakdown section.
                  </div>
                </div>
              </div>
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
