# RFC-001: Rewriting Customer Code Generation for Render Monorepo Deployment

**Status:** Draft
**Date:** 2026-04-23
**Author:** Nanowork Engineering

---

## Context & Problem Statement

Nanowork's product promise is **"text an idea, we ship a company."** The changelog references automatic landing page scaffolds (v0.8), an Agents API that exposes sharpener/namer/researcher/landing/launch/ads endpoints (v0.11), and a gallery of ready-to-transfer businesses with stacks like Next.js + Supabase + Stripe, Astro + Square + Sanity, Remix + Postgres + Redis, etc.

**The problem:** none of this is actually implemented. The codebase today is a single Vite + React + TypeScript marketing site deployed to Vercel with two Edge API handlers (`/api/ai` and `/api/phone`). There is:

- **No code generation system.** No templates, scaffolds, or codegen pipeline that produces customer projects.
- **No Python backend.** The `.gitignore` includes Python patterns, but zero `.py` files exist.
- **No Render configuration.** No `render.yaml`, no Dockerfiles, no Render-specific deployment logic.
- **No monorepo structure.** One `package.json`, one app, no workspaces.

The product copy and changelog describe a system that generates full-stack businesses for customers — but the entire generation layer is missing. Before we can "fix" the Render monorepo problem, we need to build the thing that doesn't exist yet. This RFC evaluates three approaches.

---

## Current Architecture (What Actually Exists)

```
/workspace
├── api/
│   ├── ai.ts          # Vercel Edge — prompt stubs for demos
│   └── phone.ts       # Vercel Edge — region-gated phone reveal
├── src/
│   ├── App.tsx         # SPA router
│   ├── pages/          # Home, Gallery, Demo, Changelog, Login, NotFound
│   ├── demos/          # 8 hardcoded demo components (Lamina, Ovenly, etc.)
│   ├── dashboard/      # Mock auth dashboard (Overview, Usage, Domains, Plan, Settings)
│   ├── data/           # businesses.ts — static catalog with hardcoded stacks/themes
│   ├── context/        # AuthContext (localStorage mock), PhoneContext, ThemeContext
│   ├── changelog/      # MD entries loaded at build time via import.meta.glob
│   └── components/     # SiteChrome, PhoneReveal, ThemeToggle
├── vercel.json         # Routes /api/* to edge functions, everything else to SPA
├── public/_redirects   # Netlify-style SPA fallback
├── package.json        # Single app: vite, react 19, react-router-dom 7
└── vite.config.ts      # @vitejs/plugin-react, nothing else
```

**Key observations:**

1. The "businesses" in the gallery (Lamina, Ovenly, Parcel, etc.) list stacks like `["Next.js", "Supabase", "Stripe", "Vercel"]` — but these are just string arrays rendered in the UI. No code is generated for any of them.
2. The Agents API (`POST /v1/agents/{sharpener,namer,...}`) is described in changelog v0.11 and displayed on the homepage, but the only API that exists is `api/ai.ts`, which handles four prompt tasks for the demo apps — it does not generate code or scaffold projects.
3. The dashboard (Overview, Usage, Domains, Plan, Settings) uses a mock agent profile stored in `localStorage`. There is no real backend, no real auth, no real billing.
4. Deployment is Vercel-only. The `_redirects` file is dead weight from a previous Netlify experiment.

---

## What Needs to Exist Before Any Solution Works

Regardless of which approach we pick, we need:

1. **A code generation engine** — something that takes structured input (idea, stack preferences, business type) and produces a working project.
2. **A backend that orchestrates** — the agents API needs to be real, not stub prompts.
3. **A deployment pipeline** — generated projects need to go somewhere (Render, Vercel, Fly, etc.) automatically.
4. **A monorepo or project structure** that separates the Nanowork marketing site from customer-generated code.

---

## Solution 1: Unified TypeScript Monorepo on Render (Full-Stack JS)

### The Idea

Stop promising Python backends. Rewrite the code generation system to emit **full-stack TypeScript/JavaScript** projects only. Use Render's monorepo support with a single repo containing the Nanowork platform and a codegen engine that produces JS-only customer projects.

### Architecture

