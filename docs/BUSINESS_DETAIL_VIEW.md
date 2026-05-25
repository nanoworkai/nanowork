# Business Detail View Component

A comprehensive, premium business detail modal/overlay component for the Nanowork marketplace. Displays full business information before users claim/purchase.

## Files Created

### 1. BusinessPreviewRenderer.tsx
**Location:** `/Users/jordan/Dev/nanowork-web/apps/web/src/components/BusinessPreviewRenderer.tsx`

Renders dynamic business previews based on business type:
- **SaaS**: Metric-focused dashboard view with headline and stats
- **Commerce**: Product-focused with pricing card
- **Newsletter**: Publication-style with masthead and article preview
- **Local**: Location-based with prominent CTA
- **Directory**: List/catalog style with count display

Each preview uses the business's custom theme for unique branding.

### 2. BusinessDetailView.tsx
**Location:** `/Users/jordan/Dev/nanowork-web/apps/web/src/components/BusinessDetailView.tsx`

Main detail view modal with comprehensive sections:

#### Features:
- **Modal Overlay Design**: Full-screen modal with backdrop blur
- **Status Indicators**: Available/Pending/Sold badges
- **Interactive Tabs**: Overview, Technical, Financial sections
- **Sticky Sidebar**: Pricing and CTA always visible
- **Bookmark & Share**: Social features built-in
- **Responsive Layout**: Mobile-optimized grid to single column

#### Sections:

**Hero Section:**
- Business name (3xl-5xl heading)
- Tagline
- Quick stats (ARR, tech count, includes)
- Status badge

**Preview Area:**
- Full BusinessPreviewRenderer integration
- Large, branded preview of the business

**Tabbed Content:**

1. **Overview Tab:**
   - Complete description
   - What's included (with checkmarks)
   - Key features (6 standard items)
   - Getting started guide (3-step process)

2. **Technical Tab:**
   - Full tech stack list
   - Technical details grid
   - Architecture info
   - Code quality notes

3. **Financial Tab:**
   - Revenue metrics dashboard (MRR, ARR, ROI)
   - Investment breakdown
   - Business model explanation
   - Pricing transparency

**Sticky Sidebar:**
- One-time investment price
- Primary CTA: "Claim This Business"
- Secondary CTA: "Contact Sales"
- Trust signals (secure payment, support, launch ready)

**Additional Features:**
- Smooth animations (fade-in, slide-up)
- Hover states throughout
- Share functionality (native Web Share API + clipboard fallback)
- Bookmark toggle (UI ready, needs backend integration)

### 3. MarketplaceCard.tsx (Updated)
**Location:** `/Users/jordan/Dev/nanowork-web/apps/web/src/components/MarketplaceCard.tsx`

Updated to integrate BusinessDetailView modal:
- Added state for modal visibility
- Click handlers to open detail view
- Passes business data to modal
- Handles claim action

## Integration

### Already Integrated:
- `/marketplace` route exists in App.tsx
- Marketplace page uses MarketplaceCard components
- MarketplaceCard opens BusinessDetailView on click

### Usage Example:

```tsx
import { BusinessDetailView } from "@/components/BusinessDetailView";
import { useState } from "react";

function YourComponent() {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  const handleClaim = () => {
    // Your claim logic here
    console.log("Claiming:", selectedBusiness);
  };

  return (
    <>
      <button onClick={() => setSelectedBusiness(someBusiness)}>
        View Business
      </button>

      {selectedBusiness && (
        <BusinessDetailView
          business={selectedBusiness}
          isOpen={true}
          onClose={() => setSelectedBusiness(null)}
          onClaim={handleClaim}
        />
      )}
    </>
  );
}
```

## Design Decisions

### Modal vs Dedicated Page
**Decision: Modal Overlay**

Reasons:
1. **Context Preservation**: Users stay on marketplace, can easily browse multiple businesses
2. **Faster Navigation**: No page reload, instant open/close
3. **Better UX Flow**: Natural interaction for "quick view" before committing
4. **Reduced Back Button Confusion**: Modal close vs browser back
5. **Mobile Friendly**: Full-screen on mobile feels like dedicated page anyway

### Visual Hierarchy

1. **Status & Availability** (top priority)
2. **Business Name & Preview** (brand identity)
3. **Pricing & CTA** (sticky sidebar, always visible)
4. **Detailed Information** (tabs for organization)
5. **Trust Signals** (secondary, reinforcement)

### Color & Styling

- Maintains terminal/Bloomberg aesthetic
- Uses business theme colors in preview section
- High contrast for readability
- Monospace typography for data
- Subtle animations (no distraction)
- Border-focused design (no rounded corners except badges)

## Data Structure

Uses existing `Business` type from `/data/businesses.ts`:

```typescript
type Business = {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  price: number;
  mrr?: string;
  status: BusinessStatus;
  stack: string[];
  includes: string[];
  theme: BusinessTheme;
  preview: BusinessPreview;
}
```

## TODO: Backend Integration

The component is UI-complete but needs backend integration for:

1. **Claim Flow** (`onClaim` handler):
   - Payment processing (Stripe)
   - User authentication check
   - Transfer of ownership
   - Access provisioning

2. **Bookmarks**:
   - Save/unsave business to user profile
   - Persist across sessions
   - Show in user dashboard

3. **Analytics**:
   - Track views per business
   - Time spent in detail view
   - Conversion rate tracking

4. **Share Tracking**:
   - Count shares
   - Track referral sources
   - Affiliate/referral system

## Responsive Behavior

### Desktop (lg+):
- Two-column layout (content + sticky sidebar)
- Grid view for metrics
- Full preview size
- All tabs expanded

### Tablet (md-lg):
- Still two-column but narrower
- Metrics stay side-by-side
- Sidebar becomes less sticky

### Mobile (<md):
- Single column stacked
- Sidebar moves to bottom
- Full-width CTAs
- Simplified metrics
- Preview adjusts height

## Performance Notes

- Modal uses React portal for proper z-index management
- Animations are CSS-based (no JS animation libraries)
- Images lazy-loaded (browser native)
- Preview renderer memoizable for large lists
- No external dependencies beyond lucide-react icons

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Native Web Share API (falls back to clipboard)
- CSS Grid & Flexbox layout
- No IE11 support required

## Accessibility

- Proper semantic HTML structure
- Keyboard navigation support (ESC to close, Tab to navigate)
- Focus management (traps focus in modal)
- ARIA labels on interactive elements
- Color contrast meets WCAG AA standards
- Screen reader friendly status badges

## Testing Checklist

- [ ] Open/close modal smoothly
- [ ] Tab navigation works
- [ ] Bookmark toggle persists visually
- [ ] Share button works (or copies URL)
- [ ] Responsive layouts at all breakpoints
- [ ] Status badges display correctly
- [ ] Preview renders for all business types
- [ ] Pricing calculations are accurate
- [ ] CTA buttons are properly disabled for sold businesses
- [ ] Keyboard shortcuts work (ESC to close)
- [ ] Backdrop click closes modal
- [ ] Multiple rapid opens/closes don't break state

## Next Steps

1. **Integrate Payment Flow**: Connect onClaim to Stripe Checkout
2. **Add Bookmarks Backend**: Save bookmarks to user profile
3. **Analytics Integration**: Track views and conversions
4. **A/B Testing**: Test different CTA copy and layouts
5. **Add Reviews/Social Proof**: Show purchase testimonials
6. **Similar Businesses**: Suggest related businesses at bottom
7. **Live Preview**: Add interactive demo links where applicable
8. **Video Demos**: Support video previews for some businesses
