# Deploying to Render.com

Complete guide for deploying the Nanowork backend to Render.

## Prerequisites

1. ✅ GitHub repository with your code
2. ✅ Supabase project with schema deployed (see `SUPABASE_SETUP.md`)
3. ✅ Render.com account (free tier works)

## Option 1: Deploy via Render Dashboard (Recommended)

### Step 1: Create New Web Service

1. Go to https://render.com/dashboard
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Select the repository: `nanowork-mvp`

### Step 2: Configure Service

Fill in the following settings:

- **Name:** `nanowork-backend` (or your preferred name)
- **Region:** `Oregon` (or closest to your users)
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Plan:** `Free` (or higher)

### Step 3: Add Environment Variables

Click **Advanced** → **Add Environment Variable** and add these:

#### Required Variables

```bash
NODE_ENV=production
PORT=3000

# Supabase (from your Supabase dashboard → Settings → API)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Security
INTERNAL_TOKEN=your-secret-random-string-here

# Frontend
FRONTEND_URL=https://nanowork.app
```

#### Optional Variables (add as needed)

```bash
# AI Generation
ANTHROPIC_API_KEY=sk-ant-api03-...

# Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudflare Deployments
CF_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
```

### Step 4: Deploy

1. Click **Create Web Service**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build TypeScript
   - Start the server
3. Wait 2-3 minutes for deployment to complete

### Step 5: Verify Deployment

Once deployed, test your backend:

```bash
# Replace with your Render URL
curl https://nanowork-backend.onrender.com/health

# Expected response:
# {"ok":true,"tables":15,"timestamp":"2026-05-11T..."}
```

## Option 2: Deploy via render.yaml (Infrastructure as Code)

The repository includes two `render.yaml` files:

1. **`/render.yaml`** - For deploying from project root
2. **`/backend/render.yaml`** - For deploying from backend folder

### Using /render.yaml (Project Root)

If Render is connected to the repository root:

```yaml
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

### Using /backend/render.yaml (Backend Folder)

If Render is connected with root directory set to `backend`:

```yaml
services:
  - type: web
    name: agent-platform-backend
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm start
```

The environment variables in the yaml file are marked with `sync: false`, which means Render will prompt you to add them during deployment.

## Post-Deployment Setup

### 1. Test Internal Endpoint

```bash
curl -X POST https://your-app.onrender.com/internal/provision-agent \
  -H "Authorization: Bearer YOUR_INTERNAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test-user-uuid"}'
```

### 2. Configure Webhooks (Optional)

If using Stripe webhooks:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-app.onrender.com/webhooks/stripe`
3. Copy webhook secret to `STRIPE_WEBHOOK_SECRET` env var

### 3. Update Frontend URL

Update your frontend environment to point to the Render backend:

```bash
# In your frontend .env
VITE_API_URL=https://your-app.onrender.com
```

## Troubleshooting

### Build Fails: "Module not found"

**Solution:** Ensure all dependencies are in `package.json`, not just devDependencies. Run `npm install` locally first.

### Runtime Error: "Cannot find module './dist/index.js'"

**Solution:** Check that `npm run build` completes successfully. The build command should run `tsc` and generate the `dist/` folder.

### 401 Errors on All Endpoints

**Solution:** Check that `SUPABASE_SERVICE_KEY` is set correctly in environment variables.

### "SUPABASE_URL must be configured"

**Solution:** Add required environment variables in Render dashboard → Environment.

### Port Issues

**Solution:** The backend uses `process.env.PORT || 3000`. Render automatically sets `PORT`, so no changes needed.

### Cold Starts (Free Tier)

Render free tier apps spin down after 15 minutes of inactivity. First request after idle will take 30-60 seconds.

**Solution:** Upgrade to paid plan ($7/month) for always-on service.

## Monitoring

### View Logs

In Render dashboard:
- Click your service
- Go to **Logs** tab
- Watch real-time logs

### Health Checks

Render automatically monitors the `/health` endpoint. If it returns non-200, Render will attempt to restart.

### Metrics

In the **Metrics** tab:
- CPU usage
- Memory usage
- Request rate
- Response time

## Updating Deployment

### Automatic Deploys

By default, Render auto-deploys on every push to `main` branch.

To disable:
- Service Settings → Build & Deploy
- Turn off "Auto-Deploy"

### Manual Deploy

Click **Manual Deploy** → **Deploy latest commit**

### Rollback

In the **Events** tab:
- Find a previous successful deploy
- Click **Rollback to this version**

## Custom Domain (Optional)

1. Go to **Settings** → **Custom Domains**
2. Add your domain: `api.nanowork.app`
3. Configure DNS:
   ```
   CNAME api nanowork-backend.onrender.com
   ```
4. Wait for SSL certificate (automatic, takes ~5 minutes)

## Performance Tips

### 1. Enable HTTP/2
Already enabled by default on Render.

### 2. Use Connection Pooling
The Supabase client handles this automatically.

### 3. Add Redis Cache (Optional)
For high-traffic apps:
- Add Redis service in Render
- Connect via `REDIS_URL` environment variable

### 4. Database Indexes
All recommended indexes are included in `db/schema.sql`.

## Cost Estimate

**Free Tier:**
- 750 hours/month compute
- 100 GB bandwidth
- Spins down after 15 min inactivity
- **Cost:** $0/month

**Starter Plan:**
- Always-on
- 1 GB RAM
- Automatic scaling
- **Cost:** $7/month

## Security Checklist

- ✅ `SUPABASE_SERVICE_KEY` kept secret (never in code)
- ✅ `INTERNAL_TOKEN` is a strong random string
- ✅ CORS configured for production frontend URL
- ✅ HTTPS enforced by Render (automatic)
- ✅ Environment variables encrypted at rest
- ✅ No secrets in logs (use console.error, not console.log for sensitive data)

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Test health endpoint
3. ✅ Provision test agent
4. ⬜ Deploy frontend (Cloudflare Pages)
5. ⬜ Connect frontend to backend API
6. ⬜ Set up monitoring (Sentry)
7. ⬜ Load test with realistic traffic

## Support

- Render Docs: https://render.com/docs
- Render Status: https://status.render.com
- Backend Docs: `/backend/README.md`
- Database Setup: `/backend/SUPABASE_SETUP.md`

---

**Ready to deploy:** Push to GitHub, connect in Render dashboard, add environment variables, and deploy!
