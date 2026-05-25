# Welcome Experience System

## Overview

A professional, trust-building welcome experience for new users entering the Nanowork dashboard. The system consists of dismissible components that guide users through their first interactions without being intrusive.

## Components

### 1. WelcomeBanner.tsx

**Purpose**: First-impression greeting that establishes confidence and provides orientation.

**Features**:
- Professional greeting with user's name (if available)
- Overview of platform capabilities
- Three-column quick tour highlighting key features
- Dismissible with localStorage persistence
- Elegant gradient design with subtle background effects

**Usage**:
```tsx
import WelcomeBanner from "./components/WelcomeBanner";

<WelcomeBanner
  userName={profile?.name || profile?.businessName}
  onDismiss={() => console.log('Banner dismissed')}
/>
```

**Dismissal State**:
- Key: `nanowork_welcome_dismissed`
- Stored in localStorage
- Once dismissed, never shows again for that user

---

### 2. QuickStart.tsx

**Purpose**: Progress-based onboarding guide with actionable steps.

**Features**:
- Dynamic progress tracking (visual progress bar)
- Three onboarding steps with completion status
- Collapsible interface to reduce screen real estate
- Dismissible with localStorage persistence
- Step-by-step guidance with clear CTAs
- Automatic hiding when all steps completed

**Steps**:
1. **Create your first build** - Links to /dashboard
2. **Explore your dashboard** - Links to /dashboard/history
3. **Complete your profile** - Links to /dashboard/settings

**Usage**:
```tsx
import QuickStart from "./components/QuickStart";

<QuickStart
  hasBuilds={hasBuilds}
  profileComplete={!!(profile?.businessName && profile?.name)}
  onDismiss={() => console.log('Quick start dismissed')}
/>
```

**Props**:
- `hasBuilds`: boolean - Whether user has created any builds
- `profileComplete`: boolean - Whether user has completed profile info
- `onDismiss`: function - Callback when dismissed

**Dismissal State**:
- Key: `nanowork_quickstart_dismissed`
- Stored in localStorage
- Can be re-shown by clearing localStorage if needed

---

### 3. EmptyState.tsx

**Purpose**: Reusable empty state component for consistent UI across dashboard.

**Features**:
- Icon-based illustration with optional secondary icon
- Customizable title, description, and action
- Optional features list showing what users can expect
- Consistent styling and spacing
- Fully flexible and reusable

**Usage**:
```tsx
import EmptyState from "./components/EmptyState";
import { Inbox, Mail } from "lucide-react";

<EmptyState
  icon={Inbox}
  secondaryIcon={Mail}
  title="No Messages Yet"
  description="Your inbox is empty. Messages will appear here when you receive them."
  actionLabel="Compose Message"
  actionIcon={Mail}
  onAction={() => navigate('/compose')}
  features={[
    "Message threading",
    "File attachments",
    "Read receipts",
    "Search & filters"
  ]}
/>
```

**Props**:
- `icon`: LucideIcon - Main icon for illustration
- `secondaryIcon?`: LucideIcon - Optional badge icon
- `title`: string - Main heading
- `description`: string - Supporting text
- `actionLabel?`: string - CTA button text
- `actionIcon?`: LucideIcon - Icon for CTA button
- `onAction?`: function - Click handler for CTA
- `features?`: string[] - List of features/expectations
- `className?`: string - Additional styling

---

## Integration Points

### Create.tsx (Dashboard Home)

The main landing page for new users includes:

1. **WelcomeBanner** - Shows immediately for first-time users
2. **QuickStart** - Guides users through initial steps
3. **Existing form** - Main build creation interface

**Implementation**:
```tsx
// Check if user has builds
useEffect(() => {
  const checkBuilds = async () => {
    if (!session?.access_token) return;
    const res = await fetch(`${apiUrl}/api/builds`, {
      headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (res.ok) {
      const { builds } = await res.json();
      setHasBuilds(builds && builds.length > 0);
    }
  };
  checkBuilds();
}, [session, apiUrl]);

// Render components
<WelcomeBanner userName={profile?.name || profile?.businessName} />
<QuickStart hasBuilds={hasBuilds} profileComplete={profileComplete} />
```

---

### History.tsx

Enhanced empty state using the EmptyState component pattern:

**Before**: Simple empty message with basic styling
**After**: Professional empty state with:
- Visual icon illustration
- Descriptive messaging
- Clear call-to-action
- Feature expectations list

**Implementation**: See History.tsx lines 98-140

---

## Design Principles

### 1. Trust-Building
- Professional, polished visual design
- Clear, confident messaging
- No marketing fluff or over-promises
- Practical, actionable information

