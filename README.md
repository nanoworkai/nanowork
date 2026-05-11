# Nanowork MVP

AI-powered company builder with autonomous agents. One prompt to launch your business.

## Architecture

```
┌─────────────────────────────────────┐
│         FastAPI (Port 8000)         │
│  ┌───────────────────────────────┐  │
│  │     API Endpoints (/api/*)    │  │
│  ├───────────────────────────────┤  │
│  │   React SPA (Static Files)    │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Key Features:**
- FastAPI serves both API and frontend (single deployment target)
- React (Vite) for modern, fast UI development
- Supabase for authentication & database
- Stripe for payments
- Anthropic Claude for AI features

## Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **npm** or **pnpm**

### Installation

```bash
# 1. Clone and navigate
cd nanowork-mvp

# 2. Install frontend dependencies
npm install

# 3. Setup Python environment
cd apps/api
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd ../..

# 4. Configure environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Edit .env files with your credentials

# 5. Run development servers
npm run dev
```

This starts:
- **Frontend dev server:** http://localhost:5173 (with API proxy)
- **Backend API server:** http://localhost:8000

Visit http://localhost:5173 to see the app.

## Development Workflow

```bash
# Start both frontend and backend
npm run dev

# Start individually
npm run dev:web     # Frontend only (port 5173)
npm run dev:api     # Backend only (port 8000)

# Build for production
npm run build       # Builds web and copies to api/static

# Preview production build
npm run preview     # Runs FastAPI serving built frontend

# Testing
npm run test:api    # Run API tests

# Code quality
npm run lint:api    # Lint Python code
npm run format:api  # Format Python code
```

## Project Structure

```
nanowork-mvp/
├── apps/
│   ├── api/                 # FastAPI backend
│   │   ├── app/
│   │   │   ├── main.py      # Entry point (serves API + static)
│   │   │   ├── config.py    # Settings & environment
│   │   │   ├── deps.py      # Shared dependencies
│   │   │   ├── auth.py      # Authentication
│   │   │   └── routers/     # API endpoints
│   │   ├── static/          # Built React app (gitignored)
│   │   ├── tests/           # API tests
│   │   ├── requirements.txt
│   │   ├── pyproject.toml
│   │   ├── Dockerfile
│   │   └── README.md
│   │
│   ├── web/                 # React frontend
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── api.ts   # Type-safe API client
│   │   │   │   └── supabase.ts
│   │   │   ├── pages/       # Route pages
│   │   │   ├── components/  # Reusable components
│   │   │   ├── context/     # React context
│   │   │   └── App.tsx
│   │   ├── vite.config.ts   # Proxy to :8000 in dev
│   │   ├── package.json
│   │   └── .env.example
│   │
│   └── worker/              # Cloudflare Worker (optional)
│       └── src/
│
├── docker-compose.yml       # Local Docker setup
├── package.json             # Root workspace config
└── README.md
```

## Environment Variables

### Backend (`apps/api/.env`)

```bash
ENVIRONMENT=development

# Database & Auth
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# AI
ANTHROPIC_API_KEY=sk-ant-xxx

# Payments
LINQ_STRIPE_SECRET_KEY=sk_test_xxx
LINQ_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### Frontend (`apps/web/.env`)

```bash
# API URL (empty = same origin in production)
VITE_API_URL=

# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

## API Documentation

Once running, visit:
- **Application:** http://localhost:8000
- **API Docs (Swagger):** http://localhost:8000/api/docs
- **API Docs (ReDoc):** http://localhost:8000/api/redoc
- **Health Check:** http://localhost:8000/health

## Testing

```bash
# Run API tests
npm run test:api

# Or directly with pytest
cd apps/api
pytest
```

## Deployment

### Option 1: Railway / Render

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Deploy the `apps/api` directory**
   - Railway/Render will auto-detect Python
   - Set environment variables in the platform
   - Deploy command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Option 2: Docker

```bash
# Build
docker build -t nanowork-api -f apps/api/Dockerfile .

# Run
docker run -p 8000:8000 \
  -e SUPABASE_URL=... \
  -e SUPABASE_SERVICE_ROLE_KEY=... \
  -e ANTHROPIC_API_KEY=... \
  nanowork-api
```

### Option 3: Docker Compose

```bash
# Development
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Development vs Production

### Development
- Frontend: `localhost:5173` (Vite dev server with HMR)
- Backend: `localhost:8000` (FastAPI with auto-reload)
- Vite proxies `/api` requests to backend
- CORS enabled for cross-origin requests

### Production
- Single server: `localhost:8000`
- FastAPI serves built React app as static files
- All requests to same origin (no CORS needed)
- Client-side routing handled by SPA fallback

## Key Files

| File | Purpose |
|------|---------|
| `apps/api/app/main.py` | FastAPI app, API routes, static file serving |
| `apps/web/src/lib/api.ts` | Type-safe API client for frontend |
| `apps/web/vite.config.ts` | Development proxy configuration |
| `package.json` | Root workspace scripts |
| `docker-compose.yml` | Local Docker development setup |

## Troubleshooting

### Frontend can't reach API
- Ensure FastAPI is running on port 8000
- Check Vite proxy config in `apps/web/vite.config.ts`
- Verify CORS settings in `apps/api/app/main.py`

### Static files not found in production
- Run `npm run build` to build and copy frontend
- Check that `apps/api/static/` directory exists
- Verify FastAPI is serving static files (check main.py)

### Python dependencies not found
- Activate virtual environment: `source apps/api/.venv/bin/activate`
- Install dependencies: `pip install -r apps/api/requirements.txt`

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm run test:api`
4. Format code: `npm run format:api`
5. Submit a pull request

## License

Proprietary - All rights reserved
