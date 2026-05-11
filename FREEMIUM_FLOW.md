# Freemium Conversion Flow - Implementation Summary

## Overview

Implemented a complete freemium conversion funnel where users can:
1. **Homepage** → Type company idea → Click "EXECUTE"
2. **Preview Generated** → View limited but usable preview
3. **Paywall** → Unlock full build for 100 credits
4. **Full Access** → Complete company website + dashboard

---

## User Journey

### Step 1: Homepage (Unauthenticated)
- User lands on homepage
- Types business idea in terminal-style input
- Clicks **"EXECUTE"** button
- ✅ **No login required** at this stage

### Step 2: Build Generation
- Frontend calls `POST /api/build/preview` (unauthenticated endpoint)
- Backend generates company using Claude AI:
  - Company name
  - Tagline
  - 7 departments (Legal, Brand, Web, Marketing, Sales, Finance, Ops)
  - Tasks per department
  - First outputs
- Build saved to database with status `preview`
- Returns `build_id` and `preview_url`

### Step 3: Preview Page (`/preview/:buildId`)
- Shows **limited but usable preview**:
  - ✅ Company name and tagline
  - ✅ First 3 departments fully visible
  - ✅ Remaining 4 departments blurred/locked
  - ✅ Each visible dept shows first 2 tasks (+ X more locked)

- **Prominent paywall overlay**:
  - Cost: **100 credits** to unlock
  - Benefits listed:
    - Complete website with all pages
    - Downloadable assets
    - Full department outputs
    - Editable company dashboard

- **CTAs based on auth status**:
  - **Not logged in**: "CREATE FREE ACCOUNT" (500 free credits on signup)
  - **Logged in, insufficient credits**: "BUY CREDITS"
  - **Logged in, sufficient credits**: "UNLOCK FOR 100 CREDITS"

### Step 4: Unlock Flow

**If not authenticated:**
- Click "CREATE FREE ACCOUNT" → `/login?redirect=/preview/{buildId}`
- User signs up → gets 500 free credits
- Returns to preview page
- Now sees "UNLOCK" button

**If authenticated with credits:**
- Click "UNLOCK FOR 100 CREDITS"
- Frontend calls `POST /api/build/{buildId}/unlock`
- Backend:
  - Checks user credits (must have ≥100)
  - Deducts 100 credits
  - Logs transaction in `credits_transactions`
  - Updates build status to `unlocked`
  - Associates build with user
- Redirects to `/dashboard/builds/{buildId}` (full view)

**If authenticated but insufficient credits:**
- Click "BUY CREDITS"
- Redirects to `/dashboard/plan?from=preview&buildId={buildId}`
- User purchases credits
- Returns to preview page
- Can now unlock

### Step 5: Full Build Access
- User views complete company dashboard at `/dashboard/builds/{buildId}`
- All 7 departments fully visible
- All tasks and outputs visible
- Export and launch options available

---

## Database Schema

### New Table: `builds`

```sql
CREATE TABLE builds (
  id UUID PRIMARY KEY,
  prompt TEXT NOT NULL,
  company_name TEXT,
  tagline TEXT,
  status TEXT CHECK (status IN ('preview', 'generating', 'unlocked', 'failed')),
  preview_url TEXT,
  full_url TEXT,
  credits_cost INTEGER DEFAULT 100,
  user_id UUID REFERENCES auth.users(id),  -- nullable for anonymous previews
  build_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  unlocked_at TIMESTAMPTZ,
  metadata JSONB
);
```

### Migration File
- `supabase/migrations/20260511000001_preview_builds.sql`

---

## API Endpoints

### 1. `POST /api/build/preview` (Unauthenticated)
**Request:**
```json
{
  "prompt": "FINTECH PAYMENT INFRA | $10M ARR TARGET"
}
```

**Response:**
```json
{
  "build_id": "uuid",
  "preview_url": "/preview/uuid",
  "company_name": "PayFlow",
  "tagline": "Infrastructure for the next generation of payments",
  "credits_cost": 100
}
```

### 2. `GET /api/build/:buildId` (Public)
Returns build data for preview page.

### 3. `POST /api/build/:buildId/unlock` (Authenticated)
**Response:**
```json
{
  "success": true,
  "full_url": "/dashboard/builds/uuid",
  "credits_remaining": 400
}
```

---

## Frontend Components

### 1. **Home.tsx** (Updated)
- Changed `submit()` to call `/api/build/preview`
- Redirects to `/preview/:buildId` instead of dashboard
- Handles API errors gracefully

### 2. **PreviewPage.tsx** (New)
- Fetches build data by ID
- Shows usable but limited preview
- Dynamic paywall based on auth + credit status
- Handles unlock flow

### 3. **BuildView.tsx** (New)
- Dashboard view for unlocked builds
- Shows all departments and tasks
- Export and launch buttons

### 4. **App.tsx** (Updated)
- Added route: `/preview/:buildId`
- Added route: `/dashboard/builds/:buildId`

