# Nanowork FastAPI Backend

Enterprise-grade FastAPI backend for Nanowork AI platform.

## Features

- 🔐 Supabase authentication integration
- 💳 Stripe payments integration
- 🤖 Anthropic Claude AI integration
- 📊 Request logging and analytics
- 🔒 CORS and security middleware
- 🚀 Production-ready deployment
- 📦 Serves React frontend as static files

## Setup

### 1. Create virtual environment

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
# Or for development with optional dependencies:
pip install -e ".[dev]"
```

### 3. Configure environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

### 4. Run development server

From the project root:
```bash
npm run dev:api
```

Or directly:
```bash
cd apps/api
PYTHONPATH=. uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Project Structure

```
apps/api/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI app & middleware
│   ├── config.py         # Settings & environment
│   ├── deps.py           # Shared dependencies
│   ├── auth.py           # Authentication logic
│   └── routers/          # API endpoints
│       ├── ai_route.py
│       ├── analytics.py
│       ├── build.py
│       ├── builds.py
│       ├── customers.py
│       ├── keys.py
│       ├── payments.py
│       ├── phone.py
│       ├── tenant.py
│       └── webhooks.py
├── static/               # Built React app (gitignored)
├── tests/                # Test files
├── .env.example          # Environment template
├── pyproject.toml        # Python project config
├── requirements.txt      # Python dependencies
└── README.md
```

## API Documentation

Once running, visit:
- Application: http://127.0.0.1:8000
- Swagger UI: http://127.0.0.1:8000/api/docs
- ReDoc: http://127.0.0.1:8000/api/redoc
- Health Check: http://127.0.0.1:8000/health

## Development

### Run tests
```bash
npm run test:api
# Or directly:
cd apps/api && pytest
```

### Lint code
```bash
npm run lint:api
# Or directly:
cd apps/api && ruff check app
```

### Format code
```bash
npm run format:api
# Or directly:
cd apps/api && ruff format app
```

## Deployment

### Building the frontend

The FastAPI server serves the React frontend as static files. Build the frontend first:

```bash
npm run build
```

This will:
1. Build the React app (`apps/web/dist`)
2. Copy it to `apps/api/static/`

### Railway / Render

Deploy the `apps/api` directory:

1. Set environment variables in your platform
2. The platform will detect Python and run: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Docker

```bash
docker build -t nanowork-api -f apps/api/Dockerfile .
docker run -p 8000:8000 -e SUPABASE_URL=... nanowork-api
```

### Environment Variables

Required:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `LINQ_STRIPE_SECRET_KEY`
- `LINQ_STRIPE_PUBLISHABLE_KEY`

Optional:
- `ENVIRONMENT` (default: "development")
- `CORS_ORIGINS` (comma-separated list)

## Architecture

```
┌─────────────────────────────────────┐
│      FastAPI (Port 8000)            │
│  ┌───────────────────────────────┐  │
│  │   API Routes (/api/*)         │  │
│  ├───────────────────────────────┤  │
│  │   React SPA (static files)    │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

In development:
- Frontend dev server: `localhost:5173` (proxies `/api` to `:8000`)
- Backend API server: `localhost:8000`

In production:
- Single server: `localhost:8000` (serves both API and frontend)
