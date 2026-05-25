# Build System Implementation Guide

**Step-by-step guide to implement the multi-agent business builder tab navigation**

---

## Overview

This guide provides detailed implementation steps for adding the new tab-based navigation system to the build detail pages. The new system transforms a single build page into a comprehensive workspace with:

- Overview (agent progress)
- Spreadsheet (financial model)
- Pitch Deck (investor presentation)
- Documents (generated files)
- Agents (execution logs)

---

## Phase 1: Core Navigation (2 days)

### Step 1: Update Routing

**File:** `apps/web/src/App.tsx`

Replace the current build route with nested tab routes:

```typescript
// BEFORE
<Route path="/dashboard/builds/:buildId" element={<Overview />} />

// AFTER
<Route path="/dashboard/builds/:buildId" element={<BuildDetailLayout />}>
  <Route index element={<Navigate to="overview" replace />} />
  <Route path="overview" element={<BuildOverview />} />
  <Route path="spreadsheet" element={<BuildSpreadsheet />} />
  <Route path="pitch-deck" element={<BuildPitchDeck />} />
  <Route path="documents" element={<BuildDocuments />} />
  <Route path="agents" element={<BuildAgents />} />
</Route>
```

This creates URLs like:
- `/dashboard/builds/abc123/overview`
- `/dashboard/builds/abc123/spreadsheet`
- `/dashboard/builds/abc123/pitch-deck`

---

### Step 2: Create Layout Component

Create the main layout that wraps all tabs.

**File:** `apps/web/src/dashboard/BuildDetailLayout.tsx`

See full implementation in appendix, key features:

- Loads build data once and shares with all tabs
- Renders sticky header with back button and status
- Renders sticky tab navigation
- Provides build context to child routes via `<Outlet />`
- Calculates overall progress from multiple sources

---

### Step 3: Create Header Component

**File:** `apps/web/src/dashboard/BuildDetailHeader.tsx`

Features:
- Back button to dashboard
- Build name (truncated on mobile)
- Progress badge (0-100%)
- Export button (desktop only)
- More menu dropdown

---

### Step 4: Create Tabs Component

**File:** `apps/web/src/dashboard/BuildDetailTabs.tsx`

Features:
- Horizontal scrolling on mobile
- Active tab indication (bottom border)
- Disabled state for locked tabs
- Badges for completion status
- ARIA attributes for accessibility

---

## Phase 2: Tab Components (5 days)

### Overview Tab

**File:** `apps/web/src/dashboard/BuildOverview.tsx`

This is a refactor of existing `OverviewNew.tsx`:

1. Copy all content from `OverviewNew.tsx`
2. Remove header/back button (now in layout)
3. Replace build loading with context:
   ```typescript
   const { build, setBuild, loadBuild } = useOutletContext<OutletContext>();
   ```
4. Add ARIA tabpanel attributes
5. Keep all agent department cards and live feed

---

### Spreadsheet Tab

**File:** `apps/web/src/dashboard/BuildSpreadsheet.tsx`

Features needed:
- Toolbar with export buttons (CSV, XLSX)
- Spreadsheet grid component (use library or custom)
- Auto-save on cell edit (debounced 500ms)
- Empty state while finance agents are working
- Loading state on initial load

Recommended library: `react-spreadsheet` or `handsontable`

---

### Pitch Deck Tab

**File:** `apps/web/src/dashboard/BuildPitchDeck.tsx`

Features needed:
- Left sidebar with slide thumbnails (desktop)
- Main canvas showing active slide
- Slide editor (text, images, layout)
- Add/delete slide buttons
- Export to PDF button
- Swipe navigation (mobile)

Consider using: `reveal.js` for slide rendering or custom canvas

---

### Documents Tab

**File:** `apps/web/src/dashboard/BuildDocuments.tsx`

Features needed:
- Grid of document cards (3 columns on desktop)
- Each card shows: icon, title, department, file size
- View button (opens in modal or new tab)
- Download button (individual file)
- Empty state if no documents yet

Document types:
- Business Plan (PDF)
- Marketing Strategy (PDF)
- Brand Guidelines (PDF)
- Legal Docs (PDF)
- Financial Projections (XLSX)

