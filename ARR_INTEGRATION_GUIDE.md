# ARR Display - Integration Guide

Quick guide for adding ARR display components to the existing Nanowork homepage and marketplace.

---

## Step 1: Add Route to Router

**File:** `/apps/web/src/App.tsx` (or wherever routes are defined)

```tsx
import ARRShowcase from "./pages/ARRShowcase";

// Add to routes:
<Route path="/arr-showcase" element={<ARRShowcase />} />
```

---

## Step 2: Create Sample Data

**File:** `/apps/web/src/data/sampleCompanies.ts`

```typescript
import type { ARRData } from "../components/ARRDisplay";

export interface Company {
  id: string;
  name: string;
  description: string;
  category: string;
  arr: ARRData;
  logoUrl?: string;
  websiteUrl?: string;
  createdAt: string;
}

export const SAMPLE_COMPANIES: Company[] = [
  {
    id: "1",
    name: "TaskFlow AI",
    description: "Automated workflow management for remote teams. AI-powered task assignment, smart scheduling, and productivity insights that adapt to your team's patterns.",
    category: "Productivity SaaS",
    arr: {
      min: 20000,
      max: 50000,
      tier: "growth",
      monthly: 3500,
      growth: 35,
      confidence: 85,
    },
    createdAt: "2026-01-15",
  },
  {
    id: "2",
    name: "HealthSync",
    description: "Personal health tracking and telemedicine platform. Connect patients with doctors, track vitals in real-time, and manage prescriptions digitally.",
    category: "HealthTech",
    arr: {
      min: 100000,
      max: 250000,
      tier: "scale",
      monthly: 15000,
      growth: 50,
      confidence: 91,
    },
    createdAt: "2025-11-22",
  },
  {
    id: "3",
    name: "CodeReview Pro",
    description: "AI-powered code review and security scanning. Catch bugs before production, improve code quality across your team, and automate compliance checks.",
    category: "Developer Tools",
    arr: {
      min: 20000,
      max: 50000,
      tier: "growth",
      monthly: 3200,
      growth: 42,
      confidence: 88,
    },
    createdAt: "2026-02-08",
  },
  {
    id: "4",
    name: "EcoCommerce",
    description: "Sustainable product marketplace connecting eco-conscious consumers with verified green brands. Carbon tracking on every purchase, transparency in supply chains.",
    category: "E-Commerce",
    arr: {
      min: 100000,
      max: 250000,
      tier: "scale",
      monthly: 18000,
      growth: 65,
      confidence: 79,
    },
    createdAt: "2025-12-10",
  },
  {
    id: "5",
    name: "LearnPath",
    description: "Personalized online learning platform. AI-curated courses, skill assessments, career path recommendations, and certification tracking.",
    category: "EdTech",
    arr: {
      min: 5000,
      max: 10000,
      tier: "starter",
      monthly: 800,
      growth: 15,
      confidence: 72,
    },
    createdAt: "2026-03-01",
  },
  {
    id: "6",
    name: "FinanceFlow",
    description: "Automated bookkeeping and financial reporting for small businesses. Connect your bank, get insights, stay compliant, and file taxes seamlessly.",
    category: "FinTech",
    arr: {
      min: 500000,
      max: 1000000,
      tier: "enterprise",
      monthly: 70000,
      growth: 55,
      confidence: 88,
    },
    createdAt: "2025-10-15",
  },
  {
    id: "7",
    name: "ContentAI",
    description: "AI-powered content generation and management. Create blog posts, social media content, and marketing copy that matches your brand voice.",
    category: "Marketing Tech",
    arr: {
      min: 20000,
      max: 50000,
      tier: "growth",
      monthly: 4000,
      growth: 48,
      confidence: 82,
    },
    createdAt: "2026-01-20",
  },
  {
    id: "8",
    name: "HomeService Hub",
    description: "Marketplace connecting homeowners with vetted service professionals. Instant quotes, scheduling, payment processing, and review management.",
    category: "Marketplace",
    arr: {
      min: 100000,
      max: 250000,
      tier: "scale",
      monthly: 16000,
      growth: 58,
      confidence: 86,
    },
    createdAt: "2025-11-08",
  },
  {
    id: "9",
    name: "PetCare Plus",
    description: "Comprehensive pet health management app. Track vet visits, medication reminders, nutrition plans, and connect with veterinarians virtually.",
    category: "Pet Tech",
    arr: {
      min: 5000,
      max: 10000,
      tier: "starter",
      monthly: 750,
      growth: 22,
      confidence: 68,
    },
    createdAt: "2026-02-14",
  },
  {
    id: "10",
    name: "LegalDocs AI",
    description: "Automated legal document generation for small businesses. Contracts, NDAs, terms of service, privacy policies - all compliant and customizable.",
    category: "LegalTech",
    arr: {
      min: 100000,
      max: 250000,
      tier: "scale",
      monthly: 20000,
      growth: 72,
      confidence: 93,
    },
    createdAt: "2025-12-01",
  },
];
```

