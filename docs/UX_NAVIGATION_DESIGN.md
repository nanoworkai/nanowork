# Multi-Agent Business Builder: UX & Navigation Design

**Date:** 2026-05-24  
**Status:** Design Specification  
**Design System:** Terminal Aesthetic (Monochrome, Mono Font, No Rounded Corners)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Information Architecture](#information-architecture)
3. [Navigation Structure](#navigation-structure)
4. [Build Detail Page Redesign](#build-detail-page-redesign)
5. [User Journey Flow](#user-journey-flow)
6. [Progress Indication System](#progress-indication-system)
7. [Empty States](#empty-states)
8. [Mobile Considerations](#mobile-considerations)
9. [Breadcrumb System](#breadcrumb-system)
10. [Component Specifications](#component-specifications)
11. [Wireframes](#wireframes)

---

## Executive Summary

### Design Philosophy

The multi-agent business builder must feel like a **professional command center**, not a toy. Users should:

- Never be lost or confused about their location
- Understand progress at a glance
- Access all tools within 2 clicks
- Feel in control of complex AI agents
- Trust the system with critical business data

### Key Design Decisions

**✓ CHOSEN:** Tab-based navigation within build detail  
**Rationale:** Linear workflow (Overview → Agents → Spreadsheet → Deck), familiar pattern (Linear, GitHub), clean mobile collapse

**✗ REJECTED:** Top-level dashboard items  
**Rationale:** Too many nav items clutter sidebar, breaks mental model of "everything in a build"

**✗ REJECTED:** Sidebar sub-menu  
**Rationale:** Adds navigation depth, harder to scan, mobile complexity

---

## Information Architecture

### Current Structure (As-Built)

```
Dashboard (Root)
├── 00 CREATE         → /dashboard (Create.tsx - new build form)
├── 01 HISTORY        → /dashboard/history (History.tsx - build list)
├── 02 INBOX          → /dashboard/inbox
├── 03 WALLET         → /dashboard/wallet
└── 04 SETTINGS       → /dashboard/settings

Builds
└── /dashboard/builds/:buildId → OverviewNew.tsx (terminal interface)
```

### Proposed Structure (Enhanced)

```
Dashboard (Root)
├── 00 BUILDS         → /dashboard (renamed from CREATE)
│   ├── Build List View (if multiple builds)
│   └── Quick Create Form
│
├── 01 HISTORY        → /dashboard/history
├── 02 INBOX          → /dashboard/inbox
├── 03 WALLET         → /dashboard/wallet
└── 04 SETTINGS       → /dashboard/settings

Build Detail (New Tab System)
└── /dashboard/builds/:buildId
    ├── [OVERVIEW]        → Agents running, progress, output feed
    ├── [SPREADSHEET]     → Financial model editor
    ├── [PITCH DECK]      → Investor deck builder
    ├── [DOCUMENTS]       → Generated docs (business plan, etc.)
    └── [AGENTS]          → Agent logs, re-run controls
```

### Mental Model

```
BUILD = Container for Everything

┌─────────────────────────────────────────┐
│ Build: Dog Walking Marketplace          │  ← Single source of truth
├─────────────────────────────────────────┤
│ Overview │ Spreadsheet │ Deck │ Docs   │  ← All tools in tabs
├─────────────────────────────────────────┤
│                                          │
│  Everything related to this business    │
│  lives here. No hunting across pages.   │
│                                          │
└─────────────────────────────────────────┘
```

---

## Navigation Structure

### Sidebar Navigation (Global)

**No changes to DashboardLayout.tsx** - sidebar remains clean and focused.

```typescript
// apps/web/src/dashboard/DashboardLayout.tsx
const NAV_ITEMS = [
  { to: "/dashboard", label: "BUILDS", end: true, code: "00" },      // Renamed from CREATE
  { to: "/dashboard/history", label: "HISTORY", end: false, code: "01" },
  { to: "/dashboard/inbox", label: "INBOX", end: false, code: "02" },
  { to: "/dashboard/wallet", label: "WALLET", end: false, code: "03" },
  { to: "/dashboard/settings", label: "SETTINGS", end: false, code: "04" },
];
```

### Build Detail Tabs (Local)

**New component:** `BuildDetailLayout.tsx`

```typescript
const BUILD_TABS = [
  { id: "overview", label: "OVERVIEW", code: "00", icon: Terminal },
  { id: "spreadsheet", label: "SPREADSHEET", code: "01", icon: Table },
  { id: "pitch-deck", label: "PITCH DECK", code: "02", icon: Presentation },
  { id: "documents", label: "DOCUMENTS", code: "03", icon: FileText },
  { id: "agents", label: "AGENTS", code: "04", icon: Bot },
];
```

**Route structure:**

```typescript
// apps/web/src/App.tsx
<Route path="/dashboard/builds/:buildId" element={<BuildDetailLayout />}>
  <Route index element={<Navigate to="overview" replace />} />
  <Route path="overview" element={<BuildOverview />} />
  <Route path="spreadsheet" element={<BuildSpreadsheet />} />
  <Route path="pitch-deck" element={<BuildPitchDeck />} />
  <Route path="documents" element={<BuildDocuments />} />
  <Route path="agents" element={<BuildAgents />} />
</Route>
```

---

## Build Detail Page Redesign

### Layout Structure

```
┌──────────────────────────────────────────────────────────────────┐
│ ← BACK TO BUILDS     Dog Walking Marketplace      [EXPORT] [•••] │  Header (sticky)
├──────────────────────────────────────────────────────────────────┤
│ 00 OVERVIEW │ 01 SPREADSHEET │ 02 DECK │ 03 DOCS │ 04 AGENTS    │  Tabs (sticky)
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                                                              │  │
│  │                   Tab Content Area                           │  │
│  │                                                              │  │
│  │                (Scrollable, full width)                      │  │
│  │                                                              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### Header Component

```tsx
// apps/web/src/dashboard/BuildDetailHeader.tsx

interface BuildDetailHeaderProps {
  buildId: string;
  buildName: string;
  status: BuildStatus;
  progress: number;
  onBack: () => void;
  onExport: () => void;
}

export function BuildDetailHeader({
  buildId,
  buildName,
  status,
  progress,
  onBack,
  onExport
}: BuildDetailHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-surface-1 backdrop-blur-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-xs font-mono text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              BACK TO BUILDS
            </button>
            <div className="h-4 w-px bg-white/10" />
            <h1 className="text-lg font-mono font-bold text-white">{buildName}</h1>
          </div>

          {/* Right: Status + Actions */}
          <div className="flex items-center gap-4">
            {/* Progress Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 border border-white/10 bg-surface-2">
              <div className={`w-1.5 h-1.5 rounded-full ${
                status === 'complete' ? 'bg-green-400' :
                status === 'building' ? 'bg-amber-400 animate-pulse' :
                'bg-white/40'
              }`} />
              <span className="text-xs font-mono text-white/60">
                {progress}% COMPLETE
              </span>
            </div>

            {/* Export Button */}
            <button
              onClick={onExport}
              className="px-4 py-2 border border-white/10 bg-surface-2 hover:bg-surface-3 text-white font-mono text-xs font-bold uppercase transition-colors"
            >
              <Download className="w-3.5 h-3.5 inline mr-2" />
              EXPORT
            </button>

            {/* More Menu */}
            <button className="p-2 hover:bg-white/5 text-white/60 hover:text-white transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
```

### Tab Navigation Component

```tsx
// apps/web/src/dashboard/BuildDetailTabs.tsx

interface BuildTab {
  id: string;
  label: string;
  code: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  disabled?: boolean;
}

interface BuildDetailTabsProps {
  buildId: string;
  activeTab: string;
  tabs: BuildTab[];
}

export function BuildDetailTabs({ buildId, activeTab, tabs }: BuildDetailTabsProps) {
  return (
    <nav className="sticky top-[73px] z-10 border-b border-white/10 bg-surface-0 overflow-x-auto">
      <div className="flex items-center px-6">
        {tabs.map(({ id, label, code, icon: Icon, badge, disabled }) => (
          <NavLink
            key={id}
            to={`/dashboard/builds/${buildId}/${id}`}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-3 border-b-2 font-mono text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                isActive
                  ? "border-white text-white"
                  : disabled
                  ? "border-transparent text-white/30 cursor-not-allowed"
                  : "border-transparent text-white/60 hover:text-white hover:bg-white/5"
              }`
            }
            onClick={(e) => disabled && e.preventDefault()}
          >
            <span className="text-white/40">{code}</span>
            <Icon className="w-3.5 h-3.5" />
            {label}
            {badge && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-white/10 border border-white/20">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
```

### Tab Content Components

#### 1. Overview Tab (Existing - OverviewNew.tsx)

- Agent department cards (7 departments)
- Live output feed
- Terminal prompt for new builds
- Build metadata (company name, tagline)
- Progress indicators

**No changes needed** - current terminal interface is excellent.

#### 2. Spreadsheet Tab (New)

```tsx
// apps/web/src/dashboard/BuildSpreadsheet.tsx

export function BuildSpreadsheet() {
  const { buildId } = useParams();
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load spreadsheet from backend
  // Render spreadsheet grid (e.g., using react-spreadsheet or custom grid)
  // Auto-save on change
  // Export to CSV/XLSX

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-surface-1">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-white/60" />
          <span className="text-xs font-mono font-bold text-white/60 uppercase">
            Financial Model
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-xs font-mono text-white/60 hover:text-white transition-colors">
            <Download className="w-3 h-3 inline mr-1" />
            EXPORT CSV
          </button>
          <button className="px-3 py-1.5 text-xs font-mono text-white/60 hover:text-white transition-colors">
            <Download className="w-3 h-3 inline mr-1" />
            EXPORT XLSX
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div className="flex-1 overflow-auto bg-surface-0">
        {loading ? (
          <LoadingState message="Loading financial model..." />
        ) : spreadsheet ? (
          <SpreadsheetGrid data={spreadsheet} onChange={handleChange} />
        ) : (
          <EmptyState
            icon={Calculator}
            title="No Financial Model Yet"
            description="The agents are still building your financial model. Check back soon."
            action={
              <button className="px-4 py-2 bg-white text-black font-mono text-xs font-bold uppercase">
                GENERATE NOW
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}
```

#### 3. Pitch Deck Tab (New)

```tsx
// apps/web/src/dashboard/BuildPitchDeck.tsx

export function BuildPitchDeck() {
  const { buildId } = useParams();
  const [deck, setDeck] = useState<PitchDeck | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <div className="h-full flex">
      {/* Slide Thumbnails (Left Sidebar) */}
      <aside className="w-64 border-r border-white/10 bg-surface-1 overflow-y-auto">
        <div className="p-3 space-y-2">
          {deck?.slides.map((slide, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`w-full p-3 border text-left transition-colors ${
                activeSlide === index
                  ? "border-white bg-surface-2"
                  : "border-white/10 bg-surface-0 hover:bg-surface-2"
              }`}
            >
              <div className="aspect-video bg-surface-3 mb-2 flex items-center justify-center">
                <span className="text-2xl font-mono text-white/40">{index + 1}</span>
              </div>
              <p className="text-xs font-mono text-white/60 truncate">{slide.title}</p>
            </button>
          ))}
        </div>
      </aside>

      {/* Slide Editor (Main) */}
      <main className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-surface-1">
          <div className="flex items-center gap-2">
            <Presentation className="w-4 h-4 text-white/60" />
            <span className="text-xs font-mono font-bold text-white/60 uppercase">
              Slide {activeSlide + 1} of {deck?.slides.length || 0}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs font-mono text-white/60 hover:text-white">
              <Plus className="w-3 h-3 inline mr-1" />
              ADD SLIDE
            </button>
            <button className="px-3 py-1.5 text-xs font-mono text-white/60 hover:text-white">
              <Download className="w-3 h-3 inline mr-1" />
              EXPORT PDF
            </button>
          </div>
        </div>

        {/* Slide Canvas */}
        <div className="flex-1 p-8 bg-surface-0 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <div className="aspect-video bg-white rounded-none shadow-xl">
              {/* Slide content editor */}
              <SlideEditor
                slide={deck?.slides[activeSlide]}
                onChange={(updated) => handleSlideChange(activeSlide, updated)}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

#### 4. Documents Tab (New)

```tsx
// apps/web/src/dashboard/BuildDocuments.tsx

export function BuildDocuments() {
  const { buildId } = useParams();
  const [documents, setDocuments] = useState<Document[]>([]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-mono font-bold text-white mb-2">Generated Documents</h2>
        <p className="text-sm font-mono text-white/60">
          Business plans, marketing materials, and legal documents created by your agents.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="border border-white/10 bg-surface-1 p-5 hover:bg-surface-2 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 border border-white/10 bg-surface-2 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white/60" />
              </div>
              <span className="text-xs font-mono text-white/40">{doc.size}</span>
            </div>

            <h3 className="text-sm font-mono font-bold text-white mb-1">{doc.title}</h3>
            <p className="text-xs font-mono text-white/40 mb-4">{doc.department}</p>

            <div className="flex items-center gap-2">
              <button className="flex-1 px-3 py-2 bg-white hover:bg-white/90 text-black text-xs font-mono font-bold uppercase transition-colors">
                <Eye className="w-3 h-3 inline mr-1" />
                VIEW
              </button>
              <button className="px-3 py-2 border border-white/10 bg-surface-2 hover:bg-surface-3 text-white text-xs font-mono transition-colors">
                <Download className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 5. Agents Tab (New)

```tsx
// apps/web/src/dashboard/BuildAgents.tsx

export function BuildAgents() {
  const { buildId } = useParams();
  const [agents, setAgents] = useState<AgentLog[]>([]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-mono font-bold text-white mb-2">Agent Activity</h2>
        <p className="text-sm font-mono text-white/60">
          Monitor what your 7 departments are doing and re-run specific tasks.
        </p>
      </div>

      <div className="space-y-4">
        {DEPT_ORDER.map((dept) => (
          <AgentCard
            key={dept}
            department={dept}
            logs={agents.filter(a => a.department === dept)}
            onRerun={(taskId) => handleRerun(dept, taskId)}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## User Journey Flow

### 1. New User → First Build

```
Landing Page
    ↓
Sign Up / Login
    ↓
Dashboard → Empty State
    ↓
[Create Your First Build] CTA
    ↓
Terminal Prompt → Enter Idea
    ↓
/dashboard/builds/:buildId/overview
    ↓
Watch Agents Work (7 departments in parallel)
    ↓
100% Complete → Notification
    ↓
Tabs Unlock: Spreadsheet, Deck, Docs
```

### 2. Returning User → Refine Build

```
Dashboard → Build List
    ↓
Select Build (or "Most Recent" auto-loaded)
    ↓
/dashboard/builds/:buildId/overview
    ↓
Switch to [SPREADSHEET] tab
    ↓
Edit Financial Model
    ↓
Switch to [PITCH DECK] tab
    ↓
Customize Slides
    ↓
[EXPORT] → Download All Assets
```

### 3. Multi-Build Power User

```
Dashboard → Build Dropdown
    ↓
Switch Between Builds (Cmd+K quick switcher)
    ↓
Build A: Check Agents
    ↓
Build B: Edit Spreadsheet
    ↓
Build C: Export Pitch Deck
    ↓
History → Archive Old Builds
```

---

## Progress Indication System

### Build-Level Progress

**Calculation:**

```typescript
type BuildStatus = "draft" | "generating" | "ready" | "complete" | "archived";

interface BuildProgress {
  overall: number;           // 0-100%
  agents: number;            // 0-100% (department completion)
  spreadsheet: boolean;      // Generated or not
  pitchDeck: boolean;        // Generated or not
  documents: number;         // Count of docs ready
}

function calculateProgress(build: Build): number {
  const weights = {
    agents: 50,        // Agents finishing is 50% of progress
    spreadsheet: 20,   // Spreadsheet generated adds 20%
    pitchDeck: 20,     // Deck generated adds 20%
    documents: 10,     // Documents add 10%
  };

  let progress = 0;
  progress += (build.agentsProgress / 100) * weights.agents;
  progress += build.hasSpreadsheet ? weights.spreadsheet : 0;
  progress += build.hasPitchDeck ? weights.pitchDeck : 0;
  progress += (build.documentCount / 10) * weights.documents; // Max 10 docs

  return Math.min(Math.round(progress), 100);
}
```

### Visual Indicators

#### 1. Overview Tab Progress Ring

```tsx
<div className="relative w-32 h-32 mx-auto">
  {/* Background ring */}
  <svg className="w-full h-full" viewBox="0 0 100 100">
    <circle
      cx="50"
      cy="50"
      r="40"
      fill="none"
      stroke="rgba(255,255,255,0.1)"
      strokeWidth="8"
    />
    {/* Progress ring */}
    <circle
      cx="50"
      cy="50"
      r="40"
      fill="none"
      stroke="white"
      strokeWidth="8"
      strokeDasharray={`${progress * 2.51} 251`}
      strokeLinecap="square"
      transform="rotate(-90 50 50)"
    />
  </svg>
  {/* Center percentage */}
  <div className="absolute inset-0 flex items-center justify-center">
    <span className="text-3xl font-mono font-bold text-white">{progress}%</span>
  </div>
</div>
```

#### 2. Tab Badges

```tsx
// Show completion badges on tabs
<BuildDetailTabs
  tabs={[
    { id: "overview", label: "OVERVIEW", code: "00", icon: Terminal },
    { 
      id: "spreadsheet", 
      label: "SPREADSHEET", 
      code: "01", 
      icon: Table,
      badge: hasSpreadsheet ? "✓" : "...",
      disabled: !hasSpreadsheet
    },
    { 
      id: "pitch-deck", 
      label: "PITCH DECK", 
      code: "02", 
      icon: Presentation,
      badge: hasPitchDeck ? "✓" : "...",
      disabled: !hasPitchDeck
    },
    { 
      id: "documents", 
      label: "DOCUMENTS", 
      code: "03", 
      icon: FileText,
      badge: documentCount > 0 ? documentCount : "...",
      disabled: documentCount === 0
    },
    { id: "agents", label: "AGENTS", code: "04", icon: Bot },
  ]}
/>
```

#### 3. Header Status Badge

```tsx
<div className="flex items-center gap-2 px-3 py-1.5 border border-white/10 bg-surface-2">
  <div className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
  <span className="text-xs font-mono text-white/60">{statusText}</span>
</div>

// Status mapping
const statusMap = {
  0: { color: "bg-white/40", text: "DRAFT" },
  1-99: { color: "bg-amber-400 animate-pulse", text: "BUILDING" },
  100: { color: "bg-green-400", text: "READY" },
};
```

---

## Empty States

### 1. No Builds Yet (Dashboard)

```
┌────────────────────────────────────────────┐
│                                            │
│         ┌──────────────────┐               │
│         │                  │               │
│         │   [Terminal]     │               │
│         │                  │               │
│         └──────────────────┘               │
│                                            │
│     Your Builds Will Appear Here           │
│                                            │
│  Start by describing your business idea.   │
│  Our 7 AI departments will handle the rest.│
│                                            │
│     ┌───────────────────────────┐          │
│     │  CREATE YOUR FIRST BUILD  │          │
│     └───────────────────────────┘          │
│                                            │
└────────────────────────────────────────────┘
```

### 2. Agents Still Running (Spreadsheet Tab)

```
┌────────────────────────────────────────────┐
│                                            │
│         [Calculator Icon]                  │
│                                            │
│     Financial Model In Progress            │
│                                            │
│  The Finance department is building your   │
│  5-year financial projections. This usually│
│  takes 2-3 minutes.                        │
│                                            │
│  ● ● ● (animated)                          │
│                                            │
│  Meanwhile, check the Overview tab to see  │
│  what other departments are working on.    │
│                                            │
└────────────────────────────────────────────┘
```

### 3. No Documents Yet (Documents Tab)

```
┌────────────────────────────────────────────┐
│                                            │
│         [FileText Icon]                    │
│                                            │
│     No Documents Generated Yet             │
│                                            │
│  Documents will appear here once your      │
│  agents complete their work.               │
│                                            │
│     ┌───────────────────────────┐          │
│     │   GO TO OVERVIEW          │          │
│     └───────────────────────────┘          │
│                                            │
└────────────────────────────────────────────┘
```

---

## Mobile Considerations

### 1. Build Detail Tabs → Horizontal Scroll

```tsx
// Mobile: Tabs scroll horizontally
<nav className="sticky top-[73px] z-10 border-b border-white/10 bg-surface-0 overflow-x-auto scrollbar-hide">
  <div className="flex items-center px-4 min-w-max">
    {tabs.map((tab) => (
      <NavLink key={tab.id} to={`...`} className="flex-shrink-0 ...">
        {/* Tab content */}
      </NavLink>
    ))}
  </div>
</nav>
```

### 2. Spreadsheet → Pinch to Zoom + Scroll

```tsx
// Mobile spreadsheet gestures
<div 
  className="touch-pan-x touch-pan-y overflow-auto"
  style={{ 
    WebkitOverflowScrolling: 'touch',
    touchAction: 'pinch-zoom pan-x pan-y'
  }}
>
  <SpreadsheetGrid 
    minZoom={0.5}
    maxZoom={2}
    enableGestures={isMobile}
  />
</div>
```

### 3. Pitch Deck → Swipe Between Slides

```tsx
// Mobile: Swipe slides instead of sidebar
<div className="md:hidden">
  <div 
    className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide"
    style={{ scrollSnapType: 'x mandatory' }}
  >
    {deck.slides.map((slide, i) => (
      <div key={i} className="flex-shrink-0 w-full snap-center">
        <SlideView slide={slide} />
      </div>
    ))}
  </div>
  
  {/* Slide indicator dots */}
  <div className="flex justify-center gap-1 mt-4">
    {deck.slides.map((_, i) => (
      <div 
        key={i} 
        className={`w-1.5 h-1.5 rounded-full ${
          i === activeSlide ? 'bg-white' : 'bg-white/30'
        }`}
      />
    ))}
  </div>
</div>
```

### 4. Mobile Header → Compact Mode

```tsx
// Mobile: Simplified header with dropdown menu
<header className="lg:px-6 px-4 lg:py-4 py-3">
  <div className="flex items-center justify-between">
    {/* Mobile: Back button + title only */}
    <button onClick={onBack} className="lg:hidden">
      <ArrowLeft className="w-4 h-4" />
    </button>
    <h1 className="text-sm lg:text-lg font-mono font-bold truncate">
      {buildName}
    </h1>
    
    {/* Mobile: Collapse actions into menu */}
    <button className="lg:hidden">
      <MoreVertical className="w-4 h-4" />
    </button>
    
    {/* Desktop: Show all actions */}
    <div className="hidden lg:flex items-center gap-4">
      {/* Full actions */}
    </div>
  </div>
</header>
```

---

## Breadcrumb System

### Implementation

```tsx
// apps/web/src/components/Breadcrumbs.tsx

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-xs font-mono">
      {items.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="w-3 h-3 text-white/30" />
          )}
          {item.href ? (
            <Link
              to={item.href}
              className="text-white/60 hover:text-white transition-colors uppercase"
            >
              {item.label}
            </Link>
          ) : (
            <span className={`uppercase ${
              item.active ? "text-white font-bold" : "text-white/40"
            }`}>
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
```

### Usage Examples

```tsx
// Dashboard → Builds
<Breadcrumbs items={[
  { label: "Dashboard", href: "/dashboard" },
  { label: "Builds", active: true },
]} />

// Dashboard → Build Detail → Spreadsheet
<Breadcrumbs items={[
  { label: "Dashboard", href: "/dashboard" },
  { label: "Builds", href: "/dashboard" },
  { label: "Dog Walking Marketplace", href: `/dashboard/builds/${buildId}` },
  { label: "Spreadsheet", active: true },
]} />
```

---

## Component Specifications

### 1. BuildDetailLayout Component

**File:** `apps/web/src/dashboard/BuildDetailLayout.tsx`

```tsx
export default function BuildDetailLayout() {
  const { buildId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [build, setBuild] = useState<Build | null>(null);
  const [loading, setLoading] = useState(true);

  // Determine active tab from URL
  const activeTab = location.pathname.split('/').pop() || 'overview';

  // Calculate progress
  const progress = build ? calculateProgress(build) : 0;

  // Tab configuration with unlock logic
  const tabs: BuildTab[] = [
    { id: "overview", label: "OVERVIEW", code: "00", icon: Terminal },
    { 
      id: "spreadsheet", 
      label: "SPREADSHEET", 
      code: "01", 
      icon: Table,
      badge: build?.hasSpreadsheet ? "✓" : undefined,
      disabled: !build?.hasSpreadsheet
    },
    { 
      id: "pitch-deck", 
      label: "PITCH DECK", 
      code: "02", 
      icon: Presentation,
      badge: build?.hasPitchDeck ? "✓" : undefined,
      disabled: !build?.hasPitchDeck
    },
    { 
      id: "documents", 
      label: "DOCUMENTS", 
      code: "03", 
      icon: FileText,
      badge: build?.documentCount || undefined,
      disabled: !build?.documentCount
    },
    { id: "agents", label: "AGENTS", code: "04", icon: Bot },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <BuildDetailHeader
        buildId={buildId!}
        buildName={build?.name || "Loading..."}
        status={build?.status || "draft"}
        progress={progress}
        onBack={() => navigate('/dashboard')}
        onExport={handleExport}
      />

      {/* Tabs */}
      <BuildDetailTabs
        buildId={buildId!}
        activeTab={activeTab}
        tabs={tabs}
      />

      {/* Tab Content */}
      <main className="flex-1 overflow-y-auto bg-surface-0">
        <Outlet context={{ build, setBuild }} />
      </main>
    </div>
  );
}
```

### 2. EmptyState Component

**File:** `apps/web/src/components/EmptyState.tsx`

```tsx
interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="max-w-md text-center">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 border border-white/10 bg-surface-1 flex items-center justify-center">
          <Icon className="w-8 h-8 text-white/40" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-mono font-bold text-white mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm font-mono text-white/60 leading-relaxed mb-6">
          {description}
        </p>

        {/* Action */}
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
```

### 3. LoadingState Component

**File:** `apps/web/src/components/LoadingState.tsx`

```tsx
interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        {/* Spinner */}
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
        
        {/* Message */}
        <p className="text-sm font-mono text-white/60 uppercase tracking-wider">
          {message}
        </p>
      </div>
    </div>
  );
}
```

---

## Wireframes

### Desktop: Build Detail with Tabs

```
┌────────────────────────────────────────────────────────────────────────┐
│ ← BACK   Dog Walking Marketplace    [62% COMPLETE] [EXPORT] [•••]    │ 73px
├────────────────────────────────────────────────────────────────────────┤
│ 00 OVERVIEW │ 01 SPREADSHEET ✓ │ 02 DECK ✓ │ 03 DOCS 7 │ 04 AGENTS   │ 48px
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                                                                    │ │
│  │                     SPREADSHEET TAB CONTENT                        │ │
│  │                                                                    │ │
│  │  ┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐  │ │
│  │  │   A1    │   B1    │   C1    │   D1    │   E1    │   F1    │  │ │
│  │  ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤  │ │
│  │  │ Revenue │  Year 1 │  Year 2 │  Year 3 │  Year 4 │  Year 5 │  │ │
│  │  ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤  │ │
│  │  │ Product │  $50K   │  $150K  │  $400K  │  $800K  │  $1.2M  │  │ │
│  │  ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤  │ │
│  │  │ Service │  $20K   │  $60K   │  $150K  │  $300K  │  $500K  │  │ │
│  │  └─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘  │ │
│  │                                                                    │ │
│  │  [Auto-saved 2s ago]                                              │ │
│  │                                                                    │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Mobile: Build Detail Collapsed

```
┌───────────────────────────────────┐
│ ← Dog Walking... [62%] [•••]     │ Header (sticky)
├───────────────────────────────────┤
│00 OVERVIEW│01 SHEET│02 DECK│...→│ Tabs (scrollable)
├───────────────────────────────────┤
│                                   │
│  ┌─────────────────────────────┐ │
│  │                             │ │
│  │   Spreadsheet (zoomed out)  │ │
│  │   Swipe to scroll →         │ │
│  │   Pinch to zoom             │ │
│  │                             │ │
│  └─────────────────────────────┘ │
│                                   │
│  [Export CSV] [Export XLSX]      │
│                                   │
└───────────────────────────────────┘
```

### Dashboard: Build List

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│  BUILDS                                                [+ NEW BUILD]   │
│                                                                        │
│  ┌────────────────────────────────┬────────────────────────────────┐ │
│  │ Dog Walking Marketplace        │ SaaS Analytics Platform        │ │
│  │ ● 62% COMPLETE                 │ ✓ 100% COMPLETE                │ │
│  │                                │                                │ │
│  │ Premium dog gear DTC...        │ Real-time analytics for...    │ │
│  │                                │                                │ │
│  │ Last activity: 2h ago          │ Last activity: 3d ago          │ │
│  └────────────────────────────────┴────────────────────────────────┘ │
│                                                                        │
│  ┌────────────────────────────────┬────────────────────────────────┐ │
│  │ AI Writing Assistant           │ Crypto Trading Bot             │ │
│  │ ● 15% COMPLETE                 │ [DRAFT]                        │ │
│  │                                │                                │ │
│  │ Help writers overcome...       │ Not started yet                │ │
│  │                                │                                │ │
│  │ Last activity: 5h ago          │ Created: 1w ago                │ │
│  └────────────────────────────────┴────────────────────────────────┘ │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Checklist

### Phase 1: Core Navigation (Week 1)

- [ ] Create `BuildDetailLayout.tsx` with header + tabs
- [ ] Create `BuildDetailHeader.tsx` component
- [ ] Create `BuildDetailTabs.tsx` component
- [ ] Update `App.tsx` routing for new tab structure
- [ ] Add progress calculation logic
- [ ] Test tab switching on desktop
- [ ] Test tab scrolling on mobile

### Phase 2: Tab Components (Week 2)

- [ ] Implement `BuildOverview.tsx` (refactor existing OverviewNew.tsx)
- [ ] Implement `BuildSpreadsheet.tsx` with grid editor
- [ ] Implement `BuildPitchDeck.tsx` with slide editor
- [ ] Implement `BuildDocuments.tsx` with document cards
- [ ] Implement `BuildAgents.tsx` with agent logs

### Phase 3: Empty States & Polish (Week 3)

- [ ] Create `EmptyState.tsx` component
- [ ] Create `LoadingState.tsx` component
- [ ] Add empty states to all tabs
- [ ] Add loading states to all tabs
- [ ] Implement breadcrumbs component
- [ ] Add keyboard shortcuts (Cmd+1-5 for tabs)

### Phase 4: Mobile Optimization (Week 4)

- [ ] Test all tabs on mobile (iPhone, Android)
- [ ] Implement spreadsheet touch gestures
- [ ] Implement pitch deck swipe navigation
- [ ] Optimize header for mobile
- [ ] Test tab scrolling on small screens
- [ ] Add mobile-specific empty states

### Phase 5: Backend Integration (Week 5)

- [ ] Add spreadsheet API endpoints
- [ ] Add pitch deck API endpoints
- [ ] Add documents API endpoints
- [ ] Implement auto-save for spreadsheet
- [ ] Implement export functionality
- [ ] Add real-time updates (WebSocket or polling)

---

## Design Tokens

### Spacing

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
```

### Colors (Terminal Aesthetic)

```css
--surface-0: #0a0a0a;  /* Background */
--surface-1: #151515;  /* Cards, sidebars */
--surface-2: #1f1f1f;  /* Hover states */
--surface-3: #2a2a2a;  /* Active states */

--white: #ffffff;
--white-60: rgba(255,255,255,0.6);
--white-40: rgba(255,255,255,0.4);
--white-10: rgba(255,255,255,0.1);

--green-400: #4ade80;   /* Success */
--amber-400: #fbbf24;   /* Warning/In Progress */
--red-400: #f87171;     /* Error */
```

### Typography

```css
--font-mono: 'Roboto Mono', 'Courier New', monospace;
--font-size-xs: 10px;
--font-size-sm: 12px;
--font-size-base: 14px;
--font-size-lg: 16px;
--font-size-xl: 20px;
```

### Borders

```css
--border-width: 1px;
--border-color: rgba(255,255,255,0.1);
--border-radius: 0px;  /* No rounded corners */
```

---

## Accessibility

### Keyboard Navigation

- `Tab` / `Shift+Tab` - Navigate between interactive elements
- `Cmd+1` through `Cmd+5` - Switch between build tabs
- `Cmd+K` - Open build switcher (future feature)
- `Escape` - Close modals/dropdowns
- `Enter` - Activate buttons/links
- `Arrow keys` - Navigate spreadsheet cells

### Screen Reader Support

```tsx
// Tab navigation with ARIA labels
<nav role="tablist" aria-label="Build sections">
  <NavLink
    role="tab"
    aria-selected={isActive}
    aria-controls={`panel-${tab.id}`}
    id={`tab-${tab.id}`}
  >
    {tab.label}
  </NavLink>
</nav>

// Tab panels with ARIA labels
<div
  role="tabpanel"
  aria-labelledby={`tab-${activeTab}`}
  id={`panel-${activeTab}`}
>
  {content}
</div>
```

### Focus Management

- Maintain focus when switching tabs
- Trap focus in modals
- Restore focus after closing dropdowns
- Visible focus indicators (outline: 2px solid white)

---

## Performance Considerations

### Code Splitting

```tsx
// Lazy load heavy tab components
const BuildSpreadsheet = lazy(() => import('./BuildSpreadsheet'));
const BuildPitchDeck = lazy(() => import('./BuildPitchDeck'));

// Wrap in Suspense
<Suspense fallback={<LoadingState />}>
  <BuildSpreadsheet />
</Suspense>
```

### Data Fetching

```tsx
// Prefetch tab data on hover
<NavLink
  onMouseEnter={() => prefetchTabData(tab.id)}
  onFocus={() => prefetchTabData(tab.id)}
>
  {tab.label}
</NavLink>

// Cache tab data to avoid refetching
const { data, isLoading } = useQuery({
  queryKey: ['build', buildId, tab],
  queryFn: () => fetchTabData(buildId, tab),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Spreadsheet Optimization

- Virtualize rows (render only visible cells)
- Debounce auto-save (500ms after last edit)
- Use Web Workers for formula calculations
- Limit initial render to 100 rows, lazy load rest

---

## Future Enhancements

### Phase 6: Advanced Features (Q3 2026)

- [ ] Build templates (e-commerce, SaaS, marketplace)
- [ ] AI chat assistant (ask questions about your build)
- [ ] Collaboration (share builds, leave comments)
- [ ] Version history (revert to previous states)
- [ ] Export to GitHub (push pitch deck as repo)
- [ ] Integration marketplace (connect Stripe, analytics)

### Phase 7: Power User Features (Q4 2026)

- [ ] Command palette (Cmd+K for everything)
- [ ] Custom dashboards (drag-drop widgets)
- [ ] API access (programmatic build management)
- [ ] Webhooks (notify on build completion)
- [ ] Multi-build comparison view
- [ ] Advanced agent configuration

---

## Conclusion

This UX design achieves:

1. **Clarity** - Users always know where they are (breadcrumbs, active tabs)
2. **Efficiency** - All tools accessible within 2 clicks
3. **Progress** - Clear indicators at every level (build %, tab badges, agents)
4. **Professional** - Terminal aesthetic, no fluff, command-center feel
5. **Mobile-Ready** - Thoughtful adaptations for small screens
6. **Extensible** - Tab system scales to future features

The tab-based approach provides a familiar mental model (like Linear, GitHub) while maintaining the clean terminal aesthetic that defines Nanowork.

---

**Next Steps:**

1. Review this design with team
2. Create Figma mockups (optional, can build directly)
3. Start implementation with Phase 1 (navigation)
4. Iterate based on user feedback

**Questions? Contact:** jordan@nanowork.ai
