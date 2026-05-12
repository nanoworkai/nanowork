# Fixing Render Deployment Issue

## Current Problem

The deployment is failing with this error:
```bash
bash: -c: line 1: unexpected EOF while looking for matching `"'
```

This indicates a **syntax error in the start command** with mismatched quotes: `"${PORT:-8000}'`

## Root Cause

The error shows the command is trying to run:
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}'
```

This is the **old Python/FastAPI configuration**, but the repository has been updated to use **Node.js/Express**.

## Solution: Reconfigure Render Service

### Option 1: Update Existing Service (Recommended)

1. **Go to your Render dashboard**
2. **Find the service** (likely named `nanowork-mvp` or similar)
3. **Go to Settings**
4. **Update these fields:**

   - **Root Directory:** `backend`
   - **Runtime:** Change from `Python` to `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   
5. **Environment Variables** - Remove Python-specific vars and add:
   ```bash
   NODE_ENV=production
   PORT=3000
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbG...
   SUPABASE_ANON_KEY=eyJhbG...
   INTERNAL_TOKEN=your-secure-token
   FRONTEND_URL=https://nanowork.app
   ```

6. **Remove old variables:**
   - `PYTHONPATH`
   - `ENVIRONMENT`
   - `SUPABASE_SERVICE_ROLE_KEY` (rename to `SUPABASE_SERVICE_KEY`)
   - `LINQ_STRIPE_SECRET_KEY` (rename to `STRIPE_SECRET_KEY`)
   - `LINQ_STRIPE_PUBLISHABLE_KEY` (not needed in backend)

7. **Save and Deploy**

### Option 2: Delete and Recreate Service (Clean Slate)

If the settings are too broken:

1. **Delete the existing service** in Render dashboard
2. **Create new Web Service:**
   - Connect GitHub repo
   - Select `nanowork-mvp` repository
   - **Name:** `nanowork-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Branch:** `main`
   
3. **Add environment variables** (see Option 1, step 5)
4. **Create Web Service**

### Option 3: Use Blueprint (render.yaml)

The repository now has updated `render.yaml` files:

**From Project Root:**
```yaml
# /render.yaml
services:
  - type: web
    name: nanowork-backend
    runtime: node
    region: oregon
    plan: free
    branch: main
    rootDir: backend
    buildCommand: npm install && npm run build
    startCommand: npm start
```

**From Backend Folder:**
```yaml
# /backend/render.yaml
services:
  - type: web
    name: agent-platform-backend
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm start
```

To use:
1. Delete existing service
2. Create new service
3. Select "New" → "Blueprint"
4. Choose your repository
5. Render will detect the `render.yaml` and configure automatically
6. Add the environment variables when prompted

## Verification Steps

After fixing the configuration:

### 1. Check Build Logs
```
==> Building...
==> Running 'npm install && npm run build'
added 199 packages
==> Build successful
```

### 2. Check Start Logs
```
==> Running 'npm start'
✅ Server running on port 3000
   Health check: http://localhost:3000/health
   Environment: production
```

### 3. Test Health Endpoint
```bash
curl https://your-app.onrender.com/health
# Expected: {"ok":true,"tables":15,"timestamp":"..."}
```

## Key Differences: Old vs New Backend

| Aspect | Old (Python/FastAPI) | New (Node.js/Express) |
|--------|---------------------|----------------------|
| **Runtime** | Python 3.11+ | Node.js 18+ |
| **Framework** | FastAPI + Uvicorn | Express + TypeScript |
| **Root Dir** | `apps/api` | `backend` |
| **Start Command** | `uvicorn app.main:app ...` | `npm start` |
| **Build Command** | `pip install -r requirements.txt` | `npm install && npm run build` |
| **Port** | `$PORT` or 8000 | `$PORT` or 3000 |

## Common Mistakes to Avoid

1. ❌ **Wrong Root Directory** - Must be `backend`, not `apps/api`
2. ❌ **Wrong Runtime** - Must be `Node`, not `Python`
3. ❌ **Wrong Start Command** - Must be `npm start`, not uvicorn command
4. ❌ **Missing Build Step** - Must run `npm run build` to compile TypeScript
5. ❌ **Wrong Port** - Node backend uses 3000 by default (but Render sets $PORT automatically)

## Need Help?

If you're still stuck:

1. **Check Render Logs** - The logs will show the exact command being run
2. **Verify render.yaml** - Make sure it's using Node runtime
3. **Test Locally** - Run `npm run build && npm start` locally to ensure it works
4. **Check Environment** - Make sure all required env vars are set

## Quick Fix Command

If you have Render CLI installed:

```bash
# Delete old service
render services delete nanowork-mvp

# Create new service from blueprint
cd /path/to/nanowork-mvp
render blueprint launch
```

## Success Criteria

You'll know it's working when:
- ✅ No Python/uvicorn in the logs
- ✅ See "npm install" and "npm run build" in build logs
- ✅ See "npm start" in runtime logs
- ✅ See "✅ Server running on port 3000" message
- ✅ Health endpoint returns JSON response
- ✅ No quote/syntax errors

---

**TL;DR:** The service is configured for Python but the code is Node.js. Update Runtime to Node, Build Command to `npm install && npm run build`, and Start Command to `npm start` in Render settings.
