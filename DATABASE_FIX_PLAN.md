# Database Schema Fix Plan
**Generated:** 2026-05-21

## Critical Issues That Will Break Compilation

### Issue #1: Duplicate Migration Timestamps (IMMEDIATE)
**Problem:** Two files with same timestamp `20260521000001`
- `20260521000001_remove_legacy_department_schema.sql` - Drops legacy tables
- `20260521000001_rename_legacy_to_department_agents.sql` - Renames tables

**Fix:** Choose ONE strategy and delete the other file

**Recommendation:** Keep the REMOVAL version (matches codebase usage)
```bash
rm supabase/migrations/20260521000001_rename_legacy_to_department_agents.sql
```

---

### Issue #2: Missing Table References (CRITICAL)
**Problem:** Foreign keys reference tables that never get created

**A. nano_tenants and users tables**
Files affected:
- `20260506000001_block1_tenant_users.sql`
- `20260506000005_block5_api_infra.sql`

**Fix Options:**
1. Create the missing tables (if they're part of your system)
2. Remove these migrations entirely (if they're from abandoned feature)

**Recommendation:** Remove both migrations (appear to be from multi-tenant v1 experiment)
```bash
rm supabase/migrations/20260506000001_block1_tenant_users.sql
rm supabase/migrations/20260506000005_block5_api_infra.sql
```

**B. deployments table**
File affected:
- `20260513000001_deployment_domains.sql` tries to ALTER non-existent table

**Fix:** Create the deployments table migration BEFORE this one
```sql
-- New file: supabase/migrations/20260513000000_create_deployments.sql
CREATE TABLE IF NOT EXISTS deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID REFERENCES builds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deployments_build_id ON deployments(build_id);
CREATE INDEX idx_deployments_user_id ON deployments(user_id);
```

---

### Issue #3: Agents Table Conflict (CRITICAL)
**Problem:** Two incompatible schemas for `agents` table
- OLD: Department-based (in `001_initial_schema.sql`)
- NEW: User-based (in `20260520000001_add_agents_table.sql`)

**Fix:** Remove old agents definition from `001_initial_schema.sql`

Lines to remove: 100-147 (agents table + indexes + policies)
Also remove these dependent tables:
- Lines 150-194: agent_activities
- Lines 197-248: financial_infrastructure  
- Lines 252-300: transactions (has agent_id FK)

**Why:** Backend code ONLY uses the new user-based schema

---

### Issue #4: Duplicate Table Definitions (MODERATE)
**Problem:** Tables defined multiple times with schema drift

**A. profiles table**
- `001_initial_schema.sql` - Base definition
- `001_profiles_v2.sql` - Adds columns (OK, uses ALTER)
- `20260506000010_profiles.sql` - Redundant CREATE with different schema

**Fix:** Remove the redundant one
```bash
rm supabase/migrations/20260506000010_profiles.sql
```

**B. companies table**
- `001_initial_schema.sql` - Uses `user_id` FK
- `002_companies.sql` - Uses `owner_id` FK (different!)
- `20260512000001_companies_and_members.sql` - Uses `user_id` again

**Fix:** Keep ONE authoritative version
```bash
# Option 1: Keep only the one in 001_initial_schema.sql
rm supabase/migrations/002_companies.sql

# Option 2: Or consolidate into 002_companies.sql and remove from 001
# Edit 001_initial_schema.sql to remove companies table definition
```

**C. company_members table**
- `004_company_members.sql` - Full featured
- `20260512000001_companies_and_members.sql` - Minimal version

**Fix:** Remove the minimal one
```bash
rm supabase/migrations/20260512000001_companies_and_members.sql
```

---

## Fix Script (Automated)

Run this script to automatically fix the issues:

```bash
#!/bin/bash
cd /Users/jordan/Dev/nanowork-web

echo "🔧 Fixing Supabase schema issues..."

# Fix #1: Remove duplicate timestamp migration (keep removal strategy)
echo "1. Removing duplicate migration..."
rm -f supabase/migrations/20260521000001_rename_legacy_to_department_agents.sql

# Fix #2A: Remove migrations with missing table dependencies
echo "2. Removing migrations with broken dependencies..."
rm -f supabase/migrations/20260506000001_block1_tenant_users.sql
rm -f supabase/migrations/20260506000005_block5_api_infra.sql

# Fix #2B: Create deployments table migration
echo "3. Creating deployments table migration..."
cat > supabase/migrations/20260513000000_create_deployments.sql << 'EOF'
-- Create deployments table for deployment tracking
CREATE TABLE IF NOT EXISTS deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID REFERENCES builds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'deployed', 'failed')),
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deployments_build_id ON deployments(build_id);
CREATE INDEX IF NOT EXISTS idx_deployments_user_id ON deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);

ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;

CREATE POLICY deployments_select_own ON deployments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY deployments_insert_own ON deployments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE deployments IS 'Build deployment tracking and URLs';
EOF

# Fix #4: Remove duplicate table definitions
echo "4. Removing duplicate table definitions..."
rm -f supabase/migrations/20260506000010_profiles.sql
rm -f supabase/migrations/002_companies.sql
rm -f supabase/migrations/20260512000001_companies_and_members.sql

echo "✅ Schema fixes complete!"
echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo "Edit supabase/migrations/001_initial_schema.sql and remove:"
echo "  - Lines 100-147: agents table (department-based)"
echo "  - Lines 150-194: agent_activities table"
echo "  - Lines 197-248: financial_infrastructure table"
echo "  - Lines 252-300: transactions table (or remove just agent_id FK)"
echo ""
echo "Then run: npx supabase db reset"
```

---

## Manual Edit Required

**File:** `supabase/migrations/001_initial_schema.sql`

Remove these sections (they conflict with new user-based agents):
1. **Lines 100-147:** `agents` table + indexes + policies
2. **Lines 150-194:** `agent_activities` table
3. **Lines 197-248:** `financial_infrastructure` table  
4. **Lines 252-300:** `transactions` table (or just remove agent_id FK if needed)

---

## Verification Steps

After fixes, verify the schema:

```bash
# 1. Reset local database
cd /Users/jordan/Dev/nanowork-web
npx supabase db reset

# 2. Check for errors
# Should complete without foreign key failures

# 3. Verify agents table has correct schema
psql -h localhost -p 54322 -d postgres -c "
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'agents' 
ORDER BY ordinal_position;
"

# Should see: user_id, slug, email (NOT department, company_id)

# 4. Count migrations
ls -1 supabase/migrations/*.sql | wc -l
# Should be ~19 files (down from 24)
```

---

## Production Deployment

After local verification passes:

```bash
# Link to production (one time)
npx supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
npx supabase db push

# Or manually via Supabase Dashboard SQL Editor
# Run migrations in alphabetical order
```

---

## Summary

**Files to delete:** 6 migrations
- ✅ `20260521000001_rename_legacy_to_department_agents.sql` (duplicate timestamp)
- ✅ `20260506000001_block1_tenant_users.sql` (missing tables)
- ✅ `20260506000005_block5_api_infra.sql` (missing tables)
- ✅ `20260506000010_profiles.sql` (duplicate definition)
- ✅ `002_companies.sql` (duplicate definition)
- ✅ `20260512000001_companies_and_members.sql` (duplicate definition)

**Files to create:** 1 migration
- ✅ `20260513000000_create_deployments.sql` (missing table)

**Files to edit:** 1 migration
- ✅ `001_initial_schema.sql` (remove legacy agents + related tables)

**Result:** Clean, conflict-free schema ready for production ✨
