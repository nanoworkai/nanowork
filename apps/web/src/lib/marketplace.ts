import type { Business } from "../data/businesses";

/**
 * Marketplace Search, Filter, and Sort Utilities
 *
 * High-performance utilities for the marketplace page.
 * Includes fuzzy search, multi-filter composition, and various sort strategies.
 */

// ──────────────────────────────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────────────────────────────

export type PriceRange = {
  min: number;
  max: number;
  label: string;
};

export type ARRTier = "starter" | "growth" | "scale";

export type SortOption =
  | "price-asc"
  | "price-desc"
  | "arr-desc"
  | "arr-asc"
  | "recent"
  | "alphabetical"
  | "status";

export type FilterState = {
  search: string;
  categories: string[];
  priceRange: PriceRange | null;
  customPriceMin: number | null;
  customPriceMax: number | null;
  arrTiers: ARRTier[];
  statuses: string[];
  techStack: string[];
  sortBy: SortOption;
};

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  categories: [],
  priceRange: null,
  customPriceMin: null,
  customPriceMax: null,
  arrTiers: [],
  statuses: ["available"],
  techStack: [],
  sortBy: "recent",
};

// ──────────────────────────────────────────────────────────────────────────────
// PREDEFINED RANGES
// ──────────────────────────────────────────────────────────────────────────────

export const PRICE_RANGES: PriceRange[] = [
  { min: 0, max: 3000, label: "Under $3K" },
  { min: 3000, max: 5000, label: "$3K - $5K" },
  { min: 5000, max: 10000, label: "$5K - $10K" },
  { min: 10000, max: Infinity, label: "Over $10K" },
];

export const ARR_TIER_CONFIG = {
  starter: { min: 0, max: 20000, label: "Starter (<$20K/year)" },
  growth: { min: 20000, max: 100000, label: "Growth ($20K-$100K/year)" },
  scale: { min: 100000, max: Infinity, label: "Scale (>$100K/year)" },
};

// ──────────────────────────────────────────────────────────────────────────────
// SEARCH - Fuzzy matching with term highlighting
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Calculate Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Check if a search term fuzzy matches a target string
 * Allows 1 character difference per 4 characters
 */
function fuzzyMatch(search: string, target: string): boolean {
  const searchLower = search.toLowerCase();
  const targetLower = target.toLowerCase();

  // Exact substring match
  if (targetLower.includes(searchLower)) return true;

  // Fuzzy match - allow 1 error per 4 characters
  const maxDistance = Math.floor(search.length / 4) + 1;
  const words = targetLower.split(/\s+/);

  return words.some((word) => {
    if (word.length < search.length - maxDistance) return false;
    const distance = levenshteinDistance(searchLower, word);
    return distance <= maxDistance;
  });
}

/**
 * Search businesses by name, tagline, description, and tech stack
 */
export function searchBusinesses(businesses: Business[], query: string): Business[] {
  if (!query.trim()) return businesses;

  const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);

  return businesses.filter((business) => {
    const searchableText = [
      business.name,
      business.tagline,
      business.description,
      business.category,
      ...business.stack,
    ].join(" ");

    return searchTerms.every((term) => fuzzyMatch(term, searchableText));
  });
}

/**
 * Get highlighted matches for display
 */
export function getSearchMatches(text: string, query: string): { text: string; highlight: boolean }[] {
  if (!query.trim()) return [{ text, highlight: false }];

  const searchLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  const matches: { text: string; highlight: boolean }[] = [];

  let lastIndex = 0;
  let index = textLower.indexOf(searchLower);

  while (index !== -1) {
    if (index > lastIndex) {
      matches.push({ text: text.slice(lastIndex, index), highlight: false });
    }
    matches.push({ text: text.slice(index, index + searchLower.length), highlight: true });
    lastIndex = index + searchLower.length;
    index = textLower.indexOf(searchLower, lastIndex);
  }

  if (lastIndex < text.length) {
    matches.push({ text: text.slice(lastIndex), highlight: false });
  }

  return matches.length > 0 ? matches : [{ text, highlight: false }];
}

// ──────────────────────────────────────────────────────────────────────────────
// FILTERS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Get ARR value in annual dollars from MRR string
 */
function getARRValue(mrr: string | undefined): number {
  if (!mrr) return 0;
  const monthly = parseFloat(mrr.replace(/[^0-9.]/g, ""));
  return monthly * 12;
}

/**
 * Get ARR tier for a business
 */
