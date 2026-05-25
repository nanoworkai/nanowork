import { TrendingUp, DollarSign, Zap, BarChart3 } from "lucide-react";
import { useState } from "react";

/**
 * ARR Display Component - Bloomberg Terminal Style
 *
 * Displays Annual Recurring Revenue potential for AI-generated businesses
 * in a way that's exciting, believable, and fits the terminal aesthetic.
 *
 * Design Principles:
 * - Data-dense like a Bloomberg terminal
 * - Monospace typography for financial data
 * - Green accents for positive metrics (matches terminal tradition)
 * - Compact but impactful
 * - Real-time feel with live indicators
 */

// ──────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ──────────────────────────────────────────────────────────────────────────────

export type ARRTier = "starter" | "growth" | "scale" | "enterprise";

export interface ARRData {
  min: number;        // Minimum ARR
  max: number;        // Maximum ARR
  tier: ARRTier;      // Revenue tier
  monthly?: number;   // Monthly recurring revenue
  growth?: number;    // Projected growth percentage
  confidence?: number; // AI confidence score (0-100)
}

interface ARRDisplayProps {
  data: ARRData;
  variant?: "compact" | "detailed" | "badge" | "chart";
  showBreakdown?: boolean;
  showGrowth?: boolean;
  animated?: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────
// TIER CONFIGURATION
// ──────────────────────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<ARRTier, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}> = {
  starter: {
    label: "STARTER",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    icon: "◆",
  },
  growth: {
    label: "GROWTH",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    icon: "▲",
  },
  scale: {
    label: "SCALE",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    icon: "★",
  },
  enterprise: {
    label: "ENTERPRISE",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    icon: "◉",
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ──────────────────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
}

function formatRange(min: number, max: number): string {
  return `${formatCurrency(min)}-${formatCurrency(max)}`;
}

// ──────────────────────────────────────────────────────────────────────────────
// VARIANT: COMPACT - For card headers
// ──────────────────────────────────────────────────────────────────────────────

function CompactARR({ data, animated }: { data: ARRData; animated?: boolean }) {
  const config = TIER_CONFIG[data.tier];

  return (
    <div className="flex items-center gap-2">
      {/* Tier badge */}
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded border ${config.borderColor} ${config.bgColor}`}>
        <span className={`text-xs font-mono font-bold ${config.color}`}>
          {config.icon}
        </span>
        <span className={`text-[10px] font-mono font-bold ${config.color} tracking-wider`}>
          {config.label}
        </span>
      </div>

      {/* ARR value */}
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-mono font-bold text-white tabular-nums">
          {formatRange(data.min, data.max)}
        </span>
        <span className="text-[10px] font-mono text-white/40">/YR</span>
      </div>

      {/* Live indicator */}
      {animated && (
        <div className={`w-1.5 h-1.5 rounded-full ${config.color.replace('text-', 'bg-')} animate-pulse`} />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// VARIANT: BADGE - Minimal inline display
// ──────────────────────────────────────────────────────────────────────────────

function BadgeARR({ data }: { data: ARRData }) {
  const config = TIER_CONFIG[data.tier];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border ${config.borderColor} ${config.bgColor}`}>
      <DollarSign className={`w-3 h-3 ${config.color}`} />
      <span className={`text-xs font-mono font-bold ${config.color} tabular-nums`}>
        {formatRange(data.min, data.max)}
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// VARIANT: DETAILED - Full feature display with breakdown
// ──────────────────────────────────────────────────────────────────────────────

function DetailedARR({ data, showBreakdown, showGrowth }: {
  data: ARRData;
  showBreakdown?: boolean;
  showGrowth?: boolean;
}) {
  const config = TIER_CONFIG[data.tier];
  const monthly = data.monthly || data.min / 12;

  return (
    <div className="border border-white/10 rounded-none bg-surface-2 overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 px-4 py-2.5 bg-surface-1">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5 text-white/60" />
          <span className="text-[10px] font-mono font-bold text-white/60 uppercase tracking-wider">
            Revenue Potential
          </span>
          <div className="flex-1" />
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded border ${config.borderColor} ${config.bgColor}`}>
            <span className={`text-[10px] font-mono font-bold ${config.color} tracking-wider`}>
              {config.label}
            </span>
          </div>
        </div>
      </div>

      {/* Main metrics */}
      <div className="p-4">
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-mono font-bold text-white tabular-nums">
              {formatRange(data.min, data.max)}
            </span>
            <span className="text-xs font-mono text-white/40">ARR</span>
          </div>
          {data.confidence && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${config.color.replace('text-', 'bg-')} transition-all duration-1000`}
                  style={{ width: `${data.confidence}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-white/40 tabular-nums">
                {data.confidence}% confidence
              </span>
            </div>
          )}
        </div>

        {/* Breakdown */}
        {showBreakdown && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
            <div>
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-1">
                Monthly
              </div>
              <div className="text-sm font-mono font-bold text-white tabular-nums">
                {formatCurrency(monthly)}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-1">
                Per Customer
              </div>
              <div className="text-sm font-mono font-bold text-white tabular-nums">
                {formatCurrency(monthly / 10)}
              </div>
            </div>
          </div>
        )}

        {/* Growth projection */}
        {showGrowth && data.growth && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-mono text-white/60">
                Projected growth
              </span>
              <span className="text-xs font-mono font-bold text-green-400 tabular-nums ml-auto">
                +{data.growth}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// VARIANT: CHART - Visual representation with bars
// ──────────────────────────────────────────────────────────────────────────────

function ChartARR({ data }: { data: ARRData }) {
  const config = TIER_CONFIG[data.tier];
  const monthly = data.monthly || data.min / 12;
  const maxValue = 150000; // Scale to $150K max for visual purposes
  const percentage = Math.min((data.max / maxValue) * 100, 100);

  return (
    <div className="border border-white/10 rounded-none bg-surface-2 p-4">
      {/* Header with tier */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className={`w-4 h-4 ${config.color}`} />
          <span className="text-xs font-mono font-bold text-white">
            Revenue Projection
          </span>
        </div>
        <span className={`text-[10px] font-mono font-bold ${config.color} tracking-wider`}>
          {config.label}
        </span>
      </div>

      {/* Chart visualization */}
      <div className="space-y-3">
        {/* Annual */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-white/60 uppercase tracking-wider">
              Annual
            </span>
            <span className="text-sm font-mono font-bold text-white tabular-nums">
              {formatRange(data.min, data.max)}
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full ${config.color.replace('text-', 'bg-')} rounded-full transition-all duration-1000`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Monthly */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-white/60 uppercase tracking-wider">
              Monthly
            </span>
            <span className="text-sm font-mono font-bold text-white/80 tabular-nums">
              {formatCurrency(monthly)}
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full ${config.color.replace('text-', 'bg-')}/60 rounded-full transition-all duration-1000`}
              style={{ width: `${(percentage / 12)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Growth indicator */}
      {data.growth && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${config.color.replace('text-', 'bg-')} animate-pulse`} />
          <span className="text-[10px] font-mono text-white/40">
            Est. {data.growth}% YoY growth
          </span>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

export default function ARRDisplay({
  data,
  variant = "compact",
  showBreakdown = false,
  showGrowth = false,
  animated = true,
}: ARRDisplayProps) {
  switch (variant) {
    case "badge":
      return <BadgeARR data={data} />;
    case "detailed":
      return <DetailedARR data={data} showBreakdown={showBreakdown} showGrowth={showGrowth} />;
    case "chart":
      return <ChartARR data={data} />;
    case "compact":
    default:
      return <CompactARR data={data} animated={animated} />;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// SHOWCASE CARD - Complete example for company showcases
// ──────────────────────────────────────────────────────────────────────────────

interface ShowcaseCardProps {
  company: {
    name: string;
    description: string;
    category: string;
  };
  arr: ARRData;
}

export function CompanyShowcaseCard({ company, arr }: ShowcaseCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const config = TIER_CONFIG[arr.tier];

  return (
    <div className="card rounded-none border border-white/10 overflow-hidden hover:bg-surface-3 transition-all group">
      {/* Top indicator bar - like Bloomberg terminals */}
      <div className={`h-0.5 ${config.color.replace('text-', 'bg-')}`} />

      <div className="p-4">
        {/* Header with company info */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-mono font-bold text-white mb-1 truncate">
              {company.name}
            </h3>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
              {company.category}
            </p>
          </div>
          <div className={`w-1.5 h-1.5 rounded-full ${config.color.replace('text-', 'bg-')} animate-pulse flex-shrink-0 mt-1.5`} />
        </div>

        {/* Description */}
        <p className="text-xs text-white/60 leading-relaxed mb-4 line-clamp-2">
          {company.description}
        </p>

        {/* ARR Display */}
        <div className="space-y-3">
          <ARRDisplay data={arr} variant="compact" animated />

          {/* Toggle details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-[10px] font-mono text-white/40 hover:text-white/60 transition-colors uppercase tracking-wider text-left"
          >
            {showDetails ? "▼ Hide Details" : "▶ Show Details"}
          </button>

          {/* Expandable details */}
          {showDetails && (
            <div className="pt-3 border-t border-white/5 space-y-2 animate-fade-in">
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div>
                  <span className="text-white/40 uppercase tracking-wider block mb-1">Monthly</span>
                  <span className="text-white font-bold tabular-nums">
                    {formatCurrency((arr.monthly || arr.min / 12))}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 uppercase tracking-wider block mb-1">Growth</span>
                  <span className="text-green-400 font-bold tabular-nums">
                    +{arr.growth || 25}%
                  </span>
                </div>
              </div>
              {arr.confidence && (
                <div>
                  <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-1">
                    AI Confidence
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${config.color.replace('text-', 'bg-')} transition-all duration-1000`}
                        style={{ width: `${arr.confidence}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-white/60 tabular-nums">
                      {arr.confidence}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
