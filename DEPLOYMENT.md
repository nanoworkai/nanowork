# Deployment Guide

This guide covers deploying the Nanowork platform on Render with separate frontend and backend services.

## Overview

- **Backend:** Express/Node API deployed as a Render Web Service
- **Frontend:** React/Vite SPA deployed as a Render Web Service
- **Configuration:** Each service has its own `render.yaml` file

## Prerequisites

1. A Render account (https://render.com)
2. This repository pushed to GitHub/GitLab
3. Environment variables ready (Supabase, Anthropic API key, Stripe keys)

## Step-by-Step Deployment

### 1. Deploy Backend First

The backend must be deployed first so you have the URL for the frontend configuration.

1. Go to Render Dashboard → New → Web Service
2. Connect your repository
3. Configure the service:
   - **Name:** `nanowork-backend` (or your preferred name)
   - **Region:** Oregon (or your preferred region)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free (or your preferred plan)

4. Add environment variables (click "Advanced" or "Environment"):
   ```
   NODE_ENV=production
   PORT=3000
   SUPABASE_URL=<your-supabase-url>
   SUPABASE_SERVICE_KEY=<your-service-key>
   SUPABASE_ANON_KEY=<your-anon-key>
   ANTHROPIC_API_KEY=<your-anthropic-key>
   STRIPE_SECRET_KEY=<your-stripe-secret>
   STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
   INTERNAL_TOKEN=<generate-a-random-token>
   FRONTEND_URL=https://nanowork-frontend.onrender.com
   ```

5. Click "Create Web Service"
6. Wait for deployment to complete
7. **Copy the backend URL** (e.g., `https://nanowork-backend.onrender.com`)

### 2. Deploy Frontend

1. Go to Render Dashboard → New → Web Service
2. Connect your repository (same repo)
3. Configure the service:
   - **Name:** `nanowork-frontend` (or your preferred name)
   - **Region:** Oregon (or your preferred region)
   - **Branch:** `main`
   - **Root Directory:** `apps/web`
   - **Runtime:** Node
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free (or your preferred plan)

4. Add environment variables:
   ```
   NODE_ENV=production
   PORT=3000
   VITE_API_URL=https://nanowork-backend.onrender.com
   VITE_SITE_URL=https://nanowork-frontend.onrender.com
   VITE_SUPABASE_URL=<your-supabase-url>
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```
   
   **Important:** Replace `https://nanowork-backend.onrender.com` with your actual backend URL from step 1.

5. Click "Create Web Service"
6. Wait for deployment to complete

### 3. Update Backend CORS (if needed)

If you used a different frontend URL, update the backend's `FRONTEND_URL` environment variable:

1. Go to your backend service on Render
2. Environment → Edit `FRONTEND_URL`
3. Set it to your frontend URL (e.g., `https://nanowork-frontend.onrender.com`)
4. Save (this will trigger a redeploy)

### 4. Configure Custom Domain (Optional)

If you have a custom domain:

#### Backend
1. Go to backend service → Settings → Custom Domain
2. Add your domain (e.g., `api.nanowork.app`)
3. Update DNS with Render's provided CNAME
4. Update frontend's `VITE_API_URL` to use the custom domain

#### Frontend
1. Go to frontend service → Settings → Custom Domain
2. Add your domain (e.g., `nanowork.app`)
3. Update DNS with Render's provided CNAME
4. Update backend's `FRONTEND_URL` to match

### 5. Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://nanowork-backend.onrender.com/webhooks/stripe`
3. Select events to listen for (payment intents, subscriptions, etc.)
4. Copy the webhook signing secret
5. Update backend's `STRIPE_WEBHOOK_SECRET` environment variable on Render

### 6. Test the Deployment

1. Visit your frontend URL
2. Try signing up/logging in
3. Check that API calls work
4. Monitor backend logs on Render for any errors

## Using render.yaml Files

Alternatively, you can use the included `render.yaml` files for deployment:

### Backend
Point Render to `backend/render.yaml` when creating the service.

### Frontend
Point Render to `apps/web/render.yaml` when creating the service.

**Note:** You'll still need to add environment variables manually through the Render dashboard, as sensitive values should not be in the YAML files.

## Monitoring and Logs

- **Backend logs:** Render Dashboard → nanowork-backend → Logs
- **Frontend logs:** Render Dashboard → nanowork-frontend → Logs
- **Health check:** `https://nanowork-backend.onrender.com/health`

## Common Issues

### Frontend shows "Failed to fetch" errors
- Check that `VITE_API_URL` is set correctly
- Verify backend is deployed and healthy
- Check backend CORS configuration includes frontend URL

### Backend shows CORS errors
- Ensure `FRONTEND_URL` environment variable matches your frontend URL
- Check `backend/src/index.ts` allowed origins array

### Render free tier sleep
- Free tier services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- Consider paid tier for production use

## Updating the Deployment

Render automatically redeploys when you push to your configured branch (`main`).

To manually trigger a redeploy:
1. Go to service → Manual Deploy
2. Click "Deploy latest commit"

## Environment Variables Reference

### Backend Required Variables
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `INTERNAL_TOKEN`
- `FRONTEND_URL`

### Frontend Required Variables
- `VITE_API_URL`
- `VITE_SITE_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Security Notes

1. Never commit secrets to the repository
2. Use Render's environment variables for all sensitive values
3. Rotate secrets regularly
4. Use HTTPS only (Render provides this automatically)
5. Keep `INTERNAL_TOKEN` secure - it's used for internal API authentication
