# Welcome Experience Integration Guide

## Component Hierarchy

```
DashboardLayout.tsx
│
├─ Outlet (React Router)
   │
   ├─ Create.tsx (route: /dashboard)
   │  │
   │  ├─ WelcomeBanner
   │  │  └─ Shows once, dismissible
   │  │
   │  ├─ QuickStart
   │  │  └─ Shows until completed or dismissed
   │  │
   │  └─ Main Build Form
   │     └─ Existing create interface
   │
   └─ History.tsx (route: /dashboard/history)
      │
      └─ Enhanced Empty State
         └─ Professional guidance when no builds
```

## Data Flow

```
AuthContext
    │
    ├─ profile: UserProfile
    │  ├─ name
    │  ├─ businessName
    │  └─ [completion status]
    │
    └─ session: Session
       └─ access_token
          │
          └─ API: GET /api/builds
             └─ hasBuilds: boolean
```

## State Management

### Component States

```typescript
// Create.tsx
const [prompt, setPrompt] = useState("");
const [creating, setCreating] = useState(false);
const [hasBuilds, setHasBuilds] = useState(false);

// Computed
const profileComplete = !!(profile?.businessName && profile?.name);
```

### localStorage States

```typescript
// WelcomeBanner
localStorage.getItem('nanowork_welcome_dismissed')
// Returns: "true" | null

// QuickStart  
localStorage.getItem('nanowork_quickstart_dismissed')
// Returns: "true" | null
```

## Conditional Rendering Logic

### WelcomeBanner Visibility

```typescript
// Shows if:
- localStorage.getItem('nanowork_welcome_dismissed') === null

// Hides if:
- User clicked dismiss button
- localStorage has 'nanowork_welcome_dismissed' === "true"
```

### QuickStart Visibility

```typescript
// Shows if:
- localStorage.getItem('nanowork_quickstart_dismissed') === null
- AND (!hasBuilds OR !profileComplete)

// Hides if:
- User clicked dismiss button
- OR localStorage has 'nanowork_quickstart_dismissed' === "true"
- OR (hasBuilds AND profileComplete)
```

### Empty State (History) Visibility

```typescript
// Shows if:
- !loading AND builds.length === 0

// Shows loading state if:
- loading AND builds.length === 0

// Shows build list if:
- builds.length > 0
```

## Component Communication

```
User Action          →  Component State   →  localStorage    →  Re-render
─────────────────────────────────────────────────────────────────────────
Dismiss Banner       →  isVisible=false   →  'dismissed'     →  Hidden
                                              = "true"

Create Build         →  API Call          →  hasBuilds       →  QuickStart
                                              = true             updates

Complete Profile     →  updateProfile()   →  profile.name    →  QuickStart
                                              = "John"           updates

Dismiss QuickStart   →  isVisible=false   →  'dismissed'     →  Hidden
                                              = "true"
```

## Integration Steps

### Adding to New Page

1. **Import components**:
```tsx
import WelcomeBanner from "./components/WelcomeBanner";
import QuickStart from "./components/QuickStart";
import EmptyState from "./components/EmptyState";
```

2. **Add state tracking** (if needed):
```tsx
const [hasData, setHasData] = useState(false);
```

3. **Render components**:
```tsx
return (
  <div>
    <WelcomeBanner userName={profile?.name} />
    <QuickStart hasBuilds={hasData} profileComplete={!!profile?.businessName} />
    {/* Your page content */}
  </div>
);
```

### Using EmptyState

```tsx
{items.length === 0 ? (
  <EmptyState
    icon={YourIcon}
    title="No Items Yet"
    description="Items will appear here when you create them"
    actionLabel="Create Item"
    onAction={() => navigate('/create')}
    features={["Feature 1", "Feature 2", "Feature 3"]}
  />
) : (
  <YourItemList items={items} />
)}
```

## API Integration

### Checking User Status

```typescript
// Check if user has builds
useEffect(() => {
  const checkBuilds = async () => {
    if (!session?.access_token) return;
    
    try {
      const res = await fetch(`${apiUrl}/api/builds`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (res.ok) {
        const { builds } = await res.json();
        setHasBuilds(builds && builds.length > 0);
      }
    } catch (err) {
      console.error('Failed to check builds:', err);
    }
  };
  
  checkBuilds();
}, [session, apiUrl]);
```

