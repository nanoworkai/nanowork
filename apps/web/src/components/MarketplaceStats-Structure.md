# MarketplaceStats Component Structure

## Component Hierarchy

```
MarketplaceStats
├── variant="full"
│   ├── Header Section
│   │   ├── Title: "Marketplace Overview"
│   │   ├── Description
│   │   └── Live Indicator (pulsing dot + time)
│   │
│   ├── ActivityTicker
│   │   ├── Header: "Recent Activity"
│   │   └── Scrolling Items (business name, status, ARR)
│   │
│   ├── Key Metrics Grid (4 columns)
│   │   ├── MetricCard: Available Now
│   │   ├── MetricCard: Total ARR Potential
│   │   ├── MetricCard: Average Price
│   │   └── MetricCard: Recently Claimed
│   │
│   └── Detailed Breakdowns (3 columns)
│       ├── CategoryBreakdown
│       ├── ARRBreakdown
│       └── TechStackPopularity
│
├── variant="compact"
│   ├── ActivityTicker
│   └── Key Metrics Grid (4 columns)
│       ├── MetricCard: Available
│       ├── MetricCard: Total ARR
│       ├── MetricCard: Avg Price
│       └── MetricCard: Categories
│
└── variant="horizontal"
    └── Horizontal Row (scrollable)
        ├── Available Businesses
        ├── Total ARR
        ├── Price Range
        ├── Categories
        └── Live Indicator
```

## Sub-Component Details

### MetricCard
```
┌─────────────────────────────┐
│ [Icon]           [•] Live   │
│                              │
│ 14              (Large)      │
│ AVAILABLE       (Label)      │
│ 3 pending       (SubValue)   │
└─────────────────────────────┘
```

**Props:**
- icon: React.ReactNode
- label: string
- value: string | number
- subValue?: string
- color?: string
- animated?: boolean
- trend?: "up" | "down" | "neutral"

### ActivityTicker
```
┌──────────────────────────────────────────────────────┐
│ [Activity Icon] RECENT ACTIVITY                      │
├──────────────────────────────────────────────────────┤
│ ← Lamina • AVAILABLE • $8K ARR  |  Parcel • AVAILABLE... →  │
└──────────────────────────────────────────────────────┘
```

**Features:**
- Infinite scroll animation
- Pauses on hover
- Shows 5 businesses, duplicated for seamless loop
- 60-second full cycle

### CategoryBreakdown
```
┌─────────────────────────────┐
│ [Layers Icon] CATEGORIES    │
├─────────────────────────────┤
│ SaaS             5    25%   │
│ ████████░░░░░░░░░░░░░░      │
│                             │
│ Commerce         3    15%   │
│ █████░░░░░░░░░░░░░░░░       │
│                             │
│ Marketplace      2    10%   │
│ ███░░░░░░░░░░░░░░░░░        │
└─────────────────────────────┘
```

**Features:**
- Top 5 categories shown
- Animated progress bars
- Percentage + count display
- Sorted by popularity

### ARRBreakdown
```
┌─────────────────────────────┐
│ [BarChart Icon] ARR TIERS   │
├─────────────────────────────┤
│ Starter          8    40%   │
│ ████████░░░░░░░░░░░░░░      │
│                             │
│ Growth           7    35%   │
│ ███████░░░░░░░░░░░░░░       │
│                             │
│ Scale            5    25%   │
│ █████░░░░░░░░░░░░░░░        │
└─────────────────────────────┘
```

**Features:**
- Three tier classification
- Color-coded bars (blue/green/emerald)
- Percentage + count display
- Only businesses with ARR included

### TechStackPopularity
```
┌─────────────────────────────┐
│ [Zap Icon] POPULAR TECH     │
├─────────────────────────────┤
│ [Next.js: 8] [Stripe: 7]    │
│ [Supabase: 6] [Postgres: 5] │
│ [Vercel: 4] [Node.js: 3]    │
└─────────────────────────────┘
```

**Features:**
- Top 8 tech stacks shown
- Clickable pills (optional)
- Count badge per technology
- Sorted by frequency

## Data Flow Diagram

```
BUSINESSES Array (20 items)
         ↓
calculateMetrics()
         ↓
MarketplaceMetrics
    ├── totalBusinesses: 20
    ├── availableBusinesses: 14
    ├── pendingBusinesses: 3
    ├── soldBusinesses: 3
    ├── totalARR: 156800
    ├── avgARR: 10453
    ├── minPrice: 2200
    ├── maxPrice: 12500
    ├── avgPrice: 6340
    ├── categoryBreakdown: {...}
    ├── techStackPopularity: {...}
    ├── recentlyAdded: [...]
    ├── recentlyClaimed: [...]
    └── tierBreakdown: {...}
         ↓
Render Components
```

