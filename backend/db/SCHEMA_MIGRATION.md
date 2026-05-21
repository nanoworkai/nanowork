# Schema Migration: Department-Based → User-Based Agents

## Date
2026-05-21

## What Changed

Replaced the department-based agent system with a minimal user-based agent system.

### Removed Schema (Backup: schema.sql.backup-department-based)
- **Agent Model**: 7 agents per company (sales, marketing, operations, finance, product, hr, support)
- **Key Fields**: `company_id`, `department`, `email_address`
- **Supporting Tables**: agent_memories (with vector embeddings), agent_conversations (complex threading), agent_emails (full email system), agent_tasks (task management)
- **Total Lines**: 284 lines

### New Schema (schema.sql)
- **Agent Model**: 1 agent per user for build generation
- **Key Fields**: `user_id` (UNIQUE), `slug`, `email`, `stripe_account_id`, `stripe_onboarding_complete`
- **Core Tables**: 
  - `agents` - User-based agents
  - `profiles` - User profiles with credit balances
  - `builds` - AI-generated build plans
  - `credit_transactions` - Credit transaction audit log
- **Total Lines**: 200 lines

## Why This Change Was Necessary

1. **Code-Schema Mismatch**: The application code (`src/types/index.ts`, `src/middleware/auth.ts`) expects user-based agents with fields like `slug` and `stripe_account_id`, but the database schema had department-based agents with `company_id` and `department`.

2. **Auth Middleware Failure**: The auto-provisioning logic in `src/middleware/auth.ts` would fail with "column 'slug' does not exist" errors because it tried to create agents using the wrong schema.

3. **TypeScript Type Mismatch**: The `Agent` interface defined in `src/types/index.ts` did not match the database schema, causing runtime errors.

4. **Simplified Architecture**: The new user-based model matches the actual product requirements - users create builds, not departments.

## Schema Changes Detail

### Agents Table
```sql
-- OLD: Department-based
CREATE TABLE agents (
  user_id UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id),
  department TEXT CHECK (department IN ('sales', 'marketing', ...)),
  email_address TEXT,
  UNIQUE(company_id, department)  -- One agent per department per company
);

-- NEW: User-based
CREATE TABLE agents (
  user_id UUID UNIQUE REFERENCES auth.users(id),
  slug TEXT UNIQUE,
  email TEXT UNIQUE,
  stripe_account_id TEXT,
  stripe_onboarding_complete BOOLEAN
  -- One agent per user
);
```

### New Tables Added
1. **profiles** - User credit balances (required by `src/services/creditService.ts`)
2. **builds** - AI-generated build plans (required by `src/routes/builds.ts`)
3. **credit_transactions** - Transaction audit log (required by credit system)

### New Functions Added
1. **deduct_credits()** - Atomic credit deduction function to prevent race conditions
2. **update_updated_at()** - Trigger function for auto-updating timestamps

## Migration Path

### For Local Development
```bash
# Option 1: If using Supabase CLI
supabase db reset

# Option 2: Manual application
psql $DATABASE_URL -f db/schema.sql
```

### For Production (Supabase)
```bash
# Option 1: Via Supabase CLI
supabase db push

# Option 2: Via Supabase Dashboard
# 1. Go to SQL Editor
# 2. Paste contents of db/schema.sql
# 3. Execute
```

### Verification Queries
```sql
-- Verify agents table has correct schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'agents'
ORDER BY ordinal_position;
-- Should see: user_id, slug, email, stripe_account_id (NOT department, company_id)

-- Verify all required tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('agents', 'profiles', 'builds', 'credit_transactions');
-- Should return all 4 tables

-- Test deduct_credits function exists
SELECT proname FROM pg_proc WHERE proname = 'deduct_credits';
-- Should return 1 row
```

## Rollback Plan

If you need to restore the old schema:
```bash
cp db/schema.sql.backup-department-based db/schema.sql
```

However, this is NOT recommended as the application code will not work with the old schema.

## Impact Assessment

### ✅ Fixed Issues
1. Agent auto-provisioning will now work correctly
2. TypeScript types match database schema
3. Credit system has proper atomic operations
4. Build creation flow will work end-to-end

### ⚠️ Breaking Changes
- Any code expecting department-based agents will break (none found in codebase)
- Old agent records (if any exist) will need migration (unlikely to exist)

### 🔄 No Migration Script Needed
Since the old schema was never deployed to production and the application code never used it, no data migration is required.

## Related Issues Fixed
- Auth middleware auto-provisioning failure
- TypeScript type mismatches
- Missing tables for builds and credits
- Missing atomic credit deduction function

## Next Steps After Applying This Schema

1. Apply the schema to your Supabase database (dev and production)
2. Test agent auto-provisioning: sign up a new user and verify agent is created
3. Test build creation: create a build and verify it saves correctly
4. Test credit system: verify credits can be added and deducted atomically
5. Proceed to fix remaining issues (credit race condition, authorization bypass, etc.)
