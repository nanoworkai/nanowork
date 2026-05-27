import { TrendingUp, DollarSign, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { BUSINESSES, type Business } from "../data/businesses";

/**
 * Business Showcase Component
 * Displays AI-generated companies with ARR potential and claim pricing
 * Replaces the department grid on homepage
 */

function getARRDisplay(mrr: string | undefined): { arr: string; tier: string; color: string } {
  if (!mrr) return { arr: "TBD", tier: "Starter", color: "text-accent" };

  const monthly = parseFloat(mrr.replace(/[^0-9.]/g, ''));
  const annual = monthly * 12;

  if (annual >= 100000) return { arr: `$${(annual / 1000).toFixed(0)}K`, tier: "Scale", color: "text-fintech-green" };
  if (annual >= 20000) return { arr: `$${(annual / 1000).toFixed(0)}K`, tier: "Growth", color: "text-fintech-green" };
  return { arr: `$${(annual / 1000).toFixed(1)}K`, tier: "Starter", color: "text-accent" };
}

function BusinessCard({ business }: { business: Business }) {
  const { arr, tier, color } = getARRDisplay(business.mrr);
  const isAvailable = business.status === "available";

  return (
    <div
      className={`group relative border border-fintech-border bg-surface-1 transition-colors ${
        isAvailable ? "hover:border-fintech-navy cursor-pointer" : "opacity-40"
      }`}
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        {business.status === "available" ? (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-fintech-green/10 border border-fintech-green/20">
            <div className="w-1.5 h-1.5 bg-fintech-green" />
            <span className="text-xs font-medium text-fintech-green">Available</span>
          </div>
        ) : business.status === "pending" ? (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-surface-0 border border-fintech-border">
            <Clock className="w-3 h-3 text-fintech-slate" />
            <span className="text-xs font-medium text-fintech-slate">Pending</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-surface-0 border border-fintech-border">
            <CheckCircle2 className="w-3 h-3 text-fintech-slate" />
            <span className="text-xs font-medium text-fintech-slate">Claimed</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-fintech-navy mb-1">
            {business.name}
          </h3>
          <p className="text-xs text-fintech-slate">
            {business.category}
          </p>
        </div>

        {/* Tagline */}
        <p className="text-sm text-fintech-slate mb-6 leading-relaxed">
          {business.tagline}
        </p>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-fintech-divider">
          {/* ARR Potential */}
          <div>
            <span className="text-xs text-fintech-slate/60 block mb-2">Potential ARR</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl font-semibold ${color}`}>{arr}</span>
              <span className="text-xs text-fintech-slate/50">/yr</span>
            </div>
          </div>

          {/* Price to Claim */}
          <div>
            <span className="text-xs text-fintech-slate/60 block mb-2">Claim price</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-semibold text-fintech-navy">
                ${(business.price / 1000).toFixed(1)}K
              </span>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-5">
          <span className="text-xs text-fintech-slate/60 block mb-3">
            Tech stack
          </span>
          <div className="flex flex-wrap gap-2">
            {business.stack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="px-2 py-1 text-xs bg-surface-0 border border-fintech-divider text-fintech-slate"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        {isAvailable && (
          <button className="w-full py-2.5 bg-fintech-navy hover:bg-fintech-navy/90 text-white text-sm font-medium transition-colors">
            Claim business
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
    <section className="py-16 sm:py-20">
      {/* Section Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-semibold text-fintech-navy tracking-tight">
            Pre-built businesses
          </h2>
          <span className="text-sm text-fintech-slate">
            ${(totalARR / 1000).toFixed(0)}K total ARR
          </span>
        </div>
        <p className="text-lg text-fintech-slate max-w-3xl leading-relaxed">
          Complete businesses with tech stack, payment processing, and deployment ready. Claim one and start generating revenue.
        </p>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {showcaseBusinesses.map((business) => (
          <BusinessCard key={business.slug} business={business} />
        ))}
      </div>

      {/* View All Link */}
      <div className="flex justify-center">
        <a
          href="/marketplace"
          className="inline-flex items-center gap-2 px-6 py-2.5 border border-fintech-border hover:border-fintech-navy bg-surface-1 text-sm font-medium text-fintech-navy transition-colors"
        >
          View all {BUSINESSES.length} businesses
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}
