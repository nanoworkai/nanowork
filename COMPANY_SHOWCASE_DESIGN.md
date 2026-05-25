# Company Showcase Component - Design Documentation

## Overview

A modern showcase component for displaying AI-generated, ready-to-claim businesses on the Nanowork homepage. Replaces the existing departments grid with a marketplace-style presentation.

**Component Location:** `/apps/web/src/components/CompanyShowcase.tsx`

---

## Design Philosophy

### Bloomberg Terminal Aesthetic
- **Data Density**: Multiple metrics visible at a glance (ARR, price, features, status)
- **Monospace Typography**: All text uses SF Mono for terminal consistency
- **Grid System**: Responsive 1-4 column layout adapting to screen size
- **Status Indicators**: Live dots with color-coded states (green=available, yellow=building, gray=claimed)
- **Dark Theme**: Pure surface-0/1/2 hierarchy with white accents only
- **Zero Decoration**: No gradients, shadows minimal, all business

---

## Component Structure

### 1. Main Component: `CompanyShowcase`
- Container for the entire showcase section
- Manages filter state and company data
- Handles category filtering
- Displays section header with stats

### 2. Company Card: `CompanyCard`
- Individual company display unit
- Shows all key metrics and features
- Interactive hover states (available only)
- Status-dependent styling (available/building/claimed)

### 3. Filter Bar: `FilterBar`
- Category selection buttons
- Horizontal scrollable on mobile
- Active state highlighting

---

## Data Structure

```typescript
interface AICompany {
  id: string;                    // Unique identifier
  name: string;                  // Company name
  tagline: string;               // One-line description
  industry: string;              // Industry label
  category: string;              // Filter category
  arrPotential: number;          // Annual Recurring Revenue estimate ($)
  claimPrice: number;            // One-time claim price ($)
  features: string[];            // List of key features
  status: "available" | "claimed" | "building";
  icon: string;                  // Emoji or icon identifier
  color: string;                 // Hex accent color
  buildProgress?: number;        // 0-100 if building
}
```

---

## Visual Design Details

### Color Palette
```css
Background:     surface-0 (#0d0d0d)
Cards:          surface-2 (#1e1e1e)
Headers:        surface-1 (#161616)
Hover:          surface-3 (#262626)
Text Primary:   white
Text Secondary: white/60
Text Tertiary:  white/40
Accent:         white
Status Green:   #10b981 (available)
Status Yellow:  #f59e0b (building)
Status Gray:    white/40 (claimed)
```

### Typography Scale
```
Section Title:  text-xl/2xl font-mono font-bold uppercase
Card Title:     text-sm font-mono font-bold
Metrics:        text-lg font-mono font-bold tabular-nums
Body:           text-xs font-mono
Labels:         text-xs font-mono uppercase text-white/40
```

### Spacing System
```
Card Padding:   p-4
Section Gap:    gap-4
Grid Columns:   1 / md:2 / lg:3 / xl:4
Border:         border-white/10
Hover Border:   border-white/20
```

---

## Integration with Home.tsx

### Option 1: Replace Department Grid (Recommended)

**Location:** Lines 366-379 in `Home.tsx`

Replace this section:
```tsx
{/* Department Grid */}
<section className="py-8 sm:py-12">
  <div className="mb-4 sm:mb-6">...</div>
  <DepartmentGrid />
</section>
```

With:
```tsx
{/* Company Showcase */}
<CompanyShowcase />
```

### Option 2: Add Below Departments

Keep departments, add showcase after:
```tsx
{/* Department Grid */}
<section className="py-8 sm:py-12">
  <DepartmentGrid />
</section>

{/* Company Showcase */}
<CompanyShowcase />
```

### Import Statement
Add to top of `Home.tsx`:
```tsx
import CompanyShowcase from "../components/CompanyShowcase";
```

---

## Interaction Patterns

### Hover Effects
- **Available Companies**: Background lifts to surface-3, border brightens, cursor pointer
- **Building/Claimed**: No hover effect, reduced opacity (60%)
- **CTA Button**: Background fades slightly, arrow shifts right

### Click Behavior
- **Claim Button**: Navigates to `/claim/{companyId}` (route to be created)
- **Category Filters**: Instant filter, no loading state needed
- **Build Custom Button**: Scrolls to top (terminal prompt)

### Status States
```
AVAILABLE  → Green dot (animate-pulse) + "AVAILABLE" label
BUILDING   → Yellow dot (animate-pulse) + "BUILDING" label + progress bar
CLAIMED    → Gray dot (static) + "CLAIMED" label + disabled
```

---

## Sample Data Provided

