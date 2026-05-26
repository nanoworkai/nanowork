# 🚨 EMERGENCY: Apply Complete Schema to Empty Supabase

## THE PROBLEM
Supabase database is **completely empty** (0 tables). Schema was never applied to production. Every API call fails because no tables exist.

## THE SOLUTION
Apply the complete 5,012-line schema file to Supabase **right now**.

---

## Quick Fix (5 minutes)

### Step 1: Copy Schema to Clipboard
The schema is already copied! If you need it again:
```bash
cat /tmp/FULL_SCHEMA_FOR_SUPABASE.sql | pbcopy
```

### Step 2: Open Supabase
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click: **SQL Editor** (left sidebar)

### Step 3: Paste and Run
1. Paste the entire schema (5,012 lines)
2. Click: **RUN** (bottom right)
3. Wait 30-60 seconds for completion
4. Look for "Success" message

### Step 4: Verify It Worked
Run this query in the SQL Editor:
```sql
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

**Expected result**: 50-60 tables (not 0!)

If you see 0, the migration failed. Check error messages.

---

## What This Creates

### Core Infrastructure (11 tables)
- `companies` - Company records
- `company_members` - Team membership
- `profiles` - User profiles
- `agents` - Department agents (7 per company)
- `agent_conversations` - Chat threads
- `agent_emails` - Email messages
- `agent_memories` - Vector-based memory (RAG)
- `agent_tasks` - Task queue
- `agent_executions` - Execution history
- `agent_activities` - Activity log
- `agent_orchestration` - Multi-agent coordination

### Credits & Billing (4 tables)
- `credits_transactions` - Credit usage
- `subscriptions` - Subscription records
- `invoices` - Invoice history
- `payment_methods` - Stored payment methods

### Build System (7 tables)
- `builds` - Build records
- `build_documents` - Generated documents
- `build_pitch_decks` - Pitch deck builder
- `build_spreadsheets` - Spreadsheet builder
- `workbooks` - Spreadsheet workbooks
- `sheets` - Individual sheets
- `cells` - Cell data

### Multi-Tenancy (7 tables)
- `nano_tenants` - Tenant accounts
- `nano_customers` - Customer records
- `nano_ledger` - Financial ledger
- `nano_api_keys` - API key management
- `nano_webhooks` - Webhook config
- `linq_jobs` - Job queue
- `linq_plan_limits` - Plan limits

### CRM & Business (8 tables)
- `contacts` - Contact management
- `contact_interactions` - Interaction history
- `deployments` - Deployment tracking
- `documents` - Document storage
- `landing_pages` - Landing page builder
- `payment_links` - Payment link generator
- `generated_apps` - Generated applications
- `app_files` - File storage

### Marketplace (6 tables)
- `rent_items` - Rental listings
- `rent_bookings` - Booking records
- `rent_reviews` - Reviews
- `showcase_companies` - Company showcase
- `showcase_claims` - Claimed companies
- `email_messages` - Email history

### Plus More:
- `communications` - Communication log
- `custom_domains` - Domain management
- `linq_url_cache` - URL caching
- `linq_usage` - Usage tracking
- `nano_app_schemas` - App schemas
- `nano_waitlist` - Waitlist management
- And more...

---

## After Schema is Applied

### 1. Verify Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Should list 50+ tables.

### 2. Check RLS is Enabled
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

All tables should have `rowsecurity = true`.

### 3. Test a Query
```sql
-- Should work now (not error)
SELECT * FROM companies LIMIT 1;
SELECT * FROM profiles LIMIT 1;
SELECT * FROM agents LIMIT 1;
```

### 4. Restart Your App
After schema is applied:
```bash
# Restart backend
cd backend && npm restart

# Restart worker
cd apps/worker && npm run dev

# Restart frontend
cd apps/web && npm run dev
```

All API calls should now work!

---

## If Migration Fails

### Common Errors:

**Error: "relation X does not exist"**
- Cause: Tables have dependencies
- Fix: Run the ENTIRE schema file at once (not in pieces)

**Error: "extension vector does not exist"**
- Cause: pgvector not enabled
- Fix: Go to Database → Extensions → Enable "vector"

**Error: "permission denied"**
- Cause: Not using service role key
- Fix: Make sure you're using the SQL Editor (has full permissions)

**Error: "syntax error"**
- Cause: Partial paste or clipboard issue
- Fix: Re-copy from `/tmp/FULL_SCHEMA_FOR_SUPABASE.sql` and paste again

### Nuclear Option (Start Fresh)
If you need to wipe and start over:
```sql
-- WARNING: Deletes EVERYTHING
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Then re-run the full schema
```

---

## Files Reference

- **Complete Schema**: `/tmp/FULL_SCHEMA_FOR_SUPABASE.sql` (5,012 lines)
- **Base Schema**: `backend/db/schema.sql` (370 lines)
- **Migrations**: `supabase/migrations/*.sql` (26 files)
- **Audit Report**: `supabase/SCHEMA_AUDIT_2026-05-26.md`

---

## Why This Happened

The schema files existed in the repo but were **never applied to production Supabase**. The database was initialized but left empty.

This is why:
- All API calls return "relation does not exist"
- Frontend shows errors
- Worker can't process jobs
- Backend can't query data

**Applying this schema fixes everything.**

---

## Quick Checklist

- [ ] Copy schema to clipboard
- [ ] Open Supabase SQL Editor
- [ ] Paste entire 5,012 lines
- [ ] Click RUN
- [ ] Wait for completion
- [ ] Verify table count > 0
- [ ] Test a SELECT query
- [ ] Restart all services
- [ ] Verify app works

Done! 🎉
