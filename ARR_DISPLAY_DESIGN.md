# ARR Display Component - Design Documentation

## Overview

A Bloomberg Terminal-inspired component system for displaying Annual Recurring Revenue (ARR) potential for AI-generated businesses in the Nanowork marketplace showcase.

**Files Created:**
- `/apps/web/src/components/ARRDisplay.tsx` - Main component library
- `/apps/web/src/pages/ARRShowcase.tsx` - Demo/documentation page

---

## Design Philosophy

### 1. Bloomberg Terminal Aesthetic
The design draws inspiration from Bloomberg terminals used by financial professionals:
- **Data density** - Maximum information in minimum space
- **Monospace typography** - All financial data uses monospace fonts
- **Live indicators** - Pulsing dots show real-time/active status
- **Color-coded tiers** - Instant visual hierarchy through color
- **Sharp edges** - `rounded-none` borders match terminal windows

### 2. Visual Hierarchy

```
Tier Icon + Label → ARR Range → Live Indicator
     ◆ GROWTH     $20-50K/YR         ●
```

**Reading Order:**
1. Color + icon catches eye (tier recognition)
2. Number is the primary data point
3. Live indicator suggests freshness/accuracy

### 3. Information Architecture

Four display variants optimized for different contexts:

| Variant    | Use Case                          | Information Density |
|------------|-----------------------------------|---------------------|
| `compact`  | Card headers, list items          | Low                 |
| `badge`    | Inline text, filters, tags        | Minimal             |
| `detailed` | Detail pages, modals, focus areas | High                |
| `chart`    | Analytics, comparisons            | Visual              |

---

## Revenue Tier System

### Tier Definitions

#### 🔹 STARTER ($5K-10K ARR)
- **Color:** Blue (`text-blue-400`)
- **Icon:** ◆ (diamond)
- **Target:** Solo founders, MVPs, side projects
- **Message:** "Testing market fit, early validation"

**Psychological positioning:**
- Accessible, low-risk entry point
- "Anyone can do this" messaging
- Focus on experimentation over scale

#### 🔺 GROWTH ($20K-50K ARR)
- **Color:** Green (`text-green-400`)
- **Icon:** ▲ (triangle up)
- **Target:** Full-time founders, sustainable businesses
- **Message:** "Proven model, replace your salary"

**Psychological positioning:**
- Traditional "success" marker (replace W-2 income)
- Green = growth, money, "go"
- Achievable but meaningful milestone

#### ⭐ SCALE ($100K-250K ARR)
- **Color:** Emerald (`text-emerald-400`)
- **Icon:** ★ (star)
- **Target:** Small teams, hiring phase
- **Message:** "Real business, ready to scale"

**Psychological positioning:**
- Premium tier, but still within reach
- Star = excellence, standout
- "Build a team" unlock threshold

#### ⊙ ENTERPRISE ($500K-1M+ ARR)
- **Color:** Amber (`text-amber-400`)
- **Icon:** ◉ (circled dot)
- **Target:** Venture-backable, serious scale
- **Message:** "Multiple teams, enterprise customers"

**Psychological positioning:**
- Aspirational, not unbelievable
- Amber = premium, caution (this is serious)
- VC-attention territory

### Why These Ranges?

**Credibility Thresholds:**
- $5K = One paying customer at $400/mo (believable)
- $50K = 10 customers at $400/mo (proven PMF)
- $250K = 50 customers or 10 enterprise deals (team-scale)
- $1M = 100+ customers or handful of big contracts (real company)

**Avoiding:**
- ❌ $10M+ claims (immediately triggers skepticism)
- ❌ Overlap between tiers (confusing)
- ❌ Generic "high revenue" without specifics

---

## Component Variants

### 1. Compact Variant (Default)

**Use in:** Card headers, list items, navigation

```tsx
<ARRDisplay data={arrData} variant="compact" animated />
```

**Features:**
- Tier badge with icon
- ARR range with `/YR` suffix
- Optional pulsing live indicator
- Fits in single line
- ~200px width

**Layout:**
```
┌────────────────────────────────────────┐
│ [◆ GROWTH] $20-50K/YR ●               │
└────────────────────────────────────────┘
```

### 2. Badge Variant

**Use in:** Inline text, filters, tags, chip collections

```tsx
<ARRDisplay data={arrData} variant="badge" />
```

