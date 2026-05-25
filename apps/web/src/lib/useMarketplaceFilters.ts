import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { Business } from "../data/businesses";
import {
  type FilterState,
  type SortOption,
  type PriceRange,
  type ARRTier,
  DEFAULT_FILTERS,
  PRICE_RANGES,
  applyFilters,
  sortBusinesses,
} from "./marketplace";

/**
 * Custom hook for marketplace filter state management
 *
 * Features:
 * - Syncs filter state with URL query parameters
 * - Persists state to localStorage
 * - Provides memoized filtered/sorted results
 * - Performance optimized with useCallback
 */

const STORAGE_KEY = "nanowork_marketplace_filters";

// ──────────────────────────────────────────────────────────────────────────────
// URL SERIALIZATION
// ──────────────────────────────────────────────────────────────────────────────

function filtersToParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) params.set("q", filters.search);
  if (filters.categories.length > 0) params.set("categories", filters.categories.join(","));
  if (filters.priceRange) params.set("priceRange", filters.priceRange.label);
  if (filters.customPriceMin !== null) params.set("minPrice", filters.customPriceMin.toString());
  if (filters.customPriceMax !== null) params.set("maxPrice", filters.customPriceMax.toString());
  if (filters.arrTiers.length > 0) params.set("arrTiers", filters.arrTiers.join(","));
  if (filters.statuses.length > 0 && !arraysEqual(filters.statuses, ["available"])) {
    params.set("statuses", filters.statuses.join(","));
  }
  if (filters.techStack.length > 0) params.set("tech", filters.techStack.join(","));
  if (filters.sortBy !== "recent") params.set("sort", filters.sortBy);

  return params;
}

function paramsToFilters(params: URLSearchParams): Partial<FilterState> {
  const filters: Partial<FilterState> = {};

  const search = params.get("q");
  if (search) filters.search = search;

  const categories = params.get("categories");
  if (categories) filters.categories = categories.split(",").filter(Boolean);

  const priceRangeLabel = params.get("priceRange");
  if (priceRangeLabel) {
    filters.priceRange = PRICE_RANGES.find((r) => r.label === priceRangeLabel) || null;
  }

  const minPrice = params.get("minPrice");
  if (minPrice) filters.customPriceMin = parseInt(minPrice, 10);

  const maxPrice = params.get("maxPrice");
  if (maxPrice) filters.customPriceMax = parseInt(maxPrice, 10);

  const arrTiers = params.get("arrTiers");
  if (arrTiers) filters.arrTiers = arrTiers.split(",") as ARRTier[];

  const statuses = params.get("statuses");
  if (statuses) filters.statuses = statuses.split(",").filter(Boolean);

  const tech = params.get("tech");
  if (tech) filters.techStack = tech.split(",").filter(Boolean);

  const sort = params.get("sort");
  if (sort) filters.sortBy = sort as SortOption;

  return filters;
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, i) => val === sortedB[i]);
}

// ──────────────────────────────────────────────────────────────────────────────
// LOCALSTORAGE
// ──────────────────────────────────────────────────────────────────────────────

function saveFiltersToStorage(filters: FilterState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch (error) {
    console.warn("Failed to save filters to localStorage:", error);
  }
}

function loadFiltersFromStorage(): Partial<FilterState> | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.warn("Failed to load filters from localStorage:", error);
    return null;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// HOOK
// ──────────────────────────────────────────────────────────────────────────────

export function useMarketplaceFilters(businesses: Business[]) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL params, then localStorage, then defaults
  const [filters, setFilters] = useState<FilterState>(() => {
    const urlFilters = paramsToFilters(searchParams);
    const hasUrlParams = Object.keys(urlFilters).length > 0;

    if (hasUrlParams) {
      return { ...DEFAULT_FILTERS, ...urlFilters };
    }

    const storedFilters = loadFiltersFromStorage();
    if (storedFilters) {
      return { ...DEFAULT_FILTERS, ...storedFilters };
    }

    return DEFAULT_FILTERS;
  });

  // Sync filters to URL and localStorage
  useEffect(() => {
    const params = filtersToParams(filters);
    setSearchParams(params, { replace: true });
    saveFiltersToStorage(filters);
  }, [filters, setSearchParams]);

  // Apply filters and sort
  const results = useMemo(() => {
    const filtered = applyFilters(businesses, filters);
    return sortBusinesses(filtered, filters.sortBy);
  }, [businesses, filters]);

  // Update functions
  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setFilters((prev) => {
      const categories = prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories };
    });
  }, []);

  const setPriceRange = useCallback((priceRange: PriceRange | null) => {
    setFilters((prev) => ({
      ...prev,
      priceRange,
      customPriceMin: null,
      customPriceMax: null,
    }));
  }, []);

  const setCustomPriceRange = useCallback((min: number | null, max: number | null) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: null,
      customPriceMin: min,
      customPriceMax: max,
    }));
  }, []);

  const toggleARRTier = useCallback((tier: ARRTier) => {
    setFilters((prev) => {
      const arrTiers = prev.arrTiers.includes(tier)
        ? prev.arrTiers.filter((t) => t !== tier)
        : [...prev.arrTiers, tier];
      return { ...prev, arrTiers };
    });
  }, []);

  const toggleStatus = useCallback((status: string) => {
    setFilters((prev) => {
      const statuses = prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status];
      return { ...prev, statuses };
    });
  }, []);

  const toggleTechStack = useCallback((tech: string) => {
    setFilters((prev) => {
      const techStack = prev.techStack.includes(tech)
        ? prev.techStack.filter((t) => t !== tech)
        : [...prev.techStack, tech];
      return { ...prev, techStack };
    });
  }, []);

  const setSortBy = useCallback((sortBy: SortOption) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const clearFilter = useCallback((filterKey: keyof FilterState) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      switch (filterKey) {
        case "search":
          newFilters.search = "";
          break;
        case "categories":
          newFilters.categories = [];
          break;
        case "priceRange":
          newFilters.priceRange = null;
          newFilters.customPriceMin = null;
          newFilters.customPriceMax = null;
          break;
        case "arrTiers":
          newFilters.arrTiers = [];
          break;
        case "statuses":
          newFilters.statuses = ["available"];
          break;
        case "techStack":
          newFilters.techStack = [];
          break;
        default:
          break;
      }
      return newFilters;
    });
  }, []);

  // Check if filters are active (different from defaults)
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== "" ||
      filters.categories.length > 0 ||
      filters.priceRange !== null ||
      filters.customPriceMin !== null ||
      filters.customPriceMax !== null ||
      filters.arrTiers.length > 0 ||
      !arraysEqual(filters.statuses, ["available"]) ||
      filters.techStack.length > 0
    );
  }, [filters]);

  // Count of active filters (excluding sort)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categories.length > 0) count++;
    if (filters.priceRange || filters.customPriceMin !== null || filters.customPriceMax !== null)
      count++;
    if (filters.arrTiers.length > 0) count++;
    if (!arraysEqual(filters.statuses, ["available"])) count++;
    if (filters.techStack.length > 0) count++;
    return count;
  }, [filters]);

  return {
    filters,
    results,
    resultCount: results.length,
    hasActiveFilters,
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
  };
}
