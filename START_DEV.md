# Starting Development Environment

## Quick Start

Open **3 terminal windows** and run these commands:

### Terminal 1: Backend Server
```bash
cd /Users/jordan/Dev/nanowork-web/backend
npm run dev
```
Expected output:
```
✅ Server running on port 8000
   Health check: http://localhost:8000/health
   Environment: development
```

### Terminal 2: Frontend Dev Server
```bash
cd /Users/jordan/Dev/nanowork-web/apps/web
npm run dev
```
Expected output:
```
  VITE v6.0.3  ready in 450 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Terminal 3: (Optional) Watch Logs
```bash
# Test backend is up
curl http://localhost:8000/health

# Test frontend proxying works
curl http://localhost:5173/health
```

## Troubleshooting

### Backend won't start
```bash
# Kill existing process
pkill -f "tsx watch"

# Check if port is in use
lsof -i :8000

# Restart backend
cd backend && npm run dev
```

### Frontend proxy errors
This error means backend isn't running:
```
[vite] http proxy error: /health
AggregateError [ECONNREFUSED]
```

**Fix:** Start the backend server (Terminal 1 above)

### Port mismatch
- Backend runs on **port 8000** (set in `backend/.env`)
- Frontend runs on **port 5173** (Vite default)
- Frontend proxies `/api`, `/health`, `/webhooks`, `/internal` to backend

Vite config expects backend on `localhost:8000` - don't change the PORT in `.env`

## Architecture (Development)

```
Browser → http://localhost:5173 (Vite dev server)
                ↓
         Frontend React app
                ↓
         /api/* requests
                ↓
         Vite proxy
                ↓
         http://localhost:8000 (Express backend)
```

Frontend and backend are separate processes in development but will be deployed as separate services on Render.
