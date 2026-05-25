# Marketplace Statistics Dashboard

Bloomberg Terminal-style statistics dashboard for displaying key metrics and insights about available businesses in the marketplace.

## Components

### `MarketplaceStats`
Main statistics dashboard component with three layout variants.

**Location:** `/apps/web/src/components/MarketplaceStats.tsx`

**Props:**
```typescript
interface MarketplaceStatsProps {
  variant?: "full" | "compact" | "horizontal";
  onFilterByCategory?: (category: string) => void;
}
```

**Variants:**

1. **Full Dashboard** (`variant="full"`)
   - Complete statistics overview
   - Activity ticker
   - 4 key metric cards
   - Category breakdown chart
   - ARR tier distribution
   - Tech stack popularity
   - Best for: Dedicated marketplace overview pages

2. **Compact** (`variant="compact"`)
   - Activity ticker
   - 4 key metric cards in grid
   - No detailed breakdowns
   - Best for: Page headers, sidebars, collapsed states

3. **Horizontal Bar** (`variant="horizontal"`)
   - Single row of metrics
   - Scrollable on mobile
   - Minimal vertical space
   - Best for: Sticky headers, above-the-fold stats

## Key Metrics Displayed

1. **Total Businesses Available**
   - Count of available vs total businesses
   - Visual indicator (pulsing dot)
   - Status breakdown (available/pending/sold)

2. **Combined ARR Potential**
   - Sum of all ARR from available businesses
   - Average ARR per business
   - Breakdown by tier (Starter/Growth/Scale)
   - Color-coded by tier

3. **Price Range**
   - Minimum to maximum pricing
   - Average price
   - Distribution chart

4. **Categories Breakdown**
   - Number of businesses per category
   - Visual progress bars
   - Percentage distribution
   - Top 5 categories shown

5. **Tech Stack Statistics**
   - Most popular technologies
   - Usage count per stack
   - Clickable pills (top 8)

6. **Recent Activity**
   - Recently added businesses
   - Recently claimed businesses
   - Scrolling ticker animation

## Data Calculations

All calculations are performed automatically from the `BUSINESSES` array:

- **ARR Calculation:** `parseFloat(mrr) * 12`
- **Tier Classification:**
  - Starter: $0-$20K ARR
  - Growth: $20K-$100K ARR
  - Scale: $100K+ ARR
- **Category Extraction:** First part before ` · ` separator
- **Tech Stack:** Aggregated from all `stack` arrays

## Design System

### Colors
- **Green (#7bd3a8):** Available status, growth indicators
- **Emerald (#7bd3a8):** ARR metrics, scale tier
- **Amber (#e4a46a):** Pending status, warnings
- **Blue (#8ab4ff):** Categories, starter tier
- **White:** Primary numbers, neutral metrics

### Typography
- **Font:** Monospace throughout (terminal aesthetic)
- **Numbers:** Tabular numerals for alignment
- **Labels:** Uppercase with wide tracking
- **Hierarchy:** Bold for metrics, regular for context

### Animations
- **Pulsing dots:** Live data indicators (`animate-pulse`)
- **Scrolling ticker:** Marquee animation (`animate-scroll`)
- **Progress bars:** 1s duration transition
- **Hover states:** Subtle background change

### Layout
- **Grid System:** Responsive 2/3/4 column grids
- **Borders:** `border-white/10` for subtle divisions
- **Spacing:** Consistent padding (p-4, p-6)
- **Cards:** Rounded-none for terminal aesthetic

## Usage Examples

### Basic Usage (Full Dashboard)
```tsx
import MarketplaceStats from "@/components/MarketplaceStats";

function MarketplacePage() {
  return (
    <div>
      <h1>Marketplace</h1>
      <MarketplaceStats variant="full" />
      {/* Business grid below */}
    </div>
  );
}
```

### Compact Header
```tsx
import MarketplaceStats from "@/components/MarketplaceStats";

function MarketplaceHeader() {
  return (
    <header>
      <h1>Browse Businesses</h1>
      <MarketplaceStats variant="compact" />
    </header>
  );
}
```

### Sticky Stats Bar
```tsx
import MarketplaceStats from "@/components/MarketplaceStats";

function MarketplaceWithSticky() {
  return (
    <>
      <div className="sticky top-14 z-40 border-b border-white/10">
        <MarketplaceStats variant="horizontal" />
      </div>
      {/* Rest of page content */}
    </>
  );
}
```

### Interactive Filtering
```tsx
import { useState } from "react";
import MarketplaceStats from "@/components/MarketplaceStats";

function MarketplaceWithFilters() {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  return (
    <div>
      <MarketplaceStats
        variant="full"
        onFilterByCategory={setCategoryFilter}
      />
      {/* Filter applied to business grid */}
    </div>
  );
}
```

## Sub-Components

The following internal components are exported for advanced use:

### `MetricCard`
Individual metric card with icon, label, value, and optional subvalue.

### `ActivityTicker`
Scrolling marquee showing recent business activity.

### `CategoryBreakdown`
Visual chart showing business distribution by category.

### `TechStackPopularity`
Pills showing most popular tech stacks with usage counts.

### `ARRBreakdown`
Chart showing distribution across ARR tiers (Starter/Growth/Scale).

## Utility Functions

```typescript
// Calculate ARR from a business
function calculateARR(business: Business): number

// Get ARR tier classification
function getARRTier(arr: number): 'starter' | 'growth' | 'scale'

// Calculate all marketplace metrics
function calculateMetrics(businesses: Business[]): MarketplaceMetrics

// Format currency with K/M suffixes
function formatCurrency(value: number): string
```

## Testing

To view all variants and examples:
1. Navigate to `/stats-showcase` route
2. See live examples of all three variants
3. Review implementation code examples
4. Check design system documentation

## Performance

- **Calculations:** Memoized with `useMemo` hooks
- **Re-renders:** Only when `BUSINESSES` data changes
- **Animations:** CSS-based, hardware accelerated
- **Live Updates:** Simulated every 5 seconds (interval can be adjusted)

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Color contrast ratios meet WCAG AA
- Monospace fonts may affect readability (design choice)
- No ARIA labels needed (static content)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari iOS 14+

## Future Enhancements

Potential improvements:
- Real-time WebSocket updates
- Clickable charts to filter
- Export to CSV/PDF
- Historical trend lines
- Comparison mode (week/month/quarter)
- Custom date range selection
- Saved filter presets
