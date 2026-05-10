# 🚀 Quick Start - Get V2 Running in 10 Minutes

## Current Situation
- ✅ You have phone OTP authentication working
- ✅ You have a basic profiles table
- ⚠️ Need to add v2 features (credits, companies, billing)

## Step 1: Update Profiles Table (2 minutes)

```bash
1. Open Supabase Dashboard → SQL Editor
2. Copy ALL of: supabase/ADD_V2_COLUMNS.sql
3. Paste and click "Run"
4. Verify success message appears
```

**This adds:**
- credits_balance (everyone gets 100 free credits)
- monthly_company_limit
- subscription fields
- New status fields

**Safe to run:**
- ✅ Won't break existing data
- ✅ Won't affect current authentication
- ✅ Can run multiple times

---

## Step 2: Replace AuthContext (1 minute)

```bash
# Backup old file
mv apps/web/src/context/AuthContext.tsx apps/web/src/context/AuthContext.old.tsx

# Use new v2 version
mv apps/web/src/context/AuthContextV2.tsx apps/web/src/context/AuthContext.tsx
```

**What this adds:**
- ✅ Companies array
- ✅ Credits tracking
- ✅ Company switcher support
- ✅ Keeps phone OTP authentication
- ✅ Backward compatible with existing profiles

---

## Step 3: Create Companies Table (1 minute)

Run this in Supabase SQL Editor:

```sql
-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  slug TEXT,
  industry TEXT,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'initializing',
  subdomain TEXT,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  mrr DECIMAL(12,2) DEFAULT 0,
  total_spend DECIMAL(12,2) DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_companies_owner_id ON companies(owner_id);
CREATE INDEX idx_companies_status ON companies(status);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own companies"
  ON companies FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create companies"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own companies"
  ON companies FOR UPDATE
  USING (auth.uid() = owner_id);
```

---

## Step 4: Create Credits Table (1 minute)

```sql
-- Create credits_transactions table
CREATE TABLE IF NOT EXISTS credits_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  usage_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credits_user_id ON credits_transactions(user_id);
CREATE INDEX idx_credits_created_at ON credits_transactions(created_at DESC);

-- Enable RLS
ALTER TABLE credits_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON credits_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Auto-update balance trigger
CREATE OR REPLACE FUNCTION update_credits_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET credits_balance = credits_balance + NEW.amount
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_credits
  AFTER INSERT ON credits_transactions
  FOR EACH ROW EXECUTE FUNCTION update_credits_balance();
```

---

## Step 5: Test It (5 minutes)

### Test 1: Check Your Credits
```sql
SELECT id, phone, credits_balance FROM profiles WHERE id = auth.uid();
-- Should show: 100 credits
```

### Test 2: Create a Company
```sql
INSERT INTO companies (owner_id, name, description)
VALUES (auth.uid(), 'My Test Company', 'Testing v2 features');

SELECT * FROM companies WHERE owner_id = auth.uid();
```

### Test 3: Deduct Credits
```sql
INSERT INTO credits_transactions (user_id, type, amount, balance_after, description)
VALUES (auth.uid(), 'usage', -10, 90, 'Test deduction');

-- Check balance updated automatically
SELECT credits_balance FROM profiles WHERE id = auth.uid();
-- Should show: 90 credits
```

---

## ✅ You're Ready!

After these 5 steps, you have:
- ✅ Credits system working
- ✅ Multiple companies support
- ✅ Updated AuthContext with v2 features
- ✅ Phone OTP still working
- ✅ Backward compatible

---

## What You Can Now Build

### 1. Company Switcher
```typescript
import { useAuth } from './context/AuthContext'

function CompanySwitcher() {
  const { companies, activeCompany, setActiveCompany } = useAuth()
  
  return (
    <select 
      value={activeCompany?.id} 
      onChange={(e) => setActiveCompany(e.target.value)}
    >
      {companies.map(c => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  )
}
```

### 2. Credits Display
```typescript
function CreditsDisplay() {
  const { profile } = useAuth()
  
  return (
    <div>
      {profile?.creditsBalance || 0} credits
    </div>
  )
}
```

### 3. Create Company Flow
```typescript
async function createCompany(name: string, description: string) {
  const { user, deductCredits } = useAuth()
  
  // Check credits
  const success = await deductCredits(100, 'Company creation', 'company_creation')
  
  if (!success) {
    alert('Not enough credits')
    return
  }
  
  // Create company
  const { data } = await supabase
    .from('companies')
    .insert({ owner_id: user.id, name, description })
    .select()
    .single()
  
  return data
}
```

---

## Next: Add More Tables (Optional)

Want subscriptions and billing? Run: `supabase/TABLES_FIXED.sql`

This adds:
- subscriptions table
- invoices table
- payment_methods table
- company_members table (team collaboration)
- custom_domains table

**But you can skip this for now** - the basic v2 features work with just:
- profiles (updated) ✅
- companies ✅
- credits_transactions ✅

---

## Troubleshooting

### "Column already exists"
✅ This is fine! The script is idempotent.

### "Credits balance not updating"
Check trigger exists:
```sql
SELECT trigger_name FROM information_schema.triggers 
WHERE event_object_table = 'credits_transactions';
```

### "Can't see companies"
Make sure you're authenticated:
```sql
SELECT auth.uid();  -- Should return your user ID
```

---

## 🎉 Done!

You now have:
- Multi-company support
- Credits system
- Updated AuthContext
- Phone OTP still working

**Total time:** ~10 minutes  
**Breaking changes:** None!  
**Data loss:** Zero

Your app continues to work exactly as before, but now with v2 features ready to use! 🚀