### Profile Completion Check

```typescript
// Simple check
const profileComplete = !!(profile?.businessName && profile?.name);

// Advanced check
const profileComplete = !!(
  profile?.businessName && 
  profile?.name && 
  profile?.email
);
```

## Styling Guidelines

### Theme Variables

Use existing dashboard CSS variables:

```css
/* Backgrounds */
bg-surface-0     /* Main background */
bg-surface-1     /* Elevated surface */
bg-surface-2     /* Card background */
bg-surface-3     /* Hover state */

/* Text */
text-white       /* Primary text */
text-white/80    /* Secondary text */
text-white/60    /* Tertiary text */
text-white/40    /* Muted text */

/* Borders */
border-white/10  /* Subtle borders */
border-white/20  /* Medium borders */
border-white/30  /* Strong borders */
```

### Layout Patterns

```tsx
// Container
<div className="max-w-6xl mx-auto px-6 py-8">

// Card
<div className="p-6 rounded-xl bg-surface-2 border border-white/10">

// Button Primary
<button className="px-8 py-4 rounded-xl bg-white hover:bg-zinc-100 text-black font-semibold">

// Button Secondary
<button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10">
```

## Testing Scenarios

### Scenario 1: Brand New User

```
1. Create account → Login
2. See WelcomeBanner (0 builds, incomplete profile)
3. See QuickStart (0/3)
4. Create first build
5. QuickStart updates (1/3)
6. Navigate to History
7. See enhanced empty state
8. Return to Create
9. See QuickStart (1/3)
```

### Scenario 2: Returning User

```
1. Login (has 1 build, complete profile)
2. No WelcomeBanner (previously dismissed)
3. See QuickStart (1/3) IF not dismissed
4. Complete remaining steps
5. QuickStart hides automatically
```

### Scenario 3: Testing Dismissal

```
1. Login as new user
2. Dismiss WelcomeBanner
3. Refresh page
4. WelcomeBanner stays hidden ✓
5. Dismiss QuickStart
6. Refresh page
7. QuickStart stays hidden ✓
```

## Troubleshooting

### Component Not Showing

**Problem**: WelcomeBanner doesn't appear
**Solution**:
```javascript
// Clear localStorage
localStorage.removeItem('nanowork_welcome_dismissed');
location.reload();
```

**Problem**: QuickStart doesn't update progress
**Solution**:
- Check API response from `/api/builds`
- Verify `hasBuilds` state updates
- Check profile data in AuthContext

### Layout Issues

**Problem**: Components overlap or spacing is wrong
**Solution**:
- Check parent container has proper padding
- Verify z-index layering
- Inspect CSS cascade in DevTools

### Performance Issues

**Problem**: API calls on every render
**Solution**:
- Verify useEffect dependencies
- Check for infinite loops
- Add proper memoization

## Best Practices

### Do's ✓

- Keep components dismissible
- Persist user preferences
- Show progress clearly
- Use existing design system
- Test on mobile devices
- Follow accessibility guidelines

### Don'ts ✗

- Don't force users through flows
- Don't show dismissed components
- Don't use intrusive modals
- Don't ignore mobile UX
- Don't skip error handling
- Don't hardcode text

## Future Considerations

### Backend Integration

Consider moving to backend persistence:

```typescript
// Instead of localStorage
await updateUserPreferences({
  welcomeBannerDismissed: true,
  quickStartDismissed: true,
  quickStartProgress: { step1: true, step2: true, step3: false }
});
```

### Analytics

Track key metrics:

```typescript
// Track dismissals
analytics.track('WelcomeBanner Dismissed', {
  timeOnScreen: duration,
  userType: 'new'
});

// Track completions
analytics.track('QuickStart Completed', {
  completionTime: duration,
  stepsCompleted: 3
});
```

### A/B Testing

Test variations:

```typescript
const variant = useABTest('welcome-banner-variant');

{variant === 'A' ? (
  <WelcomeBannerA />
) : (
  <WelcomeBannerB />
)}
```

## Resources

- [WELCOME_SYSTEM.md](./WELCOME_SYSTEM.md) - Full documentation
- [README.md](./README.md) - Quick reference
- Component source code - Inline comments
- Dashboard CSS - Existing design system

---

**Last Updated**: 2026-05-24  
**Version**: 1.0.0
