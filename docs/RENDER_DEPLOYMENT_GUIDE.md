# Render Deployment Fix Guide

## Current Problem

Render is trying to run the **Python backend** (old) when it should run the **Node.js backend** (new).

**Error in logs:**
```
> start
> cd apps/api && python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
/usr/bin/python: No module named uvicorn
```

**Root cause:** Render is executing the root `package.json`'s `start` script instead of using the backend folder's configuration.

## Solution: Reconfigure Render Service

You need to **manually configure** the Render service because it's currently using the wrong settings.

### Step 1: Access Render Dashboard

1. Go to https://render.com/dashboard
2. Find your service (probably named `nanowork-mvp` or similar)
3. Click on it to open settings

### Step 2: Update Service Settings

Click **Settings** (left sidebar) and update these fields:

#### Basic Settings
- **Name:** `nanowork-backend` (or keep current name)
- **Runtime:** **Node** (change from Python if needed)
- **Region:** Oregon (or your preferred region)
- **Branch:** `main`

#### Build & Deploy
- **Root Directory:** `backend` ⚠️ **CRITICAL** - Must be `backend`, not blank
- **Build Command:** `npm ci && npm run build`
- **Start Command:** `node dist/index.js`

**Why these commands?**
- `npm ci` - Clean install (faster and more reliable than `npm install`)
- `npm run build` - Compiles TypeScript to JavaScript
- `node dist/index.js` - Directly runs the compiled server (bypasses root package.json)

### Step 3: Environment Variables

Go to **Environment** tab and ensure these are set:

#### Required Variables
```bash
NODE_ENV=production
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
INTERNAL_TOKEN=generate-a-secure-random-string-here
FRONTEND_URL=https://nanowork.app
```

#### Optional Variables (add as needed)
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
CF_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
```

**Note:** Render provides `PORT` automatically, you don't need to set it.

### Step 4: Remove Old Environment Variables

Delete these if they exist (they're for the old Python backend):
- `PYTHONPATH`
- `ENVIRONMENT` (use `NODE_ENV` instead)
- `SUPABASE_SERVICE_ROLE_KEY` (rename to `SUPABASE_SERVICE_KEY`)
- `LINQ_STRIPE_SECRET_KEY` (rename to `STRIPE_SECRET_KEY`)
- `LINQ_STRIPE_PUBLISHABLE_KEY` (not needed in backend)

### Step 5: Deploy

1. Click **Manual Deploy** → **Clear build cache & deploy**
2. Wait 2-3 minutes for deployment
3. Watch the logs

#### Expected Build Logs
```
==> Cloning from https://github.com/your-username/nanowork-mvp...
==> Checking out commit abc123 in branch main
==> Using Node version 20.x
==> In directory /opt/render/project/src/backend
==> Running 'npm ci && npm run build'
added 199 packages in 5s
==> Running build command 'npm run build'
> agent-platform-backend@1.0.0 build
> tsc
==> Build successful 🎉
```

#### Expected Start Logs
```
==> Running 'node dist/index.js'
✅ Server running on port 3000
   Health check: http://localhost:3000/health
   Environment: production
```

### Step 6: Verify Deployment

Test your deployed backend:

```bash
# Health check (replace with your Render URL)
curl https://nanowork-backend.onrender.com/health

# Expected response:
# {"ok":true,"tables":15,"timestamp":"2026-05-11T..."}
```

## Alternative: Delete and Recreate

If the settings are too broken or you keep having issues:

### Option A: Create New Service from Dashboard

1. **Delete** the existing service in Render
2. Click **New +** → **Web Service**
3. Connect your GitHub repository: `nanowork-mvp`
4. Configure:
   - **Name:** `nanowork-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `node dist/index.js`
   - **Branch:** `main`
   - **Region:** Oregon
   - **Plan:** Free
5. Add all environment variables (see Step 3 above)
6. Click **Create Web Service**

### Option B: Use Infrastructure as Code (Blueprint)

The repository has updated `render.yaml` files that should work correctly:

**From Project Root** (`/render.yaml`):
```yaml
services:
  - type: web
    name: nanowork-backend
    runtime: node
    region: oregon
    plan: free
    branch: main
    rootDir: backend  # ← This makes it use backend folder
    buildCommand: npm ci && npm run build
    startCommand: node dist/index.js
```

**To use:**
1. Delete existing service in Render
2. Commit and push the updated `render.yaml` to GitHub
3. In Render dashboard: **New** → **Blueprint**
4. Select your repository
5. Render will detect `render.yaml` and configure automatically
6. Add environment variables when prompted
7. Deploy

## Verification Checklist

After deployment, verify:

- [ ] **Build logs** show `npm ci && npm run build` (not Python/pip)
- [ ] **Build succeeds** with "Build successful 🎉"
- [ ] **Start logs** show `node dist/index.js` (not uvicorn)
- [ ] **Server starts** with "✅ Server running on port 3000"
- [ ] **Health endpoint** returns `{"ok":true,"tables":15}`
- [ ] **No Python/uvicorn errors** in logs
- [ ] **Response time** < 500ms after cold start

## Common Issues & Solutions

### Issue: Still seeing Python/uvicorn in logs

**Solution:** The Root Directory is not set correctly. It must be `backend` (lowercase, no slashes).

### Issue: "Cannot find module './dist/index.js'"

**Solution:** Build failed. Check that:
1. Build command is `npm ci && npm run build`
2. TypeScript compiles without errors
3. The `dist/` folder is being created

### Issue: "Module not found" errors during build

**Solution:** Dependencies missing. Use `npm ci` instead of `npm install` for clean installs.

### Issue: Environment variable errors

**Solution:** Check that all required env vars are set in Render dashboard → Environment tab.

### Issue: 401 errors on all endpoints

**Solution:** `SUPABASE_SERVICE_KEY` is missing or incorrect.

## Project Structure

For reference, here's the correct structure:

```
nanowork-mvp/
├── apps/
│   ├── api/          ← Old Python backend (FastAPI)
│   ├── web/          ← Frontend (React)
│   └── worker/       ← Cloudflare Worker
├── backend/          ← **NEW Node.js backend (Express)** ← DEPLOY THIS
│   ├── src/
│   ├── dist/         ← Compiled JS (created by build)
│   ├── db/
│   ├── package.json
│   ├── tsconfig.json
│   └── render.yaml   ← Can use this if root directory is "backend"
├── package.json      ← Root (for monorepo, has old Python scripts)
└── render.yaml       ← Root config (has rootDir: backend)
```

**Important:** When `rootDir: backend` is set in render.yaml, Render should:
1. Change to the `backend/` directory
2. Run commands from there
3. Use `backend/package.json` scripts
4. Ignore root `package.json` scripts

## Test Locally First

Before deploying, test the exact commands locally:

```bash
cd /path/to/nanowork-mvp/backend

# Clean install
npm ci

# Build
npm run build

# Should see dist/ folder
ls dist/

# Run
node dist/index.js

# Should see:
# ✅ Server running on port 3000
```

If that works locally, it will work on Render.

## Need More Help?

1. **Check Render Logs** - The exact command being run is shown
2. **Verify Settings** - Root Directory must be `backend`
3. **Test Locally** - Run the exact commands Render uses
4. **Check render.yaml** - Ensure it's using Node runtime with backend rootDir

## Quick Reference: Correct Configuration

| Setting | Value |
|---------|-------|
| **Runtime** | Node |
| **Root Directory** | `backend` |
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `node dist/index.js` |
| **Branch** | `main` |
| **Node Version** | 20.x (automatic) |

---

**After fixing:** You should see Node.js commands in the logs, not Python/uvicorn.