**Features:**
- Minimal inline element
- Dollar sign icon
- No live indicator
- Works inline with text
- ~100px width

**Layout:**
```
This is a [$ $20-50K] revenue opportunity
```

### 3. Detailed Variant

**Use in:** Detail pages, modals, expanded views

```tsx
<ARRDisplay 
  data={arrData} 
  variant="detailed" 
  showBreakdown 
  showGrowth 
/>
```

**Features:**
- Full card with header
- Large ARR display
- Confidence score with progress bar
- Optional breakdown (monthly, per-customer)
- Optional growth projection
- ~400px width minimum

**Layout:**
```
┌────────────────────────────────────────┐
│ [chart icon] Revenue Potential [GROWTH]│
├────────────────────────────────────────┤
│                                        │
│  $20-50K  ARR                         │
│  [████████████────────] 85% confidence │
│                                        │
│  Monthly        Per Customer           │
│  $3.5K          $350                   │
│                                        │
│  [trend icon] +35% Projected growth    │
└────────────────────────────────────────┘
```

### 4. Chart Variant

**Use in:** Analytics dashboards, comparison views

```tsx
<ARRDisplay data={arrData} variant="chart" />
```

**Features:**
- Visual bar chart representation
- Annual + Monthly bars
- Tier label in corner
- Growth indicator at bottom
- ~400px width minimum

**Layout:**
```
┌────────────────────────────────────────┐
│ [zap icon] Revenue Projection   GROWTH │
│                                        │
│ Annual          $20-50K                │
│ [████████████████──────────────]       │
│                                        │
│ Monthly         $3.5K                  │
│ [████───────────────────────────]      │
│                                        │
│ ● Est. 35% YoY growth                  │
└────────────────────────────────────────┘
```

---

## Company Showcase Card

Complete card component for marketplace listings.

### Features

1. **Top indicator bar** - Colored bar matches tier (Bloomberg-style)
2. **Company header** - Name, category, live indicator
3. **Description** - 2-line truncated preview
4. **ARR display** - Compact variant by default
5. **Expandable details** - Click to show breakdown
6. **Confidence meter** - AI prediction accuracy

### Interaction Pattern

**Collapsed State:**
```
┌──────────────────────────────────┐ ← Green bar (tier)
│                                  │
│ TaskFlow AI            ●         │
│ PRODUCTIVITY SAAS                │
│                                  │
│ Automated workflow management... │
│                                  │
│ [▲ GROWTH] $20-50K/YR ●         │
│                                  │
│ ▶ Show Details                   │
└──────────────────────────────────┘
```

**Expanded State:**
```
┌──────────────────────────────────┐
│                                  │
│ TaskFlow AI            ●         │
│ PRODUCTIVITY SAAS                │
│                                  │
│ Automated workflow management... │
│                                  │
│ [▲ GROWTH] $20-50K/YR ●         │
│                                  │
│ ▼ Hide Details                   │
│ ────────────────────────────     │
│ Monthly     $3.5K                │
│ Growth      +35%                 │
│                                  │
│ AI Confidence                    │
│ [████████████────] 85%          │
└──────────────────────────────────┘
```

---

## Color Palette

### Tier Colors

All colors chosen for:
- **Visibility** on dark backgrounds
- **Meaning** in financial contexts
- **Accessibility** (WCAG AA contrast ratios)

```css
/* Starter - Blue */
text-blue-400     #60a5fa
bg-blue-500/10    rgba(59, 130, 246, 0.1)
border-blue-500/30 rgba(59, 130, 246, 0.3)

/* Growth - Green */
text-green-400     #4ade80
bg-green-500/10    rgba(34, 197, 94, 0.1)
border-green-500/30 rgba(34, 197, 94, 0.3)

/* Scale - Emerald */
text-emerald-400     #34d399
bg-emerald-500/10    rgba(16, 185, 129, 0.1)
border-emerald-500/30 rgba(16, 185, 129, 0.3)

/* Enterprise - Amber */
text-amber-400     #fbbf24
bg-amber-500/10    rgba(245, 158, 11, 0.1)
border-amber-500/30 rgba(245, 158, 11, 0.3)
```

### Surface Colors (from tailwind.config)

```css
surface-0: #0d0d0d  /* Main background */
surface-1: #161616  /* Slightly lifted */
surface-2: #1e1e1e  /* Card background */
surface-3: #262626  /* Hover state */
surface-4: #303030  /* Active state */
```

