# Business Detail View - Implementation Guide

## Quick Start

The Business Detail View is already integrated into the marketplace. Here's how it works:

### Current Flow:

1. User visits `/marketplace`
2. Clicks on any available business card
3. Modal opens with full business details
4. User can:
   - Browse tabs (Overview, Technical, Financial)
   - Bookmark the business
   - Share via social or copy link
   - Click "Claim This Business" to purchase

## File Structure

```
apps/web/src/
├── components/
│   ├── BusinessDetailView.tsx        (Main modal component)
│   ├── BusinessPreviewRenderer.tsx   (Dynamic preview renderer)
│   └── MarketplaceCard.tsx           (Updated with modal integration)
├── data/
│   └── businesses.ts                 (Business data types & mock data)
└── pages/
    └── Marketplace.tsx               (Main marketplace page)
```

## Component Architecture

```
Marketplace.tsx
  └── MarketplaceCard.tsx (grid/list view)
        ├── [Click Handler]
        └── BusinessDetailView.tsx (modal)
              ├── Header (status, actions)
              ├── BusinessPreviewRenderer.tsx
              ├── Tab Navigation
              ├── Tab Content
              │     ├── Overview Tab
              │     ├── Technical Tab
              │     └── Financial Tab
              └── Sticky Sidebar (pricing, CTA)
```

## Preview Types Examples

### 1. SaaS Business Preview
```typescript
preview: {
  kind: "saas",
  brand: "TaskFlow",
  headline: "Work smarter.",
  sub: "AI-powered task management",
  metric: "94%",
  metricLabel: "user satisfaction"
}
```
**Visual**: Metric card, clean dashboard aesthetic

### 2. Commerce Business Preview
```typescript
preview: {
  kind: "commerce",
  brand: "Ovenly",
  headline: "Today's bake.",
  product: "Sourdough boule · fresh at 3pm",
  price: "$12"
}
```
**Visual**: Product card with price, warm bakery feel

### 3. Newsletter Preview
```typescript
preview: {
  kind: "newsletter",
  brand: "Fieldnote",
  headline: "Notes from the floor.",
  issue: "Issue 47 · Scaling with 3 people",
  subs: "1,412 paid readers"
}
```
**Visual**: Magazine/publication layout with masthead

### 4. Local Business Preview
```typescript
preview: {
  kind: "local",
  brand: "Nightkey",
  headline: "Stay direct.",
  sub: "Three houses. No middle.",
  cta: "Check dates"
}
```
**Visual**: Location-focused, prominent booking CTA

### 5. Directory Preview
```typescript
preview: {
  kind: "directory",
  brand: "Stackview",
  headline: "engineers, rendered.",
  count: "184 portfolios shipped"
}
```
**Visual**: List/catalog style with total count

## Customization

### Theme Colors

Each business has a theme object:

```typescript
theme: {
  bg: "#0e120f",         // Background color
  surface: "#151b17",    // Card/surface color
  accent: "#7bd3a8",     // Primary accent (buttons, highlights)
  accent2: "#2e4a3a",    // Secondary accent (borders, subtle)
  text: "#ecf4ef",       // Primary text color
  muted: "rgba(236, 244, 239, 0.6)"  // Muted text
}
```

The preview renderer automatically applies these colors to create unique branding.

### Adding New Preview Types

To add a new preview type:

1. **Update Type Definition** in `businesses.ts`:
```typescript
export type BusinessPreview =
  | { kind: "saas"; /* ... */ }
  | { kind: "commerce"; /* ... */ }
  | { kind: "yournewtype"; /* new fields */ };
```

2. **Add Renderer** in `BusinessPreviewRenderer.tsx`:
```typescript
if (preview.kind === "yournewtype") {
  return (
    <div className="..." style={baseStyle}>
      {/* Your custom preview layout */}
    </div>
  );
}
```

3. **Add Sample Data** in `businesses.ts`:
```typescript
{
  slug: "example",
  // ... other fields
  preview: {
    kind: "yournewtype",
    // ... your fields
  }
}
```

## Styling Guide

### Terminal Aesthetic Rules

