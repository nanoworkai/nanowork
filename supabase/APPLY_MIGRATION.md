# 🚀 Quick Migration Guide - Apply in 5 Minutes

## Step 1: Backup (If you have existing data)

```bash
# In Supabase Dashboard
1. Go to Database → Backups
2. Click "Create Backup"
3. Wait for completion
```

## Step 2: Apply Schema

### Option A: Copy-Paste (Recommended)

1. **Open Supabase Dashboard**
   - Go to your project: https://app.supabase.com
   - Click "SQL Editor" in sidebar

2. **Copy the SQL**
   - Open `supabase/TABLES_FIXED.sql`
   - Select all (Cmd+A / Ctrl+A)
   - Copy (Cmd+C / Ctrl+C)

3. **Run in Supabase**
   - Click "New query" in SQL Editor
   - Paste the SQL
   - Click "Run" (or press Cmd+Enter / Ctrl+Enter)
   - Wait for completion (30-60 seconds)

4. **Verify Success**
   - Check output: "Success. No rows returned"
   - Go to "Table Editor"
   - Count tables: Should see 18 tables

### Option B: Supabase CLI (Advanced)

```bash
# Install CLI if needed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Apply migration
supabase db push --file supabase/TABLES_FIXED.sql
```

---

## Step 3: Verify Migration

Run this query in SQL Editor:

```sql
-- Check table count (should be 18)
SELECT COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check companies has owner_id (not user_id)
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'companies' 
AND column_name IN ('user_id', 'owner_id');
-- Should return only: owner_id

-- Check profiles has new columns
SELECT COUNT(*) as new_columns
FROM information_schema.columns 
WHERE table_name = 'profiles'
AND column_name IN (
  'credits_balance',
  'monthly_company_limit',
  'subscription_status',
  'avatar_url'
);
-- Should return: 4

-- Check triggers
SELECT COUNT(*) as trigger_count
FROM information_schema.triggers
WHERE trigger_schema = 'public';
-- Should return: 12+
```

**Expected Results:**
- ✅ table_count = 18
- ✅ owner_id exists (user_id does not)
- ✅ new_columns = 4
- ✅ trigger_count >= 12

---

## Step 4: Test Functionality

### Test 1: Credits System
```sql
-- Get your user ID (run in SQL Editor while authenticated)
SELECT auth.uid();

-- Insert test credit transaction
INSERT INTO credits_transactions (
  user_id,
  type,
  amount,
  balance_after,
  description
) VALUES (
  auth.uid(),
  'bonus',
  100,
  100,
  'Welcome bonus'
);

-- Check credits balance was auto-updated
SELECT credits_balance 
FROM profiles 
WHERE id = auth.uid();
-- Should return: 100
```

### Test 2: Company Creation
```sql
-- Create test company
INSERT INTO companies (
  owner_id,
  name,
  description
) VALUES (
  auth.uid(),
  'Test Company',
  'Testing the new schema'
);

-- Verify company exists
SELECT id, name, owner_id 
FROM companies 
WHERE owner_id = auth.uid();
```

### Test 3: Team Invitation
```sql
-- Invite a team member (use a different email)
INSERT INTO company_members (
  company_id,
  user_id,
  role,
  invitation_email,
  invitation_status
) VALUES (
  (SELECT id FROM companies WHERE owner_id = auth.uid() LIMIT 1),
  auth.uid(), -- In production, this would be a different user
  'admin',
  'teammate@example.com',
  'pending'
);

-- Verify invitation
SELECT * FROM company_members 
WHERE company_id IN (
  SELECT id FROM companies WHERE owner_id = auth.uid()
);
```

---

## Step 5: Deploy Application

### Frontend (apps/web)
```bash
cd apps/web

# Build
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist
```

### Worker (apps/worker)
```bash
cd apps/worker

# Set secrets (if not already set)
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY

# Deploy
npx wrangler deploy
```

---

## 🎉 You're Done!

### What You Now Have:

**Database:**
- ✅ 18 production-ready tables
- ✅ Row-level security enabled
- ✅ Automatic triggers for credits & timestamps
- ✅ Team collaboration support
- ✅ Billing & subscription tracking

**Breaking Changes Fixed:**
- ✅ `companies.user_id` → `companies.owner_id`
- ✅ All RLS policies updated
- ✅ AuthContext uses new field names

**Ready to Build:**
- ✅ Company switcher UI
- ✅ Credits purchase flow
- ✅ Team invitation system
- ✅ Stripe integration
- ✅ Custom domains

---

## 🐛 Troubleshooting

### Migration Failed Midway
```sql
-- Check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- If partial, run TABLES_FIXED.sql again
-- It's idempotent - safe to run multiple times
```

### "Permission Denied" Error
```sql
-- Make sure you're authenticated in SQL Editor
-- Top right should show your email
-- Try clicking "Run" again
```

### "Relation Does Not Exist"
```bash
# Don't run sections individually
# Run the ENTIRE TABLES_FIXED.sql file at once
```

### Foreign Key Errors
```bash
# The script creates tables in proper order
# Running sections out of order causes this
# Solution: Run complete file
```

---

## 📊 Quick Stats

**Migration Time:** ~30-60 seconds  
**Tables Created:** 18  
**Indexes Added:** 70+  
**Policies Created:** 50+  
**Triggers Added:** 12+  
**Breaking Changes:** 1 (user_id → owner_id)  

**Downtime Required:** None (if tables don't exist)  
**Data Loss Risk:** Zero (preserves existing data)  

---

## 🎯 Next Steps

1. **Configure Stripe** (see TODO.md)
   - Create products & prices
   - Copy price IDs to code
   - Set up webhooks

2. **Test Auth Flow**
   - Sign up new user
   - Verify 100 free credits
   - Create first company

3. **Build UI Components**
   - Company switcher
   - Credits display
   - Billing page

4. **Set Up Webhooks**
   ```bash
   # Test locally
   stripe listen --forward-to localhost:8787/api/stripe/webhooks
   
   # In production
   # Add endpoint in Stripe Dashboard:
   # https://api.nanowork.app/api/stripe/webhooks
   ```

---

## ✅ Completion Checklist

- [ ] Backed up existing data (if any)
- [ ] Ran TABLES_FIXED.sql in Supabase
- [ ] Verified 18 tables exist
- [ ] Confirmed `owner_id` exists in companies
- [ ] Tested credits transaction trigger
- [ ] Created test company
- [ ] Deployed frontend
- [ ] Deployed worker
- [ ] Configured Stripe products
- [ ] Set up webhook endpoint
- [ ] Tested end-to-end flow

**All done?** You're ready to build! 🚀

---

## 📞 Support

**Issue:** Tables not created  
**Fix:** Run entire TABLES_FIXED.sql (don't run sections)

**Issue:** Duplicate key errors  
**Fix:** Script is idempotent, safe to re-run

**Issue:** RLS policy errors  
**Fix:** Verify you're authenticated in SQL Editor

**Issue:** Credits not updating  
**Fix:** Check trigger exists: `update_user_credits_after_transaction`

**Still need help?**  
Check: `supabase/MIGRATION_GUIDE.md` for detailed troubleshooting
