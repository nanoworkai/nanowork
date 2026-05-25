import { useState } from "react";
import { TrendingUp, DollarSign, CheckCircle2, Clock, Package } from "lucide-react";
import { type Business } from "../data/businesses";
import { BusinessDetailView } from "./BusinessDetailView";

interface MarketplaceCardProps {
  business: Business;
  viewMode: "grid" | "list";
}

function getARRDisplay(mrr: string | undefined): { arr: string; tier: string; color: string; raw: number } {
  if (!mrr) return { arr: "TBD", tier: "Starter", color: "text-blue-400", raw: 0 };

  const monthly = parseFloat(mrr.replace(/[^0-9.]/g, ''));
  const annual = monthly * 12;

  if (annual >= 100000) return { arr: `$${(annual / 1000).toFixed(0)}K`, tier: "Scale", color: "text-emerald-400", raw: annual };
  if (annual >= 20000) return { arr: `$${(annual / 1000).toFixed(0)}K`, tier: "Growth", color: "text-green-400", raw: annual };
  return { arr: `$${(annual / 1000).toFixed(1)}K`, tier: "Starter", color: "text-blue-400", raw: annual };
}

export function MarketplaceCard({ business, viewMode }: MarketplaceCardProps) {
  const { arr, tier, color } = getARRDisplay(business.mrr);
  const isAvailable = business.status === "available";
  const [showDetailView, setShowDetailView] = useState(false);

  const handleClaimBusiness = () => {
    // TODO: Integrate with actual claim flow
    console.log("Claiming business:", business.slug);
    alert(`Claiming ${business.name} - Integration pending`);
  };

  if (viewMode === "list") {
    return (
      <>
      <div
        onClick={() => isAvailable && setShowDetailView(true)}
        className={`group border border-white/10 bg-surface-2 hover:border-white/20 transition-all ${
          isAvailable ? "hover:bg-surface-3 cursor-pointer" : "opacity-70"
        }`}
      >
        <div className="p-6 flex flex-col lg:flex-row gap-6">
          {/* Left: Main Info */}
          <div className="flex-1 min-w-0">
            {/* Header with Status */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-mono font-bold text-white mb-1 truncate group-hover:text-white/90 transition-colors">
                  {business.name}
                </h3>
                <p className="text-xs font-mono text-white/40 uppercase tracking-wider">
                  {business.category}
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex-shrink-0">
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
            </div>

            {/* Tagline */}
            <p className="text-sm text-white/70 mb-4 leading-relaxed line-clamp-2">
              {business.tagline}
            </p>

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-2 mb-4">
              {business.stack.slice(0, 5).map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 text-xs font-mono bg-white/5 border border-white/10 text-white/60"
                >
                  {tech}
                </span>
              ))}
              {business.stack.length > 5 && (
                <span className="px-2 py-0.5 text-xs font-mono text-white/40">
                  +{business.stack.length - 5} more
                </span>
              )}
            </div>
          </div>

          {/* Right: Metrics */}
          <div className="flex lg:flex-col gap-4 lg:gap-6 items-center lg:items-end justify-between lg:justify-start flex-shrink-0">
            {/* ARR */}
            <div className="text-left lg:text-right">
              <div className="flex items-center gap-1.5 mb-1 justify-start lg:justify-end">
                <TrendingUp className="w-3.5 h-3.5 text-white/40" />
                <span className="text-xs font-mono text-white/40 uppercase">ARR</span>
              </div>
              <div className={`text-xl font-mono font-bold ${color}`}>{arr}</div>
              <span className={`text-xs font-mono ${color}`}>{tier}</span>
            </div>

            {/* Price */}
            <div className="text-left lg:text-right">
              <div className="flex items-center gap-1.5 mb-1 justify-start lg:justify-end">
                <DollarSign className="w-3.5 h-3.5 text-white/40" />
                <span className="text-xs font-mono text-white/40 uppercase">Price</span>
              </div>
              <div className="text-xl font-mono font-bold text-white">
                ${(business.price / 1000).toFixed(1)}K
              </div>
              <span className="text-xs font-mono text-white/30">one-time</span>
            </div>
          </div>
        </div>
      </div>
      <BusinessDetailView
        business={business}
        isOpen={showDetailView}
        onClose={() => setShowDetailView(false)}
        onClaim={handleClaimBusiness}
      />
      </>
    );
  }

  // Grid View
  return (
    <>
    <div
      onClick={() => isAvailable && setShowDetailView(true)}
      className={`group border border-white/10 bg-surface-2 flex flex-col h-full transition-all ${
        isAvailable ? "hover:border-white/30 hover:bg-surface-3 cursor-pointer" : "opacity-60"
      }`}
    >
      {/* Status Badge - Top Right */}
      <div className="relative p-6 pb-0">
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
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
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
        <p className="text-sm text-white/70 mb-4 leading-relaxed line-clamp-2 flex-1">
          {business.tagline}
        </p>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-white/5">
          {/* ARR Potential */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-white/40" />
              <span className="text-xs font-mono text-white/40 uppercase">ARR</span>
            </div>
            <div className={`text-lg font-mono font-bold ${color}`}>{arr}</div>
            <span className={`text-xs font-mono ${color}`}>{tier}</span>
          </div>

          {/* Price to Claim */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-white/40" />
              <span className="text-xs font-mono text-white/40 uppercase">Price</span>
            </div>
            <div className="text-lg font-mono font-bold text-white">
              ${(business.price / 1000).toFixed(1)}K
            </div>
            <span className="text-xs font-mono text-white/30">one-time</span>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Package className="w-3.5 h-3.5 text-white/40" />
            <span className="text-xs font-mono text-white/40 uppercase tracking-wider">
              Stack
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {business.stack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 text-xs font-mono bg-white/5 border border-white/10 text-white/60"
              >
                {tech}
              </span>
            ))}
            {business.stack.length > 3 && (
              <span className="px-2 py-0.5 text-xs font-mono text-white/40">
                +{business.stack.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* CTA Button */}
        {isAvailable && (
          <button className="w-full py-2.5 bg-white hover:bg-zinc-100 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors mt-auto">
            View Details
          </button>
        )}
      </div>
    </div>
    <BusinessDetailView
      business={business}
      isOpen={showDetailView}
      onClose={() => setShowDetailView(false)}
      onClaim={handleClaimBusiness}
    />
    </>
  );
}
