import { TrendingUp, DollarSign, CheckCircle2, Clock } from "lucide-react";
import { BUSINESSES, type Business } from "../data/businesses";

/**
 * Business Showcase Component
 * Displays AI-generated companies with ARR potential and claim pricing
 * Replaces the department grid on homepage
 */

function getARRDisplay(mrr: string | undefined): { arr: string; tier: string; color: string } {
  if (!mrr) return { arr: "TBD", tier: "Starter", color: "text-blue-400" };

  const monthly = parseFloat(mrr.replace(/[^0-9.]/g, ''));
  const annual = monthly * 12;

  if (annual >= 100000) return { arr: `$${(annual / 1000).toFixed(0)}K`, tier: "Scale", color: "text-emerald-400" };
  if (annual >= 20000) return { arr: `$${(annual / 1000).toFixed(0)}K`, tier: "Growth", color: "text-green-400" };
  return { arr: `$${(annual / 1000).toFixed(1)}K`, tier: "Starter", color: "text-blue-400" };
}

function BusinessCard({ business }: { business: Business }) {
  const { arr, tier, color } = getARRDisplay(business.mrr);
  const isAvailable = business.status === "available";

  return (
    <div
      className={`group relative border border-white/10 bg-surface-2 transition-all ${
        isAvailable ? "hover:border-white/30 hover:bg-surface-3 cursor-pointer" : "opacity-60"
      }`}
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        {business.status === "available" ? (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/10 border border-green-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-mono text-green-400 uppercase">Available</span>
          </div>
        ) : business.status === "pending" ? (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20">
            <Clock className="w-3 h-3 text-amber-400" />
            <span className="text-xs font-mono text-amber-400 uppercase">Pending</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/10 border border-white/20">
            <CheckCircle2 className="w-3 h-3 text-white/60" />
            <span className="text-xs font-mono text-white/60 uppercase">Claimed</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-mono font-bold text-white mb-1 group-hover:text-white/90 transition-colors">
            {business.name}
          </h3>
          <p className="text-xs font-mono text-white/40 uppercase tracking-wider">
            {business.category}
          </p>
        </div>

        {/* Tagline */}
        <p className="text-sm text-white/70 mb-5 leading-relaxed">
          {business.tagline}
        </p>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-white/5">
          {/* ARR Potential */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-white/40" />
              <span className="text-xs font-mono text-white/40 uppercase">Potential ARR</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-xl font-mono font-bold ${color}`}>{arr}</span>
              <span className="text-xs font-mono text-white/30">/year</span>
            </div>
            <span className={`text-xs font-mono ${color}`}>{tier}</span>
          </div>

          {/* Price to Claim */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-white/40" />
              <span className="text-xs font-mono text-white/40 uppercase">Claim Price</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-mono font-bold text-white">
                ${(business.price / 1000).toFixed(1)}K
              </span>
            </div>
            <span className="text-xs font-mono text-white/30">one-time</span>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-4">
          <span className="text-xs font-mono text-white/40 uppercase tracking-wider block mb-2">
            Tech Stack
          </span>
          <div className="flex flex-wrap gap-2">
            {business.stack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 text-xs font-mono bg-white/5 border border-white/10 text-white/60"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        {isAvailable && (
          <button className="w-full py-3 bg-white hover:bg-zinc-100 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors">
            Claim This Business
          </button>
        )}
      </div>
    </div>
  );
}

export default function BusinessShowcase() {
  // Show first 6 available businesses
  const showcaseBusinesses = BUSINESSES.filter(b => b.status === "available").slice(0, 6);

  // Calculate total potential ARR
  const totalARR = showcaseBusinesses.reduce((sum, business) => {
    if (!business.mrr) return sum;
    const monthly = parseFloat(business.mrr.replace(/[^0-9.]/g, ''));
    return sum + (monthly * 12);
  }, 0);

  return (
    <section className="py-12">
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-mono font-bold text-white/40 uppercase tracking-wider">
            AI-Generated Companies
          </span>
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs font-mono text-green-400 whitespace-nowrap">
            ${(totalARR / 1000).toFixed(0)}K TOTAL ARR
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white uppercase tracking-tight mb-3">
          Ready-Made Businesses
        </h2>
        <p className="text-sm font-mono text-white/70 max-w-3xl leading-relaxed">
          Pre-built companies with tech stack, customers, and revenue potential. Claim one, customize it, and start generating revenue immediately. Each business is fully configured with payment processing, authentication, and deployment ready.
        </p>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {showcaseBusinesses.map((business) => (
          <BusinessCard key={business.slug} business={business} />
        ))}
      </div>

      {/* View All Link */}
      <div className="flex justify-center">
        <a
          href="/marketplace"
          className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 hover:border-white/40 bg-surface-2 hover:bg-surface-3 font-mono text-sm text-white uppercase tracking-wider transition-all group"
        >
          View All {BUSINESSES.length} Businesses
          <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </section>
  );
}
