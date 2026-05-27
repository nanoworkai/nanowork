import { useState } from "react";
import { TrendingUp, DollarSign, CheckCircle2, Clock, Package } from "lucide-react";
import { type Business } from "../data/businesses";
import { BusinessDetailView } from "./BusinessDetailView";

interface MarketplaceCardProps {
  business: Business;
  viewMode: "grid" | "list";
}

function getARRDisplay(mrr: string | undefined): { arr: string; tier: string; color: string; raw: number } {
  if (!mrr) return { arr: "TBD", tier: "Starter", color: "text-accent", raw: 0 };

  const monthly = parseFloat(mrr.replace(/[^0-9.]/g, ''));
  const annual = monthly * 12;

  if (annual >= 100000) return { arr: `$${(annual / 1000).toFixed(0)}K`, tier: "Scale", color: "text-fintech-green", raw: annual };
  if (annual >= 20000) return { arr: `$${(annual / 1000).toFixed(0)}K`, tier: "Growth", color: "text-fintech-green", raw: annual };
  return { arr: `$${(annual / 1000).toFixed(1)}K`, tier: "Starter", color: "text-accent", raw: annual };
}

export function MarketplaceCard({ business, viewMode }: MarketplaceCardProps) {
  const { arr, tier, color } = getARRDisplay(business.mrr);
  const isAvailable = business.status === "available";
  const [showDetailView, setShowDetailView] = useState(false);

  const handleClaimBusiness = () => {
    // Store business data in localStorage before redirecting to signup
    localStorage.setItem('pending_claim', JSON.stringify({
      businessId: business.slug,
      businessName: business.name,
      businessData: business
    }));
    window.location.href = '/login?intent=claim';
  };

  if (viewMode === "list") {
    return (
      <>
      <div
        onClick={() => isAvailable && setShowDetailView(true)}
        className={`group border border-fintech-border bg-surface-1 hover:border-fintech-navy transition-all ${
          isAvailable ? "hover:bg-surface-3 cursor-pointer" : "opacity-70"
        }`}
      >
        <div className="p-6 flex flex-col lg:flex-row gap-6">
          {/* Left: Main Info */}
          <div className="flex-1 min-w-0">
            {/* Header with Status */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-fintech-navy mb-1 truncate group-hover:opacity-80 transition-opacity">
                  {business.name}
                </h3>
                <p className="text-xs text-fintech-slate">
                  {business.category}
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex-shrink-0">
                {business.status === "available" ? (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-fintech-green/10 border border-fintech-green/20">
                    <div className="w-1.5 h-1.5 bg-fintech-green animate-pulse" />
                    <span className="text-xs font-medium text-fintech-green">Available</span>
                  </div>
                ) : business.status === "pending" ? (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-fintech-amber/10 border border-fintech-amber/20">
                    <Clock className="w-3 h-3 text-fintech-amber" />
                    <span className="text-xs font-medium text-fintech-amber">Pending</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-surface-0 border border-fintech-border">
                    <CheckCircle2 className="w-3 h-3 text-fintech-slate" />
                    <span className="text-xs font-medium text-fintech-slate">Claimed</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tagline */}
            <p className="text-sm text-fintech-slate mb-4 leading-relaxed line-clamp-2">
              {business.tagline}
            </p>

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-2 mb-4">
              {business.stack.slice(0, 5).map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 text-xs bg-surface-0 border border-fintech-divider text-fintech-slate"
                >
                  {tech}
                </span>
              ))}
              {business.stack.length > 5 && (
                <span className="px-2 py-0.5 text-xs text-fintech-slate">
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
                <TrendingUp className="w-3.5 h-3.5 text-fintech-slate" />
                <span className="text-xs text-fintech-slate/60">ARR</span>
              </div>
              <div className={`text-xl font-semibold ${color}`}>{arr}</div>
              <span className={`text-xs ${color}`}>{tier}</span>
            </div>

            {/* Price */}
            <div className="text-left lg:text-right">
              <div className="flex items-center gap-1.5 mb-1 justify-start lg:justify-end">
                <DollarSign className="w-3.5 h-3.5 text-fintech-slate" />
                <span className="text-xs text-fintech-slate/60">Price</span>
              </div>
              <div className="text-xl font-semibold text-fintech-navy">
                ${(business.price / 1000).toFixed(1)}K
              </div>
              <span className="text-xs text-fintech-slate">one-time</span>
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
      className={`group border border-fintech-border bg-surface-1 flex flex-col h-full transition-all ${
        isAvailable ? "hover:border-fintech-navy hover:bg-surface-3 cursor-pointer" : "opacity-60"
      }`}
    >
      {/* Status Badge - Top Right */}
      <div className="relative p-6 pb-0">
        <div className="absolute top-4 right-4 z-10">
          {business.status === "available" ? (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-fintech-green/10 border border-fintech-green/20">
              <div className="w-1.5 h-1.5 bg-fintech-green animate-pulse" />
              <span className="text-xs font-medium text-fintech-green">Available</span>
            </div>
          ) : business.status === "pending" ? (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-fintech-amber/10 border border-fintech-amber/20">
              <Clock className="w-3 h-3 text-fintech-amber" />
              <span className="text-xs font-medium text-fintech-amber">Pending</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-surface-0 border border-fintech-border">
              <CheckCircle2 className="w-3 h-3 text-fintech-slate" />
              <span className="text-xs font-medium text-fintech-slate">Claimed</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-fintech-navy mb-1 group-hover:opacity-80 transition-opacity">
            {business.name}
          </h3>
          <p className="text-xs text-fintech-slate">
            {business.category}
          </p>
        </div>

        {/* Tagline */}
        <p className="text-sm text-fintech-slate mb-4 leading-relaxed line-clamp-2 flex-1">
          {business.tagline}
        </p>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-fintech-divider">
          {/* ARR Potential */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-fintech-slate" />
              <span className="text-xs text-fintech-slate/60">ARR</span>
            </div>
            <div className={`text-lg font-semibold ${color}`}>{arr}</div>
            <span className={`text-xs ${color}`}>{tier}</span>
          </div>

          {/* Price to Claim */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-fintech-slate" />
              <span className="text-xs text-fintech-slate/60">Price</span>
            </div>
            <div className="text-lg font-semibold text-fintech-navy">
              ${(business.price / 1000).toFixed(1)}K
            </div>
            <span className="text-xs text-fintech-slate">one-time</span>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Package className="w-3.5 h-3.5 text-fintech-slate" />
            <span className="text-xs text-fintech-slate/60">
              Stack
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {business.stack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 text-xs bg-surface-0 border border-fintech-divider text-fintech-slate"
              >
                {tech}
              </span>
            ))}
            {business.stack.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-fintech-slate">
                +{business.stack.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* CTA Button */}
        {isAvailable && (
          <button className="w-full py-2.5 bg-fintech-navy hover:bg-fintech-navy/90 text-white text-sm font-medium transition-colors mt-auto">
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