## State Management

```typescript
// Component State
const [metrics, setMetrics] = useState<MarketplaceMetrics | null>(null);
const [liveUpdate, setLiveUpdate] = useState(0);

// Effects
useEffect(() => {
  // Initial calculation
  const calculated = calculateMetrics(BUSINESSES);
  setMetrics(calculated);
  
  // Live update interval (5s)
  const interval = setInterval(() => {
    setLiveUpdate(prev => prev + 1);
  }, 5000);
  
  return () => clearInterval(interval);
}, []);
```

## Calculation Functions

### calculateARR
```typescript
function calculateARR(business: Business): number {
  if (!business.mrr) return 0;
  const monthly = parseFloat(business.mrr.replace(/[^0-9.]/g, ''));
  return monthly * 12;
}

// Example:
// Input: "$680 MRR"
// Output: 8160
```

### getARRTier
```typescript
function getARRTier(arr: number): 'starter' | 'growth' | 'scale' {
  if (arr >= 100000) return 'scale';    // $100K+
  if (arr >= 20000) return 'growth';    // $20K-$100K
  return 'starter';                      // $0-$20K
}
```

### formatCurrency
```typescript
function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

// Examples:
// 1500000 → "$1.50M"
// 45000 → "$45K"
// 800 → "$800"
```

## Responsive Breakpoints

### Mobile (< 640px)
- 2-column metric grid
- Stacked breakdowns
- Horizontal scroll ticker
- Compact spacing

### Tablet (640px - 1024px)
- 2-4 column metric grid
- 2-column breakdowns
- Full ticker visible
- Standard spacing

### Desktop (1024px+)
- 4-column metric grid
- 3-column breakdowns
- Wide layout
- Generous spacing

### Ultra-wide (1920px+)
- Full width expansion
- Enhanced readability
- More data visible
- Optimal information density

## Color Palette

```css
/* Primary Metrics */
--color-available: #7bd3a8   /* Green - Available status */
--color-arr: #7bd3a8          /* Emerald - ARR metrics */
--color-pending: #e4a46a      /* Amber - Pending status */
--color-category: #8ab4ff     /* Blue - Categories */

/* Tier Colors */
--tier-starter: #8ab4ff       /* Blue */
--tier-growth: #7bd3a8        /* Green */
--tier-scale: #7bd3a8         /* Emerald */

/* UI Elements */
--color-text-primary: #ffffff
--color-text-secondary: rgba(255, 255, 255, 0.7)
--color-text-muted: rgba(255, 255, 255, 0.4)
--color-border: rgba(255, 255, 255, 0.1)
--color-surface: #0a0a0a
```

## Animation Keyframes

### Scroll (Ticker)
```css
@keyframes scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.animate-scroll {
  animation: scroll 60s linear infinite;
}

.animate-scroll:hover {
  animation-play-state: paused;
}
```

### Pulse (Live Indicator)
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### Progress Bar Fill
```css
.progress-bar {
  width: 0%;
  transition: width 1s ease-out;
}

.progress-bar.animate {
  width: var(--percentage);
}
```

## Performance Considerations

### Memoization
- `calculateMetrics()` runs once on mount
- Breakdown calculations memoized with `useMemo`
- Re-renders only when `BUSINESSES` changes

### Animation Performance
- CSS animations (GPU accelerated)
- No JavaScript animation loops
- Paused when not visible
- Reduced motion support (TODO)

### Bundle Size
- Component: ~15KB gzipped
- No external dependencies
- Tree-shakeable sub-components
- Minimal runtime overhead

## Accessibility Tree

```
<section aria-label="Marketplace Statistics">
  <header>
    <h2>Marketplace Overview</h2>
    <div aria-label="Live indicator" role="status">
  </header>
  
  <section aria-label="Recent Activity">
    <div role="marquee">...</div>
  </section>
  
  <section aria-label="Key Metrics">
    <article aria-label="Available Businesses">...</article>
    <article aria-label="Total ARR">...</article>
    ...
  </section>
  
  <section aria-label="Detailed Breakdowns">
    <article aria-label="Category Distribution">...</article>
    <article aria-label="ARR Tier Distribution">...</article>
    <article aria-label="Tech Stack Popularity">...</article>
  </section>
</section>
```
