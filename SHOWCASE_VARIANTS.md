# Company Showcase - Design Variants

## Current Implementation (Recommended)

**Layout:** Grid-based marketplace view
**Density:** High - 4 columns max on XL screens
**Interaction:** Card-based with hover states
**Best for:** Browsing multiple options, comparison shopping

---

## Alternative Variant 1: List View

For a more data-dense, terminal-like experience:

```tsx
// Compact list with inline metrics
<div className="space-y-2">
  {companies.map((company) => (
    <div className="card rounded-none border border-white/10 p-4 hover:bg-surface-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Company Info */}
        <div className="flex items-center gap-4 flex-1">
          <div className="text-2xl">{company.icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-mono font-bold text-white truncate">
              {company.name}
            </h3>
            <p className="text-xs font-mono text-white/60 truncate">
              {company.tagline}
            </p>
          </div>
        </div>

        {/* Center: Metrics */}
        <div className="hidden md:flex items-center gap-8">
          <div className="text-right">
            <div className="text-xs font-mono text-white/40 uppercase">ARR</div>
            <div className="text-sm font-mono font-bold text-white tabular-nums">
              ${(company.arrPotential / 1000).toFixed(0)}K
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono text-white/40 uppercase">Price</div>
            <div className="text-sm font-mono font-bold text-white tabular-nums">
              ${(company.claimPrice / 1000).toFixed(1)}K
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono text-white/40 uppercase">Industry</div>
            <div className="text-sm font-mono text-white/60">
              {company.industry}
            </div>
          </div>
        </div>

        {/* Right: Status + CTA */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-mono text-green-400">AVAILABLE</span>
          </div>
          <button className="px-4 py-2 rounded-none bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-colors">
            Claim
          </button>
        </div>
      </div>
    </div>
  ))}
</div>
```

**Pros:**
- More companies visible at once
- Easier scanning/comparison
- Better for power users

**Cons:**
- Less visual appeal
- Limited feature preview
- Requires wider screens

---

## Alternative Variant 2: Featured Carousel

For highlighting top companies with rotation:

```tsx
// Hero-style featured company with carousel
<div className="relative">
  <div className="card-lg rounded-none border border-white/10 overflow-hidden">
    {/* Featured Company Display */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
      {/* Left: Details */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="text-6xl">{featuredCompany.icon}</div>
          <div>
            <h2 className="text-2xl font-mono font-bold text-white">
              {featuredCompany.name}
            </h2>
            <p className="text-sm font-mono text-white/50 uppercase tracking-wider">
              {featuredCompany.industry}
            </p>
          </div>
        </div>

        <p className="text-base font-mono text-white/70 leading-relaxed">
          {featuredCompany.tagline}
        </p>

        {/* Expanded metrics */}
        <div className="grid grid-cols-2 gap-4">
          {/* ... large metric cards ... */}
        </div>

        {/* Full features list */}
        <div className="space-y-2">
          {featuredCompany.features.map((feature) => (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
              <span className="text-sm font-mono text-white/70">{feature}</span>
            </div>
          ))}
        </div>

        <button className="w-full px-6 py-4 rounded-none bg-white text-black font-mono font-bold uppercase tracking-wider hover:bg-white/90 transition-colors">
          Claim This Business
        </button>
      </div>

      {/* Right: Visual/Screenshot */}
      <div className="hidden lg:block">
        {/* Could show mockup, metrics dashboard, or tech stack */}
      </div>
    </div>

    {/* Carousel Controls */}
    <div className="border-t border-white/10 px-8 py-4 bg-surface-1 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {companies.slice(0, 5).map((_, i) => (
          <button
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === currentIndex ? "bg-white" : "bg-white/20"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-surface-3">←</button>
        <button className="p-2 hover:bg-surface-3">→</button>
      </div>
    </div>
  </div>

  {/* Grid of remaining companies below */}
  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* ... compact cards ... */}
  </div>
</div>
```

**Pros:**
- Spotlight on best opportunities
- More detail visible
- Engaging interaction pattern

**Cons:**
- Fewer companies visible initially
- Requires user interaction to explore
- May miss companies not featured

---

## Alternative Variant 3: Table View (Ultra-Dense)

For maximum data density (Bloomberg-style):

