# How to Apply Schema Migration to Supabase

## Quick Start

**Found 23 missing tables!** Follow these steps to add them to your Supabase database.

## Option 1: Via Supabase Dashboard (Recommended)

### Step 1: Verify Current Schema
1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor**
3. Copy and paste: `/tmp/verify-schema.sql`
4. Click **Run**
5. Review results to see current tables and any security issues

### Step 2: Apply Migration
1. Still in **SQL Editor**
2. Open file: `supabase/migrations/20260526000001_missing_tables.sql`
3. Copy all contents (600+ lines)
4. Paste into SQL Editor
5. Click **Run**
6. Wait for "Success" message

### Step 3: Verify Migration Worked
1. Run `/tmp/verify-schema.sql` again
2. Check that all 23 new tables appear
3. Verify RLS is enabled on all tables (should show "✓ RLS Enabled")

## Option 2: Via Supabase CLI

```bash
cd /Users/jordan/Dev/nanowork-web
supabase db push
```

## What This Migration Adds

### 23 New Tables:

**Frontend Tables (3):**
- linq_jobs
- nano_app_schemas
- nano_waitlist

**Multi-Tenancy Infrastructure (7):**
- linq_plan_limits
- linq_url_cache
- linq_usage
- nano_api_keys
- nano_customers
- nano_ledger
- nano_tenants
- nano_webhooks

**Agent Infrastructure (3):**
- agent_conversations
- agent_memories
- agent_tasks

**CRM & Business Tools (10):**
- app_files
- contacts
- contact_interactions
- deployments
- documents
- generated_apps
- landing_pages
- payment_links

## After Migration

### Test These Queries

```sql
-- Check all tables exist
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
-- Should return 58+ tables

-- Verify RLS enabled
SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false;
-- Should return 0

-- Test a new table
SELECT * FROM nano_waitlist LIMIT 1;
-- Should return empty set (not error)
```

### Common Issues

**Issue**: "relation X does not exist"
**Fix**: Table order matters. Run full migration file, don't copy individual tables.

**Issue**: "RLS policy fails"
**Fix**: Make sure you're testing with an authenticated user, not anonymous.

**Issue**: Foreign key constraint fails
**Fix**: Run `supabase/migrations/` in order. Dependencies must exist first.

## Rollback (If Needed)

If something goes wrong:

```sql
-- See supabase/SCHEMA_AUDIT_2026-05-26.md for rollback script
-- It will DROP all 23 tables
```

## Next Actions

After applying this migration:

1. ✅ Test frontend - Check linq_jobs, nano_waitlist work
2. ✅ Test worker - Verify multi-tenancy tables accessible
3. ✅ Test backend - Check agent tables work correctly
4. ⚠️ Seed data - Add default records to linq_plan_limits
5. ⚠️ Fix naming - Resolve credit_transactions vs credits_transactions

## Files Reference

- **Migration**: `supabase/migrations/20260526000001_missing_tables.sql`
- **Audit Report**: `supabase/SCHEMA_AUDIT_2026-05-26.md`
- **Verification Script**: `/tmp/verify-schema.sql`
- **Comparison**: `/tmp/schema-comparison.md`

## Questions?

See the full audit report at `supabase/SCHEMA_AUDIT_2026-05-26.md` for:
- Detailed table analysis
- Security considerations
- Breaking changes (none)
- Performance notes
