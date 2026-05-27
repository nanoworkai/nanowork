import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Grid3x3,
  List,
  X,
  Terminal
} from "lucide-react";
import { BUSINESSES } from "../data/businesses";
import { MarketplaceCard } from "../components/MarketplaceCard";
import MarketplaceFilters from "../components/MarketplaceFilters";
import ActiveFilters from "../components/ActiveFilters";
import MarketplaceStats from "../components/MarketplaceStats";
import { useMarketplaceFilters } from "../lib/useMarketplaceFilters";

type ViewMode = "grid" | "list";

export default function Marketplace() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Use the enhanced filter hook with URL sync and localStorage
  const {
    filters,
    results,
    resultCount,
    activeFilterCount,
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
    <div className="min-h-screen bg-surface-0">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface-1/80 backdrop-blur-xl border-b border-fintech-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-fintech-navy hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-fintech-navy flex items-center justify-center">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Nanowork</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-fintech-slate hover:text-fintech-navy transition-colors">
              Home
            </Link>
            <Link to="/pricing" className="text-sm font-medium text-fintech-slate hover:text-fintech-navy transition-colors">
              Pricing
            </Link>
            <Link
              to="/login"
              className="px-5 py-2 bg-fintech-navy text-white text-sm font-medium hover:bg-fintech-navy/90 transition-colors"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold text-fintech-navy tracking-tight mb-6">
            Browse marketplace
          </h1>

          {/* Statistics Dashboard */}
          <div className="mb-6">
            <MarketplaceStats variant="full" />
          </div>

          {/* Search & Controls */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fintech-slate" />
              <input
                type="text"
                placeholder="Search businesses, categories, tech stack..."
                value={filters.search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-surface-1 border border-fintech-border text-fintech-navy placeholder-fintech-slate/40 text-sm focus:outline-none focus:border-fintech-navy transition-colors"
              />
              {filters.search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-fintech-slate hover:text-fintech-navy transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="relative px-4 py-3 bg-surface-1 border border-fintech-border hover:border-fintech-navy text-fintech-navy text-sm font-medium transition-colors flex items-center gap-2 justify-center"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-fintech-navy text-white text-xs font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* View Toggle */}
            <div className="flex border border-fintech-border">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-3 transition-colors ${
                  viewMode === "grid"
                    ? "bg-fintech-navy text-white"
                    : "bg-surface-1 text-fintech-slate hover:text-fintech-navy"
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-3 border-l border-fintech-border transition-colors ${
                  viewMode === "list"
                    ? "bg-fintech-navy text-white"
                    : "bg-surface-1 text-fintech-slate hover:text-fintech-navy"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
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

        {/* Main Layout */}
        <div className="flex gap-6 mt-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="hidden lg:block w-80 flex-shrink-0">
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
          )}

          {/* Mobile Filters Overlay */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-40 bg-fintech-navy/80 backdrop-blur-sm">
              <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-surface-1 border-r border-fintech-border overflow-y-auto">
                <div className="sticky top-0 bg-surface-1 border-b border-fintech-border p-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-fintech-navy">Filters</span>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-fintech-slate hover:text-fintech-navy transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4">
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
                </div>
              </div>
            </div>
          )}

          {/* Business Grid/List */}
          <div className="flex-1 min-w-0">
            {results.length === 0 ? (
              <div className="border border-fintech-border bg-surface-1 p-12 text-center">
                <div className="text-fintech-slate text-sm mb-2">No businesses found</div>
                <button
                  onClick={clearAllFilters}
                  className="text-fintech-navy text-sm font-medium underline hover:no-underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                {/* Grid View */}
                {viewMode === "grid" && (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {results.map((business) => (
                      <MarketplaceCard
                        key={business.slug}
                        business={business}
                        viewMode="grid"
                      />
                    ))}
                  </div>
                )}

                {/* List View */}
                {viewMode === "list" && (
                  <div className="space-y-4">
                    {results.map((business) => (
                      <MarketplaceCard
                        key={business.slug}
                        business={business}
                        viewMode="list"
                      />
                    ))}
                  </div>
                )}

                {/* Results Count */}
                <div className="mt-8 text-center">
                  <span className="text-xs text-fintech-slate">
                    Showing {resultCount} of {BUSINESSES.length} businesses
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
