import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  DollarSign,
  TrendingUp,
  Package,
  CheckCircle2,
} from "lucide-react";
import type { Business } from "../data/businesses";
import {
  type FilterState,
  type SortOption,
  PRICE_RANGES,
  ARR_TIER_CONFIG,
  getUniqueCategories,
  getUniqueTechStack,
  getStatusCounts,
} from "../lib/marketplace";

type MarketplaceFiltersProps = {
  businesses: Business[];
  filters: FilterState;
  onSearchChange: (search: string) => void;
  onToggleCategory: (category: string) => void;
  onSetPriceRange: (range: (typeof PRICE_RANGES)[number] | null) => void;
  onSetCustomPriceRange: (min: number | null, max: number | null) => void;
  onToggleARRTier: (tier: "starter" | "growth" | "scale") => void;
  onToggleStatus: (status: string) => void;
  onToggleTechStack: (tech: string) => void;
  onSetSortBy: (sort: SortOption) => void;
};

// ──────────────────────────────────────────────────────────────────────────────
// COLLAPSIBLE SECTION
// ──────────────────────────────────────────────────────────────────────────────

function FilterSection({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-fintech-divider">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="text-fintech-slate">{icon}</div>
          <span className="text-sm font-medium text-fintech-navy">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-fintech-slate" />
        ) : (
          <ChevronDown className="w-4 h-4 text-fintech-slate" />
        )}
      </button>
      {isOpen && <div className="p-4 pt-0">{children}</div>}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// CHECKBOX ITEM
// ──────────────────────────────────────────────────────────────────────────────