---

## Step 3: Add Marketplace Section to Homepage

**File:** `/apps/web/src/pages/Home.tsx`

Add this new section after the Department Grid (around line 380):

```tsx
import { CompanyShowcaseCard } from "../components/ARRDisplay";
import { SAMPLE_COMPANIES } from "../data/sampleCompanies";

// ... existing code ...

{/* Marketplace Showcase - Add after Department Grid */}
<section className="py-12">
  <div className="mb-6">
    <div className="flex items-center gap-3">
      <span className="text-xs font-mono font-bold text-white/40 uppercase tracking-wider">
        Ready-Made Businesses
      </span>
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-xs font-mono text-white/60">
        {SAMPLE_COMPANIES.length} AVAILABLE
      </span>
    </div>
  </div>

  {/* Category filters */}
  <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
    {["All", "Productivity", "HealthTech", "FinTech", "EdTech", "E-Commerce"].map((cat) => (
      <button
        key={cat}
        className="px-3 py-1.5 rounded-none border border-white/10 bg-surface-1 hover:bg-surface-3 text-xs font-mono text-white/60 hover:text-white transition-colors whitespace-nowrap"
      >
        {cat.toUpperCase()}
      </button>
    ))}
  </div>

  {/* Company grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {SAMPLE_COMPANIES.slice(0, 6).map((company) => (
      <CompanyShowcaseCard
        key={company.id}
        company={{
          name: company.name,
          description: company.description,
          category: company.category,
        }}
        arr={company.arr}
      />
    ))}
  </div>

  {/* View all link */}
  <div className="mt-6 text-center">
    <Link
      to="/marketplace"
      className="inline-flex items-center gap-2 text-xs font-mono text-white/60 hover:text-white transition-colors uppercase tracking-wider"
    >
      View All {SAMPLE_COMPANIES.length} Businesses
      <ArrowRight className="w-3.5 h-3.5" />
    </Link>
  </div>
</section>
```

---

## Step 4: Create Full Marketplace Page

**File:** `/apps/web/src/pages/Marketplace.tsx`

