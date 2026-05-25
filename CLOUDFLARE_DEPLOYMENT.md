# Cloudflare Deployment Guide

## Architecture

- **Frontend**: Cloudflare Pages (apps/web)
- **Backend API**: Cloudflare Workers (apps/worker)
- **Database**: Supabase
- **Payments**: Stripe

## 1. Deploy Cloudflare Worker (Backend API)

```bash
cd apps/worker
npx wrangler deploy
```

### Set Worker Secrets

```bash
cd apps/worker
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
```

After deployment, note your worker URL:
- Production: `https://nanowork-api.<your-subdomain>.workers.dev`

## 2. Deploy Cloudflare Pages (Frontend)

### Option A: Via Cloudflare Dashboard (Recommended)

1. Go to Cloudflare Dashboard → Pages
2. Create a new project from your GitHub repo
3. Configure build settings:
   - **Build command**: `cd apps/web && bun install && bun run build`
   - **Build output directory**: `apps/web/dist`
   - **Root directory**: `/`

4. Add environment variables:
   ```
   VITE_API_URL=https://nanowork-api.<your-subdomain>.workers.dev
   VITE_SUPABASE_URL=https://<your-project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   VITE_SITE_URL=https://YOUR-DOMAIN.com
   ```

5. Deploy!

### Option B: Via CLI

```bash
cd apps/web
bun run build

# Set environment variables first
export VITE_API_URL=https://nanowork-api.<your-subdomain>.workers.dev
export VITE_SUPABASE_URL=https://<your-project>.supabase.co
export VITE_SUPABASE_ANON_KEY=<your-anon-key>
export VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
export VITE_SITE_URL=https://YOUR-DOMAIN.com

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=nanowork-web
```

## 3. Connect Custom Domain

1. In Cloudflare Pages dashboard, go to your project
2. Click "Custom domains"
3. Add `YOUR-DOMAIN.com` and `www.YOUR-DOMAIN.com`
4. Cloudflare will automatically configure DNS

## 4. Update API Redirects (Important!)

Update `/apps/web/public/_redirects` with your actual worker URL:

```
/api/*  https://nanowork-api.<your-subdomain>.workers.dev/:splat  200
/health  https://nanowork-api.<your-subdomain>.workers.dev/health  200
/assets/*  /assets/:splat  200
/*  /index.html  200
```

Then rebuild and redeploy.

## 5. Verify Deployment

Test these endpoints:

1. **Frontend**: https://YOUR-DOMAIN.com
2. **API Health**: https://YOUR-DOMAIN.com/health (should proxy to worker)
3. **API Test**: https://YOUR-DOMAIN.com/api/test

## Environment Variables Summary

### Cloudflare Worker (apps/worker)
Set via `wrangler secret put`:
- `ANTHROPIC_API_KEY` - Claude API key
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

### Cloudflare Pages (apps/web)
Set in Cloudflare Pages dashboard:
- `VITE_API_URL` - Your worker URL
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `VITE_SITE_URL` - Your domain (https://YOUR-DOMAIN.com)

## Troubleshooting

### Issue: "undefined is not an object" errors in production

**Cause**: Environment variables not injected at build time.

**Solution**: 
1. Ensure all `VITE_*` environment variables are set in Cloudflare Pages dashboard
2. Rebuild the project (Cloudflare will inject them automatically)
3. Verify build.ts includes the `define` block for env injection

### Issue: API calls return 404

**Cause**: `_redirects` file pointing to wrong worker URL.

**Solution**: Update `apps/web/public/_redirects` with correct worker URL and redeploy.

### Issue: CORS errors

**Cause**: Worker not configured to accept requests from Pages domain.

**Solution**: Update worker CORS configuration to allow your Pages domain.

### Issue: Authentication not working

**Cause**: Supabase redirect URL mismatch.

**Solution**: 
1. Add your production URL to Supabase dashboard → Authentication → URL Configuration
2. Add `https://YOUR-DOMAIN.com` to allowed redirect URLs

## Rollback Process

If deployment fails:

1. **Pages**: Cloudflare keeps all previous deployments - click "Rollback" in dashboard
2. **Worker**: Deploy previous version: `wrangler deploy --compatibility-date=<previous-date>`

## Monitoring

- **Pages Analytics**: Cloudflare Dashboard → Pages → Analytics
- **Worker Analytics**: Cloudflare Dashboard → Workers → Analytics
- **Logs**: `wrangler tail` for real-time worker logs