```tsx
<div className="card rounded-none border border-white/10 overflow-x-auto">
  <table className="w-full">
    <thead className="border-b border-white/10 bg-surface-1">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-mono font-bold text-white/40 uppercase tracking-wider">
          Company
        </th>
        <th className="px-4 py-3 text-left text-xs font-mono font-bold text-white/40 uppercase tracking-wider">
          Industry
        </th>
        <th className="px-4 py-3 text-right text-xs font-mono font-bold text-white/40 uppercase tracking-wider">
          ARR
        </th>
        <th className="px-4 py-3 text-right text-xs font-mono font-bold text-white/40 uppercase tracking-wider">
          Price
        </th>
        <th className="px-4 py-3 text-right text-xs font-mono font-bold text-white/40 uppercase tracking-wider">
          ROI
        </th>
        <th className="px-4 py-3 text-center text-xs font-mono font-bold text-white/40 uppercase tracking-wider">
          Status
        </th>
        <th className="px-4 py-3"></th>
      </tr>
    </thead>
    <tbody>
      {companies.map((company) => (
        <tr className="border-b border-white/5 hover:bg-surface-3 transition-colors">
          <td className="px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">{company.icon}</span>
              <div>
                <div className="text-sm font-mono font-bold text-white">
                  {company.name}
                </div>
                <div className="text-xs font-mono text-white/50">
                  {company.tagline}
                </div>
              </div>
            </div>
          </td>
          <td className="px-4 py-3 text-sm font-mono text-white/60">
            {company.industry}
          </td>
          <td className="px-4 py-3 text-sm font-mono font-bold text-white text-right tabular-nums">
            ${(company.arrPotential / 1000).toFixed(0)}K
          </td>
          <td className="px-4 py-3 text-sm font-mono font-bold text-white text-right tabular-nums">
            ${(company.claimPrice / 1000).toFixed(1)}K
          </td>
          <td className="px-4 py-3 text-sm font-mono text-green-400 text-right tabular-nums">
            {Math.ceil((company.claimPrice / (company.arrPotential / 12)) * 100) / 100}mo
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center justify-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-mono text-green-400">AVL</span>
            </div>
          </td>
          <td className="px-4 py-3">
            <button className="px-3 py-1.5 rounded-none bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-colors">
              Claim
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

**Pros:**
- Maximum information density
- Easy sorting/filtering
- Professional/serious aesthetic
- True Bloomberg terminal feel

**Cons:**
- Less visually engaging
- Mobile experience challenging
- Requires horizontal scroll on small screens

---

## Hybrid Approach (Recommended for Production)

Combine the best of all variants:

### Desktop (>1024px):
- Grid view (current implementation)
- 3-4 columns depending on screen size
- Rich cards with hover states

### Tablet (768-1024px):
- 2 column grid OR list view toggle
- User preference saved to localStorage

### Mobile (<768px):
- Single column list view
- Swipeable cards
- Compact metrics inline

### Implementation:
```tsx
const [viewMode, setViewMode] = useState<"grid" | "list" | "table">("grid");

// Add view toggle buttons
<div className="flex items-center gap-2">
  <button
    onClick={() => setViewMode("grid")}
    className={viewMode === "grid" ? "active" : ""}
  >
    Grid
  </button>
  <button
    onClick={() => setViewMode("list")}
    className={viewMode === "list" ? "active" : ""}
  >
    List
  </button>
  <button
    onClick={() => setViewMode("table")}
    className={viewMode === "table" ? "active" : ""}
  >
    Table
  </button>
</div>

{viewMode === "grid" && <GridView companies={filteredCompanies} />}
{viewMode === "list" && <ListView companies={filteredCompanies} />}
{viewMode === "table" && <TableView companies={filteredCompanies} />}
```

---

## Visual Density Levels

### Level 1: Spacious (Current Implementation)
- 4-6 companies per viewport
- Full feature lists visible
- Large metrics
- Best for: First-time users, browsing

### Level 2: Compact
- 6-9 companies per viewport
- Truncated features (3 max)
- Medium metrics
- Best for: Repeat users, quick scanning

### Level 3: Dense
- 9-12 companies per viewport
- Features as count only
- Small metrics in table format
- Best for: Power users, analysts

---

## Color Coding Options

### Option 1: Status-Based (Current)
- Green = Available
- Yellow = Building
- Gray = Claimed

### Option 2: Category-Based
```tsx
const categoryColors = {
  saas: "#8b5cf6",      // Purple
  marketplace: "#f59e0b", // Amber
  ecommerce: "#22c55e",  // Green
  fintech: "#10b981",    // Emerald
  ai: "#06b6d4",        // Cyan
  social: "#ef4444",     // Red
};
```

Add colored left border:
```tsx
<div
  className="card border-l-4"
  style={{ borderLeftColor: categoryColors[company.category] }}
