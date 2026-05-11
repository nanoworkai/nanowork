# Database Migration Guide - v1 to v2

## 🔧 What This Fixed

### 1. **Breaking Change: `user_id` → `owner_id`**
**Problem:** The `companies` table used `user_id` which is confusing when adding team collaboration.

**Solution:**
```sql
-- Automatically renames user_id to owner_id if it exists
ALTER TABLE companies RENAME COLUMN user_id TO owner_id;
```

**Impact:**
- ✅ All RLS policies updated to use `owner_id`
- ✅ Foreign key constraints preserved
- ✅ Indexes automatically renamed

---

### 2. **Table Creation Errors**
**Common Supabase errors that were fixed:**

#### Error: "Column already exists"
**Problem:** Running the script multiple times tried to add existing columns.

**Solution:** Used `IF NOT EXISTS` and `ADD COLUMN IF NOT EXISTS`
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 0;
```

#### Error: "Table already exists"
**Problem:** Script failed if tables were already created.

**Solution:** Used `CREATE TABLE IF NOT EXISTS`
```sql
CREATE TABLE IF NOT EXISTS company_members ( ... );
```

#### Error: "Constraint already exists"
**Problem:** Re-running script tried to create duplicate constraints.

**Solution:** Drop old constraints before creating new ones
```sql
DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_plan_check 
  CHECK (plan IN ('free', 'starter', 'growth', 'scale', 'enterprise'));
```

#### Error: "Policy already exists"
**Problem:** RLS policies couldn't be recreated.

**Solution:** Drop all policies before creating them
```sql
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT ...
```

---

### 3. **Table Creation Order**
**Problem:** Foreign key references failed if tables didn't exist yet.

**Solution:** Created tables in proper dependency order:
1. `profiles` (no dependencies)
2. `companies` (depends on profiles)
3. `company_members` (depends on companies and profiles)
4. `custom_domains` (depends on companies)
5. `agents` (depends on companies)
6. `agent_emails` (depends on agents and companies)
7. `credits_transactions` (depends on profiles and companies)
8. `subscriptions` (depends on profiles)
9. `invoices` (depends on profiles and subscriptions)
10. `payment_methods` (depends on profiles)
11. `account_deletions` (depends on profiles)
12. Remaining tables (agents, activities, transactions, etc.)

---

### 4. **Unique Index Issues**
**Problem:** Creating unique indexes on NULL values caused errors.

**Solution:** Added `WHERE column IS NOT NULL` for nullable unique columns
```sql
CREATE UNIQUE INDEX idx_companies_slug 
  ON companies(slug) 
  WHERE slug IS NOT NULL;
```

This allows multiple NULL values but ensures uniqueness for non-NULL values.

---

### 5. **RLS Policy Conflicts**
**Problem:** Team member policies couldn't reference `company_members` table that didn't exist yet.

**Solution:** Created policies in two passes:
1. First pass: Create basic owner policies
2. Second pass: Add team member policies after `company_members` exists

```sql
-- First: Create companies table with owner policy only
CREATE POLICY "Owners can view own companies" ON companies ...

-- Later: Add team member policy after company_members exists
CREATE POLICY "Team members can view their companies" ON companies ...
```

---

## 📋 How to Apply This Migration

### Option 1: Fresh Database (Recommended for Dev)
```bash
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy entire TABLES_FIXED.sql
4. Paste and click "Run"
5. Verify all 18 tables created
```

### Option 2: Existing Database with Data
```bash
1. **BACKUP YOUR DATA FIRST**
   - Export all tables from Supabase
   - Save locally

2. Run TABLES_FIXED.sql
   - It will update existing tables
   - It will create missing tables
   - Data will be preserved

3. Verify Migration
   - Check table list (should see 18 tables)
   - Check companies.owner_id exists
   - Check profiles has new columns
```

---

## ✅ Verification Checklist

After running the migration, verify:

### Tables Created (18 total)
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Should return:**
- [ ] account_deletions
- [ ] agent_activities
- [ ] agent_emails
- [ ] agents
- [ ] assets
- [ ] communications
- [ ] companies
- [ ] company_members
- [ ] credits_transactions
- [ ] custom_domains
- [ ] financial_infrastructure
- [ ] invoices
- [ ] metrics
- [ ] payment_methods
- [ ] profiles
- [ ] prospects
- [ ] subscriptions
- [ ] transactions

### Breaking Change Applied
```sql
-- Check companies table has owner_id (not user_id)
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'companies' 
AND column_name IN ('user_id', 'owner_id');
```

**Should return:** Only `owner_id`

### Profiles Table Updated
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles'
AND column_name IN ('credits_balance', 'monthly_company_limit', 'subscription_status');
```

**Should return:** All 3 columns

### Triggers Created
```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

**Should include:**
- update_profiles_updated_at
- update_companies_updated_at
- check_company_limit_before_insert
- update_user_credits_after_transaction

### RLS Policies
```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Should have policies for all 18 tables**

