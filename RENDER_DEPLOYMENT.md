# Render Deployment Guide

## Backend Deployment Status

✅ **Backend is ready for deployment**

The backend has been configured as a standalone Render web service in `render.yaml`.

### Verification Completed
- ✅ Backend builds successfully (`npm run build`)
- ✅ Health endpoint responds: `{"ok":true,"tables":15,"timestamp":"..."}`
- ✅ `render.yaml` configured with both frontend and backend services
- ✅ All environment variables documented

---

## Deploy to Render

### Option 1: Blueprint Deployment (Recommended)
Deploy both services at once using the blueprint:

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New → Blueprint**
3. Connect your GitHub repository
4. Render will detect `render.yaml` and create both services:
   - `nanowork-api` (backend)
   - `nanowork-web` (frontend)

### Option 2: Manual Backend Service
Deploy just the backend:

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `nanowork-api`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/index.js`
   - **Health Check Path**: `/health`

---

## Required Environment Variables

Add these in the Render Dashboard under **Environment**:

### ⚠️ Critical (Required for startup):
```
SUPABASE_URL=<your-supabase-project-url>
SUPABASE_SERVICE_KEY=<your-supabase-service-role-key>
```

### Recommended:
```
SUPABASE_ANON_KEY=<your-supabase-anon-key>
ANTHROPIC_API_KEY=<your-anthropic-api-key>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
INTERNAL_TOKEN=<generate-random-secure-token>
CF_ACCOUNT_ID=<your-cloudflare-account-id>
CLOUDFLARE_API_TOKEN=<your-cloudflare-api-token>
```

### Optional (Stripe Pricing):
```
STRIPE_PRICE_STARTER=<price-id>
STRIPE_PRICE_GROWTH=<price-id>
STRIPE_PRICE_SCALE=<price-id>
STRIPE_PRICE_ENTERPRISE=<price-id>
CUSTOM_DOMAIN_PRICE_ID=<price-id>
```

### Auto-configured by render.yaml:
These are already set in the YAML file:
- `NODE_ENV=production`
- `PORT=3000`
- `FRONTEND_URL=https://nanowork-web.onrender.com`
- `CORS_ORIGIN=https://nanowork-web.onrender.com,https://nanowork.app`

---

## After Backend Deploys

Once the backend is live at `https://nanowork-api.onrender.com`:

### Update Frontend Environment Variable
Set this in your frontend `.env` or Render frontend service:
```
VITE_API_URL=https://nanowork-api.onrender.com
```

### Update Stripe Webhook URL
In your Stripe Dashboard, update the webhook endpoint to:
```
https://nanowork-api.onrender.com/webhooks/stripe
```

---

## Verify Deployment

After deployment, test the health endpoint:
```bash
curl https://nanowork-api.onrender.com/health
```

Expected response:
```json
{"ok":true,"tables":15,"timestamp":"2026-05-24T..."}
```

---

## Service URLs
- **Backend API**: `https://nanowork-api.onrender.com`
- **Frontend**: `https://nanowork-web.onrender.com`
- **Health Check**: `https://nanowork-api.onrender.com/health`

---

## Notes
- The backend requires `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` to start
- Health check endpoint returns `{"ok":true}` when all services are operational
- CORS is configured to allow requests from the frontend URLs
- Free tier may experience cold starts (first request may take 30-60 seconds)