---

### Agents Tab

**File:** `apps/web/src/dashboard/BuildAgents.tsx`

Features needed:
- List of 7 departments
- Execution logs for each department
- Re-run button per department
- Task-level logs with timestamps
- Filter/search logs (future)

---

## Phase 3: Shared Components (1 day)

### EmptyState

**File:** `apps/web/src/components/EmptyState.tsx`

Reusable component for when content isn't ready yet.

Props:
- `icon`: Lucide icon component
- `title`: Heading text
- `description`: Explanation text
- `action`: Optional CTA button

---

### LoadingState

**File:** `apps/web/src/components/LoadingState.tsx`

Spinner with message.

Props:
- `message`: Loading text (default: "Loading...")

---

## Phase 4: Backend Integration (3 days)

### API Endpoints to Add

**File:** `backend/src/routes/builds.ts`

Add these new routes:

```typescript
// Get build with all tab metadata
GET /builds/:id
Response: {
  build: {
    id, name, prompt, status, created_at,
    progress: {
      agents: 75,           // 0-100
      hasSpreadsheet: true,
      hasPitchDeck: false,
      documentCount: 4
    }
  }
}

// Spreadsheet data
GET /builds/:id/spreadsheet
Response: { data: [...], columns: [...] }

PUT /builds/:id/spreadsheet
Body: { data: [...] }
Response: { success: true }

// Pitch deck data
GET /builds/:id/pitch-deck
Response: { slides: [...] }

PUT /builds/:id/pitch-deck
Body: { slides: [...] }
Response: { success: true }

// Documents list
GET /builds/:id/documents
Response: { documents: [...] }

// Download single document
GET /builds/:id/documents/:docId/download
Response: File stream

// Agent logs
GET /builds/:id/agents/logs
Response: { logs: [...] }

// Export all (ZIP)
GET /builds/:id/export
Response: ZIP file stream
```

---

### Database Schema Changes

Add tables if needed:

```sql
-- Spreadsheet data (JSON blob)
CREATE TABLE build_spreadsheets (
  id UUID PRIMARY KEY,
  build_id UUID REFERENCES builds(id),
  data JSONB,
  updated_at TIMESTAMP
);

-- Pitch deck slides
CREATE TABLE build_pitch_decks (
  id UUID PRIMARY KEY,
  build_id UUID REFERENCES builds(id),
  slides JSONB,
  updated_at TIMESTAMP
);

-- Generated documents
CREATE TABLE build_documents (
  id UUID PRIMARY KEY,
  build_id UUID REFERENCES builds(id),
  department TEXT,
  title TEXT,
  file_path TEXT,
  file_size INT,
  created_at TIMESTAMP
);

-- Agent execution logs
CREATE TABLE agent_logs (
  id UUID PRIMARY KEY,
  build_id UUID REFERENCES builds(id),
  department TEXT,
  task TEXT,
  status TEXT,
  output TEXT,
  created_at TIMESTAMP
);
```

---

## Phase 5: Polish & Testing (2 days)

### Keyboard Shortcuts

Add keyboard navigation:

```typescript
// In BuildDetailLayout.tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      switch(e.key) {
        case '1':
          navigate(`/dashboard/builds/${buildId}/overview`);
          break;
        case '2':
          navigate(`/dashboard/builds/${buildId}/spreadsheet`);
          break;
        case '3':
          navigate(`/dashboard/builds/${buildId}/pitch-deck`);
          break;
        case '4':
          navigate(`/dashboard/builds/${buildId}/documents`);
          break;
        case '5':
          navigate(`/dashboard/builds/${buildId}/agents`);
          break;
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [buildId, navigate]);
```

---

### Mobile Testing

Test on:
- iPhone (Safari, Chrome)
- Android (Chrome, Samsung Internet)
- iPad (Safari)

Check:
- Header collapses properly
- Tabs scroll horizontally
- Touch targets are large enough (44x44px)
- No horizontal overflow
- Content scrolls smoothly

---

### Performance Optimization