1. **No Rounded Corners**: Except for badges/pills
2. **Monospace Font**: All data, metrics, prices
3. **Border-First**: Use borders over shadows
4. **High Contrast**: Dark bg, light text
5. **Subtle Animations**: Pulse for live data only
6. **Grid Patterns**: Use for texture, not decoration

### Color Palette

```css
/* Base Colors */
--surface-0: #000000      /* Page background */
--surface-1: #0a0a0a      /* Card background */
--surface-2: #141414      /* Hover states */
--surface-3: #1e1e1e      /* Active states */

/* Text Colors */
--text-primary: #ffffff
--text-secondary: rgba(255, 255, 255, 0.7)
--text-muted: rgba(255, 255, 255, 0.4)

/* Status Colors */
--status-available: #10b981    /* Green */
--status-pending: #f59e0b      /* Amber */
--status-sold: #6b7280         /* Gray */

/* Tier Colors */
--tier-starter: #3b82f6        /* Blue */
--tier-growth: #10b981         /* Green */
--tier-scale: #10b981          /* Emerald */
--tier-enterprise: #f59e0b     /* Amber */
```

## Integration Points

### 1. Claim/Purchase Flow

Current placeholder:
```typescript
const handleClaimBusiness = () => {
  console.log("Claiming business:", business.slug);
  alert(`Claiming ${business.name} - Integration pending`);
};
```

Replace with:
```typescript
const handleClaimBusiness = async () => {
  // 1. Check authentication
  if (!user) {
    router.push(`/login?redirect=/marketplace`);
    return;
  }

  // 2. Create Stripe checkout session
  const response = await fetch('/api/checkout/create', {
    method: 'POST',
    body: JSON.stringify({
      businessId: business.slug,
      userId: user.id,
      amount: business.price,
    }),
  });

  const { sessionUrl } = await response.json();

  // 3. Redirect to Stripe
  window.location.href = sessionUrl;
};
```

### 2. Bookmark Functionality

Current placeholder:
```typescript
const handleBookmark = () => {
  setSavedBookmark(!savedBookmark);
  // TODO: Integrate with actual bookmark API
};
```

Replace with:
```typescript
const handleBookmark = async () => {
  try {
    if (savedBookmark) {
      await fetch(`/api/bookmarks/${business.slug}`, {
        method: 'DELETE',
      });
    } else {
      await fetch('/api/bookmarks', {
        method: 'POST',
        body: JSON.stringify({ businessId: business.slug }),
      });
    }
    setSavedBookmark(!savedBookmark);
  } catch (error) {
    console.error('Bookmark failed:', error);
  }
};
```

### 3. Analytics Tracking

Add view tracking:
```typescript
useEffect(() => {
  if (isOpen) {
    // Track modal open
    fetch('/api/analytics/business-view', {
      method: 'POST',
      body: JSON.stringify({
        businessId: business.slug,
        timestamp: Date.now(),
      }),
    });
  }
}, [isOpen, business.slug]);
```

## API Endpoints Needed

### GET /api/businesses/:slug
```json
{
  "business": { /* Business object */ },
  "isBookmarked": false,
  "viewCount": 142,
  "recentViews": 12
}
```

### POST /api/bookmarks
```json
{
  "businessId": "lamina",
  "userId": "user_123"
}
```

### DELETE /api/bookmarks/:businessId
```json
{
  "success": true
}
```

### POST /api/checkout/create
```json
{
  "businessId": "lamina",
  "userId": "user_123",
  "amount": 4200,
  "successUrl": "https://app.com/success",
  "cancelUrl": "https://app.com/cancel"
}
```
Response:
```json
{
  "sessionId": "cs_test_...",
  "sessionUrl": "https://checkout.stripe.com/..."
}
```

### POST /api/analytics/business-view
```json
{
  "businessId": "lamina",
  "userId": "user_123",
  "timestamp": 1716536400000
}
```

## Testing

### Manual Testing Checklist

1. **Open Modal**
   - [ ] Click card in grid view
   - [ ] Click card in list view
   - [ ] Modal opens smoothly
   - [ ] Backdrop appears

2. **Close Modal**
   - [ ] Click X button
   - [ ] Click backdrop
   - [ ] Press ESC key
   - [ ] Modal closes smoothly

