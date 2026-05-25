# Production Deployment Checklist

## ✅ Pre-Deployment

- [ ] All tests pass locally
- [ ] TypeScript builds without errors: `bun run typecheck`
- [ ] Production build succeeds: `bun run build`
- [ ] Environment variables ready (see below)

## 🔧 Environment Variables Setup

### Cloudflare Worker (Backend)
Set these via `wrangler secret put` in `apps/worker/`:

```bash
cd apps/worker
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
```

### Cloudflare Pages (Frontend)
Set these in Cloudflare Pages Dashboard → Settings → Environment Variables:

| Variable | Example Value | Notes |
|----------|---------------|-------|
| `VITE_API_URL` | `https://nanowork-api.your.workers.dev` | Your worker URL |
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | From Supabase dashboard |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | From Supabase dashboard |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | From Stripe dashboard |
| `VITE_SITE_URL` | `https://YOUR-DOMAIN.com` | Your production domain |

## 🚀 Deployment Steps

### 1. Deploy Worker (Backend)
```bash
cd apps/worker
wrangler deploy
```

Note the deployed URL (e.g., `https://nanowork-api.your.workers.dev`)

### 2. Update Frontend API Redirect
Edit `apps/web/public/_redirects`:
```
/api/*  https://nanowork-api.YOUR-SUBDOMAIN.workers.dev/:splat  200
```

### 3. Deploy Frontend
```bash
# Option A: Via Cloudflare Dashboard (Recommended)
# Push to GitHub, Cloudflare auto-deploys

# Option B: Via CLI
cd apps/web
VITE_API_URL=https://your-worker-url.workers.dev \
VITE_SUPABASE_URL=https://xxx.supabase.co \
VITE_SUPABASE_ANON_KEY=eyJ... \
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... \
VITE_SITE_URL=https://YOUR-DOMAIN.com \
bun run build

npx wrangler pages deploy dist --project-name=nanowork-web
```

## 🧪 Post-Deployment Verification

Test these URLs:

- [ ] Homepage: `https://YOUR-DOMAIN.com` - Should load
- [ ] Dashboard: `https://YOUR-DOMAIN.com/dashboard` - Should redirect to auth
- [ ] API Health: `https://YOUR-DOMAIN.com/health` - Should return `{"ok": true}`
- [ ] API Test: `https://YOUR-DOMAIN.com/api/test` - Should return data

### Test in Browser Console
```javascript
// Check env vars are injected
console.log(import.meta.env);
// Should show VITE_* variables

// Test Supabase
fetch('https://YOUR-DOMAIN.com/health').then(r => r.json()).then(console.log);
```

## 🐛 Common Issues

### Issue: "undefined is not an object" errors

**Fix**: Environment variables not set in Cloudflare Pages dashboard.
1. Go to Pages → Settings → Environment Variables
2. Add all `VITE_*` variables
3. Trigger a new build

### Issue: API calls return 404

**Fix**: `_redirects` has wrong worker URL.
1. Update `apps/web/public/_redirects` with correct worker URL
2. Rebuild and redeploy

### Issue: CORS errors

**Fix**: Worker needs to allow Pages domain.
1. Check worker CORS configuration
2. Add your domain to allowed origins

### Issue: Supabase auth not working

**Fix**: Redirect URL not configured.
1. Supabase Dashboard → Authentication → URL Configuration
2. Add `https://YOUR-DOMAIN.com` to allowed redirect URLs

## 🔄 Rollback

If deployment fails:

**Pages**: 
```
Cloudflare Dashboard → Pages → Deployments → Previous deployment → Rollback
```

**Worker**:
```bash
cd apps/worker
git checkout <previous-commit>
wrangler deploy
```

## 📊 Monitoring

- **Pages Logs**: Cloudflare Dashboard → Pages → Logs
- **Worker Logs**: `wrangler tail` in `apps/worker/`
- **Analytics**: Cloudflare Dashboard → Analytics

## ✅ Success Indicators

- [ ] Frontend loads without console errors
- [ ] API health check returns 200
- [ ] Authentication flow works
- [ ] No "undefined" errors in production
- [ ] All features functional