```tsx
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Terminal, ArrowLeft, Filter, Search } from "lucide-react";
import { CompanyShowcaseCard } from "../components/ARRDisplay";
import { SAMPLE_COMPANIES, type Company } from "../data/sampleCompanies";
import type { ARRTier } from "../components/ARRDisplay";

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<ARRTier | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "arr-high" | "arr-low" | "confidence">("newest");

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(SAMPLE_COMPANIES.map(c => c.category))).sort();
  }, []);

  // Filter and sort companies
  const filteredCompanies = useMemo(() => {
    let filtered = SAMPLE_COMPANIES;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        c => c.name.toLowerCase().includes(query) ||
             c.description.toLowerCase().includes(query) ||
             c.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    // Tier filter
    if (selectedTier) {
      filtered = filtered.filter(c => c.arr.tier === selectedTier);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "arr-high":
          return b.arr.max - a.arr.max;
        case "arr-low":
          return a.arr.max - b.arr.max;
        case "confidence":
          return (b.arr.confidence || 0) - (a.arr.confidence || 0);
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, selectedTier, sortBy]);

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface-0 border-b border-white/10">
        <div className="max-w-[1800px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white hover:opacity-70 transition-opacity">
            <div className="w-6 h-6 rounded-none bg-white flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="text-sm font-mono font-bold uppercase tracking-wider">Nanowork</span>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-mono text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-12">
        {/* Hero */}
        <section className="mb-12">
          <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-4">
            Marketplace
          </div>
          <h1 className="text-4xl font-mono font-bold text-white uppercase tracking-tight mb-4">
            Ready-Made Businesses
          </h1>
          <p className="text-sm font-mono text-white/70 max-w-3xl leading-relaxed">
            AI-generated businesses with proven revenue models. Browse by category, revenue tier, or confidence score.
            Each business comes with legal docs, branding, website, and go-to-market strategy.
          </p>
        </section>

        {/* Search and filters */}
        <section className="mb-8">
          {/* Search bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search businesses..."
                className="w-full pl-12 pr-4 py-3 bg-surface-1 border border-white/10 rounded-none text-white placeholder:text-white/40 font-mono text-sm focus:outline-none focus:border-white/20"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Tier filters */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-white/40" />
              <span className="text-xs font-mono text-white/40 uppercase tracking-wider">Tier:</span>
              {(["starter", "growth", "scale", "enterprise"] as ARRTier[]).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(selectedTier === tier ? null : tier)}
                  className={`px-3 py-1.5 rounded-none border text-xs font-mono uppercase tracking-wider transition-colors ${
                    selectedTier === tier
                      ? "border-white/30 bg-white/10 text-white"
                      : "border-white/10 bg-surface-1 text-white/60 hover:text-white"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>

            {/* Category filter */}
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-white/40 uppercase tracking-wider">Category:</span>
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-none border text-xs font-mono uppercase tracking-wider transition-colors ${
                  selectedCategory === null
                    ? "border-white/30 bg-white/10 text-white"
                    : "border-white/10 bg-surface-1 text-white/60 hover:text-white"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  className={`px-3 py-1.5 rounded-none border text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap ${
                    selectedCategory === cat
                      ? "border-white/30 bg-white/10 text-white"
                      : "border-white/10 bg-surface-1 text-white/60 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-white/40 uppercase tracking-wider">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-none border border-white/10 bg-surface-1 text-white text-xs font-mono uppercase tracking-wider focus:outline-none focus:border-white/20"
              >
                <option value="newest">Newest</option>
                <option value="arr-high">Highest ARR</option>
                <option value="arr-low">Lowest ARR</option>
                <option value="confidence">Highest Confidence</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-xs font-mono text-white/40">
            Showing {filteredCompanies.length} of {SAMPLE_COMPANIES.length} businesses
          </div>
        </section>

        {/* Company grid */}
        <section>
          {filteredCompanies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompanies.map((company) => (
                <CompanyShowcaseCard
                  key={company.id}
                  company={{
                    name: company.name,
                    description: company.description,
                    category: company.category,
                  }}
                  arr={company.arr}
                />
              ))}
            </div>
          ) : (
            <div className="card-lg rounded-none p-12 text-center">
              <p className="text-sm font-mono text-white/60">
                No businesses match your filters. Try adjusting your search.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between text-xs font-mono text-white/30">
            <div>© 2026 NANOWORK INC</div>
            <div>MARKETPLACE v1.0</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
```

---

## Step 5: Add Marketplace Route

**File:** `/apps/web/src/App.tsx`

```tsx
import Marketplace from "./pages/Marketplace";

// Add to routes:
<Route path="/marketplace" element={<Marketplace />} />
```

---

## Step 6: Update Navigation

Add marketplace link to header navigation:

**File:** `/apps/web/src/pages/Home.tsx`

```tsx
<nav className="flex items-center gap-1">
  {/* Add before login/dashboard buttons */}
  <Link
    to="/marketplace"
    className="hidden md:block px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider text-white/60 hover:text-white transition-colors"
  >
    Marketplace
  </Link>
  
  {isAuthenticated ? (
    // ... existing code
  ) : (
    // ... existing code
  )}
</nav>
```

---

## Step 7: Optional Enhancements

### A. Add to Footer

```tsx
<div>
  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">
    Product
  </h3>
  <ul className="space-y-2 text-xs font-mono text-white/40">
    <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
    <li><Link to="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
    <li><Link to="/revenue" className="hover:text-white transition-colors">Revenue</Link></li>
    <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
  </ul>
</div>
```

### B. Add Quick Stats to Homepage Hero

```tsx
<div className="grid grid-cols-3 gap-4 mt-8 max-w-2xl">
  <div className="card rounded-none p-4 text-center">
    <div className="text-2xl font-mono font-bold text-white mb-1">
      {SAMPLE_COMPANIES.length}
    </div>
    <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
      Businesses
    </div>
  </div>
  <div className="card rounded-none p-4 text-center">
    <div className="text-2xl font-mono font-bold text-white mb-1">
      $2.4M
    </div>
    <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
      Total ARR
    </div>
  </div>
  <div className="card rounded-none p-4 text-center">
    <div className="text-2xl font-mono font-bold text-white mb-1">
      48H
    </div>
    <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
      Avg Build
    </div>
  </div>
</div>
```

### C. Add Featured Business Section

```tsx
{/* Featured Business - Add to homepage */}
<section className="py-12">
  <div className="card-lg rounded-none border border-white/10 overflow-hidden">
    <div className="border-b border-white/10 px-6 py-3 bg-surface-1">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono font-bold text-white/60 uppercase tracking-wider">
          Featured Business
        </span>
        <div className="flex-1" />
        <span className="text-[10px] font-mono text-white/40">UPDATED DAILY</span>
      </div>
    </div>
    
    <div className="grid md:grid-cols-[2fr,1fr] gap-8 p-8">
      <div>
        <h2 className="text-2xl font-mono font-bold text-white mb-3">
          {SAMPLE_COMPANIES[0].name}
        </h2>
        <p className="text-sm text-white/70 leading-relaxed mb-6">
          {SAMPLE_COMPANIES[0].description}
        </p>
        <Link
          to={`/marketplace/${SAMPLE_COMPANIES[0].id}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-none bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-colors"
        >
          View Details
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div>
        <ARRDisplay 
          data={SAMPLE_COMPANIES[0].arr}
          variant="detailed"
          showBreakdown
          showGrowth
        />
      </div>
    </div>
  </div>
</section>
```

---

## Step 8: Connect to Real Data

When ready to connect to API:

**File:** `/apps/web/src/hooks/useCompanies.ts`

```typescript
import { useState, useEffect } from "react";
import type { Company } from "../data/sampleCompanies";

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/companies`);
        if (!response.ok) throw new Error("Failed to fetch companies");
        const data = await response.json();
        setCompanies(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  return { companies, loading, error };
}
```

Then update Marketplace.tsx:

```tsx
// Replace SAMPLE_COMPANIES with:
const { companies, loading, error } = useCompanies();

// Add loading state:
if (loading) {
  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center">
      <div className="text-white font-mono">Loading marketplace...</div>
    </div>
  );
}

// Add error state:
if (error) {
  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center">
      <div className="text-red-400 font-mono">Error: {error.message}</div>
    </div>
  );
}
```

---

## Step 9: Testing Checklist

- [ ] ARRShowcase page renders at `/arr-showcase`
- [ ] All 4 variants display correctly
- [ ] All 4 tiers have correct colors
- [ ] Showcase cards expand/collapse
- [ ] Marketplace page renders at `/marketplace`
- [ ] Search filters companies
- [ ] Category filters work
- [ ] Tier filters work
- [ ] Sort options work
- [ ] Mobile responsive (test at 375px width)
- [ ] Tablet responsive (test at 768px width)
- [ ] Desktop responsive (test at 1440px width)
- [ ] Animations are smooth (60fps)
- [ ] Hover states work on desktop
- [ ] Focus states work with keyboard
- [ ] Screen reader announces values
- [ ] No console errors
- [ ] No accessibility warnings

---

## Step 10: Deploy

1. Commit changes
2. Push to repository
3. Verify build passes
4. Test in staging environment
5. Deploy to production

```bash
# Commit
git add .
git commit -m "feat: add ARR display component and marketplace"

# Push
git push origin main

# Build
npm run build

# Deploy (depends on your setup)
npm run deploy
```

---

## Quick Reference

### File Locations
- Component: `/apps/web/src/components/ARRDisplay.tsx`
- Demo page: `/apps/web/src/pages/ARRShowcase.tsx`
- Marketplace: `/apps/web/src/pages/Marketplace.tsx`
- Sample data: `/apps/web/src/data/sampleCompanies.ts`
- Hook: `/apps/web/src/hooks/useCompanies.ts`

### Routes
- Demo: `/arr-showcase`
- Marketplace: `/marketplace`
- Company detail: `/marketplace/:id` (future)

### Import Examples
```tsx
// Component
import ARRDisplay, { CompanyShowcaseCard } from "@/components/ARRDisplay";

// Types
import type { ARRData, ARRTier } from "@/components/ARRDisplay";

// Data
import { SAMPLE_COMPANIES } from "@/data/sampleCompanies";
```

---

## Support

For questions or issues:
1. Check design doc: `ARR_DISPLAY_DESIGN.md`
2. Check visual examples: `ARR_VISUAL_EXAMPLES.md`
3. View demo page: `/arr-showcase`
4. Review component source: `ARRDisplay.tsx`

---

## Next Steps

After basic integration:
1. Add company detail pages
2. Implement comparison feature
3. Add favorites/bookmarking
4. Build email alerts for new listings
5. Add purchase/checkout flow
6. Implement user dashboard
7. Add analytics tracking
8. Build admin panel for managing listings