---

## Credits System Integration

### Credit Costs
- **Preview build**: Free (no credits deducted)
- **Unlock full build**: 100 credits

### Credit Sources
- **New signup**: 500 free credits
- **Purchase**: Via `/dashboard/plan` (Stripe integration)

### Credit Transactions
- Logged in `credits_transactions` table
- Tracks: amount, type (credit/debit), description, balance_after

---

## Conversion Metrics to Track

1. **Preview Generation Rate**: Homepage submits → Preview created
2. **Preview View Duration**: Time spent on preview page
3. **Auth Conversion**: Anonymous preview → Signup
4. **Unlock Rate**: Previews viewed → Unlocks purchased
5. **Credit Purchase Rate**: Insufficient credits → Purchase
6. **Average Revenue Per Preview**: Total credits spent / previews generated

---

## Testing Checklist

### Local Testing

1. **Unauthenticated Flow**
   ```bash
   # Start backend
   cd apps/api
   python -m uvicorn app.main:app --reload --port 8000
   
   # Start frontend
   cd apps/web
   npm run dev
   ```

   - [ ] Visit http://localhost:5173
   - [ ] Type company idea
   - [ ] Click EXECUTE
   - [ ] Verify redirect to `/preview/:buildId`
   - [ ] Verify 3 departments visible, 4 locked
   - [ ] Click "CREATE FREE ACCOUNT"
   - [ ] Sign up → gets 500 credits
   - [ ] Returns to preview page
   - [ ] Click "UNLOCK FOR 100 CREDITS"
   - [ ] Verify redirect to `/dashboard/builds/:buildId`
   - [ ] Verify all 7 departments visible

2. **Database Migration**
   ```bash
   # Apply migration
   supabase db push
   
   # Verify table exists
   # In Supabase SQL Editor:
   SELECT * FROM builds LIMIT 1;
   ```

3. **Insufficient Credits**
   - [ ] Manually set user credits to 50 in database
   - [ ] Try to unlock 100-credit build
   - [ ] Verify "Insufficient credits" error
   - [ ] Verify redirect to purchase page

---

## Production Deployment

### 1. Apply Database Migration
```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### 2. Deploy Backend (Render)
- Push code to GitHub
- Render auto-deploys from `render.yaml`
- No new env vars needed (uses existing `ANTHROPIC_API_KEY`)

### 3. Deploy Frontend (Cloudflare Pages)
- Push code to GitHub
- Cloudflare Pages auto-deploys
- Verify `VITE_API_URL` points to Render backend

### 4. Verify RLS Policies
In Supabase SQL Editor:
```sql
-- Check builds table policies
SELECT * FROM pg_policies WHERE tablename = 'builds';
```

Should show:
- `builds_create_anonymous` - Anyone can INSERT
- `builds_select_own` - Users see own builds
- `builds_update_own` - Users update own builds

---

## Next Steps / Enhancements

### Phase 2 Improvements
1. **Email Preview Link**
   - Send preview URL via email for later access
   - "Save this preview for later"

2. **Preview Analytics**
   - Track which departments get viewed most
   - Heatmaps on preview page
   - A/B test different credit costs

3. **Social Sharing**
   - "Share your preview" button
   - Generate OG image for preview
   - Twitter/LinkedIn cards

4. **Referral System**
   - "Share and get 100 credits"
   - Track referral conversions
   - Reward both referrer and referee

5. **Preview Expiry**
   - Previews expire after 7 days (create urgency)
   - "Unlock before it expires" messaging

6. **Progressive Unlock**
   - Unlock individual departments (25 credits each)
   - "Unlock just Marketing department"
   - Lower barrier to first purchase

---

## Files Modified/Created

### Backend (Python/FastAPI)
- ✅ `apps/api/app/routers/build.py` - Added preview + unlock endpoints
- ✅ `supabase/migrations/20260511000001_preview_builds.sql` - New builds table

### Frontend (React/TypeScript)
- ✅ `apps/web/src/pages/Home.tsx` - Updated submit() to call preview API
- ✅ `apps/web/src/pages/PreviewPage.tsx` - New preview page with paywall
- ✅ `apps/web/src/dashboard/BuildView.tsx` - New full build view
- ✅ `apps/web/src/App.tsx` - Added routes

### Documentation
- ✅ `FREEMIUM_FLOW.md` - This file

---

## Support

If users encounter issues:
1. Check browser console for API errors
2. Verify backend logs in Render dashboard
3. Check Supabase logs for database errors
4. Ensure credits_balance is correct in profiles table

---

## Success Metrics (First 30 Days)

**Goals:**
- [ ] 1,000 preview builds generated
- [ ] 20% signup conversion (200 new users)
- [ ] 10% unlock conversion (100 unlocked builds)
- [ ] $1,000 in credit purchases

**Key Indicators:**
- Preview bounce rate < 50%
- Average time on preview page > 2 minutes
- Return rate (users coming back to unlock) > 30%
