import { useEffect, useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  Zap,
  Clock,
  Activity,
  BarChart3,
} from "lucide-react";
import { BUSINESSES, type Business } from "../data/businesses";

/**
 * Marketplace Statistics Dashboard
 *
 * Bloomberg Terminal-style statistics header showing key metrics
 * about available businesses in the marketplace.
 *
 * Design Principles:
 * - Data-dense terminal aesthetic
 * - Live indicators and animations
 * - Monospace typography
 * - Color-coded metrics
 * - Instant insights at a glance
 */

// ──────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ──────────────────────────────────────────────────────────────────────────────

interface MarketplaceMetrics {
  totalBusinesses: number;
  availableBusinesses: number;
  pendingBusinesses: number;
  soldBusinesses: number;
  totalARR: number;
  avgARR: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  categoryBreakdown: Record<string, number>;
  techStackPopularity: Record<string, number>;
  recentlyAdded: Business[];
  recentlyClaimed: Business[];
  tierBreakdown: {
    starter: number;
    growth: number;
    scale: number;
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// CALCULATION UTILITIES
// ──────────────────────────────────────────────────────────────────────────────

function calculateARR(business: Business): number {
  if (!business.mrr) return 0;
  const monthly = parseFloat(business.mrr.replace(/[^0-9.]/g, ''));
  return monthly * 12;
}

function getARRTier(arr: number): 'starter' | 'growth' | 'scale' {
  if (arr >= 100000) return 'scale';
  if (arr >= 20000) return 'growth';
  return 'starter';
}

function calculateMetrics(businesses: Business[]): MarketplaceMetrics {
  const available = businesses.filter(b => b.status === "available");
  const pending = businesses.filter(b => b.status === "pending");
  const sold = businesses.filter(b => b.status === "sold");

  // ARR calculations
  const arrValues = businesses.map(calculateARR).filter(arr => arr > 0);
  const totalARR = arrValues.reduce((sum, arr) => sum + arr, 0);
  const avgARR = arrValues.length > 0 ? totalARR / arrValues.length : 0;

  // Price calculations
  const prices = businesses.map(b => b.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

  // Category breakdown
  const categoryBreakdown: Record<string, number> = {};
  businesses.forEach(b => {
    const category = b.category.split(' · ')[0]; // Extract main category
    categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
  });

  // Tech stack popularity
  const techStackPopularity: Record<string, number> = {};
  businesses.forEach(b => {
    b.stack.forEach(tech => {
      techStackPopularity[tech] = (techStackPopularity[tech] || 0) + 1;
    });
  });

  // Tier breakdown
  const tierBreakdown = { starter: 0, growth: 0, scale: 0 };
  businesses.forEach(b => {
    const arr = calculateARR(b);
    if (arr > 0) {
      const tier = getARRTier(arr);
      tierBreakdown[tier]++;
    }
  });

  // Sort businesses by slug for consistency (simulate recency)
  const recentlyAdded = [...businesses].slice(0, 3);
  const recentlyClaimed = sold.slice(0, 2);

  return {
    totalBusinesses: businesses.length,
    availableBusinesses: available.length,
    pendingBusinesses: pending.length,
    soldBusinesses: sold.length,
    totalARR,
    avgARR,
    minPrice,
    maxPrice,
    avgPrice,
    categoryBreakdown,
    techStackPopularity,
    recentlyAdded,
    recentlyClaimed,
    tierBreakdown,
  };
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

// ──────────────────────────────────────────────────────────────────────────────
// METRIC CARD COMPONENTS
// ──────────────────────────────────────────────────────────────────────────────

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
  animated?: boolean;
  trend?: "up" | "down" | "neutral";
}

function MetricCard({ icon, label, value, subValue, color = "text-white", animated = false, trend }: MetricCardProps) {
  return (
    <div className="border border-white/10 bg-surface-2 p-4 hover:bg-surface-3 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="text-white/40">{icon}</div>
        {animated && (
          <div className={`w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')} animate-pulse`} />
        )}
      </div>
      <div className={`text-2xl font-mono font-bold ${color} mb-1 tabular-nums`}>
        {value}
      </div>
      <div className="text-xs font-mono text-white/40 uppercase tracking-wider mb-1">
        {label}
      </div>
      {subValue && (
        <div className="text-xs font-mono text-white/60 flex items-center gap-1">
          {trend === "up" && <TrendingUp className="w-3 h-3 text-green-400" />}
          {trend === "down" && <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />}
          {subValue}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// TICKER COMPONENT - Scrolling recent activity
// ──────────────────────────────────────────────────────────────────────────────

interface ActivityTickerProps {
  businesses: Business[];
}

function ActivityTicker({ businesses }: ActivityTickerProps) {
  const items = businesses.slice(0, 5).map(b => ({
    name: b.name,
    status: b.status,
    arr: calculateARR(b),
  }));

  return (
    <div className="border border-white/10 bg-surface-1 overflow-hidden">
      <div className="border-b border-white/5 px-4 py-2">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-white/40" />
          <span className="text-xs font-mono font-bold text-white/60 uppercase tracking-wider">
            Recent Activity
          </span>
        </div>
      </div>
      <div className="flex animate-scroll">
        {[...items, ...items].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-6 py-3 border-r border-white/5 whitespace-nowrap flex-shrink-0"
          >
            <span className="text-xs font-mono font-bold text-white">
              {item.name}
            </span>
            <span className={`text-xs font-mono ${
              item.status === 'available' ? 'text-green-400' :
              item.status === 'pending' ? 'text-amber-400' :
              'text-white/40'
            }`}>
              {item.status.toUpperCase()}
            </span>
            {item.arr > 0 && (
              <span className="text-xs font-mono text-white/60 tabular-nums">
                {formatCurrency(item.arr)} ARR
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// CATEGORY BREAKDOWN COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

interface CategoryBreakdownProps {
  categories: Record<string, number>;
  total: number;
}

function CategoryBreakdown({ categories, total }: CategoryBreakdownProps) {
  const sorted = Object.entries(categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="border border-white/10 bg-surface-2 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-4 h-4 text-white/40" />
        <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
          Categories
        </span>
      </div>
      <div className="space-y-3">
        {sorted.map(([category, count]) => {
          const percentage = (count / total) * 100;
          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono text-white/70">{category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-white/40 tabular-nums">
                    {count}
                  </span>
                  <span className="text-xs font-mono text-white/30 tabular-nums">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/30 rounded-full transition-all duration-1000"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// TECH STACK POPULARITY COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

interface TechStackPopularityProps {
  techStack: Record<string, number>;
}

function TechStackPopularity({ techStack }: TechStackPopularityProps) {
  const sorted = Object.entries(techStack)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  return (
    <div className="border border-white/10 bg-surface-2 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-white/40" />
        <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
          Popular Tech
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {sorted.map(([tech, count]) => (
          <div
            key={tech}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <span className="text-xs font-mono text-white/70">{tech}</span>
            <span className="text-xs font-mono font-bold text-white/40 tabular-nums">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ARR BREAKDOWN BY TIER
// ──────────────────────────────────────────────────────────────────────────────

interface ARRBreakdownProps {
  tierBreakdown: { starter: number; growth: number; scale: number };
  total: number;
}

function ARRBreakdown({ tierBreakdown, total }: ARRBreakdownProps) {
  const tiers = [
    { name: 'Starter', count: tierBreakdown.starter, color: 'text-blue-400', bg: 'bg-blue-400' },
    { name: 'Growth', count: tierBreakdown.growth, color: 'text-green-400', bg: 'bg-green-400' },
    { name: 'Scale', count: tierBreakdown.scale, color: 'text-emerald-400', bg: 'bg-emerald-400' },
  ];

  return (
    <div className="border border-white/10 bg-surface-2 p-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-white/40" />
        <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
          ARR Tiers
        </span>
      </div>
      <div className="space-y-3">
        {tiers.map(tier => {
          const percentage = total > 0 ? (tier.count / total) * 100 : 0;
          return (
            <div key={tier.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-mono font-bold ${tier.color}`}>
                  {tier.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-white/70 tabular-nums">
                    {tier.count}
                  </span>
                  <span className="text-xs font-mono text-white/40 tabular-nums">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${tier.bg} rounded-full transition-all duration-1000`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN MARKETPLACE STATS COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

interface MarketplaceStatsProps {
  variant?: "full" | "compact" | "horizontal";
  onFilterByCategory?: (category: string) => void;
}

export default function MarketplaceStats({ variant = "full", onFilterByCategory: _onFilterByCategory }: MarketplaceStatsProps) {
  const [metrics, setMetrics] = useState<MarketplaceMetrics | null>(null);
  const [_liveUpdate, setLiveUpdate] = useState(0);

  useEffect(() => {
    // Calculate initial metrics
    const calculated = calculateMetrics(BUSINESSES);
    setMetrics(calculated);

    // Simulate live updates every 5 seconds
    const interval = setInterval(() => {
      setLiveUpdate(prev => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!metrics) {
    return (
      <div className="border border-white/10 bg-surface-1 p-8 text-center">
        <div className="text-xs font-mono text-white/40 uppercase tracking-wider animate-pulse">
          Loading marketplace data...
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // VARIANT: HORIZONTAL - Compact stats bar above grid
  // ──────────────────────────────────────────────────────────────────────────────

  if (variant === "horizontal") {
    return (
      <div className="border-b border-white/10 bg-surface-1">
        <div className="flex items-center overflow-x-auto">
          {/* Total Businesses */}
          <div className="flex items-center gap-3 px-6 py-4 border-r border-white/10 whitespace-nowrap">
            <Package className="w-4 h-4 text-white/40" />
            <div>
              <div className="text-xl font-mono font-bold text-white tabular-nums">
                {metrics.availableBusinesses}/{metrics.totalBusinesses}
              </div>
              <div className="text-xs font-mono text-white/40">AVAILABLE</div>
            </div>
          </div>

          {/* Total ARR */}
          <div className="flex items-center gap-3 px-6 py-4 border-r border-white/10 whitespace-nowrap">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <div>
              <div className="text-xl font-mono font-bold text-green-400 tabular-nums">
                {formatCurrency(metrics.totalARR)}
              </div>
              <div className="text-xs font-mono text-white/40">TOTAL ARR</div>
            </div>
          </div>

          {/* Price Range */}
          <div className="flex items-center gap-3 px-6 py-4 border-r border-white/10 whitespace-nowrap">
            <DollarSign className="w-4 h-4 text-white/40" />
            <div>
              <div className="text-xl font-mono font-bold text-white tabular-nums">
                {formatCurrency(metrics.minPrice)}-{formatCurrency(metrics.maxPrice)}
              </div>
              <div className="text-xs font-mono text-white/40">PRICE RANGE</div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-3 px-6 py-4 border-r border-white/10 whitespace-nowrap">
            <Layers className="w-4 h-4 text-white/40" />
            <div>
              <div className="text-xl font-mono font-bold text-white tabular-nums">
                {Object.keys(metrics.categoryBreakdown).length}
              </div>
              <div className="text-xs font-mono text-white/40">CATEGORIES</div>
            </div>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2 px-6 py-4">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-mono text-green-400 uppercase tracking-wider">
              LIVE
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // VARIANT: COMPACT - Grid of metric cards
  // ──────────────────────────────────────────────────────────────────────────────

  if (variant === "compact") {
    return (
      <div className="space-y-4">
        {/* Ticker */}
        <ActivityTicker businesses={metrics.recentlyAdded} />

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            icon={<Package className="w-4 h-4" />}
            label="Available"
            value={metrics.availableBusinesses}
            subValue={`of ${metrics.totalBusinesses} total`}
            color="text-green-400"
            animated
          />
          <MetricCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Total ARR"
            value={formatCurrency(metrics.totalARR)}
            subValue={`Avg ${formatCurrency(metrics.avgARR)}`}
            color="text-emerald-400"
            trend="up"
          />
          <MetricCard
            icon={<DollarSign className="w-4 h-4" />}
            label="Avg Price"
            value={formatCurrency(metrics.avgPrice)}
            subValue={`${formatCurrency(metrics.minPrice)}-${formatCurrency(metrics.maxPrice)}`}
            color="text-white"
          />
          <MetricCard
            icon={<Layers className="w-4 h-4" />}
            label="Categories"
            value={Object.keys(metrics.categoryBreakdown).length}
            subValue={`${Object.keys(metrics.techStackPopularity).length} tech stacks`}
            color="text-blue-400"
          />
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // VARIANT: FULL - Complete dashboard
  // ──────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header with live indicator */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-mono font-bold text-white uppercase tracking-tight mb-1">
            Marketplace Overview
          </h2>
          <p className="text-xs font-mono text-white/60">
            Real-time insights on {metrics.totalBusinesses} AI-generated businesses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-mono text-green-400 uppercase tracking-wider">
            LIVE
          </span>
          <span className="text-xs font-mono text-white/40 ml-2 tabular-nums">
            {new Date().toLocaleTimeString('en-US', { hour12: false })}
          </span>
        </div>
      </div>

      {/* Activity Ticker */}
      <ActivityTicker businesses={metrics.recentlyAdded} />

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<Package className="w-4 h-4" />}
          label="Available Now"
          value={metrics.availableBusinesses}
          subValue={`${metrics.pendingBusinesses} pending`}
          color="text-green-400"
          animated
        />
        <MetricCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Total ARR Potential"
          value={formatCurrency(metrics.totalARR)}
          subValue={`Avg ${formatCurrency(metrics.avgARR)}`}
          color="text-emerald-400"
          trend="up"
        />
        <MetricCard
          icon={<DollarSign className="w-4 h-4" />}
          label="Average Price"
          value={formatCurrency(metrics.avgPrice)}
          subValue={`Range ${formatCurrency(metrics.minPrice)}-${formatCurrency(metrics.maxPrice)}`}
          color="text-white"
        />
        <MetricCard
          icon={<Clock className="w-4 h-4" />}
          label="Recently Claimed"
          value={metrics.soldBusinesses}
          subValue="in last 30 days"
          color="text-amber-400"
        />
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CategoryBreakdown
          categories={metrics.categoryBreakdown}
          total={metrics.totalBusinesses}
        />
        <ARRBreakdown
          tierBreakdown={metrics.tierBreakdown}
          total={Object.values(metrics.tierBreakdown).reduce((a, b) => a + b, 0)}
        />
        <TechStackPopularity techStack={metrics.techStackPopularity} />
      </div>
    </div>
  );
}
