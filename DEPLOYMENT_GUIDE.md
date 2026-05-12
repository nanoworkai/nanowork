# Nanowork Deployment Guide

## Architecture Overview

Your app is split into 3 deployments:

| Component | Platform | URL | Source |
|-----------|----------|-----|--------|
| **Frontend** | Cloudflare Pages | `nanowork.app` | `apps/web/` |
| **API Worker** | Cloudflare Workers | `api.nanowork.app` | `apps/worker/` |
| **Backend** | Render | `*.onrender.com` | `backend/` |

## Current Issue: Render Configuration

**Error:** `npm error Did you mean one of these? npm error npm star`

**Root Cause:** Render is trying to run `npm start` from the **root directory** instead of the `backend/` directory.

### Fix Options

#### Option 1: Update Existing Render Service (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Find your service (likely named `nanowork-mvp`, `nanowork-backend`, or similar)
3. Click **Settings**
4. Verify/Update these settings:

   ```
   Runtime: Node
   Root Directory: backend
   Build Command: npm ci && npm run build
   Start Command: npm start
   Health Check Path: /health
   Branch: main
   ```

5. Scroll to **Environment Variables** and verify:
   - `NODE_ENV=production`
   - `PORT=3000` (or leave blank - Render auto-sets)
   - `SUPABASE_URL` (your Supabase project URL)
   - `SUPABASE_SERVICE_KEY` (Supabase service role key)
   - `SUPABASE_ANON_KEY` (Supabase anon key)
   - `ANTHROPIC_API_KEY` (your Claude API key)
   - `STRIPE_SECRET_KEY` (your Stripe secret key)
   - `STRIPE_WEBHOOK_SECRET` (your Stripe webhook secret)
   - `INTERNAL_TOKEN` (generate a secure random string)
   - `FRONTEND_URL=https://nanowork.app`

6. Click **Save Changes**
7. Click **Manual Deploy** → **Clear build cache & deploy**

#### Option 2: Delete and Recreate Service

If settings are broken:

1. **Delete** the existing service in Render dashboard
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `nanowork-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm start`
   - **Branch:** `main`
   - **Plan:** Free
5. Add environment variables (see Option 1, step 5)
6. Click **Create Web Service**

#### Option 3: Use Blueprint (render.yaml)

1. **Delete** existing service
2. Click **New** → **Blueprint**
3. Select your repository
4. Render will detect `/render.yaml` and auto-configure
5. Add environment variables when prompted
6. Deploy

## Deployment Commands

### Local Development

```bash
# Frontend + Worker
npm run dev

# Backend only
cd backend && npm run dev
```

### Deploy Frontend (Cloudflare Pages)

```bash
# From root
npm run deploy:web

# Or manually
cd apps/web
npm run build
npx wrangler pages deploy dist
```

### Deploy API Worker (Cloudflare Workers)

```bash
# From root
npm run deploy:worker

# Or manually
cd apps/worker
npx wrangler deploy
```

### Deploy Backend (Render)

Backend deploys automatically on git push to `main` branch.

Or trigger manually:
1. Go to Render dashboard
2. Select backend service
3. Click **Manual Deploy** → **Deploy latest commit**

## Verification Steps

### 1. Check Backend Health

```bash
curl https://your-backend.onrender.com/health
```

Expected response:
```json
{
  "ok": true,
  "tables": 15,
  "timestamp": "2026-05-12T04:13:42.030Z"
}
```

### 2. Check Frontend

Visit `https://nanowork.app` and verify:
- ✅ Home page loads
- ✅ Can navigate to `/login`
- ✅ Can navigate to `/dashboard` (redirects to login if not authenticated)
- ✅ Can navigate to `/app` (shows preview if built app exists)

### 3. Check API Worker

```bash
curl https://api.nanowork.app/health
```

Expected response:
```json
{"status": "ok"}
```

## Common Issues

### Issue: "npm start not found"

**Solution:** Render is running from wrong directory. Set `Root Directory: backend` in Render settings.

### Issue: "Build succeeds but start fails"

**Check:**
1. `backend/package.json` has `"start": "node dist/index.js"`
2. `npm run build` creates `backend/dist/index.js`
3. Root directory is set to `backend` in Render

### Issue: "Frontend routes return 404"

**Solution:** Ensure `apps/web/public/_redirects` exists with:
```
/*    /index.html   200
```

This is already configured and working.

### Issue: "CORS errors when calling API"

**Check:**
1. Backend `FRONTEND_URL` env var matches your frontend domain
2. Frontend is making requests to correct backend URL
3. Backend CORS middleware is configured (already in place)

## Environment Variables Reference

### Backend (Render)

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Set to `production` | Yes |
| `PORT` | Auto-set by Render, usually 3000 | No |
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (full access) | Yes |
| `SUPABASE_ANON_KEY` | Supabase anon key (public) | Yes |
| `ANTHROPIC_API_KEY` | Claude API key for AI features | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key for payments | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes |
| `INTERNAL_TOKEN` | Secret token for internal API calls | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `CF_ACCOUNT_ID` | Cloudflare account ID (if needed) | No |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token (if needed) | No |

### Frontend (Cloudflare Pages)

Environment variables are set in Cloudflare Pages dashboard or via `.env.production`:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `VITE_API_URL` | Backend API URL |

Check `apps/web/.env.production` for current values.

### API Worker (Cloudflare Workers)

Set via `wrangler secret put <NAME>`:

```bash
cd apps/worker
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
```

## Success Checklist

- ✅ Backend builds successfully on Render
- ✅ Backend starts without errors
- ✅ Backend health endpoint returns 200 OK
- ✅ Frontend deploys to Cloudflare Pages
- ✅ Frontend routes work (no 404s)
- ✅ Can navigate between pages
- ✅ Login flow works
- ✅ Dashboard loads for authenticated users
- ✅ API calls succeed (no CORS errors)

## Need Help?

1. **Check Logs:**
   - Render: Dashboard → Service → Logs tab
   - Cloudflare Pages: Dashboard → Pages → Deployment logs
   - Cloudflare Workers: Dashboard → Workers → Real-time logs

2. **Test Locally:**
   ```bash
   # Backend
   cd backend
   npm ci
   npm run build
   npm start
   
   # Frontend
   cd apps/web
   npm run dev
   ```

3. **Verify Build:**
   ```bash
   # Backend
   cd backend && npm run build && ls -la dist/
   # Should see: index.js and other compiled files
   
   # Frontend
   cd apps/web && npm run build && ls -la dist/
   # Should see: index.html, assets/, _redirects
   ```

---

**Quick Reference:**

- Frontend code: `apps/web/src/`
- Backend code: `backend/src/`
- Worker code: `apps/worker/src/`
- Deploy frontend: `npm run deploy:web`
- Deploy worker: `npm run deploy:worker`
- Deploy backend: Git push to main
