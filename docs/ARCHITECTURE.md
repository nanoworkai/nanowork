# Nanowork Architecture

## Overview

Nanowork is structured as a monorepo with FastAPI as the primary entry point serving both the API and the React frontend.

## Directory Structure

```
nanowork-mvp/
├── apps/
│   ├── api/              # FastAPI Backend (PRIMARY ENTRY POINT)
│   │   ├── app/
│   │   │   ├── main.py   # FastAPI app + static file serving
│   │   │   ├── routers/  # API endpoints
│   │   │   └── ...
│   │   ├── static/       # Built React app (generated, gitignored)
│   │   ├── tests/        # pytest tests
│   │   └── Dockerfile
│   │
│   ├── web/              # React Frontend (Vite)
│   │   ├── src/
│   │   │   ├── lib/api.ts    # API client
│   │   │   ├── pages/
│   │   │   └── components/
│   │   └── dist/         # Build output (copied to api/static)
│   │
│   └── worker/           # Cloudflare Worker (Optional/Legacy)
│       └── src/
│
├── docker-compose.yml
├── package.json          # Root workspace
└── README.md
```

## Request Flow

### Development Mode

```
User → localhost:5173 (Vite) ──/api/*──> localhost:8000 (FastAPI)
                                         ↓
                                    API Response
```

**Ports:**
- Frontend dev server: `5173` (with HMR, proxy to backend)
- Backend API server: `8000` (auto-reload enabled)

**Commands:**
```bash
npm run dev           # Runs both frontend + backend
npm run dev:web       # Frontend only
npm run dev:api       # Backend only
```

### Production Mode

```
User → :8000 (FastAPI) → API routes (/api/*)
                       → Static files (/)
```

**Single Port:** `8000` serves everything

**Build & Deploy:**
```bash
npm run build         # Build web + copy to api/static
npm run start         # Start FastAPI server
```

## Technology Stack

### Backend (FastAPI)
- **Framework:** FastAPI 0.115+
- **Server:** Uvicorn with auto-reload
- **Database:** Supabase (PostgreSQL)
- **AI:** Anthropic Claude
- **Payments:** Stripe
- **Testing:** pytest

### Frontend (React)
- **Framework:** React 19
- **Build Tool:** Vite 6
- **Router:** React Router v7
- **Styling:** Tailwind CSS + CSS Modules
- **Type Safety:** TypeScript

### Infrastructure
- **Development:** Concurrent frontend + backend
- **Production:** Single FastAPI server
- **Deployment:** Docker, Railway, Render
- **Optional:** Cloudflare Worker (legacy)

## API Client

The frontend uses a type-safe API client (`apps/web/src/lib/api.ts`):

```typescript
import { apiClient } from './lib/api';

// Health check
const health = await apiClient.health();

// Create build
const build = await apiClient.createBuild("My business idea");

// Get analytics
const analytics = await apiClient.getAnalytics();
```

**Features:**
- Automatic token management
- Same-origin in production (no CORS)
- Type-safe responses
- Error handling

## Environment Configuration

### Backend (`apps/api/.env`)

```bash
ENVIRONMENT=development
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
ANTHROPIC_API_KEY=sk-ant-xxx
LINQ_STRIPE_SECRET_KEY=sk_test_xxx
LINQ_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### Frontend (`apps/web/.env`)

```bash
# Empty in production (same origin)
VITE_API_URL=

# Supabase config
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

# Stripe public key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

## Build Process

1. **Build Frontend:**
   ```bash
   npm run build:web
   # → Compiles TypeScript
   # → Bundles with Vite
   # → Outputs to apps/web/dist/
   ```

2. **Copy to API:**
   ```bash
   npm run build:copy
   # → Removes apps/api/static/
   # → Copies apps/web/dist/ to apps/api/static/
   ```

3. **Result:**
   ```
   apps/api/static/
   ├── index.html
   ├── assets/
   │   ├── index-[hash].js
   │   ├── index-[hash].css
   │   └── ...
   ├── favicon.ico
   └── logo.png
   ```

## Routing

### API Routes (FastAPI)

All API routes are prefixed with `/api`:

- `/api/build` - Build generation
- `/api/builds` - Build management
- `/api/payments` - Stripe integration
- `/api/customers` - Customer management
- `/api/analytics` - Analytics data
- `/api/webhooks` - Stripe webhooks

**Documentation:**
- Swagger UI: `/api/docs`
- ReDoc: `/api/redoc`
- OpenAPI JSON: `/api/openapi.json`

### Frontend Routes (React Router)

Client-side routing handled by React Router:

- `/` - Home page
- `/login` - Authentication
- `/dashboard` - Main dashboard
- `/revenue` - Revenue page
- `/swipe` - Swipe interface

FastAPI serves `index.html` for all non-API routes to enable SPA routing.

## Deployment

### Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app

# Install dependencies
COPY apps/api/requirements.txt .
RUN pip install -r requirements.txt

# Copy API + built frontend
COPY apps/api/app ./app
COPY apps/api/static ./static

# Run FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Railway / Render

1. Build frontend locally: `npm run build`
2. Deploy `apps/api` directory
3. Platform auto-detects Python
4. Set environment variables
5. Runs: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## Security

### Development
- CORS enabled for `localhost:5173`
- API requests proxied through Vite
- Separate ports for frontend/backend

### Production
- No CORS needed (same origin)
- Static files served with proper caching
- API routes require authentication
- Supabase Row Level Security (RLS)

## Testing

### Backend Tests
```bash
npm run test:api
# Or: cd apps/api && pytest
```

### Frontend Tests
```bash
# TODO: Add frontend tests
npm run test:web
```

## Performance

### Frontend
- Code splitting by route
- Manual chunks for vendors
- Asset optimization
- Lazy loading

### Backend
- Request logging to Supabase
- API response caching
- Static file caching headers
- Production-optimized builds

## Future Enhancements

- [ ] Add frontend tests (Vitest/Playwright)
- [ ] Server-side rendering (SSR) option
- [ ] API rate limiting
- [ ] Redis caching layer
- [ ] WebSocket support
- [ ] GraphQL endpoint
- [ ] CI/CD pipeline

## Troubleshooting

### Build fails
- Check TypeScript errors: `npm run build:web`
- Verify dependencies: `npm install`
- Clear cache: `rm -rf apps/web/dist node_modules/.vite`

### API not reachable
- Ensure FastAPI is running: `npm run dev:api`
- Check proxy config: `apps/web/vite.config.ts`
- Verify CORS settings: `apps/api/app/main.py`

### Static files 404
- Run build: `npm run build`
- Check static dir exists: `ls apps/api/static`
- Verify FastAPI serves static: check `main.py`

## Contributing

1. Create feature branch
2. Make changes
3. Run tests: `npm run test:api`
4. Format code: `npm run format:api`
5. Build: `npm run build`
6. Submit PR

---

**Last Updated:** 2026-05-10
**Version:** 0.1.0
