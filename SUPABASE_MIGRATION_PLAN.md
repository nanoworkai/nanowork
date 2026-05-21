# Supabase Schema Conflict - Migration Plan

## Problem Summary

Two conflicting `agents` table definitions exist:

1. **OLD** (`001_initial_schema.sql`) - Department-based agents (7 per company)
   - Columns: `company_id`, `department`, `email_address`, `virtual_card_id`
   - Status: NOT USED in production code

2. **NEW** (`20260520000001_add_agents_table.sql`) - User-based agents (1 per user)
   - Columns: `user_id`, `slug`, `email`, `stripe_account_id`  
   - Status: ACTIVELY USED by backend API

Both use `CREATE TABLE IF NOT EXISTS agents`, causing conflicts during compilation.

---

## Solution: Choose One Migration

I've created TWO migration options. Pick ONE based on your needs:

### Option 1: Clean Removal (RECOMMENDED)

**File:** `supabase/migrations/20260521000001_remove_legacy_department_schema.sql`

**What it does:**
- Drops all legacy department-based tables (not used in code)
- Checks if wrong agents table exists and removes it
- Allows new user-based agents table to be created cleanly

**Use this if:**
- You don't need the department-based system
- You want a clean schema without unused tables
- ✅ Recommended for most cases

### Option 2: Rename to Preserve

**File:** `supabase/migrations/20260521000001_rename_legacy_to_department_agents.sql`

**What it does:**
- Renames old `agents` → `department_agents`
- Updates all foreign key references
- Preserves the old schema for potential future use

**Use this if:**
- You might want the department-based system later
- You want to keep both agent systems

---

## Deployment Steps

### For Local Development

```bash
# 1. Choose which migration to keep (delete the other)
cd supabase/migrations

# Keep ONE of these:
# rm 20260521000001_remove_legacy_department_schema.sql  # If using rename
# rm 20260521000001_rename_legacy_to_department_agents.sql  # If using removal

# 2. Reset local database (if Docker running)
npx supabase db reset

# 3. Or push just the new migration
npx supabase db push
```

### For Production (Supabase Dashboard)

**Method 1: Via Supabase CLI**
```bash
# Link to your project (one time)
npx supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
npx supabase db push
```

**Method 2: Via SQL Editor**
```bash
# 1. Copy the contents of your chosen migration file:
cat supabase/migrations/20260521000001_remove_legacy_department_schema.sql
# or
cat supabase/migrations/20260521000001_rename_legacy_to_department_agents.sql

# 2. Go to Supabase Dashboard → SQL Editor
# 3. Paste and run the migration
# 4. Then run the new agents table migration:
cat supabase/migrations/20260520000001_add_agents_table.sql
```

**Method 3: Via Migration History**
```bash
# In Supabase Dashboard:
# 1. Go to Database → Migrations
# 2. Click "Create Migration"
# 3. Paste chosen migration SQL
# 4. Click "Run"
```

---

## Verification

After deploying, verify the schema:

```sql
-- Check agents table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'agents'
ORDER BY ordinal_position;

-- Should see: user_id, slug, email (NEW schema)
-- Should NOT see: department, company_id (OLD schema)

-- Check related tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('agents', 'generated_apps', 'builds');
```

---

## Current Migration Order

After choosing your option, migrations will run in this order:

1. `001_initial_schema.sql` - Creates profiles, companies (LEGACY agents commented/deprecated)
2. `003_credits.sql` - Credits system
3. `005_subscriptions.sql` - Subscription management
4. ... (other migrations)
5. `20260520000001_add_agents_table.sql` - Creates NEW user-based agents table ✅
6. `20260520000002_add_last_activity_at_to_builds.sql` - Adds column to builds
7. `20260521000001_[chosen_migration].sql` - Fixes conflict 🔧

---

## Files Changed

- ✅ `supabase/migrations/001_initial_schema.sql` - Added DEPRECATED warning
- ✅ `supabase/migrations/20260521000001_remove_legacy_department_schema.sql` - NEW (Option 1)
- ✅ `supabase/migrations/20260521000001_rename_legacy_to_department_agents.sql` - NEW (Option 2)

---

## Recommendation

**Use Option 1 (Clean Removal)** because:
1. ✅ Backend code uses ONLY the new schema
2. ✅ Zero references to department-based agents in codebase
3. ✅ Cleaner schema without unused tables
4. ✅ Easier to maintain

Delete this file:
```bash
rm supabase/migrations/20260521000001_rename_legacy_to_department_agents.sql
```

Keep this file:
```bash
# Keep: supabase/migrations/20260521000001_remove_legacy_department_schema.sql
```
