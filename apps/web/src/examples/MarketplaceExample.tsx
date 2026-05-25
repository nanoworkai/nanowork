/**
 * Marketplace Filter Example
 *
 * This file demonstrates how to use the marketplace filter system.
 * Copy this pattern to integrate filtering into any page.
 */

import { useEffect } from "react";
import { BUSINESSES } from "../data/businesses";
import { useMarketplaceFilters } from "../lib/useMarketplaceFilters";
import MarketplaceFilters from "../components/MarketplaceFilters";
import ActiveFilters from "../components/ActiveFilters";
import HighlightedText from "../components/HighlightedText";

export default function MarketplaceExample() {
  // Step 1: Initialize the filter hook with your data
  const {
    filters,          // Current filter state
    results,          // Filtered and sorted businesses
    resultCount,      // Number of results
    // Filter update methods
    setSearch,
    toggleCategory,
    setPriceRange,
    setCustomPriceRange,
    toggleARRTier,
    toggleStatus,
    toggleTechStack,
    setSortBy,
    clearAllFilters,
    clearFilter,
  } = useMarketplaceFilters(BUSINESSES);

  return (
    <div className="min-h-screen bg-surface-0 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-mono font-bold text-white mb-8">
          Marketplace Filter Example
        </h1>

        <div className="grid grid-cols-[320px_1fr] gap-8">
          {/* Step 2: Add the filter sidebar */}
          <aside>
            <MarketplaceFilters
              businesses={BUSINESSES}
              filters={filters}
              onSearchChange={setSearch}
              onToggleCategory={toggleCategory}
              onSetPriceRange={setPriceRange}
              onSetCustomPriceRange={setCustomPriceRange}
              onToggleARRTier={toggleARRTier}
              onToggleStatus={toggleStatus}
              onToggleTechStack={toggleTechStack}
              onSetSortBy={setSortBy}
            />
          </aside>

          <main className="space-y-6">
            {/* Step 3: Add the active filters display */}
            <ActiveFilters
              filters={filters}
              resultCount={resultCount}
              totalCount={BUSINESSES.length}
              onClearAll={clearAllFilters}
              onClearFilter={clearFilter}
              onRemoveCategory={toggleCategory}
              onRemoveStatus={toggleStatus}
              onRemoveARRTier={toggleARRTier}
              onRemoveTechStack={toggleTechStack}
            />

            {/* Step 4: Display filtered results */}
            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map((business) => (
                  <div
                    key={business.slug}
                    className="bg-surface-1 border border-white/10 p-6"
                  >
                    {/* Use HighlightedText to show search matches */}
                    <HighlightedText
                      text={business.name}
                      searchQuery={filters.search}
                      className="text-xl font-mono font-bold text-white"
                    />

                    <HighlightedText
                      text={business.tagline}
                      searchQuery={filters.search}
                      className="text-sm text-white/70 mt-1"
                    />

                    <div className="mt-4 flex items-center gap-4 text-xs font-mono">
                      <span className="text-white/40">
                        Price: <span className="text-white">${business.price.toLocaleString()}</span>
                      </span>
                      {business.mrr && (
                        <span className="text-white/40">
                          MRR: <span className="text-white">{business.mrr}</span>
                        </span>
                      )}
                      <span className="text-white/40">
                        Status: <span className="text-white capitalize">{business.status}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-surface-1 border border-white/10 p-12 text-center">
                <p className="text-white/60 font-mono mb-4">
                  No businesses match your filters
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-white text-black font-mono font-bold uppercase text-sm hover:bg-white/90 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/**
 * ADVANCED USAGE
 */

// 1. Programmatically set filters
export function ProgrammaticFilterExample() {
  const { setSearch, toggleCategory, setSortBy } = useMarketplaceFilters(BUSINESSES);

  const handlePresetFilter = () => {
    setSearch("saas");
    toggleCategory("SaaS");
    setSortBy("arr-desc");
  };

  return (
    <button onClick={handlePresetFilter}>
      Show High-ARR SaaS Businesses
    </button>
  );
}

// 2. Monitor filter changes
export function FilterChangeListenerExample() {
  const { filters, resultCount } = useMarketplaceFilters(BUSINESSES);

  // React to filter changes
  useEffect(() => {
    console.log("Filters changed:", filters);
    console.log("Result count:", resultCount);
  }, [filters, resultCount]);

  return <div>Monitoring filters...</div>;
}

// 3. Custom filter combinations
export function CustomFilterExample() {
  const { toggleCategory, toggleStatus, setPriceRange } = useMarketplaceFilters(BUSINESSES);

  const showAffordableAvailableSaaS = () => {
    toggleCategory("SaaS");
    toggleStatus("available");
    setPriceRange({ min: 0, max: 5000, label: "Under $5K" });
  };

  return (
    <button onClick={showAffordableAvailableSaaS}>
      Show Affordable Available SaaS
    </button>
  );
}

// 4. Share filtered URLs
export function ShareableURLExample() {
  const currentURL = window.location.href; // Already includes filter params!

  return (
    <button onClick={() => navigator.clipboard.writeText(currentURL)}>
      Copy Filtered Link
    </button>
  );
}

// 5. Access raw filter utilities - use these directly without the hook
export {
  searchBusinesses,
  sortBusinesses,
  getUniqueCategories,
} from "../lib/marketplace";
