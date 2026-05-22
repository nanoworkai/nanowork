# Render.com Deployment Setup

## 🏗️ Architecture: Separate Services

This app now deploys as **two separate Render services**:

1. **nanowork-frontend** (Static Site) - Serves the React app
2. **nanowork-backend** (Web Service) - Handles API, webhooks, health checks

## ⚠️ Critical: Environment Variables Required

### Frontend Service (`nanowork-frontend`)

Set these in the Render Dashboard:

```
VITE_API_URL=https://nanowork-backend.onrender.com
VITE_SITE_URL=https://nanowork-frontend.onrender.com
VITE_SUPABASE_URL=https://jxkvpzvwpxrabsubovmt.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
```

**Important:** Replace the backend URL with your actual backend service URL from Render.

### Backend Service (`nanowork-backend`)

Set these in the Render Dashboard:

```
CORS_ORIGIN=https://nanowork-frontend.onrender.com
FRONTEND_URL=https://nanowork-frontend.onrender.com
SUPABASE_URL=https://jxkvpzvwpxrabsubovmt.supabase.co
SUPABASE_SERVICE_KEY=<your-service-role-key>
SUPABASE_ANON_KEY=<your-anon-key>
ANTHROPIC_API_KEY=<your-anthropic-key>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-webhook-secret>
INTERNAL_TOKEN=<generate-secure-token>
CF_ACCOUNT_ID=<your-cloudflare-account-id>
CLOUDFLARE_API_TOKEN=<your-cloudflare-token>
```

**Important:** Replace frontend URLs with your actual frontend service URL from Render.

## ✅ Fixed Issues

### 1. Static Site Service Added
- Created separate `nanowork-frontend` static site service
- `staticPublishPath: ./apps/web/dist` points to correct build output
- SPA routing configured with `/*` rewrite to `/index.html`

### 2. Backend Static Serving Removed
- Removed `express.static()` and SPA fallback from backend
- Backend now only handles API routes, webhooks, health checks
- No more complex build command copying frontend to backend

### 3. AGENT_EMAIL_DOMAIN Made Optional
- Added placeholder fallback for when feature isn't enabled yet
- Won't block deployment anymore

### 4. Secrets Sanitized
- Removed live API keys from `backend/.env.example`

## 🚀 Deployment Process

### Frontend Build (Static Site)
```bash
cd apps/web
npm install
npm run build
# Outputs to apps/web/dist
# Render publishes dist/ as static site
```

### Backend Build (Web Service)
```bash
cd backend
npm install
npm run build
# Outputs to backend/dist
# Render runs: node dist/index.js
```

## 📋 Next Steps

1. **Push these changes to GitHub:**
   ```bash
   git add -A
   git commit -m "fix: split into separate frontend static site and backend services"
   git push origin main
   ```

2. **Watch both services deploy in Render Dashboard:**
   - `nanowork-frontend` should show Vite build output and file uploads
   - `nanowork-backend` should show TypeScript compilation and server start

3. **Configure environment variables:**
   - Set frontend env vars (VITE_API_URL, etc.)
   - Set backend env vars (CORS_ORIGIN, FRONTEND_URL, etc.)
   - **Replace placeholder URLs with actual Render URLs after first deploy**

4. **Update CORS after URLs are known:**
   - Get frontend URL: `https://nanowork-frontend.onrender.com`
   - Get backend URL: `https://nanowork-backend.onrender.com`
   - Set CORS_ORIGIN on backend to frontend URL
   - Set VITE_API_URL on frontend to backend URL
   - Redeploy both services

5. **Test the deployment:**
   - Visit frontend URL
   - Try logging in (Supabase auth)
   - Check that API calls work (CORS)
   - Test Stripe billing portal redirect

## 🔍 Architecture Benefits

- **Faster deploys:** Backend changes don't rebuild frontend
- **Better caching:** Static CDN for frontend assets
- **Cleaner separation:** Frontend can't break backend and vice versa
- **Easier debugging:** Separate logs for each service

## 📝 Troubleshooting

### Frontend deploy fails
- Check build log for Vite errors
- Verify `apps/web/dist` is created
- Check `staticPublishPath: ./apps/web/dist` is correct

### Backend can't connect to frontend (CORS errors)
- Verify `CORS_ORIGIN` is set on backend
- Make sure it matches frontend URL exactly
- Check no trailing slash

### Frontend can't reach backend (network errors)
- Verify `VITE_API_URL` is set on frontend
- Make sure it matches backend URL exactly
- Redeploy frontend after changing env vars
