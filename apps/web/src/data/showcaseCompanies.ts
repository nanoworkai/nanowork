/**
 * SHOWCASE COMPANIES DATA
 *
 * Centralized data file for AI-generated companies displayed in the showcase.
 * Update this file to add/edit/remove companies without touching component code.
 */

export interface AICompany {
  id: string;
  name: string;
  tagline: string;
  industry: string;
  category: "saas" | "marketplace" | "ecommerce" | "fintech" | "ai" | "social";
  arrPotential: number; // Annual Recurring Revenue estimate ($)
  claimPrice: number; // One-time price to claim ($)
  features: string[];
  status: "available" | "claimed" | "building";
  icon: string; // Emoji or icon identifier
  color: string; // Accent color for visual differentiation
  buildProgress?: number; // 0-100 if status is "building"
}

// ──────────────────────────────────────────────────────────────────────────────
// COMPANY CATALOG
// ──────────────────────────────────────────────────────────────────────────────

export const showcaseCompanies: AICompany[] = [
  {
    id: "comp_001",
    name: "FlowFinance",
    tagline: "Invoice automation for B2B companies",
    industry: "FinTech",
    category: "fintech",
    arrPotential: 250000,
    claimPrice: 4999,
    features: [
      "Automated invoicing",
      "Payment tracking",
      "Stripe integration",
      "Client portal",
      "Late payment reminders",
    ],
    status: "available",
    icon: "💳",
    color: "#10b981",
  },
  {
    id: "comp_002",
    name: "CreatorStack",
    tagline: "Content monetization platform for creators",
    industry: "SaaS",
    category: "saas",
    arrPotential: 500000,
    claimPrice: 7999,
    features: [
      "Subscription management",
      "Digital products",
      "Member dashboard",
      "Analytics",
      "Email automation",
    ],
    status: "available",
    icon: "🎨",
    color: "#8b5cf6",
  },
  {
    id: "comp_003",
    name: "LocalEats",
    tagline: "Delivery marketplace for regional restaurants",
    industry: "Marketplace",
    category: "marketplace",
    arrPotential: 1200000,
    claimPrice: 12999,
    features: [
      "Restaurant admin",
      "Order management",
      "Delivery tracking",
      "Customer app",
      "Payment processing",
    ],
    status: "building",
    icon: "🍕",
    color: "#f59e0b",
    buildProgress: 68,
  },
  {
    id: "comp_004",
    name: "CodeMentor AI",
    tagline: "AI-powered code review and mentorship",
    industry: "AI/ML",
    category: "ai",
    arrPotential: 800000,
    claimPrice: 9999,
    features: [
      "Real-time code review",
      "Learning paths",
      "Team analytics",
      "IDE integration",
      "Custom style guides",
    ],
    status: "available",
    icon: "🤖",
    color: "#06b6d4",
  },
  {
    id: "comp_005",
    name: "FitTrack Pro",
    tagline: "Personal training app with AI coach",
    industry: "Health & Fitness",
    category: "saas",
    arrPotential: 350000,
    claimPrice: 5999,
    features: [
      "Workout plans",
      "Progress tracking",
      "Nutrition logging",
      "Video library",
      "Social challenges",
    ],
    status: "available",
    icon: "💪",
    color: "#ef4444",
  },
  {
    id: "comp_006",
    name: "PropConnect",
    tagline: "B2B property management platform",
    industry: "Real Estate",
    category: "saas",
    arrPotential: 600000,
    claimPrice: 8999,
    features: [
      "Tenant portal",
      "Maintenance requests",
      "Payment processing",
      "Lease management",
      "Document storage",
    ],
    status: "claimed",
    icon: "🏢",
    color: "#3b82f6",
  },
  {
    id: "comp_007",
    name: "SustainShop",
    tagline: "Eco-friendly products marketplace",
    industry: "E-commerce",
    category: "ecommerce",
    arrPotential: 450000,
    claimPrice: 6999,
    features: [
      "Vendor onboarding",
      "Carbon tracking",
      "Subscription boxes",
      "Mobile app",
      "Impact reporting",
    ],
    status: "available",
    icon: "🌱",
    color: "#22c55e",
  },
  {
    id: "comp_008",
    name: "TeamSync",
    tagline: "Async collaboration for remote teams",
    industry: "Productivity",
    category: "saas",
    arrPotential: 900000,
    claimPrice: 11999,
    features: [
      "Video messages",
      "Screen recording",
      "Team spaces",
      "Integrations",
      "Smart notifications",
    ],
    status: "available",
    icon: "🎯",
    color: "#a855f7",
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Get companies by category
 */
export function getCompaniesByCategory(category: string): AICompany[] {
  if (category === "all") return showcaseCompanies;
  return showcaseCompanies.filter((c) => c.category === category);
}

/**
 * Get companies by status
 */
export function getCompaniesByStatus(
  status: "available" | "claimed" | "building"
): AICompany[] {
  return showcaseCompanies.filter((c) => c.status === status);
}

/**
 * Get single company by ID
 */
export function getCompanyById(id: string): AICompany | undefined {
  return showcaseCompanies.find((c) => c.id === id);
}

/**
 * Get featured companies (highest ARR)
 */
export function getFeaturedCompanies(limit: number = 3): AICompany[] {
  return [...showcaseCompanies]
    .sort((a, b) => b.arrPotential - a.arrPotential)
    .slice(0, limit);
}

/**
 * Get companies sorted by price (low to high)
 */
export function getCompaniesByPriceLowToHigh(): AICompany[] {
  return [...showcaseCompanies].sort((a, b) => a.claimPrice - b.claimPrice);
}

/**
 * Get companies sorted by ARR (high to low)
 */
export function getCompaniesByARR(): AICompany[] {
  return [...showcaseCompanies].sort((a, b) => b.arrPotential - a.arrPotential);
}

/**
 * Calculate total stats
 */
export function getShowcaseStats() {
  const total = showcaseCompanies.length;
  const available = showcaseCompanies.filter((c) => c.status === "available").length;
  const building = showcaseCompanies.filter((c) => c.status === "building").length;
  const claimed = showcaseCompanies.filter((c) => c.status === "claimed").length;
  const totalARR = showcaseCompanies.reduce((sum, c) => sum + c.arrPotential, 0);
  const avgPrice = Math.round(
    showcaseCompanies.reduce((sum, c) => sum + c.claimPrice, 0) / total
  );

  return {
    total,
    available,
    building,
    claimed,
    totalARR,
    avgPrice,
  };
}

/**
 * Search companies by name or tagline
 */
export function searchCompanies(query: string): AICompany[] {
  const lowerQuery = query.toLowerCase();
  return showcaseCompanies.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.tagline.toLowerCase().includes(lowerQuery) ||
      c.industry.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Filter companies by price range
 */
export function getCompaniesByPriceRange(
  min: number,
  max: number
): AICompany[] {
  return showcaseCompanies.filter(
    (c) => c.claimPrice >= min && c.claimPrice <= max
  );
}

/**
 * Filter companies by ARR range
 */
export function getCompaniesByARRRange(min: number, max: number): AICompany[] {
  return showcaseCompanies.filter(
    (c) => c.arrPotential >= min && c.arrPotential <= max
  );
}

/**
 * Get similar companies (same category, excluding given ID)
 */
export function getSimilarCompanies(
  companyId: string,
  limit: number = 3
): AICompany[] {
  const company = getCompanyById(companyId);
  if (!company) return [];

  return showcaseCompanies
    .filter((c) => c.id !== companyId && c.category === company.category)
    .slice(0, limit);
}

// ──────────────────────────────────────────────────────────────────────────────
// CATEGORY DEFINITIONS
// ──────────────────────────────────────────────────────────────────────────────

export const categories = [
  { id: "all", label: "All Companies", icon: "🏢" },
  { id: "saas", label: "SaaS", icon: "💻" },
  { id: "marketplace", label: "Marketplace", icon: "🛒" },
  { id: "ecommerce", label: "E-commerce", icon: "🛍️" },
  { id: "fintech", label: "FinTech", icon: "💰" },
  { id: "ai", label: "AI/ML", icon: "🤖" },
  { id: "social", label: "Social", icon: "👥" },
] as const;

// ──────────────────────────────────────────────────────────────────────────────
// INDUSTRY TAGS
// ──────────────────────────────────────────────────────────────────────────────

export const industries = [
  "FinTech",
  "SaaS",
  "Marketplace",
  "AI/ML",
  "Health & Fitness",
  "Real Estate",
  "E-commerce",
  "Productivity",
  "Education",
  "Entertainment",
] as const;

// ──────────────────────────────────────────────────────────────────────────────
// SAMPLE USAGE
// ──────────────────────────────────────────────────────────────────────────────

/*
// In your component:
import { showcaseCompanies, getCompaniesByCategory, getShowcaseStats } from "@/data/showcaseCompanies";

// Use directly
const companies = showcaseCompanies;

// Filter by category
const saasCompanies = getCompaniesByCategory("saas");

// Get stats
const stats = getShowcaseStats();
// Showcase stats available via getShowcaseStats()

// Search
const results = searchCompanies("AI");

// Get featured
const featured = getFeaturedCompanies(3);
*/
