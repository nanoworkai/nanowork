# Render.com Deployment Setup

## ⚠️ Critical: Environment Variables Required

Add these environment variables in the Render Dashboard for your `nanowork-web` service:

### 1. CORS_ORIGIN (Critical)
```
https://your-app.onrender.com
```
**Why:** Backend defaults to localhost origins, blocking production frontend

### 2. FRONTEND_URL (Critical) 
```
https://your-app.onrender.com
```
**Why:** Stripe billing portal redirects will go to localhost without this

### 3. All Other Variables
Ensure these are set with your production values:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY` 
- `SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `INTERNAL_TOKEN`
- `CF_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

## ✅ Fixed Issues

### 1. AGENT_EMAIL_DOMAIN Not Required
- Made optional with placeholder fallback
- Will work now without this env var
- Add it later when you enable agent email functionality

### 2. Build Command Cleaned
- Removed debug `ls -la` commands
- Simplified from 9 operations to 6
- Still creates backend/public and copies frontend

### 3. Secrets Sanitized
- Removed live API keys from `backend/.env.example`
- File is now safe to commit

## 🔍 Remaining Architecture Notes

### Current Setup (Monolithic - Correct for Free Tier)
- Single Render service bundles frontend + backend
- Frontend builds to `apps/web/dist`
- Gets copied to `backend/public/`
- Express serves static files + API

**This is correct for free tier.** Don't change to separate services unless you upgrade to paid plan.

### Build Process Flow
```bash
1. cd apps/web && npm install && npm run build    # Build React frontend
2. mkdir -p backend/public                         # Ensure dir exists  
3. cp -r apps/web/dist/* backend/public/          # Copy to backend
4. cd backend && npm install && npm run build      # Build Express backend
```

## 🚀 Next Steps

1. **Push these changes to GitHub**
2. **In Render Dashboard:**
   - Set `CORS_ORIGIN` to your production URL
   - Set `FRONTEND_URL` to your production URL
   - Verify all other env vars are set
3. **Trigger a new deploy**
4. **Test the deployment:**
   - Visit your app URL
   - Try logging in (Supabase auth)
   - Check that API calls work (CORS)
   - Test Stripe billing portal redirect

## 📝 Known Issues to Monitor

- **Build complexity:** 6-step chained command could still fail silently
- **No build caching:** Frontend rebuilds every time even if unchanged
- **Workspace resolution:** `npm run build -w web` might fail in clean Render env
  
If deployment still fails, check Render logs for which step is breaking.