---

## Typography

### Fonts

```css
font-sans: SF Pro Display, SF Pro Text, system-ui
font-mono: SF Mono, Monaco, Cascadia Code, Consolas
```

### Financial Data Rules

**Always use monospace for:**
- Currency amounts
- Percentages
- Dates
- Confidence scores
- Any tabular data

**Use tabular numerals:**
```tsx
className="tabular-nums"  // CSS: font-variant-numeric: tabular-nums
```

This ensures numbers align vertically in tables and don't shift width.

### Size Scale

```css
/* Labels */
text-[10px]  /* Metadata, timestamps */
text-xs      /* Secondary info */

/* Primary data */
text-sm      /* Compact displays */
text-base    /* Standard */
text-2xl     /* Hero numbers */

/* Tracking */
tracking-wider     /* Labels */
tracking-tight     /* Large numbers */
```

---

## Animation

### Principles

1. **Minimal motion** - Only animate what needs to move
2. **Purpose-driven** - Every animation has meaning
3. **Fast timing** - 300ms or less for UI feedback
4. **Slow for data** - 1s for progress bars (feels deliberate)

### Animation Types

#### 1. Pulsing Indicator
```tsx
<div className="animate-pulse" />
```
**Meaning:** Live data, real-time, active system

**Used for:**
- Live indicators (dots)
- Status badges
- Tier icons

**Timing:** 2s ease-in-out infinite

#### 2. Progress Bar Fill
```tsx
<div 
  className="transition-all duration-1000"
  style={{ width: `${percentage}%` }}
/>
```
**Meaning:** Calculated value, confidence level

**Used for:**
- Confidence scores
- Revenue projections
- Chart bars

**Timing:** 1000ms ease-out

#### 3. Expandable Sections
```tsx
<div className="animate-fade-in" />
```
**Meaning:** New information revealed

**Used for:**
- Showcase card details
- Breakdown tables
- Tooltips

**Timing:** 300ms ease

### Performance

All animations use:
- `transform` (GPU accelerated)
- `opacity` (GPU accelerated)
- **No** `height`, `width`, or `left` animations (CPU bound)

---

## Data Structure

### ARRData Interface

```typescript
interface ARRData {
  min: number;        // Minimum ARR in dollars
  max: number;        // Maximum ARR in dollars
  tier: ARRTier;      // "starter" | "growth" | "scale" | "enterprise"
  monthly?: number;   // Optional: MRR (if not provided, min/12)
  growth?: number;    // Optional: YoY growth percentage
  confidence?: number; // Optional: AI confidence (0-100)
}
```

### Example Data

```typescript
const exampleARR: ARRData = {
  min: 20000,
  max: 50000,
  tier: "growth",
  monthly: 3500,
  growth: 35,
  confidence: 85,
};
```

### Validation Rules

1. **min < max** - Always
2. **Tier matches range:**
   - starter: $5-10K
   - growth: $20-50K
   - scale: $100-250K
   - enterprise: $500K+
3. **monthly ≈ (min + max) / 24** - If provided
4. **confidence: 0-100** - Percentage
5. **growth: positive number** - YoY percentage

---

## Implementation Guide

### 1. Basic Usage

```tsx
import ARRDisplay from "@/components/ARRDisplay";

function CompanyCard() {
  const arrData = {
    min: 20000,
    max: 50000,
    tier: "growth",
    confidence: 85,
  };

  return (
    <div className="card">
      <h3>Company Name</h3>
      <ARRDisplay data={arrData} variant="compact" />
    </div>
  );
}
```

### 2. Showcase Integration

```tsx
import { CompanyShowcaseCard } from "@/components/ARRDisplay";

function Marketplace() {
  const companies = [
    {
      company: {
        name: "TaskFlow AI",
        description: "Workflow automation platform",
        category: "Productivity",
      },
      arr: {
        min: 20000,
        max: 50000,
        tier: "growth",
        growth: 35,
        confidence: 85,
      },
    },
    // ... more companies
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {companies.map((item, i) => (
        <CompanyShowcaseCard key={i} {...item} />
      ))}
    </div>
  );
}
```

### 3. Filtering by Tier

