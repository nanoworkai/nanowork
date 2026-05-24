# Deployment Checklist

Quick reference for deploying the Nanowork backend to Render.

## ✅ Pre-Deployment

- [ ] Code pushed to GitHub
- [ ] Supabase project created
- [ ] Database schema deployed (`db/schema.sql`)
- [ ] Database verified (`db/verify-schema.sql`)
- [ ] Local build succeeds (`npm run build`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] Local server runs (`npm run dev`)

## 🚀 Render Configuration

### Basic Settings
```
Name: nanowork-backend
Region: Oregon (or closest to users)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
Plan: Free (or Starter $7/mo for always-on)
```

### Required Environment Variables
```bash
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbG...  # From Supabase dashboard
SUPABASE_ANON_KEY=eyJhbG...     # From Supabase dashboard
INTERNAL_TOKEN=generate-secure-random-string
FRONTEND_URL=https://nanowork.app
```

### Optional Environment Variables
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
CF_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
```

## 🧪 Post-Deployment Tests

### 1. Health Check
```bash
curl https://your-app.onrender.com/health
# Expected: {"ok":true,"tables":15,"timestamp":"..."}
```

### 2. Auth Test (should fail with 401)
```bash
curl https://your-app.onrender.com/agents/me
# Expected: {"error":"No authorization token provided"}
```

### 3. Internal Endpoint
```bash
curl -X POST https://your-app.onrender.com/internal/provision-agent \
  -H "Authorization: Bearer YOUR_INTERNAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"00000000-0000-0000-0000-000000000001"}'
# Expected: {"agent":{...},"created":true}
```

## 📊 Monitoring

After deployment, check:

- [ ] Logs show "✅ Server running on port 3000"
- [ ] No error messages in logs
- [ ] Health endpoint returns 200
- [ ] Response time < 500ms (after cold start)
- [ ] Memory usage stable (< 500MB)

## 🔧 Common Issues

### Build Fails
- Check all dependencies are in `package.json`
- Verify `npm install` works locally
- Check Node version (needs >= 18.0.0)

### Runtime Errors
- Verify environment variables are set
- Check logs for specific error messages
- Ensure Supabase credentials are correct

### Slow First Request
- Normal on free tier (cold start ~30-60s)
- Upgrade to Starter plan for always-on

## 📝 Documentation

- `RENDER_DEPLOY.md` - Complete deployment guide
- `SUPABASE_SETUP.md` - Database setup
- `README.md` - Full backend documentation
- `QUICK_START.md` - 5-minute local setup

## 🎯 Success Criteria

Deployment is successful when:
- ✅ Build completes without errors
- ✅ Server starts and logs "✅ Server running"
- ✅ Health endpoint returns `{"ok":true}`
- ✅ Can provision agents via internal endpoint
- ✅ Frontend can connect to API
- ✅ No errors in Render logs

## 🔄 Update Process

To deploy updates:
1. Push changes to GitHub `main` branch
2. Render auto-deploys (takes ~2-3 minutes)
3. Monitor logs for errors
4. Test health endpoint
5. Rollback if issues (Render dashboard → Events → Rollback)

---

**Quick Start:** Push code → Connect Render → Add env vars → Deploy → Test `/health`