function CheckboxItem({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center justify-between p-2 hover:bg-surface-3 cursor-pointer group">
      <div className="flex items-center gap-2">
        <div
          className={`w-4 h-4 border flex items-center justify-center transition-colors ${
            checked
              ? "bg-fintech-navy border-fintech-navy"
              : "border-fintech-border group-hover:border-fintech-navy"
          }`}
        >
          {checked && <CheckCircle2 className="w-3 h-3 text-white" />}
        </div>
        <span className="text-sm text-fintech-slate group-hover:text-fintech-navy">{label}</span>
      </div>
      {count !== undefined && (
        <span className="text-xs text-fintech-slate/60 tabular-nums">{count}</span>
      )}
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
    </label>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

export default function MarketplaceFilters({
  businesses,
  filters,
  onSearchChange,
  onToggleCategory,
  onSetPriceRange,
  onSetCustomPriceRange,
  onToggleARRTier,
  onToggleStatus,
  onToggleTechStack,
  onSetSortBy,
}: MarketplaceFiltersProps) {
  const [customMin, setCustomMin] = useState("");
  const [customMax, setCustomMax] = useState("");

  const categories = getUniqueCategories(businesses);
  const techStack = getUniqueTechStack(businesses);
  const statusCounts = getStatusCounts(businesses);

  const handleCustomPriceApply = () => {
    const min = customMin ? parseInt(customMin, 10) : null;
    const max = customMax ? parseInt(customMax, 10) : null;
    onSetCustomPriceRange(min, max);
  };

  return (
    <div className="w-full bg-surface-1 border border-fintech-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-fintech-divider">
        <div className="flex items-center gap-2 mb-1">
          <SlidersHorizontal className="w-4 h-4 text-fintech-slate" />
          <h2 className="text-sm font-semibold text-fintech-navy">
            Filters
          </h2>
        </div>
        <p className="text-xs text-fintech-slate">Refine your search</p>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-fintech-divider">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fintech-slate" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search businesses..."
            className="w-full pl-10 pr-4 py-2 bg-surface-0 border border-fintech-border text-fintech-navy text-sm placeholder:text-fintech-slate/40 focus:border-fintech-navy focus:outline-none"
          />
          {filters.search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-fintech-slate hover:text-fintech-navy"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sort */}
      <div className="p-4 border-b border-fintech-divider">
        <label className="block text-xs font-medium text-fintech-slate mb-2">
          Sort by
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => onSetSortBy(e.target.value as SortOption)}
          className="w-full px-3 py-2 bg-surface-0 border border-fintech-border text-fintech-navy text-sm focus:border-fintech-navy focus:outline-none cursor-pointer"
        >
          <option value="recent">Recently Added</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="arr-desc">ARR: Highest First</option>
          <option value="arr-asc">ARR: Lowest First</option>
          <option value="alphabetical">Alphabetical A-Z</option>
          <option value="status">Status (Available First)</option>
        </select>
      </div>

      {/* Scrollable Filters */}
      <div className="flex-1 overflow-y-auto">
        {/* Categories */}
        <FilterSection title="Category" icon={<Package className="w-4 h-4" />}>
          <div className="space-y-1">
            {categories.map(({ value, count }) => (
              <CheckboxItem
                key={value}
                label={value}
                count={count}
                checked={filters.categories.includes(value)}
                onChange={() => onToggleCategory(value)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection title="Price Range" icon={<DollarSign className="w-4 h-4" />}>
          <div className="space-y-3">
            {/* Preset Ranges */}
            <div className="space-y-1">
              {PRICE_RANGES.map((range) => (
                <CheckboxItem
                  key={range.label}
                  label={range.label}
                  checked={filters.priceRange?.label === range.label}
                  onChange={() =>
                    onSetPriceRange(
                      filters.priceRange?.label === range.label ? null : range
                    )
                  }
                />
              ))}
            </div>

            {/* Custom Range */}
            <div className="pt-3 border-t border-fintech-divider">
              <label className="block text-xs font-medium text-fintech-slate mb-2">
                Custom Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={customMin}
                  onChange={(e) => setCustomMin(e.target.value)}
                  className="flex-1 px-2 py-1.5 bg-surface-0 border border-fintech-border text-fintech-navy text-xs placeholder:text-fintech-slate/40 focus:border-fintech-navy focus:outline-none"
                />
                <span className="text-fintech-slate">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={customMax}
                  onChange={(e) => setCustomMax(e.target.value)}
                  className="flex-1 px-2 py-1.5 bg-surface-0 border border-fintech-border text-fintech-navy text-xs placeholder:text-fintech-slate/40 focus:border-fintech-navy focus:outline-none"
                />
              </div>
              <button
                onClick={handleCustomPriceApply}
                className="mt-2 w-full px-3 py-1.5 bg-fintech-navy text-white text-xs font-medium hover:bg-fintech-navy/90 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </FilterSection>

        {/* ARR Tier */}
        <FilterSection title="ARR Tier" icon={<TrendingUp className="w-4 h-4" />}>
          <div className="space-y-1">
            {(Object.entries(ARR_TIER_CONFIG) as [keyof typeof ARR_TIER_CONFIG, typeof ARR_TIER_CONFIG[keyof typeof ARR_TIER_CONFIG]][]).map(
              ([tier, config]) => (
                <CheckboxItem
                  key={tier}
                  label={config.label}
                  checked={filters.arrTiers.includes(tier)}
                  onChange={() => onToggleARRTier(tier)}
                />
              )
            )}
          </div>
        </FilterSection>

        {/* Status */}
        <FilterSection title="Status" icon={<CheckCircle2 className="w-4 h-4" />}>
          <div className="space-y-1">
            <CheckboxItem
              label="Available"
              count={statusCounts.available}
              checked={filters.statuses.includes("available")}
              onChange={() => onToggleStatus("available")}
            />
            <CheckboxItem
              label="Pending"
              count={statusCounts.pending}
              checked={filters.statuses.includes("pending")}
              onChange={() => onToggleStatus("pending")}
            />
            <CheckboxItem
              label="Sold"
              count={statusCounts.sold}
              checked={filters.statuses.includes("sold")}
              onChange={() => onToggleStatus("sold")}
            />
          </div>
        </FilterSection>

        {/* Tech Stack */}
        <FilterSection title="Tech Stack" icon={<Package className="w-4 h-4" />} defaultOpen={false}>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {techStack.map(({ value, count }) => (
              <CheckboxItem
                key={value}
                label={value}
                count={count}
                checked={filters.techStack.includes(value)}
                onChange={() => onToggleTechStack(value)}
              />
            ))}
          </div>
        </FilterSection>
      </div>
    </div>
  );
}
