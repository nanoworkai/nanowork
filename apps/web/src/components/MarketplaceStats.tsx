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
 * Shows key metrics about available businesses in the marketplace
 */

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

  const arrValues = businesses.map(calculateARR).filter(arr => arr > 0);
  const totalARR = arrValues.reduce((sum, arr) => sum + arr, 0);
  const avgARR = arrValues.length > 0 ? totalARR / arrValues.length : 0;

  const prices = businesses.map(b => b.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

  const categoryBreakdown: Record<string, number> = {};
  businesses.forEach(b => {
    const category = b.category.split(' · ')[0];
    categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
  });

  const techStackPopularity: Record<string, number> = {};
  businesses.forEach(b => {
    b.stack.forEach(tech => {
      techStackPopularity[tech] = (techStackPopularity[tech] || 0) + 1;
    });
  });

  const tierBreakdown = { starter: 0, growth: 0, scale: 0 };
  businesses.forEach(b => {
    const arr = calculateARR(b);
    if (arr > 0) {
      const tier = getARRTier(arr);
      tierBreakdown[tier]++;
    }
  });

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

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
  animated?: boolean;
  trend?: "up" | "down" | "neutral";
}

function MetricCard({ icon, label, value, subValue, color = "text-fintech-navy", animated = false, trend }: MetricCardProps) {
  return (
    <div className="border border-fintech-border bg-surface-1 p-4 hover:bg-surface-3 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="text-fintech-slate">{icon}</div>
        {animated && (
          <div className={`w-1.5 h-1.5 ${color.replace('text-', 'bg-')} animate-pulse`} />
        )}
      </div>
      <div className={`text-2xl font-semibold ${color} mb-1 tabular-nums`}>
        {value}
      </div>
      <div className="text-xs text-fintech-slate mb-1">
        {label}
      </div>
      {subValue && (
        <div className="text-xs text-fintech-slate/60 flex items-center gap-1">
          {trend === "up" && <TrendingUp className="w-3 h-3 text-fintech-green" />}
          {trend === "down" && <TrendingUp className="w-3 h-3 text-fintech-red rotate-180" />}
          {subValue}
        </div>
      )}
    </div>
  );
}

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
    <div className="border border-fintech-border bg-surface-1 overflow-hidden">
      <div className="border-b border-fintech-divider px-4 py-2">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-fintech-slate" />
          <span className="text-xs font-semibold text-fintech-navy">
            Recent Activity
          </span>
        </div>
      </div>
      <div className="flex animate-scroll">
        {[...items, ...items].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-6 py-3 border-r border-fintech-divider whitespace-nowrap flex-shrink-0"
          >
            <span className="text-xs font-semibold text-fintech-navy">
              {item.name}
            </span>
            <span className={`text-xs font-medium ${
              item.status === 'available' ? 'text-fintech-green' :
              item.status === 'pending' ? 'text-fintech-amber' :
              'text-fintech-slate'
            }`}>
              {item.status.toUpperCase()}
            </span>
            {item.arr > 0 && (
              <span className="text-xs text-fintech-slate tabular-nums">
                {formatCurrency(item.arr)} ARR
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface CategoryBreakdownProps {
  categories: Record<string, number>;
  total: number;
}

function CategoryBreakdown({ categories, total }: CategoryBreakdownProps) {
  const sorted = Object.entries(categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="border border-fintech-border bg-surface-1 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-4 h-4 text-fintech-slate" />
        <span className="text-xs font-semibold text-fintech-navy">
          Categories
        </span>
      </div>
      <div className="space-y-3">
        {sorted.map(([category, count]) => {
          const percentage = (count / total) * 100;
          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-fintech-slate">{category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-fintech-slate/60 tabular-nums">
                    {count}
                  </span>
                  <span className="text-xs text-fintech-slate/40 tabular-nums">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-surface-0 overflow-hidden">
                <div
                  className="h-full bg-fintech-navy/30 transition-all duration-1000"
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

interface TechStackPopularityProps {
  techStack: Record<string, number>;
}

function TechStackPopularity({ techStack }: TechStackPopularityProps) {
  const sorted = Object.entries(techStack)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  return (
    <div className="border border-fintech-border bg-surface-1 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-fintech-slate" />
        <span className="text-xs font-semibold text-fintech-navy">
          Popular Tech
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {sorted.map(([tech, count]) => (
          <div
            key={tech}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-surface-0 border border-fintech-divider hover:bg-surface-3 transition-colors"
          >
            <span className="text-xs text-fintech-slate">{tech}</span>
            <span className="text-xs font-semibold text-fintech-slate/60 tabular-nums">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ARRBreakdownProps {
  tierBreakdown: { starter: number; growth: number; scale: number };
  total: number;
}

function ARRBreakdown({ tierBreakdown, total }: ARRBreakdownProps) {
  const tiers = [
    { name: 'Starter', count: tierBreakdown.starter, color: 'text-accent', bg: 'bg-accent' },
    { name: 'Growth', count: tierBreakdown.growth, color: 'text-fintech-green', bg: 'bg-fintech-green' },
    { name: 'Scale', count: tierBreakdown.scale, color: 'text-fintech-green', bg: 'bg-fintech-green' },
  ];

  return (
    <div className="border border-fintech-border bg-surface-1 p-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-fintech-slate" />
        <span className="text-xs font-semibold text-fintech-navy">
          ARR Tiers
        </span>
      </div>
      <div className="space-y-3">
        {tiers.map(tier => {
          const percentage = total > 0 ? (tier.count / total) * 100 : 0;
          return (
            <div key={tier.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-semibold ${tier.color}`}>
                  {tier.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-fintech-slate tabular-nums">
                    {tier.count}
                  </span>
                  <span className="text-xs text-fintech-slate/60 tabular-nums">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-surface-0 overflow-hidden">
                <div
                  className={`h-full ${tier.bg} opacity-30 transition-all duration-1000`}
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

interface MarketplaceStatsProps {
  variant?: "full" | "compact" | "horizontal";
  onFilterByCategory?: (category: string) => void;
}

export default function MarketplaceStats({ variant = "full", onFilterByCategory: _onFilterByCategory }: MarketplaceStatsProps) {
  const [metrics, setMetrics] = useState<MarketplaceMetrics | null>(null);
  const [_liveUpdate, setLiveUpdate] = useState(0);

  useEffect(() => {
    const calculated = calculateMetrics(BUSINESSES);
    setMetrics(calculated);

    const interval = setInterval(() => {
      setLiveUpdate(prev => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!metrics) {
    return (
      <div className="border border-fintech-border bg-surface-1 p-8 text-center">
        <div className="text-xs text-fintech-slate animate-pulse">
          Loading marketplace data...
        </div>
      </div>
    );
  }

  if (variant === "horizontal") {
    return (
      <div className="border-b border-fintech-divider bg-surface-1">
        <div className="flex items-center overflow-x-auto">
          <div className="flex items-center gap-3 px-6 py-4 border-r border-fintech-divider whitespace-nowrap">
            <Package className="w-4 h-4 text-fintech-slate" />
            <div>
              <div className="text-xl font-semibold text-fintech-navy tabular-nums">
                {metrics.availableBusinesses}/{metrics.totalBusinesses}
              </div>
              <div className="text-xs text-fintech-slate">AVAILABLE</div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-6 py-4 border-r border-fintech-divider whitespace-nowrap">
            <TrendingUp className="w-4 h-4 text-fintech-green" />
            <div>
              <div className="text-xl font-semibold text-fintech-green tabular-nums">
                {formatCurrency(metrics.totalARR)}
              </div>
              <div className="text-xs text-fintech-slate">TOTAL ARR</div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-6 py-4 border-r border-fintech-divider whitespace-nowrap">
            <DollarSign className="w-4 h-4 text-fintech-slate" />
            <div>
              <div className="text-xl font-semibold text-fintech-navy tabular-nums">
                {formatCurrency(metrics.minPrice)}-{formatCurrency(metrics.maxPrice)}
              </div>
              <div className="text-xs text-fintech-slate">PRICE RANGE</div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-6 py-4 border-r border-fintech-divider whitespace-nowrap">
            <Layers className="w-4 h-4 text-fintech-slate" />
            <div>
              <div className="text-xl font-semibold text-fintech-navy tabular-nums">
                {Object.keys(metrics.categoryBreakdown).length}
              </div>
              <div className="text-xs text-fintech-slate">CATEGORIES</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-6 py-4">
            <div className="w-2 h-2 bg-fintech-green animate-pulse" />
            <span className="text-xs font-medium text-fintech-green">
              LIVE
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="space-y-4">
        <ActivityTicker businesses={metrics.recentlyAdded} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            icon={<Package className="w-4 h-4" />}
            label="Available"
            value={metrics.availableBusinesses}
            subValue={`of ${metrics.totalBusinesses} total`}
            color="text-fintech-green"
            animated
          />
          <MetricCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Total ARR"
            value={formatCurrency(metrics.totalARR)}
            subValue={`Avg ${formatCurrency(metrics.avgARR)}`}
            color="text-fintech-green"
            trend="up"
          />
          <MetricCard
            icon={<DollarSign className="w-4 h-4" />}
            label="Avg Price"
            value={formatCurrency(metrics.avgPrice)}
            subValue={`${formatCurrency(metrics.minPrice)}-${formatCurrency(metrics.maxPrice)}`}
            color="text-fintech-navy"
          />
          <MetricCard
            icon={<Layers className="w-4 h-4" />}
            label="Categories"
            value={Object.keys(metrics.categoryBreakdown).length}
            subValue={`${Object.keys(metrics.techStackPopularity).length} tech stacks`}
            color="text-accent"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-fintech-divider pb-4">
        <div>
          <h2 className="text-lg font-semibold text-fintech-navy mb-1">
            Marketplace Overview
          </h2>
          <p className="text-xs text-fintech-slate">
            Real-time insights on {metrics.totalBusinesses} AI-generated businesses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-fintech-green animate-pulse" />
          <span className="text-xs font-medium text-fintech-green">
            LIVE
          </span>
          <span className="text-xs text-fintech-slate ml-2 tabular-nums">
            {new Date().toLocaleTimeString('en-US', { hour12: false })}
          </span>
        </div>
      </div>

      <ActivityTicker businesses={metrics.recentlyAdded} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<Package className="w-4 h-4" />}
          label="Available Now"
          value={metrics.availableBusinesses}
          subValue={`${metrics.pendingBusinesses} pending`}
          color="text-fintech-green"
          animated
        />
        <MetricCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Total ARR Potential"
          value={formatCurrency(metrics.totalARR)}
          subValue={`Avg ${formatCurrency(metrics.avgARR)}`}
          color="text-fintech-green"
          trend="up"
        />
        <MetricCard
          icon={<DollarSign className="w-4 h-4" />}
          label="Average Price"
          value={formatCurrency(metrics.avgPrice)}
          subValue={`Range ${formatCurrency(metrics.minPrice)}-${formatCurrency(metrics.maxPrice)}`}
          color="text-fintech-navy"
        />
        <MetricCard
          icon={<Clock className="w-4 h-4" />}
          label="Recently Claimed"
          value={metrics.soldBusinesses}
          subValue="in last 30 days"
          color="text-fintech-amber"
        />
      </div>

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
