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
      <header className="sticky top-0 z-50 bg-surface-0 border-b border-white/10">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white hover:opacity-70 transition-opacity">
            <div className="w-6 h-6 rounded-none bg-white flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="text-sm font-mono font-bold uppercase tracking-wider">Nanowork</span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className="px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider text-white/60 hover:text-white transition-colors"
            >
              Home
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-mono font-bold text-white/40 uppercase tracking-wider">
              Marketplace
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-mono font-bold text-white uppercase tracking-tight mb-6">
            All Businesses
          </h1>

          {/* Statistics Dashboard */}
          <div className="mb-6">
            <MarketplaceStats variant="full" />
          </div>

          {/* Search & Controls */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search businesses, categories, tech stack..."
                value={filters.search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-surface-2 border border-white/10 text-white placeholder-white/40 font-mono text-sm focus:outline-none focus:border-white/30 transition-colors"
              />
              {filters.search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="relative px-4 py-3 bg-surface-2 border border-white/10 hover:border-white/30 text-white font-mono text-sm transition-colors flex items-center gap-2 justify-center"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-black text-xs font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* View Toggle */}
            <div className="flex border border-white/10">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-3 transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-black"
                    : "bg-surface-2 text-white/60 hover:text-white"
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-3 border-l border-white/10 transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-black"
                    : "bg-surface-2 text-white/60 hover:text-white"
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
            <div className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm">
              <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-surface-1 border-r border-white/10 overflow-y-auto">
                <div className="sticky top-0 bg-surface-1 border-b border-white/10 p-4 flex items-center justify-between">
                  <span className="text-sm font-mono font-bold text-white uppercase">Filters</span>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-white/60 hover:text-white transition-colors"
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
              <div className="card rounded-none p-12 text-center">
                <div className="text-white/40 font-mono text-sm mb-2">No businesses found</div>
                <button
                  onClick={clearAllFilters}
                  className="text-white font-mono text-sm underline hover:no-underline"
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
                  <span className="text-xs font-mono text-white/40">
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