```
/
├── apps/
│   ├── web/                    # Current marketing site (Vite + React)
│   └── platform-api/           # Real backend (Node/Express or Hono)
│       ├── agents/             # Sharpener, Namer, Researcher, Landing, Launch, Ads
│       ├── codegen/            # Project generator
│       │   ├── templates/      # Starter templates per business type
│       │   │   ├── saas/       # Next.js + Supabase + Stripe
│       │   │   ├── commerce/   # Astro + Square/Stripe
│       │   │   ├── newsletter/ # Ghost-compatible or custom
│       │   │   └── local/      # Simple booking + landing
│       │   ├── renderer.ts     # Template interpolation + file emission
│       │   └── deployer.ts     # Render API integration
│       └── auth/               # Real auth (replace localStorage mock)
├── packages/
│   ├── shared/                 # Types, utils shared across apps
│   └── ui/                     # Shared component library
├── render.yaml                 # Monorepo: web = static site, api = web service
└── package.json                # Workspace root (npm/pnpm workspaces)
```

**render.yaml:**
```yaml
services:
  - type: web
    name: nanowork-api
    runtime: node
    rootDir: apps/platform-api
    buildCommand: npm install && npm run build
    startCommand: npm start

  - type: web
    name: nanowork-web
    runtime: static
    rootDir: apps/web
    buildCommand: npm install && npm run build
    staticPublishPath: dist
```

### Critical Assessment

**What's good:**
- Single language across the entire stack eliminates the Python/JS split entirely.
- Render's `rootDir` in `render.yaml` handles monorepo routing cleanly.
- TypeScript everywhere means shared types between the platform API, the generated code, and the marketing site.
- Simpler hiring — you need TypeScript engineers, not TypeScript + Python engineers.