```tsx
function MarketplaceWithFilters() {
  const [selectedTier, setSelectedTier] = useState<ARRTier | null>(null);

  const filteredCompanies = companies.filter(
    (c) => !selectedTier || c.arr.tier === selectedTier
  );

  return (
    <>
      <div className="flex gap-2">
        {["starter", "growth", "scale", "enterprise"].map((tier) => (
          <button
            key={tier}
            onClick={() => setSelectedTier(tier as ARRTier)}
            className={selectedTier === tier ? "active" : ""}
          >
            {tier.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filteredCompanies.map((item, i) => (
          <CompanyShowcaseCard key={i} {...item} />
        ))}
      </div>
    </>
  );
}
```

---

## Responsive Design

### Breakpoints

```css
/* Mobile: 320px+ */
- Single column grids
- Slightly smaller text (text-[10px] → text-[9px])
- Hide secondary info

/* Tablet: 768px+ */
- 2-column grids
- Full text sizes
- Show all info

/* Desktop: 1024px+ */
- 3-4 column grids
- Maximum data density
- Hover states active
```

### Mobile Considerations

**Compact variant on mobile:**
```tsx
<div className="flex flex-col sm:flex-row gap-2">
  {/* Stack vertically on mobile */}
</div>
```

**Hide confidence bars on small screens:**
```tsx
<div className="hidden sm:block">
  <ConfidenceBar value={85} />
</div>
```

---

## Accessibility

### 1. Semantic HTML

```tsx
<div role="region" aria-label="Revenue information">
  <ARRDisplay data={arrData} />
</div>
```

### 2. Color Independence

Never rely on color alone:
- Icons differentiate tiers (◆ ▲ ★ ◉)
- Text labels always present
- Patterns in charts (not just color)

### 3. Focus States

All interactive elements have visible focus:
```css
.showcase-card:focus-within {
  outline: 2px solid white;
  outline-offset: 2px;
}
```

### 4. Screen Reader Text

```tsx
<span className="sr-only">
  Annual recurring revenue: $20,000 to $50,000. Growth tier.
</span>
<ARRDisplay data={arrData} aria-hidden="true" />
```

---

## Future Enhancements

### 1. Historical Trends
Show ARR trajectory over time:
```tsx
<ARRDisplay 
  data={arrData}
  variant="trend"
  history={[
    { month: "Jan", arr: 15000 },
    { month: "Feb", arr: 22000 },
    { month: "Mar", arr: 35000 },
  ]}
/>
```

### 2. Comparison Mode
Side-by-side ARR comparison:
```tsx
<ARRComparison companies={[companyA, companyB]} />
```

### 3. Interactive Projections
Let users adjust assumptions:
```tsx
<ARRCalculator 
  basePrice={99}
  conversionRate={0.02}
  onUpdate={(arr) => console.log(arr)}
/>
```

### 4. Milestone Indicators
Show progress to next tier:
```tsx
<ARRDisplay 
  data={arrData}
  showNextMilestone 
  // "35% to Scale tier"
/>
```

---

## Testing Checklist

### Visual Regression
- [ ] All variants render correctly
- [ ] Colors match tier config
- [ ] Animations work smoothly
- [ ] No layout shift on data load

### Data Validation
- [ ] Handles missing optional fields
- [ ] Formats edge cases (0, 999, 1000000)
- [ ] Validates tier/range alignment

### Interaction
- [ ] Showcase card expand/collapse works
- [ ] Hover states apply
- [ ] Focus states visible
- [ ] Touch targets ≥44px on mobile

### Accessibility
- [ ] Screen reader announces values
- [ ] Keyboard navigation works
- [ ] Color contrast passes WCAG AA
- [ ] Works with prefers-reduced-motion

### Performance
- [ ] No unnecessary re-renders
- [ ] Animations don't block main thread
- [ ] Works with 100+ cards on page

---

## Credits

**Design inspiration:**
- Bloomberg Terminal (data density, monospace)
- Robinhood (green for growth, clean charts)
- Stripe Dashboard (confidence scores, clean cards)

**Component patterns:**
- Radix UI (compound components)
- Tailwind UI (utility-first styling)
- shadcn/ui (variant system)

---

## Questions?

For implementation help or design feedback, see:
- Component source: `/apps/web/src/components/ARRDisplay.tsx`
- Demo page: `/apps/web/src/pages/ARRShowcase.tsx`
- Live demo: `/arr-showcase` route (add to router)
