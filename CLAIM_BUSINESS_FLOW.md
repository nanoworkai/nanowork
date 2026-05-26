# Claim Business Flow - Implementation Summary

## Overview
Complete claim flow: User clicks claim on homepage → forced to sign up → business appears in their dashboard automatically.

## Changes Made

### 1. Frontend Components

#### MarketplaceCard.tsx
- Updated `handleClaimBusiness()` to store business data in localStorage
- Redirects to `/login?intent=claim` instead of showing alert

#### Login.tsx
- Detects `intent=claim` query parameter and switches to signup tab
- Shows claim banner with business name above signup form
- After successful signup, creates company record in Supabase
- Stores business data in company settings
- Redirects to `/dashboard?claimed=true`

#### ClaimBusinessModal.tsx
- Updated unauthenticated flow to match MarketplaceCard approach
- Stores pending claim in localStorage before redirect

#### Create.tsx (Dashboard)
- Added success toast that appears when `?claimed=true` parameter is present
- Toast auto-hides after 5 seconds
- Shows confirmation: "Business Claimed Successfully!"

### 2. Database Migration

**File:** `supabase/migrations/020_add_claimed_at.sql`

Adds two new columns to the `companies` table:
- `claimed_at` (timestamptz) - Tracks when business was claimed
- `source` (text) - Tracks origin: 'marketplace', 'manual', 'claimed', 'imported'

**To apply:**
```bash
# Run in Supabase SQL editor or via CLI
psql $DATABASE_URL -f supabase/migrations/020_add_claimed_at.sql
```

Or copy/paste the SQL directly into Supabase dashboard SQL editor.

### 3. Data Flow

```
1. User clicks "Claim" on business card
   ↓
2. Business data saved to localStorage as 'pending_claim'
   {
     businessId: string,
     businessName: string,
     businessData: Business object
   }
   ↓
3. Redirect to /login?intent=claim
   ↓
4. Login page shows signup tab with claim banner
   ↓
5. User creates account
   ↓
6. After signup success:
   - Insert company record with owner_id = new user
   - Set claimed_at = now()
   - Set source = 'claimed'
   - Store original business data in settings.originalBusinessData
   - Clear localStorage
   - Redirect to /dashboard?claimed=true
   ↓
7. Dashboard shows success toast
   - "Business Claimed Successfully!"
   - Auto-hides after 5 seconds
```

## Testing Steps

1. **Start on homepage**
   - Navigate to homepage with business cards

2. **Click claim button**
   - Verify localStorage has 'pending_claim' data
   - Verify redirect to `/login?intent=claim`

3. **Check signup page**
   - Verify signup tab is active (not signin)
   - Verify claim banner shows business name
   - Verify banner shows: "Claiming Business: [Business Name]"

4. **Sign up with new account**
   - Fill in name, email, password
   - Submit form

5. **Verify redirect**
   - Should redirect to `/dashboard?claimed=true`

6. **Check dashboard**
   - Success toast should appear
   - Toast should show "Business Claimed Successfully!"
   - Toast should auto-hide after 5 seconds

7. **Verify database**
   ```sql
   SELECT id, name, owner_id, claimed_at, source
   FROM companies
   WHERE source = 'claimed'
   ORDER BY created_at DESC
   LIMIT 1;
   ```

## Database Schema

```sql
-- Companies table now includes:
ALTER TABLE companies ADD COLUMN claimed_at TIMESTAMPTZ;
ALTER TABLE companies ADD COLUMN source TEXT 
  CHECK (source IN ('marketplace', 'manual', 'claimed', 'imported'));
```

## Next Steps (Future Enhancements)

1. **Show claimed business in dashboard**
   - Add company list view
   - Highlight newly claimed business
   - Show business details and metrics

2. **Email confirmation**
   - Send welcome email with claimed business details
   - Include next steps guide

3. **Payment integration**
   - Add Stripe checkout for paid businesses
   - Handle success/cancel redirects

4. **Admin dashboard**
   - Track claim conversion rates
   - Monitor which businesses get claimed most

## Files Modified

- `apps/web/src/components/MarketplaceCard.tsx`
- `apps/web/src/components/ClaimBusinessModal.tsx`
- `apps/web/src/pages/Login.tsx`
- `apps/web/src/dashboard/Create.tsx`
- `supabase/migrations/020_add_claimed_at.sql` (new)

## Dependencies

No new dependencies added. Uses existing:
- `@supabase/supabase-js` for database operations
- `react-router-dom` for navigation
- `lucide-react` for icons
