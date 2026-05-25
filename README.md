# Nanowork MVP

AI-powered company builder with autonomous agents. One prompt to launch your business.

## Architecture

```
┌─────────────────────────────────────────────┐
│              Render.com                     │
│  ┌───────────────────────────────────────┐  │
│  │   Backend API (Express/Node)          │  │
│  │   nanowork-backend.onrender.com       │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│              Render.com                     │
│  ┌───────────────────────────────────────┐  │
│  │   Frontend (React/Vite)               │  │
│  │   nanowork-frontend.onrender.com      │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

**Key Features:**
- Separate frontend and backend deployments on Render
- Backend: Express/Node API
- Frontend: React SPA (built with Bun, styled with Tailwind CSS)
- Supabase for authentication & database
- Stripe for payments
- Anthropic Claude for AI features

## Quick Start

### Prerequisites

- **Node.js 18+**
- **npm**

### Installation

```bash
# 1. Clone and navigate
cd nanowork-web

# 2. Install dependencies
npm install

# 3. Configure backend environment
cp backend/.env.example backend/.env
# Edit with your credentials

# 4. Configure frontend environment
cp apps/web/.env.example apps/web/.env
# Edit with your credentials

# 5. Run development
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd apps/web && npm run dev
```

This starts:
- **Backend API:** http://localhost:3000
- **Frontend:** http://localhost:5173 (Vite with HMR)

Visit http://localhost:5173 to see the app.

## Development Workflow

```bash
# Backend development
cd backend
npm run dev          # Start backend API (port 3000)
npm run build        # Build backend
npm start            # Start production backend

# Frontend development
cd apps/web
npm run dev          # Start frontend dev server (port 5173)
npm run build        # Build frontend for production
npm run verify-build # Build and verify CSS processing
npm start            # Serve production build
```

## Project Structure

```
nanowork-web/
├── apps/
│   └── web/                 # React frontend
│       ├── src/
│       │   ├── lib/
│       │   │   ├── api.ts   # API client
│       │   │   └── supabase.ts
│       │   ├── pages/       # Route pages
│       │   ├── components/  # Reusable components
│       │   ├── index.css    # Tailwind CSS (processed via CLI)
│       │   └── App.tsx
│       ├── build.ts         # Production build script (Bun)
│       ├── dev-server.ts    # Dev server with Tailwind processing
│       ├── BUILD.md         # Build system documentation
│       ├── render.yaml      # Frontend deployment config
│       └── package.json
│
├── backend/                 # Express/Node API
│   ├── src/
│   │   ├── index.ts         # Entry point
│   │   ├── routes/          # API routes
│   │   └── lib/             # Utilities
│   ├── render.yaml          # Backend deployment config
│   └── package.json
│
└── package.json             # Root workspace
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

### Frontend (`apps/web/.env`)

```bash
# API URL (backend URL)
VITE_API_URL=http://localhost:3000

# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

# Site
VITE_SITE_URL=http://localhost:5173
```

## API Documentation

Once running:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health

## Deployment

### Render.com Deployment

This project deploys frontend and backend as separate services on Render.

#### 1. Deploy Backend

1. Create a new **Web Service** on Render
2. Connect your repository
3. Use these settings:
   - **Name:** `nanowork-backend`
   - **Root Directory:** `backend`
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm start`
   - **Branch:** `main`
4. Set environment variables in Render dashboard (see backend/.env.example)
5. Deploy!

Alternatively, Render can auto-detect `backend/render.yaml` if you point to that directory.

#### 2. Deploy Frontend

1. Create a new **Web Service** on Render
2. Connect your repository
3. Use these settings:
   - **Name:** `nanowork-frontend`
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm start`
   - **Branch:** `main`
4. Set environment variables:
   - `VITE_API_URL` = Your backend URL (e.g., `https://nanowork-backend.onrender.com`)
   - Other env vars from apps/web/.env.example
5. Deploy!

Alternatively, Render can auto-detect `apps/web/render.yaml` if you point to that directory.

## Development vs Production

### Development
- Frontend: `localhost:5173` (Vite dev server)
- Backend: `localhost:3000` (Express)
- Frontend configured to call `http://localhost:3000`

### Production
- Frontend: Render (nanowork-frontend.onrender.com)
- Backend: Render (nanowork-backend.onrender.com)
- Frontend configured with `VITE_API_URL=https://nanowork-backend.onrender.com`

## Troubleshooting

### Frontend can't reach API
- Ensure backend is running on port 3000
- Check `VITE_API_URL` is set correctly in apps/web/.env
- Verify CORS settings in `backend/src/index.ts`
- Check that frontend URL is in backend's allowed origins

### Backend errors
- Check `backend/.env` file exists and has correct values
- Ensure all required environment variables are set
- Check backend logs for detailed errors
- Verify Supabase credentials are correct

### CORS issues in production
- Backend's `FRONTEND_URL` env var must match your frontend URL
- Frontend's `VITE_API_URL` must match your backend URL
- Check Render environment variables are set correctly

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally: `npm run dev`
4. Submit a pull request

## License

Proprietary - All rights reserved
