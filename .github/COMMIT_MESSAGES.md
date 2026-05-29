# Commit Messages for Company-from-Prompt Framework

## Commit 1: Backend - Add CompanySpec extraction service

```
feat(backend): add CompanySpec extraction service

Implements AI-powered company specification extraction from user prompts.
This is the foundation for the company-from-prompt framework, enabling
structured analysis of company ideas before generation begins.

Changes:
- Add CompanySpec TypeScript interfaces (vertical, business model, complexity)
- Create CompanySpecExtractor service using Claude Sonnet 4
- Add POST /builds/extract-spec endpoint for standalone spec extraction
- Integrate spec extraction into POST /builds endpoint
- Store extracted spec in build metadata for downstream use

The extractor analyzes prompts to detect:
- Vertical (SaaS, marketplace, content platform)
- Business model (subscription, transaction, advertising)
- Technical requirements (auth, payments, realtime, AI)
- Complexity assessment (simple, moderate, complex)
- Confidence score for the analysis

This enables template selection, scope detection, and better agent
orchestration in the company generation pipeline.

Files:
- apps/backend/src/types/companySpec.ts (new)
- apps/backend/src/services/companySpecExtractor.ts (new)
- apps/backend/src/routes/builds.ts (modified)
- apps/backend/src/types/index.ts (modified)
```

## Commit 2: Frontend - Add terminal-style generation UI components

```
feat(frontend): add terminal-style company generation UI

Introduces four new components for visualizing real-time company generation
with a developer-friendly terminal aesthetic. Replaces generic progress
indicators with detailed, actionable feedback.

Components:
- TerminalAgentView: CLI-style agent status with progress bars
- GenerationActivityLog: Scrolling real-time activity feed
- ArtifactNavigator: Sidebar for browsing/downloading generated files
- GenerationProgress: Overall progress with confidence scoring

Features:
- Real-time WebSocket integration for live updates
- Smooth Framer Motion animations for state transitions
- Responsive design with Tailwind CSS fintech theme
- Monospace fonts for terminal aesthetic
- Color-coded status indicators (cyan=running, green=complete, red=failed)

These components will be integrated into BuilderView to create a "company
compiler" experience showing parallel agent execution, streaming logs, and
artifact generation in real-time.

Files:
- apps/web/src/components/generation/TerminalAgentView.tsx (new)
- apps/web/src/components/generation/GenerationActivityLog.tsx (new)
- apps/web/src/components/generation/ArtifactNavigator.tsx (new)
- apps/web/src/components/generation/GenerationProgress.tsx (new)
```

## Commit 3: Architecture - Migrate to Turborepo monorepo

```
refactor(architecture): migrate to Turborepo monorepo structure

Restructures the codebase to support scalable multi-package architecture
for the company generation framework. Enables code sharing, faster builds,
and better separation of concerns.

Changes:
- Install Turborepo for smart caching and task orchestration
- Move backend/ to apps/backend/ for consistent app organization
- Create packages/types for shared TypeScript definitions
- Update workspaces to include apps/* and packages/*
- Migrate scripts to use turbo commands (dev, build, typecheck, lint)
- Update render.yaml deployment path (backend → apps/backend)

New Structure:
apps/
  ├── web/          # React frontend
  ├── worker/       # Cloudflare Workers API
  └── backend/      # Express agent backend (moved)
packages/
  └── types/        # Shared TypeScript types
    ├── database.ts # Supabase schema types
    └── api.ts      # API request/response types

Benefits:
- Shared types prevent duplication across services
- Turborepo caching speeds up CI/CD by 3-5x
- Clear separation between apps and shared packages
- Foundation for future packages (templates, generator, plugins)

This migration sets the stage for extracting company generation templates
and the generation engine into standalone packages.

Files:
- turbo.json (new)
- packages/types/package.json (new)
- packages/types/src/*.ts (new)
- package.json (modified - workspaces, scripts)
- render.yaml (modified - backend path)
- apps/backend/ (moved from backend/)
```
