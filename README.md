# Nanowork MVP

![CI](https://github.com/yourusername/nanowork-web/workflows/CI/badge.svg)
![Deploy Check](https://github.com/yourusername/nanowork-web/workflows/Deploy%20Check/badge.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)

AI-powered company builder with autonomous agents. One prompt to launch your business.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Workers                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   API Workers (Hono)                                  │  │
│  │   nanowork-api.workers.dev / api.nanowork.ai          │  │
│  │   - Authentication & Agent Orchestration              │  │
│  │   - Stripe Webhooks & Payment Processing              │  │
│  │   - Claude API Integration                            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Render.com                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   Frontend (React/Vite + Bun)                         │  │
│  │   nanowork-web.onrender.com                           │  │
│  │   - Modern React 19 with Tailwind CSS                 │  │
│  │   - Framer Motion animations                          │  │
│  │   - Responsive design system                          │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   Agent Platform Backend (Express/Node + WebSockets)  │  │
│  │   nanowork-api.onrender.com                           │  │
│  │   - Real-time agent execution & streaming             │  │
│  │   - WebSocket connections for live updates            │  │
│  │   - Anthropic Claude integration                      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase                                │
│  - PostgreSQL Database                                       │
│  - Authentication (Magic Link, OAuth)                        │
│  - Row Level Security (RLS)                                  │
│  - Real-time subscriptions                                   │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  - Stripe (Payments & Subscriptions)                         │
│  - Anthropic Claude 4.X (AI Agent Platform)                  │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**

- **Hybrid Architecture:** Cloudflare Workers for API edge compute + Render for frontend & agent backend
- **Frontend:** React 19 SPA with Bun build system, Tailwind CSS, Framer Motion
- **API Layer:** Cloudflare Workers (Hono framework) for low-latency API routes
- **Agent Backend:** Express/Node with WebSocket support for real-time agent streaming
- **Database:** Supabase (PostgreSQL with RLS)
- **Payments:** Stripe with webhook handling
- **AI:** Anthropic Claude 4.X (Opus, Sonnet, Haiku)
- **New Pages:** About, Contact, Security, Privacy, Terms

## Quick Start

### Prerequisites

- **Node.js 18+** (for backend and Cloudflare Workers)
- **Bun 1.0+** (for frontend development)
- **npm** or **bun** package manager
- **Cloudflare account** (for Workers deployment)
- **Render account** (for frontend/backend deployment)
- **Supabase project** (for database and auth)

### Installation

```bash
# 1. Clone and navigate
cd nanowork-web

# 2. Install dependencies
npm install                    # Root workspace
cd apps/web && npm install     # Frontend
cd ../worker && npm install    # Cloudflare Workers
cd ../../backend && npm install # Agent Backend

# 3. Configure Cloudflare Worker
cd apps/worker
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your credentials

# 4. Configure Frontend
cd ../web
cp .env.example .env
# Edit .env with your credentials

# 5. Configure Agent Backend
cd ../../backend
cp .env.example .env
# Edit .env with your credentials

# 6. Run development (from root)
npm run dev
# This starts web + worker concurrently

# Or run services individually:
# Terminal 1 - Frontend
cd apps/web && bun run dev

# Terminal 2 - Cloudflare Worker
cd apps/worker && npm run dev

# Terminal 3 - Agent Backend (optional, for agent features)
cd backend && npm run dev
```

This starts:

- **Frontend:** http://localhost:3000 (Bun dev server with HMR)
- **Worker API:** http://localhost:8787 (Cloudflare Workers local)
- **Agent Backend:** http://localhost:3000 (Express + WebSockets)

Visit http://localhost:3000 to see the app.

## Development Workflow

```bash
# Frontend development (apps/web)
cd apps/web
bun run dev          # Start dev server with hot reload (port 3000)
bun run build        # Production build with Bun + Tailwind
bun run typecheck    # TypeScript validation
bun run start        # Serve production build

# Cloudflare Workers API (apps/worker)
cd apps/worker
npm run dev          # Start Wrangler dev server
npm run build        # Validate build (dry-run)
npm run deploy       # Deploy to Cloudflare
npm run typecheck    # TypeScript validation

# Agent Platform Backend (backend)
cd backend
npm run dev          # Start Express + WebSocket server (port 3000)
npm run build        # Build TypeScript
npm start            # Start production server
npm run typecheck    # TypeScript validation

# Root workspace commands
npm run dev          # Start web + worker concurrently
npm run typecheck    # Check all TypeScript
npm run validate     # Run typecheck + lint
```

## Project Structure

```
nanowork-web/
├── apps/
│   ├── web/                     # React frontend
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── api.ts       # API client
│   │   │   │   └── supabase.ts
│   │   │   ├── pages/           # Route pages
│   │   │   │   ├── Home.tsx
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Pricing.tsx
│   │   │   │   ├── About.tsx    # NEW
│   │   │   │   ├── Contact.tsx  # NEW
│   │   │   │   ├── Security.tsx # NEW
│   │   │   │   ├── Privacy.tsx  # NEW
│   │   │   │   └── Terms.tsx    # NEW
│   │   │   ├── components/      # Reusable components
│   │   │   ├── index.css        # Tailwind CSS
│   │   │   └── App.tsx
│   │   ├── build.ts             # Production build script (Bun)
│   │   ├── dev-server.ts        # Dev server with Tailwind
│   │   ├── BUILD.md             # Build documentation
│   │   ├── render.yaml          # Frontend deployment
│   │   └── package.json
│   │
│   └── worker/                  # Cloudflare Workers API
│       ├── src/
│       │   ├── index.ts         # Hono API routes
│       │   ├── routes/          # API endpoints
│       │   └── lib/             # Utilities
│       ├── wrangler.toml        # Cloudflare config
│       └── package.json
│
├── backend/                     # Agent Platform Backend
│   ├── src/
│   │   ├── index.ts             # Express + WebSocket server
│   │   ├── routes/              # Agent execution routes
│   │   ├── agents/              # Agent definitions
│   │   └── lib/                 # Utilities
│   ├── render.yaml              # Backend deployment
│   └── package.json
│
├── render.yaml                  # Render Blueprint (multi-service)
└── package.json                 # Root workspace
```

## Environment Variables

### Backend (`backend/.env`)

```bash
NODE_ENV=development
PORT=3000

# Database & Auth
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
SUPABASE_ANON_KEY=xxx

# AI
ANTHROPIC_API_KEY=sk-ant-xxx

# Payments
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Other
INTERNAL_TOKEN=xxx
FRONTEND_URL=http://localhost:5173
```

### Cloudflare Worker (`apps/worker/.env` - local dev only)

```bash
# Set via wrangler secret in production
ANTHROPIC_API_KEY=sk-ant-xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Frontend (`apps/web/.env`)

```bash
# API URL (Cloudflare Worker in prod, local worker in dev)
VITE_API_URL=http://localhost:8787

# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

# Stripe (optional for frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Site
VITE_SITE_URL=http://localhost:3000
```

## Local Development URLs

Once running:

- **Frontend:** http://localhost:3000 (Bun dev server)
- **Cloudflare Worker API:** http://localhost:8787 (Wrangler dev)
- **Agent Backend:** http://localhost:3000 (Express + WebSockets)
- **Health Check:** http://localhost:3000/health (Agent backend)

## Deployment

### Multi-Service Deployment Strategy

This project uses a **hybrid deployment model** for optimal performance and cost:

1. **Cloudflare Workers** - API layer (low-latency, edge compute)
2. **Render.com** - Frontend (static site) + Agent Backend (Node.js with WebSockets)

#### 1. Deploy Cloudflare Workers API

```bash
cd apps/worker

# Set secrets (one-time setup)
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET

# Deploy
npm run deploy
```

**Production URL:** `https://nanowork-api.workers.dev` or `https://api.nanowork.ai` (custom domain)

#### 2. Deploy via Render Blueprint

This project uses a Render Blueprint (`render.yaml`) to deploy both frontend and backend together:

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Blueprint**
3. Connect your GitHub repository
4. Render will detect `render.yaml` and create:
   - **nanowork-web** - Static site (frontend)
   - **nanowork-api** - Web service (agent backend)
5. Set required environment variables in Render dashboard
6. Deploy!

**Alternatively, deploy services individually:**

**Frontend:**

```bash
cd apps/web
# Render will run: npm install && npm run build
# Start: serve -s dist -l 3000
```

**Agent Backend:**

```bash
cd backend
# Render will run: npm install && npm run build
# Start: node dist/index.js
```

## Development vs Production

### Development

- **Frontend:** `localhost:3000` (Bun dev server)
- **Worker API:** `localhost:8787` (Wrangler dev)
- **Agent Backend:** `localhost:3000` (Express + WebSockets)
- Frontend calls Worker API at `localhost:8787`

### Production

- **Frontend:** `https://nanowork-web.onrender.com` (Render static site)
- **Worker API:** `https://nanowork-api.workers.dev` (Cloudflare Workers)
- **Agent Backend:** `https://nanowork-api.onrender.com` (Render web service)
- Frontend configured with `VITE_API_URL=https://nanowork-api.workers.dev`

## Troubleshooting

### Frontend can't reach Worker API

- Ensure Wrangler dev server is running on port 8787
- Check `VITE_API_URL` is set correctly in apps/web/.env
- Verify CORS settings in `apps/worker/src/index.ts`
- Check that frontend URL is in worker's allowed origins

### Cloudflare Worker errors

- Check secrets are set: `npx wrangler secret list`
- Verify `wrangler.toml` configuration
- Check Cloudflare dashboard for error logs
- Ensure compatibility flags are correct

### Agent Backend WebSocket issues

- Verify backend is running and accessible
- Check WebSocket connection URL in frontend
- Ensure CORS and WebSocket upgrade headers are configured
- Monitor backend logs for connection errors

### Deployment issues

- **Render Blueprint:** Ensure `render.yaml` is at repository root
- **Environment variables:** Verify all secrets are set in Render dashboard
- **Build failures:** Check build logs for missing dependencies
- **CORS in production:** Worker must allow frontend origin, Agent Backend must allow frontend origin

## CI/CD Pipeline

We have comprehensive GitHub Actions workflows to catch issues before production:

- ✅ **Automatic TypeScript checking** on all PRs
- ✅ **Build validation** for web, worker, and backend
- ✅ **Dependency vulnerability scanning**
- ✅ **Code quality checks** (console.log, debugger, etc.)
- ✅ **Bundle size monitoring**

**Before pushing:**

```bash
# Run these locally to catch issues early
bun run typecheck           # Check all TypeScript
cd apps/web && bun run build  # Test production build
```

📚 **Full CI/CD Documentation:** [.github/CI_CD_GUIDE.md](.github/CI_CD_GUIDE.md)

## TODO List

### 🔴 Critical - Backend & Infrastructure

- [ ] **Agent Harness Integration**
  - [ ] Design and implement agent workflow orchestration system
  - [ ] Create agent state management (queued, running, completed, failed)
  - [ ] Build agent execution pipeline with retry logic
  - [ ] Implement agent result streaming via WebSockets
  - [ ] Add agent logging and telemetry

- [ ] **Backend API Completion**
  - [ ] Complete WebSocket implementation for real-time agent updates
  - [ ] Implement agent execution endpoints (`POST /api/agents/execute`)
  - [ ] Add agent status polling endpoints (`GET /api/agents/:id/status`)
  - [ ] Build agent result retrieval (`GET /api/agents/:id/results`)
  - [ ] Implement agent cancellation (`DELETE /api/agents/:id`)
  - [ ] Add rate limiting and quota management per user/plan

- [ ] **Database Schema & Migrations**
  - [ ] Complete `agents` table schema (agent definitions, metadata)
  - [ ] Create `agent_executions` table (execution history, status, results)
  - [ ] Add `user_quotas` table (usage tracking per plan)
  - [ ] Implement `agent_templates` table (pre-built agent templates)
  - [ ] Set up Row Level Security (RLS) policies for all tables
  - [ ] Create database indexes for performance
  - [ ] Write and test migration scripts

- [ ] **Authentication & Authorization**
  - [ ] Implement JWT validation in Cloudflare Workers
  - [ ] Add role-based access control (RBAC) for agents
  - [ ] Create API key management system for programmatic access
  - [ ] Implement session management and refresh token logic
  - [ ] Add OAuth providers (Google, GitHub) via Supabase

### 🟡 High Priority - Features

- [ ] **Agent Platform Features**
  - [ ] Build agent marketplace (browse, search, filter templates)
  - [ ] Create agent builder UI (drag-and-drop or form-based)
  - [ ] Implement agent versioning system
  - [ ] Add agent sharing and publishing capabilities
  - [ ] Build agent analytics dashboard (usage stats, success rates)

- [ ] **Payment & Billing**
  - [ ] Complete Stripe subscription integration
  - [ ] Implement usage-based billing (per agent execution)
  - [ ] Add billing dashboard (invoices, payment methods)
  - [ ] Create plan upgrade/downgrade flow
  - [ ] Implement usage alerts and quota warnings
  - [ ] Add webhook handlers for Stripe events

- [ ] **User Dashboard**
  - [ ] Build agent execution history page
  - [ ] Create real-time agent execution monitoring
  - [ ] Add agent result visualization
  - [ ] Implement saved agents library
  - [ ] Build usage analytics page
  - [ ] Add team collaboration features

### 🟢 Medium Priority - Polish & UX

- [ ] **Frontend Enhancements**
  - [ ] Add loading states and skeleton screens
  - [ ] Implement error boundaries and fallback UI
  - [ ] Create toast notification system (using Sonner)
  - [ ] Add keyboard shortcuts for power users
  - [ ] Implement dark mode toggle
  - [ ] Add accessibility improvements (ARIA labels, focus management)

- [ ] **Content Pages**
  - [ ] Complete About page with team info and mission
  - [ ] Finalize Contact page with form backend integration
  - [ ] Add Security page details (SOC2, encryption, data handling)
  - [ ] Expand Privacy Policy with data collection details
  - [ ] Update Terms of Service with usage limits and policies

- [ ] **Performance Optimization**
  - [ ] Implement code splitting and lazy loading
  - [ ] Add React Query for API caching
  - [ ] Optimize bundle size (tree shaking, compression)
  - [ ] Implement service worker for offline support
  - [ ] Add performance monitoring (Web Vitals)

### 🔵 Low Priority - Nice to Have

- [ ] **DevOps & Monitoring**
  - [ ] Set up Sentry for error tracking
  - [ ] Add application performance monitoring (APM)
  - [ ] Implement structured logging with log aggregation
  - [ ] Create health check endpoints for all services
  - [ ] Add automated backup system for database

- [ ] **Testing**
  - [ ] Write unit tests for critical business logic
  - [ ] Add integration tests for API endpoints
  - [ ] Create E2E tests for user flows (Playwright)
  - [ ] Implement visual regression tests
  - [ ] Add load testing for agent execution pipeline

- [ ] **Documentation**
  - [ ] Create API documentation (OpenAPI/Swagger)
  - [ ] Write agent development guide
  - [ ] Add architecture decision records (ADRs)
  - [ ] Create deployment runbook
  - [ ] Write contributing guidelines

- [ ] **Additional Features**
  - [ ] Multi-language support (i18n)
  - [ ] Agent scheduling (cron-like execution)
  - [ ] Email notifications for agent completions
  - [ ] Export agent results (CSV, JSON, PDF)
  - [ ] Agent collaboration (share agents between users)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally: `npm run dev` and `bun run typecheck`
4. Submit a pull request (CI will automatically run)
5. Address any CI failures before merge

## License

Proprietary - All rights reserved