export function getARRTier(business: Business): ARRTier | null {
  const arr = getARRValue(business.mrr);
  if (arr >= ARR_TIER_CONFIG.scale.min) return "scale";
  if (arr >= ARR_TIER_CONFIG.growth.min) return "growth";
  if (arr > 0) return "starter";
  return null;
}

/**
 * Filter by category (multi-select, OR logic)
 */
export function filterByCategory(businesses: Business[], categories: string[]): Business[] {
  if (categories.length === 0) return businesses;
  return businesses.filter((b) =>
    categories.some((cat) => b.category.toLowerCase().includes(cat.toLowerCase()))
  );
}

/**
 * Filter by price range
 */
export function filterByPrice(
  businesses: Business[],
  range: PriceRange | null,
  customMin: number | null,
  customMax: number | null
): Business[] {
  if (customMin !== null || customMax !== null) {
    const min = customMin ?? 0;
    const max = customMax ?? Infinity;
    return businesses.filter((b) => b.price >= min && b.price <= max);
  }

  if (!range) return businesses;
  return businesses.filter((b) => b.price >= range.min && b.price < range.max);
}

/**
 * Filter by ARR tier (multi-select, OR logic)
 */
export function filterByARRTier(businesses: Business[], tiers: ARRTier[]): Business[] {
  if (tiers.length === 0) return businesses;
  return businesses.filter((b) => {
    const tier = getARRTier(b);
    return tier && tiers.includes(tier);
  });
}

/**
 * Filter by status (multi-select, OR logic)
 */
export function filterByStatus(businesses: Business[], statuses: string[]): Business[] {
  if (statuses.length === 0) return businesses;
  return businesses.filter((b) => statuses.includes(b.status));
}

/**
 * Filter by tech stack (multi-select, OR logic)
 */
export function filterByTechStack(businesses: Business[], techStack: string[]): Business[] {
  if (techStack.length === 0) return businesses;
  return businesses.filter((b) =>
    techStack.some((tech) => b.stack.some((s) => s.toLowerCase() === tech.toLowerCase()))
  );
}

/**
 * Apply all filters to businesses
 */
export function applyFilters(businesses: Business[], filters: FilterState): Business[] {
  let filtered = businesses;

  // Search
  filtered = searchBusinesses(filtered, filters.search);

  // Category
  filtered = filterByCategory(filtered, filters.categories);

  // Price
  filtered = filterByPrice(
    filtered,
    filters.priceRange,
    filters.customPriceMin,
    filters.customPriceMax
  );

  // ARR Tier
  filtered = filterByARRTier(filtered, filters.arrTiers);

  // Status
  filtered = filterByStatus(filtered, filters.statuses);

  // Tech Stack
  filtered = filterByTechStack(filtered, filters.techStack);

  return filtered;
}

// ──────────────────────────────────────────────────────────────────────────────
// SORT
// ──────────────────────────────────────────────────────────────────────────────

export function sortBusinesses(businesses: Business[], sortBy: SortOption): Business[] {
  const sorted = [...businesses];

  switch (sortBy) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);

    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);

    case "arr-desc":
      return sorted.sort((a, b) => getARRValue(b.mrr) - getARRValue(a.mrr));

    case "arr-asc":
      return sorted.sort((a, b) => getARRValue(a.mrr) - getARRValue(b.mrr));

    case "alphabetical":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    case "status":
      const statusOrder = { available: 0, pending: 1, sold: 2 };
      return sorted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    case "recent":
    default:
      // Keep original order (assuming data is already sorted by recency)
      return sorted;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// UTILITY - Extract unique values
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Get all unique categories from businesses
 */
export function getUniqueCategories(businesses: Business[]): Array<{ value: string; count: number }> {
  const categoryMap = new Map<string, number>();

  businesses.forEach((b) => {
    // Extract main category (before first ·)
    const mainCategory = b.category.split("·")[0].trim();
    categoryMap.set(mainCategory, (categoryMap.get(mainCategory) || 0) + 1);
  });

  return Array.from(categoryMap.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get all unique tech stack items from businesses
 */
export function getUniqueTechStack(businesses: Business[]): Array<{ value: string; count: number }> {
  const techMap = new Map<string, number>();

  businesses.forEach((b) => {
    b.stack.forEach((tech) => {
      techMap.set(tech, (techMap.get(tech) || 0) + 1);
    });
  });

  return Array.from(techMap.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Count businesses by status
 */
export function getStatusCounts(
  businesses: Business[]
): Record<string, number> {
  return businesses.reduce(
    (acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}