1. **Code splitting:**
   ```typescript
   const BuildSpreadsheet = lazy(() => import('./BuildSpreadsheet'));
   const BuildPitchDeck = lazy(() => import('./BuildPitchDeck'));
   ```

2. **Prefetching:**
   ```typescript
   <NavLink
     onMouseEnter={() => queryClient.prefetchQuery(['spreadsheet', buildId])}
   >
     SPREADSHEET
   </NavLink>
   ```

3. **Memoization:**
   ```typescript
   const progress = useMemo(() => calculateProgress(build), [build]);
   ```

---

## Testing Checklist

### Desktop (Chrome, Safari, Firefox)

- [ ] Navigate to build → redirects to overview
- [ ] Click each tab → URL changes, content loads
- [ ] Back button returns to dashboard
- [ ] Refresh stays on current tab
- [ ] Progress badge updates live
- [ ] Disabled tabs can't be clicked
- [ ] Tab badges show correct data
- [ ] Export button works
- [ ] Header/tabs stay sticky on scroll

### Mobile (iPhone, Android)

- [ ] Header collapses properly
- [ ] Tabs scroll horizontally
- [ ] Active tab is visible
- [ ] Content scrolls smoothly
- [ ] Touch targets work well
- [ ] Back button easy to tap
- [ ] No layout shift

### Edge Cases

- [ ] Build not found → redirect with error
- [ ] Build loading fails → error state
- [ ] Tab content empty → empty state
- [ ] Agent still running → loading indicator
- [ ] Multiple tabs open → correct data
- [ ] Slow network → loading states

---

## Rollout Plan

### Week 1: Beta (10% of users)

Deploy to staging, enable for select users via feature flag:

```typescript
// Feature flag check
const hasTabNavigation = useFeatureFlag('build-tabs');

return hasTabNavigation ? (
  <BuildDetailLayout />
) : (
  <OverviewNew />  // Old version
);
```

### Week 2: Ramp to 50%

Monitor:
- Error rates (4xx, 5xx)
- Page load times
- User feedback
- Tab usage analytics

### Week 3: Full Release

Remove feature flag, deploy to 100% of users.

---

## Analytics to Track

Add these events:

```typescript
// Tab view
analytics.track('build_tab_viewed', {
  buildId: build.id,
  tab: 'spreadsheet',
  timestamp: Date.now()
});

// Tab switch
analytics.track('build_tab_switched', {
  buildId: build.id,
  fromTab: 'overview',
  toTab: 'pitch-deck'
});

// Export action
analytics.track('build_exported', {
  buildId: build.id,
  format: 'zip'
});

// Empty state action
analytics.track('empty_state_action_clicked', {
  buildId: build.id,
  tab: 'documents',
  action: 'go_to_overview'
});
```

Metrics to watch:
- Most popular tab
- Average time per tab
- Tab switch frequency
- Empty state → action conversion
- Export button click rate

---

## Troubleshooting

### "Tab content not loading"

1. Check console for API errors
2. Verify build ID in URL is valid
3. Check network tab for failed requests
4. Ensure authentication token is present

### "Tabs not switching"

1. Check React Router is installed correctly
2. Verify NavLink `to` prop has correct path
3. Check for JavaScript errors in console
4. Test with hard refresh (Cmd+Shift+R)

### "Progress badge shows 0%"

1. Verify build has progress data
2. Check calculation logic in `calculateProgress()`
3. Ensure backend is sending progress fields
4. Check for null/undefined values

### "Empty state shows when data exists"

1. Check loading state logic
2. Verify data structure matches expected format
3. Check conditional rendering logic
3. Add console.log to debug data flow

---

## Future Enhancements

### Phase 6: Advanced Features (Q3)

- [ ] Collaboration (multi-user editing)
- [ ] Comments on documents
- [ ] Version history for spreadsheet/deck
- [ ] AI chat assistant per build
- [ ] Export to GitHub
- [ ] Templates for common industries

### Phase 7: Power User Features (Q4)

- [ ] Command palette (Cmd+K)
- [ ] Bulk actions (export multiple)
- [ ] Custom dashboards
- [ ] API access
- [ ] Webhooks
- [ ] Advanced analytics

---

## Support