3. **Navigation**
   - [ ] Switch between tabs
   - [ ] Content updates correctly
   - [ ] Tab indicator moves

4. **Preview Rendering**
   - [ ] SaaS preview displays correctly
   - [ ] Commerce preview displays correctly
   - [ ] Newsletter preview displays correctly
   - [ ] Local preview displays correctly
   - [ ] Directory preview displays correctly
   - [ ] Theme colors apply properly

5. **Actions**
   - [ ] Bookmark toggle works
   - [ ] Share button works (or copies URL)
   - [ ] Claim button is clickable (available)
   - [ ] Claim button is disabled (sold/pending)

6. **Responsive**
   - [ ] Mobile: Single column layout
   - [ ] Tablet: Adjusted grid
   - [ ] Desktop: Two-column layout
   - [ ] Sidebar is sticky on desktop

7. **Status Badges**
   - [ ] Available: Green with pulse
   - [ ] Pending: Amber with clock
   - [ ] Sold: Gray with checkmark

8. **Metrics Calculation**
   - [ ] ARR calculated correctly from MRR
   - [ ] ROI estimate makes sense
   - [ ] Price displays with commas

### Unit Tests (TODO)

```typescript
describe('BusinessDetailView', () => {
  it('renders business information correctly', () => {
    // Test
  });

  it('closes on backdrop click', () => {
    // Test
  });

  it('closes on ESC key', () => {
    // Test
  });

  it('switches tabs correctly', () => {
    // Test
  });

  it('disables claim button for sold businesses', () => {
    // Test
  });
});

describe('BusinessPreviewRenderer', () => {
  it('renders SaaS preview', () => {
    // Test
  });

  it('renders Commerce preview', () => {
    // Test
  });

  it('applies theme colors', () => {
    // Test
  });
});
```

## Performance Optimization

### Current State
- Modal renders on demand (not mounted until opened)
- Preview images lazy-loaded
- CSS animations (GPU accelerated)

### Future Optimizations
1. **Preload First Business**: Preload first business data on marketplace load
2. **Image Optimization**: Use next/image or similar for automatic optimization
3. **Code Splitting**: Lazy load BusinessDetailView component
4. **Memoization**: Memoize expensive calculations (ARR, ROI)
5. **Virtual Scrolling**: For very long lists in marketplace

## Accessibility

### Already Implemented
- Semantic HTML structure
- Keyboard navigation (ESC to close)
- Focus trap in modal
- ARIA labels on buttons
- Color contrast > WCAG AA

### TODO
- [ ] Screen reader announcements on modal open
- [ ] Focus management (return focus on close)
- [ ] ARIA live regions for dynamic content
- [ ] Keyboard navigation between tabs (arrow keys)

## Troubleshooting

### Modal Won't Open
- Check `isOpen` prop is being set
- Verify no console errors
- Check z-index conflicts with other elements

### Preview Not Rendering
- Verify `preview.kind` matches one of the defined types
- Check theme object has all required properties
- Look for console warnings about missing props

### Claim Button Not Working
- Check `onClaim` callback is defined
- Verify business status is "available"
- Check console for errors in claim handler

### Styles Not Applying
- Verify Tailwind classes are correct
- Check custom CSS variables are defined
- Ensure parent container doesn't override z-index

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Modal | ✅ | ✅ | ✅ | ✅ |
| Backdrop Blur | ✅ | ✅ | ✅ | ✅ |
| Web Share API | ✅ | ❌* | ✅ | ✅ |
| CSS Grid | ✅ | ✅ | ✅ | ✅ |
| Sticky Position | ✅ | ✅ | ✅ | ✅ |

*Falls back to clipboard copy

## Deployment Notes

1. **Environment Variables**: None required for UI
2. **Build Size**: ~15KB gzipped (modal + preview renderer)
3. **Runtime Dependencies**: lucide-react (already in project)
4. **CSS Dependencies**: Tailwind CSS (already configured)

## Support

For questions or issues:
1. Check this guide first
2. Review component source code comments
3. Check console for errors
4. Test in isolation with sample data
