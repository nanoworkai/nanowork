# Multi-Agent Business Builder: UX Design Summary

**Executive Summary for Quick Reference**

---

## Problem Statement

Users need to interact with multiple tools for their business:
- Watch AI agents build their business
- Edit financial models (spreadsheet)
- Customize pitch decks
- Access generated documents
- Monitor agent logs

**Current issue:** All content crammed into one page or scattered across different sections. Users get lost, can't find tools, unclear on progress.

---

## Solution

**Tab-based navigation within each build** - Everything lives in one place, organized by tool type.

```
Build Detail Page
├── Header (sticky): Back button, build name, progress badge, export
├── Tabs (sticky): Overview | Spreadsheet | Pitch Deck | Documents | Agents
└── Content (scrollable): Current tab content
```

---

## Key Design Decisions

### 1. Tabs within build (NOT top-level navigation)

**Why:** Keeps mental model simple - "one build = one workspace". All tools for a specific business live together.

**Rejected:** Separate top-level nav items (04 SPREADSHEET, 05 DECKS) - would clutter sidebar and break cohesion.

### 2. Progressive unlock (disabled tabs until ready)

**Why:** Guides users through workflow. No confusion about "where's my spreadsheet?" - it's grayed out until agents generate it.

**Visual:** Tab shows "..." badge while building, "✓" when ready.

### 3. Terminal aesthetic throughout

**Why:** Matches brand. Professional, not toy-like. Command center feel.

**Rules:**
- No rounded corners (except small badges)
- Monospace font everywhere
- Borders over shadows
- High contrast (dark bg, light text)
- Minimal color (white, amber for progress, green for complete)

### 4. Mobile: horizontal scroll tabs

**Why:** Fits many tabs on small screen without stacking.

**Implementation:** Swipeable tabs, active tab auto-scrolls into view.

---

## User Journey (Happy Path)

```
1. User arrives at dashboard
   └─> Sees list of builds or empty state

2. Clicks "CREATE BUILD" or selects existing build
   └─> Lands on /builds/:id/overview

3. Overview tab shows:
   - Terminal prompt to enter idea
   - After submit: 7 agent departments working in parallel
   - Live output feed showing progress
   - Overall progress badge (0-100%)

4. Agents complete (100%)
   └─> Tabs unlock with checkmarks: ✓ SPREADSHEET, ✓ PITCH DECK, etc.

5. User clicks SPREADSHEET tab
   └─> Sees financial model, can edit cells, auto-saves

6. User clicks PITCH DECK tab
   └─> Sees slide editor, can customize presentation

7. User clicks DOCUMENTS tab
   └─> Sees all generated PDFs (business plan, marketing, legal)

8. User clicks EXPORT
   └─> Downloads ZIP with everything (spreadsheet, deck, docs)

9. User has complete business package to launch
```

---

## Information Architecture

### Global Navigation (Sidebar)

```
00 BUILDS      → /dashboard (renamed from CREATE)
01 HISTORY     → /dashboard/history
02 INBOX       → /dashboard/inbox
03 WALLET      → /dashboard/wallet
04 SETTINGS    → /dashboard/settings
```

### Build-Level Navigation (Tabs)

```
/builds/:id/overview      00 OVERVIEW      (agents, progress, feed)
/builds/:id/spreadsheet   01 SPREADSHEET   (financial model)
/builds/:id/pitch-deck    02 PITCH DECK    (investor presentation)
/builds/:id/documents     03 DOCUMENTS     (generated files)
/builds/:id/agents        04 AGENTS        (execution logs)
```

---

## Progress Indication

### Build-Level Progress (0-100%)

**Formula:**
```
progress = (agents * 0.5) + (spreadsheet * 0.2) + (pitchDeck * 0.2) + (docs * 0.1)

Example:
- Agents: 75% complete → 37.5 points
- Spreadsheet: Generated → 20 points
- Pitch Deck: Not ready → 0 points
- Documents: 5 of 10 → 5 points
Total: 62.5% → rounds to 62%
```

**Where shown:**
- Header badge: `[62% ●]` (pulsing amber dot while building)
- Dashboard card: Progress bar under build name

### Tab-Level Progress

**Badges:**
- `...` - Not ready yet (tab disabled)
- `✓` - Ready to use (tab enabled, content available)
- `7` - Count (e.g., 7 documents generated)

### Department-Level Progress (Overview tab)

**Agent cards show:**
- Status: Queued → Running → Done
- Task count: `3/10` (3 tasks completed of 10 total)
- Progress bar: Visual indicator of completion
- Output preview: Last 3 tasks + final summary

---

## Empty States

### 1. Dashboard (No Builds)

```
┌────────────────────────────────┐
│                                │
│   [Terminal Icon]              │
│                                │
│   Your Builds Will Appear Here │
│                                │
│   Start by describing your     │
│   business idea. Our 7 AI      │
│   departments will handle       │
│   the rest.                    │
│                                │
│   [CREATE YOUR FIRST BUILD]    │
│                                │
└────────────────────────────────┘
```