---

## 🔄 What Changed in Each Table

### profiles
**Added columns:**
- avatar_url
- status (active/suspended/deleted)
- email_verified
- subscription_status
- subscription_id
- trial_ends_at
- subscription_ends_at
- credits_balance
- monthly_company_limit
- total_companies_created
- timezone
- notification_preferences
- last_login_at
- deleted_at

**Updated constraints:**
- plan enum now includes 'enterprise'

### companies
**Renamed:**
- user_id → owner_id

**Added columns:**
- slug
- logo_url
- subdomain
- custom_domain_id
- total_spend
- settings
- deleted_at

**Updated constraints:**
- status enum includes 'deleted'
- website_status enum added

**Updated policies:**
- Now supports team member access

---

## 🚨 Troubleshooting

### Error: "permission denied for table profiles"
**Fix:** Make sure you're using the Supabase service role key, not anon key.

### Error: "relation profiles does not exist"
**Fix:** Run the entire script. Don't run sections individually.

### Error: "null value in column violates not-null constraint"
**Fix:** The script handles this with DEFAULT values. If you see this, check your data.

### Error: "duplicate key value violates unique constraint"
**Fix:** You have duplicate data. Clean it before migration:
```sql
-- Find duplicates
SELECT email, COUNT(*) 
FROM profiles 
GROUP BY email 
HAVING COUNT(*) > 1;
```

### Error: "function already exists"
**Fix:** The script drops functions before creating. If you still see this:
```sql
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS check_company_creation_limit CASCADE;
DROP FUNCTION IF EXISTS update_credits_balance CASCADE;
```

Then run the script again.

---

## 📊 Before vs After

### Before Migration
```
profiles
  - email, name, plan
  - stripe_customer_id
  
companies
  - user_id (FK to profiles)
  - name, description, status
```

### After Migration
```
profiles
  - email, name, plan (+ enterprise)
  - stripe_customer_id
  + avatar_url, status, email_verified
  + subscription_status, subscription_id
  + trial_ends_at, subscription_ends_at
  + credits_balance, monthly_company_limit
  + timezone, notification_preferences
  + last_login_at, deleted_at

companies
  - owner_id (renamed from user_id)
  - name, description, status (+ deleted)
  + slug, logo_url, subdomain
  + custom_domain_id, total_spend
  + settings, deleted_at

+ company_members (team collaboration)
+ custom_domains (domain management)
+ agent_emails (email infrastructure)
+ credits_transactions (credits ledger)
+ subscriptions (Stripe subscriptions)
+ invoices (billing)
+ payment_methods (payment cards)
+ account_deletions (GDPR)
```

---

## 🎯 Post-Migration Tasks

### 1. Update Frontend Code
**File:** `apps/web/src/context/AuthContext.tsx`
- ✅ Already updated to use `owner_id`
- ✅ Already loads companies and team memberships

### 2. Update Worker/API Code
Search for any references to `user_id` in companies context:
```bash
grep -r "user_id" apps/worker/src --include="*.ts"
```

### 3. Test Data Migration
Create a test profile and company:
```sql
-- Insert test profile
INSERT INTO profiles (id, email, credits_balance)
VALUES (
  auth.uid(),
  'test@example.com',
  100
);

-- Create test company
INSERT INTO companies (owner_id, name, description)
VALUES (
  auth.uid(),
  'Test Company',
  'A test company'
);

-- Verify credits deduction
INSERT INTO credits_transactions (
  user_id,
  type,
  amount,
  balance_after,
  description
) VALUES (
  auth.uid(),
  'usage',
  -10,
  90,
  'Test credit deduction'
);

-- Check balance was updated by trigger
SELECT credits_balance FROM profiles WHERE id = auth.uid();
-- Should return 90
```

### 4. Update Environment Variables
Make sure your `.env.local` has:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=https://api.nanowork.app
```

---

## 📞 Need Help?

**Common Issues:**
1. Table creation errors → Run entire TABLES_FIXED.sql script
2. RLS policy errors → Check you're authenticated in SQL Editor
3. Foreign key errors → Tables created out of order (run full script)
4. Duplicate errors → Clean existing data first

**Still stuck?**
- Check Supabase logs: Project → Logs
- Check table structure: Project → Table Editor
- Verify RLS policies: Project → Authentication → Policies

---

## ✨ What You Get After Migration

1. ✅ All 18 tables with proper relationships
2. ✅ Breaking changes resolved (`user_id` → `owner_id`)
3. ✅ Team collaboration ready
4. ✅ Credits system functional
5. ✅ Subscription tracking configured
6. ✅ RLS policies for security
7. ✅ Triggers for automation
8. ✅ Indexes for performance

**You're ready to:**
- Build company switcher UI
- Implement credits purchase
- Add team invitations
- Configure Stripe webhooks
- Deploy to production
