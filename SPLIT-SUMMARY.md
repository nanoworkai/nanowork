# Frontend/Backend Split Summary

This document summarizes the changes made to split the monorepo into separate frontend and backend deployments on Render.

## What Changed

### New Files Created

1. **`apps/web/render.yaml`** - Frontend deployment configuration for Render
2. **`DEPLOYMENT.md`** - Comprehensive deployment guide
3. **`SPLIT-SUMMARY.md`** - This file

### Files Modified

1. **`backend/render.yaml`** - Updated with proper configuration and Render regions
2. **`apps/web/.env.production`** - Updated to point to backend Render URL
3. **`render.yaml`** (root) - Deprecated with instructions to use subdirectory configs
4. **`README.md`** - Completely updated with new architecture and deployment instructions

## Architecture Changes

### Before
- Monorepo with complex Cloudflare Workers setup
- Frontend and backend tightly coupled
- Cloudflare Pages for frontend, Workers for API

### After
- Clean separation of frontend and backend
- Backend: Express/Node API on Render (`backend/`)
- Frontend: React/Vite SPA on Render (`apps/web/`)
- Independent deployment and scaling

## Deployment Configuration

### Backend (`backend/render.yaml`)
```yaml
Service: nanowork-backend
Root: backend/
Build: npm ci && npm run build
Start: npm start
URL: https://nanowork-backend.onrender.com
```

### Frontend (`apps/web/render.yaml`)
```yaml
Service: nanowork-frontend
Root: apps/web/
Build: npm ci && npm run build
Start: npm start
URL: https://nanowork-frontend.onrender.com
```

## Environment Variables

### Backend URLs
- **Production:** `https://nanowork-backend.onrender.com`
- **Health Check:** `https://nanowork-backend.onrender.com/health`

### Frontend URLs
- **Production:** `https://nanowork-frontend.onrender.com`

### Key Environment Variables

**Backend:**
- `FRONTEND_URL` → Frontend URL for CORS
- `PORT` → 3000
- Supabase, Anthropic, Stripe credentials

**Frontend:**
- `VITE_API_URL` → Backend URL
- `VITE_SITE_URL` → Frontend URL
- Supabase public credentials

## CORS Configuration

The backend already has dynamic CORS configuration that reads from `FRONTEND_URL` environment variable. The allowed origins include:

- Value from `FRONTEND_URL` env var
- `https://nanowork.ai`
- `https://www.nanowork.ai`
- `https://nanowork-5k9.pages.dev`
- `http://localhost:5173`
- `http://localhost:3000`

## Next Steps

1. **Deploy Backend First**
   - Create Render Web Service pointing to `backend/`
   - Set all required environment variables
   - Copy the deployed backend URL

2. **Deploy Frontend Second**
   - Create Render Web Service pointing to `apps/web/`
   - Set `VITE_API_URL` to the backend URL from step 1
   - Set other required environment variables

3. **Update Backend CORS**
   - Set `FRONTEND_URL` to match your deployed frontend URL
   - Redeploy if needed

4. **Test**
   - Visit frontend URL
   - Test authentication
   - Verify API calls work
   - Check logs for any errors

## Development Workflow

### Local Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd apps/web
npm run dev
```

### Production Deployment
- Push to `main` branch
- Render auto-deploys both services
- Monitor logs in Render dashboard

## Benefits of This Split

1. **Simpler Configuration** - No complex Worker bindings or Cloudflare setup
2. **Independent Scaling** - Scale frontend and backend separately
3. **Easier Debugging** - Clear separation of concerns, better logs
4. **Standard Tooling** - Use standard Node.js/Express patterns
5. **Cost Effective** - Render free tier available for both services
6. **Standard Deployment** - No Wrangler, just standard Node.js deployment

## Migration Checklist

- [x] Create frontend render.yaml
- [x] Update backend render.yaml
- [x] Configure environment variables
- [x] Update documentation (README.md)
- [x] Create deployment guide (DEPLOYMENT.md)
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Render
- [ ] Test full application flow
- [ ] Configure custom domains (optional)
- [ ] Set up Stripe webhooks
- [ ] Monitor for 24-48 hours

## Rollback Plan

If issues arise, the original code is preserved. To rollback:
1. Revert changes to `apps/web/.env.production`
2. Use the old root `render.yaml` configuration
3. Or deploy to Cloudflare Workers/Pages using original setup

## Support

For issues or questions:
1. Check `DEPLOYMENT.md` for detailed instructions
2. Review Render logs for specific errors
3. Check `README.md` troubleshooting section
4. Verify all environment variables are set correctly