>
```

### Option 3: Value-Based
- High ARR (>$1M): Green accent
- Medium ARR ($500K-$1M): Yellow accent
- Standard ARR (<$500K): White/default

---

## Interactive Features to Add

### 1. Quick View Modal
Hover over card → small preview modal appears
- Full feature list
- Revenue breakdown
- Tech stack
- No page navigation required

### 2. Comparison Mode
Select 2-3 companies → side-by-side comparison
- Metric differences highlighted
- Feature overlap shown
- Best value indicated

### 3. Saved/Wishlist
Heart icon on cards → save for later
- Persistent across sessions
- Email notifications on price drops
- Saved in user profile

### 4. Sort Options
```tsx
const sortOptions = [
  { value: "arr-high", label: "Highest ARR" },
  { value: "arr-low", label: "Lowest ARR" },
  { value: "price-low", label: "Lowest Price" },
  { value: "price-high", label: "Highest Price" },
  { value: "roi", label: "Best ROI" },
  { value: "newest", label: "Recently Added" },
];
```

### 5. Advanced Filters
```tsx
// Price range slider
<input type="range" min={0} max={20000} />

// ARR range slider
<input type="range" min={0} max={2000000} />

// Industry multi-select
<select multiple>
  <option>SaaS</option>
  <option>FinTech</option>
  <option>E-commerce</option>
</select>

// Status checkboxes
<input type="checkbox" id="available" />
<input type="checkbox" id="building" />
```

---

## Performance Optimizations

### Virtualization (for 100+ companies)
```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

const rowVirtualizer = useVirtualizer({
  count: companies.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 350, // card height
  overscan: 5,
});
```

### Pagination
```tsx
const ITEMS_PER_PAGE = 12;
const [page, setPage] = useState(1);
const paginatedCompanies = companies.slice(
  (page - 1) * ITEMS_PER_PAGE,
  page * ITEMS_PER_PAGE
);
```

### Infinite Scroll
```tsx
const { ref, inView } = useInView();

useEffect(() => {
  if (inView && hasMore) {
    loadMoreCompanies();
  }
}, [inView]);
```

---

## Accessibility Enhancements

### Keyboard Navigation
```tsx
// Arrow keys to navigate cards
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case "ArrowRight":
      focusNextCard();
      break;
    case "ArrowLeft":
      focusPrevCard();
      break;
    case "Enter":
      openSelectedCard();
      break;
  }
};
```

### Screen Reader Improvements
```tsx
<div
  role="article"
  aria-label={`${company.name}, ${company.industry}, ${company.arrPotential} ARR potential, ${company.claimPrice} to claim`}
>
  {/* card content */}
</div>
```

### Focus Management
```tsx
// Trap focus in modal
import { FocusTrap } from "@headlessui/react";

<FocusTrap>
  <ClaimCompanyModal />
</FocusTrap>
```

---

## A/B Testing Ideas

### Test 1: Card Layout
- A: Current implementation (full features visible)
- B: Compact (features as count, expand on click)
- Metric: Click-through rate to claim

### Test 2: Pricing Display
- A: Show claim price prominently
- B: Show ARR potential prominently
- C: Show ROI/breakeven months prominently
- Metric: Conversion rate

### Test 3: CTA Copy
- A: "Claim This Business"
- B: "Start Earning"
- C: "Get This Company"
- D: "Own This Business"
- Metric: Button click rate

### Test 4: Filter Position
- A: Filters above grid (current)
- B: Filters in sidebar (left)
- C: Filters in dropdown (mobile-first)
- Metric: Filter usage rate

---

## Future Enhancements

### Phase 2: Social Proof
- Show "X people viewing"
- "Last claimed 2 hours ago"
- Star ratings from claimers
- Success stories

### Phase 3: Customization
- "Build a variant" - modify existing company
- Pick features à la carte
- Custom branding preview
- Price calculator

### Phase 4: Marketplace Features
- Secondary market (resell claimed companies)
- Partnership opportunities
- Revenue sharing models
- Exit planning services

---

## Design System Tokens

For consistency, use these exact values:

```typescript
export const SHOWCASE_TOKENS = {
  spacing: {
    cardPadding: "1rem",      // p-4
    gridGap: "1rem",          // gap-4
    sectionGap: "2rem",       // py-8
  },
  sizing: {
    cardMinHeight: "350px",
    iconSize: "2rem",
    buttonHeight: "40px",
  },
  typography: {
    cardTitle: "text-sm font-mono font-bold",
    metrics: "text-lg font-mono font-bold tabular-nums",
    body: "text-xs font-mono",
    labels: "text-xs font-mono uppercase text-white/40",
  },
  colors: {
    available: "#10b981",
    building: "#f59e0b",
    claimed: "rgba(255, 255, 255, 0.4)",
  },
  animation: {
    hoverTransition: "transition-all duration-200",
    pulse: "animate-pulse",
  },
};
```

Use these tokens to maintain consistency across all variants.
