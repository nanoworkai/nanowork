# Nanowork MVP

AI-powered company builder with autonomous agents. One prompt to launch your business.

## Architecture

```
┌─────────────────────────────────────────────┐
│          Cloudflare Workers                 │
│  ┌───────────────────────────────────────┐  │
│  │   API (Hono) - api.nanowork.app       │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│         Cloudflare Pages                    │
│  ┌───────────────────────────────────────┐  │
│  │   React SPA - nanowork.ai             │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

**Key Features:**
- Full TypeScript monorepo
- Hono API on Cloudflare Workers
- React (Vite) on Cloudflare Pages
- Supabase for authentication & database
- Stripe for payments
- Anthropic Claude for AI features

## Quick Start

### Prerequisites

- **Node.js 18+**
- **npm**
- **Wrangler CLI** (`npm install -g wrangler`)

### Installation

```bash
# 1. Clone and navigate
cd nanowork-mvp

# 2. Install dependencies
npm install

# 3. Configure environment
cp apps/web/.env.example apps/web/.env
cp apps/worker/.dev.vars.example apps/worker/.dev.vars
# Edit with your credentials

# 4. Run development
npm run dev
```

This starts:
- **Frontend:** http://localhost:5173 (Vite with HMR)
- **Worker API:** http://localhost:8787 (proxied through Vite)

Visit http://localhost:5173 to see the app.

## Development Workflow

```bash
# Start both frontend and worker
npm run dev

# Start individually
npm run dev:web     # Frontend only (port 5173)
npm run dev:worker  # Worker only (port 8787)

# Build
npm run build       # Build web app

# Deploy
npm run deploy      # Deploy both worker and web
```

## Project Structure

```
nanowork-mvp/
├── apps/
│   ├── web/                 # React frontend
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── api.ts   # API client
│   │   │   │   └── supabase.ts
│   │   │   ├── pages/       # Route pages
│   │   │   ├── components/  # Reusable components
│   │   │   └── App.tsx
│   │   ├── vite.config.ts   # Proxy to :8787 in dev
│   │   └── package.json
│   │
│   └── worker/              # Cloudflare Worker (Hono API)
│       ├── src/
│       │   ├── index.ts     # Entry point
│       │   ├── routes/      # API routes
│       │   ├── lib/         # Utilities
│       │   └── middleware/  # Middleware
│       ├── wrangler.toml
│       └── package.json
│
└── package.json             # Root workspace
```

## Environment Variables

### Worker (`apps/worker/.dev.vars` for local, Cloudflare dashboard for production)

```bash
ENVIRONMENT=development

# Database & Auth
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# AI
ANTHROPIC_API_KEY=sk-ant-xxx

# Payments
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Frontend (`apps/web/.env`)

```bash
# API URL (empty in dev = uses Vite proxy)
VITE_API_URL=

# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

## API Documentation

Once running:
- **Application:** http://localhost:5173
- **Worker API:** http://localhost:8787
- **Health Check:** http://localhost:8787/health

## Deployment

### Production Setup

1. **Deploy Worker (API):**
   ```bash
   cd apps/worker
   npx wrangler deploy
   ```
   - Configure secrets: `wrangler secret put ANTHROPIC_API_KEY`
   - Set environment variables in Cloudflare dashboard

2. **Deploy Web (Frontend):**
   ```bash
   cd apps/web
   npm run build
   npx wrangler pages deploy dist
   ```

3. **Configure DNS:**
   - Worker: `api.nanowork.app`
   - Pages: `nanowork.ai`

Or use the root command:
```bash
npm run deploy
```

## Development vs Production

### Development
- Frontend: `localhost:5173` (Vite with HMR)
- Worker: `localhost:8787` (Wrangler dev)
- Vite proxies `/api` and `/health` to worker

### Production
- Frontend: Cloudflare Pages (nanowork.ai)
- Worker: Cloudflare Workers (api.nanowork.app)
- Set `VITE_API_URL=https://api.nanowork.app` in production

## Troubleshooting

### Frontend can't reach API
- Ensure worker is running on port 8787
- Check Vite proxy config in `apps/web/vite.config.ts`
- Verify CORS settings in `apps/worker/src/index.ts`

### Worker errors
- Check `.dev.vars` file exists and has correct values
- Ensure all required environment variables are set
- Check `wrangler dev` logs for detailed errors

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally: `npm run dev`
4. Submit a pull request

## License

Proprietary - All rights reserved