### 2. Non-Intrusive
- All components are dismissible
- Preferences persist across sessions
- Quick collapse/expand options
- Automatic hiding when no longer relevant

### 3. Guidance Without Hand-Holding
- Clear next steps, but not pushy
- Users can skip or dismiss anytime
- Information is helpful, not mandatory
- Respects user agency

### 4. Progressive Disclosure
- WelcomeBanner: High-level orientation
- QuickStart: Step-by-step guidance
- EmptyStates: Contextual help when needed

---

## Styling & Theme

All components use the existing dashboard design system:

**Colors**:
- `bg-surface-0`, `bg-surface-1`, `bg-surface-2` - Background layers
- `border-white/10`, `border-white/20` - Subtle borders
- `text-white/60`, `text-white/80` - Text hierarchy
- Accent colors for CTAs and highlights

**Spacing**:
- Consistent padding: `p-4`, `p-6`, `p-8`
- Gap utilities: `gap-2`, `gap-4`, `gap-6`
- Margin utilities: `mb-4`, `mb-6`, `mb-8`

**Interactive Elements**:
- `hover:bg-white/5` - Subtle hover states
- `transition-all` - Smooth transitions
- `rounded-xl`, `rounded-2xl` - Modern rounded corners
- `shadow-lg`, `shadow-xl` - Depth when needed

---

## localStorage Keys

| Key | Purpose | Values |
|-----|---------|--------|
| `nanowork_welcome_dismissed` | Tracks WelcomeBanner dismissal | `"true"` or not set |
| `nanowork_quickstart_dismissed` | Tracks QuickStart dismissal | `"true"` or not set |

**Reset for Testing**:
```javascript
// In browser console
localStorage.removeItem('nanowork_welcome_dismissed');
localStorage.removeItem('nanowork_quickstart_dismissed');
```

---

## User Flow

### First Visit
1. User logs in and lands on `/dashboard`
2. **WelcomeBanner** appears - explains platform
3. **QuickStart** appears - shows progress (0/3)
4. User creates first build
5. **QuickStart** updates (1/3 complete)
6. User continues through steps or dismisses

### Return Visit (Before Completion)
1. WelcomeBanner hidden (dismissed)
2. QuickStart shows if not dismissed and steps incomplete
3. Regular dashboard interface

### Return Visit (After Completion)
1. Both components hidden
2. Clean, professional dashboard
3. Empty states provide contextual guidance

---

## Future Enhancements

Potential improvements for future iterations:

1. **Tooltips**: Inline help on specific features
2. **Feature Tours**: Interactive walkthroughs for complex features
3. **Contextual Help**: AI-powered assistance based on user behavior
4. **Video Tutorials**: Short clips for visual learners
5. **Progress Persistence**: Backend storage for cross-device progress
6. **Personalization**: Dynamic content based on user industry/role
7. **Celebration Moments**: Micro-interactions when completing milestones

---

## Testing

### Manual Testing Checklist

- [ ] WelcomeBanner appears on first visit
- [ ] WelcomeBanner dismisses and stays hidden
- [ ] QuickStart shows correct progress
- [ ] QuickStart navigation links work
- [ ] QuickStart collapse/expand works
- [ ] Empty states display correctly
- [ ] Empty state CTAs navigate correctly
- [ ] Mobile responsive on all screen sizes
- [ ] localStorage persistence works across sessions

### Browser Testing

Test in:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Accessibility

All components follow WCAG 2.1 Level AA guidelines:

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **ARIA Labels**: Buttons have descriptive aria-labels
- **Color Contrast**: Text meets 4.5:1 contrast ratio
- **Focus Indicators**: Clear focus states on all interactive elements
- **Screen Readers**: Semantic HTML and proper heading hierarchy

---

## References

**Inspiration**:
- Stripe's onboarding flow (progressive, non-intrusive)
- Linear's workspace setup (clear, actionable steps)
- Notion's welcome experience (helpful without being pushy)
- Vercel's new project flow (trust-building, professional)

**Design Philosophy**:
- "Users are starting real businesses" - Professional tone
- "They need to feel confident and guided" - Clear information
- "Currently just drops them in" - Address the gap
- "This company knows what they're doing" - Target impression

---

## Support

For questions or issues:
1. Check this documentation first
2. Review component source code for inline comments
3. Test in browser console with localStorage cleared
4. Verify API responses for build data

---

**Last Updated**: 2026-05-24  
**Version**: 1.0.0  
**Components**: 3 (WelcomeBanner, QuickStart, EmptyState)  
**Integration Points**: 2 (Create.tsx, History.tsx)