### 2. Spreadsheet Tab (Agents Still Working)

```
┌────────────────────────────────┐
│                                │
│   [Calculator Icon]            │
│                                │
│   Financial Model In Progress  │
│                                │
│   The Finance department is    │
│   building your 5-year         │
│   projections. Usually takes   │
│   2-3 minutes.                 │
│                                │
│   ● ● ● (animated)             │
│                                │
│   [GO TO OVERVIEW]             │
│                                │
└────────────────────────────────┘
```

### 3. Documents Tab (None Generated Yet)

```
┌────────────────────────────────┐
│                                │
│   [FileText Icon]              │
│                                │
│   No Documents Yet             │
│                                │
│   Documents will appear here   │
│   once your agents complete    │
│   their work.                  │
│                                │
│   [GO TO OVERVIEW]             │
│                                │
└────────────────────────────────┘
```

---

## Mobile Adaptations

### Header

**Desktop:** Full layout with all buttons visible  
**Mobile:** Compact - back arrow, truncated title, progress badge, menu (⋯)

### Tabs

**Desktop:** All tabs visible inline  
**Mobile:** Horizontal scroll, swipe between tabs

### Spreadsheet

**Desktop:** Full grid with toolbar  
**Mobile:** Zoomed out view, pinch-to-zoom, swipe-to-scroll

### Pitch Deck

**Desktop:** Sidebar with thumbnails + main editor  
**Mobile:** Swipeable slides (no sidebar), dots for pagination

---

## Keyboard Shortcuts

```
Cmd+1 → Overview tab
Cmd+2 → Spreadsheet tab
Cmd+3 → Pitch Deck tab
Cmd+4 → Documents tab
Cmd+5 → Agents tab

Cmd+K → Open command palette (future)
Cmd+E → Export build
Cmd+B → Switch build (future)
```

---

## Component Hierarchy

```
BuildDetailLayout (apps/web/src/dashboard/BuildDetailLayout.tsx)
├── BuildDetailHeader (./BuildDetailHeader.tsx)
│   ├── Back button
│   ├── Build name
│   ├── Progress badge
│   ├── Export button
│   └── More menu
│
├── BuildDetailTabs (./BuildDetailTabs.tsx)
│   └── NavLink for each tab
│
└── <Outlet /> (React Router nested routes)
    ├── BuildOverview (./BuildOverview.tsx)
    │   ├── Department cards (7)
    │   ├── Live output feed
    │   └── Terminal prompt
    │
    ├── BuildSpreadsheet (./BuildSpreadsheet.tsx)
    │   ├── Toolbar (export buttons)
    │   └── Spreadsheet grid
    │
    ├── BuildPitchDeck (./BuildPitchDeck.tsx)
    │   ├── Slide thumbnails (desktop)
    │   ├── Toolbar (add slide, export)
    │   └── Slide editor
    │
    ├── BuildDocuments (./BuildDocuments.tsx)
    │   └── Document cards (grid)
    │
    └── BuildAgents (./BuildAgents.tsx)
        └── Agent log cards (7 departments)
```

---

## API Requirements

### GET /builds/:id

Returns build with progress metadata:

```json
{
  "build": {
    "id": "abc123",
    "name": "Dog Walking Marketplace",
    "prompt": "Premium dog walking...",
    "status": "generating",
    "progress": {
      "agents": 75,
      "hasSpreadsheet": true,
      "hasPitchDeck": false,
      "documentCount": 4
    }
  }
}
```

### GET /builds/:id/spreadsheet

Returns spreadsheet data:

```json
{
  "data": [
    ["", "Year 1", "Year 2", "Year 3"],
    ["Revenue", 50000, 150000, 400000],
    ["Costs", 30000, 80000, 200000]
  ],
  "columns": ["A", "B", "C", "D"]
}
```

### GET /builds/:id/pitch-deck

Returns slide data:

```json
{
  "slides": [
    {
      "id": "slide1",
      "title": "Cover",
      "content": { "heading": "DogWalk", "subheading": "..." }
    }
  ]
}
```

### GET /builds/:id/documents

Returns document list:

```json
{
  "documents": [
    {
      "id": "doc1",
      "title": "Business Plan",
      "department": "Legal",
      "size": "2.3 MB",
      "url": "/api/builds/abc123/documents/doc1/download"
    }
  ]
}
```

### GET /builds/:id/agents/logs

Returns agent execution logs:

```json
{
  "logs": [
    {
      "id": "log1",
      "department": "Legal",
      "task": "Draft terms of service",
      "status": "complete",
      "timestamp": "2026-05-24T14:23:00Z"
    }
  ]
}
```

---

## Success Metrics

Track these to measure UX success:

### Engagement
- **Tab usage rate:** % of users who click each tab
- **Most popular tab:** Which tab gets most views?
- **Tab switch frequency:** How often users switch tabs?
- **Time per tab:** Average time spent in each tab

### Conversion
- **Empty state → action:** % who click "Go to Overview" from empty state
- **Export rate:** % of builds that get exported
- **Completion rate:** % of builds that reach 100%

### Performance
- **Tab load time:** Time from click to content visible
- **Page load time:** Time to first interactive tab
- **Error rate:** Failed API calls for tab data

### User Satisfaction
- **Confusion rate:** Support tickets about navigation
- **Task success rate:** Users finding what they need
- **Net Promoter Score:** Would users recommend?

---

## Implementation Timeline

### Week 1: Core Navigation
- [x] Design complete
- [ ] Update routing (App.tsx)
- [ ] Create BuildDetailLayout
- [ ] Create header component
- [ ] Create tabs component
- [ ] Test on desktop

### Week 2: Overview + Spreadsheet
- [ ] Refactor Overview tab (from OverviewNew.tsx)
- [ ] Build Spreadsheet tab
- [ ] Create EmptyState component
- [ ] Create LoadingState component
- [ ] Test both tabs work

### Week 3: Deck + Documents + Agents
- [ ] Build Pitch Deck tab
- [ ] Build Documents tab
- [ ] Build Agents tab
- [ ] Test all tabs work together

### Week 4: Mobile + Polish
- [ ] Mobile responsive design
- [ ] Keyboard shortcuts
- [ ] Empty states for all tabs
- [ ] Loading states for all tabs
- [ ] Cross-browser testing

### Week 5: Backend + Deploy
- [ ] Add API endpoints
- [ ] Database migrations
- [ ] Integration testing
- [ ] Deploy to staging
- [ ] Beta test with 10% users
- [ ] Full release

---

## Risks & Mitigations

### Risk: Tab content takes too long to load
**Mitigation:** Show loading states, prefetch on hover, cache responses

### Risk: Users don't understand locked tabs
**Mitigation:** Clear empty states, progress indication, tooltip on hover

### Risk: Mobile spreadsheet is unusable
**Mitigation:** Optimize for touch, pinch-to-zoom, export to desktop view

### Risk: Too many tabs overwhelming
**Mitigation:** Start with Overview (familiar), progressive disclosure, onboarding tour

### Risk: Backend can't handle new API load
**Mitigation:** Load test, add caching, rate limiting, CDN for static assets

---

## Future Enhancements (Post-MVP)

### Phase 2 (Q3 2026)
- Command palette (Cmd+K) for power users
- Collaboration (multi-user editing)
- Comments on documents/slides
- Version history (revert changes)
- Build templates (SaaS, e-commerce, etc.)

### Phase 3 (Q4 2026)
- AI chat assistant per build
- Export to GitHub (push deck as repo)
- Integration marketplace (Stripe, analytics)
- Custom dashboards (drag-drop widgets)
- Advanced agent configuration
- Webhooks for automation

---

## Questions & Answers

**Q: Why tabs instead of separate pages?**  
A: Keeps everything for one build in one place. Faster navigation, clearer mental model, easier to switch context.

**Q: Why disable tabs until ready?**  
A: Prevents confusion ("where's my spreadsheet?"). Clear signal that content is still being generated.

**Q: Why terminal aesthetic?**  
A: Professional, trustworthy, matches brand. Avoids toy-like feel of colorful rounded designs.

**Q: Why not a sidebar menu instead of tabs?**  
A: Tabs are more familiar (Linear, GitHub), easier to scan horizontally, better on mobile.

**Q: What if a build has 20 tabs in the future?**  
A: Group related tabs (Financials → multiple sheets), use dropdown for overflow, or sidebar for secondary tools.

**Q: How do users switch between builds?**  
A: Back to dashboard, then select new build. Future: Cmd+K command palette with fuzzy search.

---

## Related Documentation

1. **UX_NAVIGATION_DESIGN.md** - Detailed design specs, wireframes, components
2. **USER_FLOW_DIAGRAM.md** - Visual user journeys, decision trees, flow charts
3. **BUILD_SYSTEM_IMPLEMENTATION.md** - Step-by-step code implementation guide
4. **This document (UX_DESIGN_SUMMARY.md)** - Executive summary for quick reference

---

## Approval Checklist

Before implementation:

- [ ] Design reviewed by team
- [ ] User flows validated with mockups
- [ ] API endpoints scoped with backend
- [ ] Mobile design approved
- [ ] Accessibility requirements met
- [ ] Performance targets set
- [ ] Analytics events defined
- [ ] Timeline agreed upon

**Status:** ✅ Design complete - Ready for implementation

**Approved by:** Jordan Plows  
**Date:** 2026-05-24

---

**Contact:** jordan@nanowork.ai  
**Project:** Nanowork Multi-Agent Business Builder  
**Version:** 1.0