**What's bad:**
- **You don't actually have a Python backend to "fix."** There are zero `.py` files. The "Python backend" is a phantom — either it exists in another repo you haven't shared, or it's aspirational. This solution solves a problem that doesn't exist in this codebase.
- **Template-based codegen is fragile.** Mustache/Handlebars-style templates for full-stack apps get unmaintainable fast. Every new business type means a new template tree. Every framework version bump means updating every template.
- **Render's static site hosting is limited.** The current site uses Vercel Edge functions (`api/ai.ts`, `api/phone.ts`). Moving to Render means rewriting these as Express/Hono routes or using Render's serverless (which is less mature than Vercel's edge runtime).
- **You're moving away from Vercel, which already works.** The `vercel.json` is configured, the edge functions run, the SPA routing works. Migrating to Render for the marketing site introduces risk with no clear upside for the marketing site itself.

**Verdict:** This is the cleanest architecture on paper, but it's solving for a codegen system that hasn't been designed yet and migrating away from a deployment platform (Vercel) that already works. Only pursue this if you're committed to Render as your sole platform and you have the engineering capacity to build the codegen engine, the real agents API, and the real dashboard backend simultaneously.

---

## Solution 2: Split Deployment — Vercel for Platform, Render for Generated Projects

### The Idea

Keep the Nanowork marketing site and platform API on Vercel (where they already work). Build a separate codegen service that produces customer projects and deploys them to Render. Each generated customer project becomes its own Render service — either a static site or a web service, depending on the stack.

### Architecture

```
Repo 1: nanowork-platform (THIS REPO — stays on Vercel)
├── api/
│   ├── ai.ts              # Existing demo helper (keep as-is)
│   ├── phone.ts           # Existing phone reveal (keep as-is)
│   ├── agents/            # NEW: Real agent endpoints
│   │   ├── sharpener.ts
│   │   ├── namer.ts
│   │   ├── researcher.ts
│   │   ├── landing.ts
│   │   ├── launch.ts
│   │   └── ads.ts
│   └── codegen/
│       └── generate.ts    # Orchestrator: calls agents, emits project, pushes to customer repo, triggers Render
├── src/                   # Marketing site (unchanged)
└── vercel.json            # Extended with new /api/agents/* and /api/codegen/* routes

Repo 2: nanowork-project-templates (separate repo)
├── templates/
│   ├── nextjs-saas/       # Next.js + Supabase + Stripe starter
│   ├── astro-commerce/    # Astro + payments starter
│   ├── remix-ops/         # Remix + Postgres + Redis starter
│   └── sveltekit-booking/ # SvelteKit + Cal.com starter
├── shared/                # Shared utilities injected into all templates
└── scripts/
    └── render-deploy.ts   # Creates render.yaml, pushes, triggers Render API

Per customer: auto-generated repo
├── [generated project files]
├── render.yaml            # Auto-generated per project type
└── .nanowork              # Metadata: agent ID, generation params, etc.
```

### Critical Assessment

**What's good:**
- **Least invasive to what already works.** The marketing site stays on Vercel untouched. No migration risk.
- **Clean separation of concerns.** Platform = Vercel. Customer projects = Render. Different lifecycles, different scaling needs.
- **Customer projects are self-contained.** Each gets its own repo and Render service, which is exactly what you'd want for transfer (your gallery says "Full codebase + assets" as a deliverable).
- **Supports mixed stacks naturally.** Customer project can be Next.js, Astro, Remix, SvelteKit — whatever. Render doesn't care as long as the `render.yaml` is valid.

**What's bad:**
- **Two platforms to manage.** Vercel for the platform, Render for customer projects. Double the deployment config, double the monitoring, double the billing dashboards.
- **The codegen endpoint in Vercel Edge has hard limits.** Vercel Edge functions have a 25-second execution limit (even on Pro). Generating a full project, pushing it to GitHub, and triggering a Render deploy will almost certainly exceed that. You'd need a background job system (queue + worker), which Vercel doesn't natively support — you'd need something like Inngest, Trigger.dev, or an external queue.
- **Template repos are a maintenance burden.** Every template is a frozen snapshot of a framework + integration. When Next.js ships a breaking change, you update one template. When Stripe changes their API, you update four templates. When Supabase changes auth patterns, you update three. This doesn't scale.
- **No real Python.** Again — the Python backend mentioned in your question doesn't exist in this repo. If it exists elsewhere, this solution doesn't address it. If the agents API (Sharpener, etc.) is supposed to run Python ML models, this solution puts them in Vercel Edge TypeScript — which may not be what you want for compute-heavy AI workloads.

**Verdict:** This is the most pragmatic, least risky approach. It preserves everything that works today and adds the generation layer as a separate concern. The downside is operational complexity (two platforms) and the Vercel execution time limit, which will require a job queue for the actual generation pipeline. Choose this if you want to ship incrementally without touching the working marketing site.

---

## Solution 3: AI-First Code Generation (No Templates, LLM-Generated Projects)

### The Idea

Don't maintain templates at all. Use the existing Agents API pattern — the Sharpener/Landing/etc. agents that are already described in the product — and extend them into a code generation pipeline where an LLM generates the entire customer project from a structured prompt. Deploy to Render via their API.

### Architecture

```
/
├── apps/
│   ├── web/                       # Marketing site (current code, moved into monorepo)
│   └── codegen-worker/            # Long-running worker (NOT edge, NOT serverless)
│       ├── pipeline/
│       │   ├── 01-sharpen.ts      # Agent: idea → pitch + ICP + wedge
│       │   ├── 02-name.ts         # Agent: pitch → brand name + domain
│       │   ├── 03-research.ts     # Agent: market scan
│       │   ├── 04-architect.ts    # NEW: pitch + stack prefs → file tree + specs
│       │   ├── 05-generate.ts     # NEW: specs → full project files via LLM
│       │   ├── 06-validate.ts     # NEW: lint, type-check, test generated code
│       │   ├── 07-deploy.ts       # Push to Render via API
│       │   └── 08-launch.ts       # Agent: launch plan + ads
│       ├── prompts/               # System prompts per agent/step
│       ├── validators/            # AST-level checks, dependency resolution
│       └── queue.ts               # Job queue (BullMQ/Redis or Render's cron)
├── packages/
│   └── shared/
├── render.yaml
└── package.json
```

### The Generation Pipeline

```
User texts idea
    → Sharpener (pitch + ICP + wedge)
    → Namer (brand + domain availability)
    → Researcher (market gap + competitors)
    → Architect (NEW: file tree, dependencies, API routes, DB schema)
    → Generator (NEW: LLM writes each file, guided by architect output)
    → Validator (NEW: tsc --noEmit, eslint, basic smoke tests)
    → Deployer (git init, push to Render-connected repo, trigger deploy)
    → Launch (distribution plan, ad copy)
```

### Critical Assessment

**What's good:**
- **No template maintenance.** The LLM generates code for any stack, any framework, any integration. New framework? Update the prompt, not a template tree.
- **Matches the product narrative.** The homepage literally says "Text an idea. We help you shape it, ship it." An LLM pipeline that goes from idea to deployed code is the most literal implementation of the promise.
- **Render's monorepo support works here.** The `codegen-worker` is a long-running Render web service (or background worker). The marketing site is a static site. Both live in one repo, deployed via `render.yaml` with `rootDir` per service.
- **The agents are already described.** The homepage lists Sharpener, Namer, Researcher, Landing, Launch, Ads with typed contracts. You just need to add Architect, Generator, and Validator to the pipeline.

**What's bad:**
- **LLM-generated code is unreliable.** Even GPT-4o produces code with import errors, missing dependencies, wrong API usage, and subtle logic bugs. The "Validator" step (type-check, lint, smoke test) will catch some of this, but not all. You'll need a feedback loop where validation failures get fed back to the LLM for correction — which adds latency and cost.
- **Cost per generation is high.** Generating a full project (20-50 files, each requiring context-aware generation) will cost $2-10+ in API calls per project at current GPT-4o pricing. At $99/mo per customer, you can't afford many re-generations.
- **The "Validator" is the hard part.** Type-checking generated code requires installing dependencies, running `tsc`, running `eslint` — in an isolated environment, per generation. This is essentially a CI pipeline per customer project. You need sandboxed execution (Docker, Firecracker, or Render's build system itself).
- **Latency is brutal.** A full pipeline (sharpen → name → research → architect → generate → validate → deploy) could take 3-10 minutes. The product says "we'll text you when the page is live" — so async is fine in theory, but a 10-minute wait for a landing page that might have bugs is a bad experience.
- **You still need Render API integration.** Render's API for creating services programmatically is available but requires creating repos (or using a Render-connected GitHub repo), pushing code, and triggering deploys. This is non-trivial plumbing regardless of how the code is generated.
- **Debugging generated code is a nightmare for customers.** When a customer takes ownership of a generated project ("Full codebase + assets" is listed as a deliverable), they inherit LLM-written code with no consistent patterns, no shared conventions, and potentially creative but wrong solutions. Template-based code is at least predictable.

**Verdict:** This is the most ambitious and the most aligned with the product vision, but it's also the highest risk. LLM code generation is improving fast, but it's not reliable enough today for production-grade, customer-facing projects without significant human review. The validator/feedback loop is the critical component — if you can make that robust (essentially a CI pipeline per generation), this approach has the highest ceiling. If you can't, you'll ship buggy projects and erode trust. Only pursue this if you have strong AI engineering capacity and are willing to invest heavily in the validation layer.

---

## Comparison Matrix

| Dimension | Solution 1: Unified TS Monorepo | Solution 2: Split Deploy | Solution 3: LLM-First |
|---|---|---|---|
| **Migration risk** | High (move off Vercel) | Low (keep what works) | Medium (new worker infra) |
| **Template maintenance** | High (per-stack templates) | High (per-stack templates) | None (LLM generates) |
| **Code quality** | Predictable (templated) | Predictable (templated) | Variable (LLM-dependent) |
| **Stack flexibility** | Limited to templates built | Limited to templates built | Any stack the LLM knows |
| **Operational complexity** | One platform (Render) | Two platforms (Vercel + Render) | One platform (Render) |
| **Time to first generation** | Medium | Shortest | Longest |
| **Matches product copy** | Partially | Partially | Fully |
| **Python backend support** | No (all TS) | No (all TS) | Possible (LLM can emit Python) |
| **Customer code transferability** | Good (clean templates) | Good (clean templates) | Risky (LLM quirks) |
| **Render monorepo usage** | Full | Customer projects only | Full |

---

## Recommendation

**Start with Solution 2, plan for Solution 3.**

Solution 2 is the only one that doesn't require touching anything that currently works. You can:

1. Build the real agents API as Vercel serverless functions (they're already stubbed in the product).
2. Build a job queue (Inngest or Trigger.dev) to handle async generation.
3. Start with 2-3 template-based project types (SaaS, commerce, newsletter) deployed to Render.
4. Gradually replace templates with LLM generation as the validator matures.

This gives you a working generation pipeline in the near term while building toward the more ambitious LLM-first approach.

**But be honest about what exists.** Right now, the codebase has zero infrastructure for code generation, zero backend, zero deployment automation, and a mock dashboard. The "Python backend" problem doesn't exist here — what exists is a React marketing site with Vercel edge stubs. Any solution needs to start by building the backend before it can worry about Render monorepo layout.

---

## Appendix: Files That Need to Change (Any Solution)

| File | Current State | Required Change |
|---|---|---|
| `api/ai.ts` | Demo prompt stubs | Expand into real agent endpoints or replace with backend |
| `api/phone.ts` | Phone reveal | Keep as-is (works) |
| `src/data/businesses.ts` | Static array of 8 businesses | Should be backed by a database |
| `src/context/AuthContext.tsx` | localStorage mock auth | Real auth (Clerk, Auth0, or custom) |
| `src/dashboard/*` | Mock data from localStorage | Wire to real API |
| `vercel.json` | SPA + 2 edge routes | Add agent routes (Solution 2) or remove (Solutions 1/3) |
| `package.json` | Single app | Workspace root (Solutions 1/3) |
| `render.yaml` | Does not exist | Must be created (all solutions) |
