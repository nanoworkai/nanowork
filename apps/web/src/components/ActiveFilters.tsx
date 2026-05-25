import { X } from "lucide-react";
import type { FilterState } from "../lib/marketplace";
import { ARR_TIER_CONFIG } from "../lib/marketplace";

type ActiveFiltersProps = {
  filters: FilterState;
  resultCount: number;
  totalCount: number;
  onClearAll: () => void;
  onClearFilter: (filterKey: keyof FilterState) => void;
  onRemoveCategory: (category: string) => void;
  onRemoveStatus: (status: string) => void;
  onRemoveARRTier: (tier: "starter" | "growth" | "scale") => void;
  onRemoveTechStack: (tech: string) => void;
};

/**
 * Active Filters Display Component
 *
 * Shows currently active filters as removable chips
 * Displays result count and clear all functionality
 */

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-2 border border-white/20 hover:border-white/40 text-white text-xs font-mono rounded group transition-colors"
    >
      <span>{label}</span>
      <X className="w-3 h-3 text-white/40 group-hover:text-white" />
    </button>
  );
}

export default function ActiveFilters({
  filters,
  resultCount,
  totalCount,
  onClearAll,
  onClearFilter,
  onRemoveCategory,
  onRemoveStatus,
  onRemoveARRTier,
  onRemoveTechStack,
}: ActiveFiltersProps) {
  const hasActiveFilters =
    filters.search ||
    filters.categories.length > 0 ||
    filters.priceRange !== null ||
    filters.customPriceMin !== null ||
    filters.customPriceMax !== null ||
    filters.arrTiers.length > 0 ||
    (filters.statuses.length > 0 && !(filters.statuses.length === 1 && filters.statuses[0] === "available")) ||
    filters.techStack.length > 0;

  if (!hasActiveFilters) {
    return (
      <div className="py-4 border-b border-white/10">
        <p className="text-sm font-mono text-white/60">
          Showing all <span className="text-white font-bold">{totalCount}</span> businesses
        </p>
      </div>
    );
  }

  return (
    <div className="py-4 border-b border-white/10 space-y-4">
      {/* Result Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-mono text-white/60">
          Found <span className="text-white font-bold">{resultCount}</span> of{" "}
          <span className="text-white/60">{totalCount}</span> businesses
        </p>
        <button
          onClick={onClearAll}
          className="text-xs font-mono text-white/60 hover:text-white transition-colors flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          Clear all filters
        </button>
      </div>

      {/* Active Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {/* Search */}
        {filters.search && (
          <FilterChip
            label={`Search: "${filters.search}"`}
            onRemove={() => onClearFilter("search")}
          />
        )}

        {/* Categories */}
        {filters.categories.map((category) => (
          <FilterChip
            key={category}
            label={`Category: ${category}`}
            onRemove={() => onRemoveCategory(category)}
          />
        ))}

        {/* Price Range */}
        {filters.priceRange && (
          <FilterChip
            label={`Price: ${filters.priceRange.label}`}
            onRemove={() => onClearFilter("priceRange")}
          />
        )}

        {/* Custom Price Range */}
        {(filters.customPriceMin !== null || filters.customPriceMax !== null) && (
          <FilterChip
            label={`Price: $${filters.customPriceMin ?? 0} - $${filters.customPriceMax ?? "∞"}`}
            onRemove={() => onClearFilter("priceRange")}
          />
        )}

        {/* ARR Tiers */}
        {filters.arrTiers.map((tier) => (
          <FilterChip
            key={tier}
            label={`ARR: ${ARR_TIER_CONFIG[tier].label}`}
            onRemove={() => onRemoveARRTier(tier)}
          />
        ))}

        {/* Status */}
        {filters.statuses.length > 0 &&
          !(filters.statuses.length === 1 && filters.statuses[0] === "available") &&
          filters.statuses.map((status) => (
            <FilterChip
              key={status}
              label={`Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`}
              onRemove={() => onRemoveStatus(status)}
            />
          ))}

        {/* Tech Stack */}
        {filters.techStack.map((tech) => (
          <FilterChip
            key={tech}
            label={`Tech: ${tech}`}
            onRemove={() => onRemoveTechStack(tech)}
          />
        ))}
      </div>
    </div>
  );
}