Questions? Contact: jordan@nanowork.ai

Documentation:
- Design: `/docs/UX_NAVIGATION_DESIGN.md`
- User Flows: `/docs/USER_FLOW_DIAGRAM.md`
- This guide: `/docs/BUILD_SYSTEM_IMPLEMENTATION.md`

---

## Appendix: Code Samples

### BuildDetailLayout.tsx (Complete)

```typescript
import { useEffect, useState } from "react";
import { useParams, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Terminal, Table, Presentation, FileText, Bot } from "lucide-react";
import { BuildDetailHeader } from "./BuildDetailHeader";
import { BuildDetailTabs } from "./BuildDetailTabs";
import { useAuth } from "../context/AuthContext";

interface Build {
  id: string;
  name: string;
  prompt: string;
  status: string;
  progress?: {
    agents: number;
    hasSpreadsheet: boolean;
    hasPitchDeck: boolean;
    documentCount: number;
  };
}

export default function BuildDetailLayout() {
  const { buildId } = useParams<{ buildId: string }>();
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [build, setBuild] = useState<Build | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBuild();
  }, [buildId, session]);

  async function loadBuild() {
    if (!session?.access_token || !buildId) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || ''}/api/builds/${buildId}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setBuild(data.build);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Failed to load build:', err);
    } finally {
      setLoading(false);
    }
  }

  const calculateProgress = () => {
    if (!build?.progress) return 0;
    
    const { agents, hasSpreadsheet, hasPitchDeck, documentCount } = build.progress;
    
    let progress = 0;
    progress += (agents / 100) * 50;
    progress += hasSpreadsheet ? 20 : 0;
    progress += hasPitchDeck ? 20 : 0;
    progress += (documentCount / 10) * 10;
    
    return Math.min(Math.round(progress), 100);
  };

  const progress = calculateProgress();
  const activeTab = location.pathname.split('/').pop() || 'overview';

  const tabs = [
    { id: "overview", label: "OVERVIEW", code: "00", icon: Terminal },
    { 
      id: "spreadsheet", 
      label: "SPREADSHEET", 
      code: "01", 
      icon: Table,
      badge: build?.progress?.hasSpreadsheet ? "✓" : undefined,
      disabled: !build?.progress?.hasSpreadsheet
    },
    { 
      id: "pitch-deck", 
      label: "PITCH DECK", 
      code: "02", 
      icon: Presentation,
      badge: build?.progress?.hasPitchDeck ? "✓" : undefined,
      disabled: !build?.progress?.hasPitchDeck
    },
    { 
      id: "documents", 
      label: "DOCUMENTS", 
      code: "03", 
      icon: FileText,
      badge: build?.progress?.documentCount || undefined,
      disabled: !build?.progress?.documentCount
    },
    { id: "agents", label: "AGENTS", code: "04", icon: Bot },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-0">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-mono text-white/60">LOADING BUILD...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-surface-0">
      <BuildDetailHeader
        buildId={buildId!}
        buildName={build?.name || "Untitled Build"}
        status={build?.status || "draft"}
        progress={progress}
        onBack={() => navigate('/dashboard')}
        onExport={() => handleExport(buildId!)}
      />

      <BuildDetailTabs
        buildId={buildId!}
        activeTab={activeTab}
        tabs={tabs}
      />

      <main className="flex-1 overflow-y-auto bg-surface-0">
        <Outlet context={{ build, setBuild, loadBuild }} />
      </main>
    </div>
  );
}

async function handleExport(buildId: string) {
  window.location.href = `/api/builds/${buildId}/export`;
}
```

---

## Summary

This implementation adds a professional tab-based navigation system to the build detail pages. Users can:

1. **See progress at a glance** - Header badge shows overall %
2. **Access all tools easily** - Tabs for overview, spreadsheet, deck, docs, agents
3. **Never get lost** - Active tab indication, breadcrumbs, back button
4. **Work on any device** - Responsive design for desktop and mobile
5. **Trust the system** - Professional terminal aesthetic, clear states

Timeline: 2 weeks for core features, 3 weeks with testing and polish.

**Start with Phase 1 (routing and layout) to see the structure come together quickly.**