8 pre-configured companies across categories:
1. **FlowFinance** - FinTech invoice automation ($250K ARR, $4.9K claim)
2. **CreatorStack** - SaaS content monetization ($500K ARR, $7.9K claim)
3. **LocalEats** - Marketplace food delivery ($1.2M ARR, $12.9K claim) - BUILDING
4. **CodeMentor AI** - AI/ML code review ($800K ARR, $9.9K claim)
5. **FitTrack Pro** - SaaS fitness app ($350K ARR, $5.9K claim)
6. **PropConnect** - SaaS property management ($600K ARR, $8.9K claim) - CLAIMED
7. **SustainShop** - E-commerce eco products ($450K ARR, $6.9K claim)
8. **TeamSync** - SaaS async collaboration ($900K ARR, $11.9K claim)

Total ARR Potential: **$5.05M**

---

## Responsive Behavior

### Mobile (< 768px)
- Single column grid
- Horizontal scroll for filters
- Stacked metrics (2-column within cards)
- Hide secondary stats in header

### Tablet (768px - 1024px)
- 2-column grid
- Full filter bar visible
- Compact card padding

### Desktop (1024px+)
- 3-column grid
- Full stats in header
- Comfortable spacing

### XL Desktop (1280px+)
- 4-column grid (max density)
- All features visible
- Maximum information density

---

## Accessibility

### Keyboard Navigation
- All interactive elements focusable
- Tab order: filters → cards → CTA buttons
- Enter/Space activates buttons

### Screen Readers
- Status indicators have text labels
- Metrics have descriptive labels ("ARR Potential", "Claim Price")
- Category buttons have clear labels
- Disabled states announced

### Color Contrast
- All text meets WCAG AA standards (4.5:1 minimum)
- Status indicators use both color AND text
- Hover states don't rely solely on color

---

## Future Enhancements

### Phase 2 Features
1. **Real-time updates**: WebSocket for status changes
2. **Search bar**: Filter by name/tagline/industry
3. **Sorting**: Price, ARR, newest, popularity
4. **Detailed modal**: Click card for full details
5. **Wishlist**: Save favorite companies
6. **Price alerts**: Notify when price drops

### Backend Integration
```typescript
// API endpoints needed:
GET  /api/companies              // List all companies
GET  /api/companies/:id          // Get single company
POST /api/companies/:id/claim    // Claim a company
GET  /api/companies/stats        // Global stats
```

### Animation Enhancements
- Stagger card entrance animations
- Smooth category switch transitions
- Progress bar real-time updates
- Ticker-style ARR counter

---

## Performance Considerations

### Current Implementation
- Static data (no API calls)
- Instant filtering (client-side)
- Minimal re-renders (useState for filters only)
- No images (emoji icons for speed)

### Production Optimization
- Implement virtual scrolling for 100+ companies
- Lazy load card details
- Cache filter states in localStorage
- Prefetch claim flow routes

---

## Testing Checklist

- [ ] All filters work correctly
- [ ] Hover states only on available companies
- [ ] Building progress bar displays correctly
- [ ] Claimed companies are disabled
- [ ] Empty state shows when no results
- [ ] Responsive layout works on all breakpoints
- [ ] CTA buttons navigate correctly
- [ ] Stats update when filtering
- [ ] Category pills highlight active state
- [ ] Keyboard navigation functions properly

---

## Code Quality

### TypeScript
- Full type safety with interfaces
- No `any` types
- Proper prop typing for all components

### Component Organization
- Clear separation of concerns
- Reusable sub-components
- Self-documenting code with comments

### Styling
- Tailwind utility classes only
- Consistent with existing design system
- No custom CSS required

---

## Questions & Support

**File Location:**
- Component: `/apps/web/src/components/CompanyShowcase.tsx`
- Documentation: `/COMPANY_SHOWCASE_DESIGN.md`

**Key Design Decisions:**
1. **Why emoji icons?** Fast, scalable, no image loading, personality without breaking terminal aesthetic
2. **Why tabular-nums?** Ensures numbers align perfectly in grids (Bloomberg principle)
3. **Why 4-column max?** Maintains readability, follows terminal window paradigm
4. **Why no images?** Speed, consistency, forces focus on data

**Design System Compliance:**
- ✅ Uses only surface-0/1/2/3 colors
- ✅ Monospace typography throughout
- ✅ Rounded-none (no border radius)
- ✅ Minimal hover effects (subtle lift only)
- ✅ Status dots with pulse animation
- ✅ Uppercase tracking for labels
- ✅ Tabular numbers for metrics

---

## Implementation Timeline

**Immediate** (5 minutes):
1. Import component in Home.tsx
2. Replace DepartmentGrid section
3. Test responsive behavior

**Short-term** (1 hour):
1. Create `/claim/:id` route
2. Add claim flow modal
3. Connect to auth context

**Long-term** (future sprint):
1. Backend API integration
2. Real-time status updates
3. Search and advanced filtering
4. User wishlist feature
