# 🎯 Next Steps - Implementation Plan

## Current Status
- ✅ Database schema v2 ready (`TABLES_FIXED.sql`)
- ✅ TypeScript types created
- ✅ Stripe webhooks implemented
- ✅ Breaking changes documented
- ⚠️ AuthContext reverted to phone auth (needs update)
- ⚠️ Database not yet applied

---

## Step 1: Apply Database Migration (Do This First!)

### Apply the Schema
```bash
1. Open Supabase Dashboard: https://app.supabase.com
2. Go to SQL Editor
3. Copy all of: supabase/TABLES_FIXED.sql
4. Paste into new query
5. Click "Run" (Cmd+Enter)
6. Wait 30-60 seconds
```

### Verify Success
Run this query in SQL Editor:
```sql
-- Should return 18
SELECT COUNT(*) as tables FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should return owner_id, not user_id
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'companies' AND column_name LIKE '%_id';

-- Should return 4 (new columns)
SELECT COUNT(*) FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('credits_balance', 'monthly_company_limit', 'subscription_status', 'avatar_url');
```

**Expected:**
- ✅ tables = 18
- ✅ companies has: id, owner_id (not user_id)
- ✅ profiles has 4 new columns

---

## Step 2: Update AuthContext (After DB Applied)

Your AuthContext was reverted to phone auth, but the database uses email auth. Here's what needs to be updated:

### Current Issues:
```typescript
// ❌ Current (Phone auth)
phone: string
requestOtp(phone: string)
verifyOtp(phone: string, token: string)

// ✅ Should be (Email auth matching database)
email: string
signUp(email: string, password: string)
signIn(email: string, password: string)
```

### Action Required:
I'll create an updated AuthContext that:
- Uses email/password authentication (matching your database)
- Loads multiple companies per user
- Includes credits tracking
- Supports team member companies

**Do you want me to update AuthContext now?** 
- Option A: Update to email/password auth (recommended)
- Option B: Keep phone auth and update database to match
- Option C: Support both phone AND email auth

---

## Step 3: Add Stripe Routes to Worker

The worker was modified and doesn't include the Stripe routes I created. We need to add:

```typescript
// apps/worker/src/index.ts
import stripe from './routes/stripe'
import stripeWebhooks from './routes/stripe-webhooks'

app.route('/api/stripe', stripe)
app.route('/api/stripe/webhooks', stripeWebhooks)
```

---

## Step 4: Install Dependencies

### Worker needs Stripe SDK:
```bash
cd apps/worker
npm install stripe
```

---

## Step 5: Configure Stripe

### Create Products in Stripe Dashboard
1. **Starter Plan**
   - Monthly: $29/mo
   - Yearly: $290/yr

2. **Growth Plan**
   - Monthly: $99/mo
   - Yearly: $990/yr

3. **Scale Plan**
   - Monthly: $299/mo
   - Yearly: $2,990/yr

4. **Credits Packages**
   - 1,000 credits: $10
   - 5,000 credits: $45
   - 20,000 credits: $160

### Copy Price IDs
After creating products, update:
- `apps/web/src/lib/stripe.ts` → `PRICE_IDS`
- `apps/worker/src/routes/stripe-webhooks.ts` → `getPlanFromPriceId()`

### Add Webhook Endpoint
In Stripe Dashboard:
- Endpoint URL: `https://api.nanowork.app/api/stripe/webhooks`
- Events to listen:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `checkout.session.completed`

Copy webhook signing secret to env var.

---

## Step 6: Environment Variables

### Frontend (.env.local)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=https://api.nanowork.app
```

### Worker (Cloudflare Secrets)
```bash
cd apps/worker
npx wrangler secret put STRIPE_SECRET_KEY
# Enter: sk_test_...

npx wrangler secret put STRIPE_WEBHOOK_SECRET
# Enter: whsec_...

npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# Enter: eyJ... (service role, not anon key)
```

---

## Step 7: Test Migration

### Test Credits System
```sql
-- Create test user profile (in Supabase SQL Editor)
INSERT INTO profiles (id, email, credits_balance) 
VALUES (auth.uid(), 'test@example.com', 100)
ON CONFLICT (id) DO UPDATE SET credits_balance = 100;

-- Deduct credits (trigger should auto-update balance)
INSERT INTO credits_transactions (user_id, type, amount, balance_after, description)
VALUES (auth.uid(), 'usage', -10, 90, 'Test deduction');

-- Verify balance updated
SELECT credits_balance FROM profiles WHERE id = auth.uid();
-- Should return: 90
```

### Test Company Creation
```sql
-- Create company
INSERT INTO companies (owner_id, name, description)
VALUES (auth.uid(), 'Test Company', 'Testing schema');

-- Verify
SELECT id, name, owner_id FROM companies WHERE owner_id = auth.uid();
```

---

## Step 8: Deploy

### Worker
```bash
cd apps/worker
npx wrangler deploy
```

### Frontend
```bash
cd apps/web
npm run build
npx wrangler pages deploy dist
```

---

## Step 9: Test Stripe Webhooks

### Local Testing
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local worker
stripe listen --forward-to http://localhost:8787/api/stripe/webhooks

# In another terminal, trigger test events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
```

### Check Database
After triggering webhooks, verify in Supabase:
```sql
-- Check subscriptions table
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5;

-- Check invoices table
SELECT * FROM invoices ORDER BY created_at DESC LIMIT 5;

-- Check credits transactions
SELECT * FROM credits_transactions ORDER BY created_at DESC LIMIT 5;
```

---

## Step 10: Build UI Components

Priority order:

### 1. Company Switcher (High Priority)
```typescript
// apps/web/src/components/CompanySwitcher.tsx
import { useAuth } from '../context/AuthContext'

export function CompanySwitcher() {
  const { companies, activeCompany, setActiveCompany } = useAuth()
  
  return (
    <select 
      value={activeCompany?.id} 
      onChange={(e) => setActiveCompany(e.target.value)}
    >
      {companies.map(company => (
        <option key={company.id} value={company.id}>
          {company.name}
        </option>
      ))}
    </select>
  )
}
```

### 2. Credits Display (High Priority)
```typescript
// apps/web/src/components/CreditsDisplay.tsx
import { useAuth } from '../context/AuthContext'
import { formatCredits } from '../lib/stripe'

export function CreditsDisplay() {
  const { profile } = useAuth()
  
  return (
    <div>
      <span>{formatCredits(profile.creditsBalance)} credits</span>
      <button onClick={() => /* open purchase modal */}>
        Buy More
      </button>
    </div>
  )
}
```

### 3. Billing Page (Medium Priority)
- Current plan display
- Usage statistics
- Invoice history
- "Manage Billing" button → Stripe portal

### 4. Team Invitations (Medium Priority)
- Invite member form
- Pending invitations list
- Member list with roles

### 5. Custom Domains (Low Priority)
- Add domain form
- DNS records display
- Verification status

---

## Decision Points

### 1. Authentication Method
**Current:** Phone OTP  
**Database supports:** Email/password  
**Question:** Which do you want to use?

**Options:**
- A) Switch to email/password (recommended - matches DB schema)
- B) Keep phone OTP (need to update DB schema)
- C) Support both

**My recommendation:** Switch to email/password. It's:
- More standard for B2B SaaS
- Better for team invitations
- Matches the database schema we built
- Easier for account recovery

### 2. Credits Purchase Flow
**Question:** Where should users buy credits?

**Options:**
- A) Dedicated "/buy-credits" page
- B) Modal from credits display
- C) Part of settings/billing page

**My recommendation:** Modal from credits display for quick access + link in billing page.

### 3. Plan Upgrade Flow
**Question:** How should users upgrade?

**Options:**
- A) Pricing page with comparison table
- B) In-app upgrade prompts when hitting limits
- C) Both

**My recommendation:** Both - pricing page for browsing, prompts when hitting limits.

---

## Quick Wins (Can Do Immediately)

These don't require database or UI changes:

1. ✅ Deploy worker with Stripe routes
2. ✅ Set environment variables
3. ✅ Create Stripe products
4. ✅ Test webhooks locally

---

## What Should I Do Next?

Please choose:

**Option 1: Update AuthContext** (Recommended)
- I'll update it to email/password auth
- Match the database schema
- Add companies array, credits, etc.

**Option 2: Update Database Schema**
- Revert to phone authentication
- Adjust table structure
- Keep phone-based auth

**Option 3: Build UI Components First**
- Create company switcher
- Create credits display
- Create billing page

**Option 4: Configure & Test Stripe**
- Set up products
- Test webhooks
- Verify integration

Let me know which path you want to take, and I'll execute it! 🚀
