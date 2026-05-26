# Supabase Schema Audit - May 26, 2026

## Executive Summary

Cross-referenced all Supabase table usage across frontend, worker, and backend against migration files. Found **23 missing tables** that are referenced in code but not defined in the database schema.

## Tables by Component

### Frontend (apps/web/src) - 8 tables
- ✅ companies
- ✅ company_members
- ✅ credits_transactions
- ✅ email_messages
- ❌ **linq_jobs** - MISSING
- ❌ **nano_app_schemas** - MISSING
- ❌ **nano_waitlist** - MISSING
- ✅ profiles

### Worker (apps/worker/src) - 22 tables
- ✅ builds
- ✅ companies
- ✅ company_members
- ❌ **credit_transactions** - MISSING (typo variant?)
- ✅ credits_transactions
- ✅ email_messages
- ✅ invoices
- ❌ **linq_jobs** - MISSING
- ❌ **linq_plan_limits** - MISSING
- ❌ **linq_url_cache** - MISSING
- ❌ **linq_usage** - MISSING
- ❌ **nano_api_keys** - MISSING
- ❌ **nano_customers** - MISSING
- ❌ **nano_ledger** - MISSING
- ❌ **nano_tenants** - MISSING
- ❌ **nano_webhooks** - MISSING
- ✅ profiles
- ✅ rent_bookings
- ✅ rent_items
- ✅ rent_waitlist
- ✅ subscriptions
- ⚠️ **users** - May refer to auth.users (built-in)

### Backend (backend/src) - 28 tables
- ❌ **agent_conversations** - MISSING
- ✅ agent_emails
- ✅ agent_executions
- ❌ **agent_memories** - MISSING
- ❌ **agent_tasks** - MISSING
- ✅ agents
- ❌ **app_files** - MISSING
- ✅ build_documents
- ✅ build_pitch_decks
- ✅ build_spreadsheets
- ⚠️ **businesses** - MISSING (duplicate of companies?)
- ✅ cells
- ❌ **contact_interactions** - MISSING
- ❌ **contacts** - MISSING
- ❌ **credit_transactions** - MISSING (typo variant?)
- ❌ **deployments** - MISSING
- ❌ **documents** - MISSING
- ❌ **generated_apps** - MISSING
- ❌ **landing_pages** - MISSING
- ❌ **payment_links** - MISSING
- ✅ profiles
- ✅ sheets
- ✅ showcase_claims
- ✅ showcase_companies
- ✅ subscriptions
- ✅ transactions
- ✅ workbooks

## Missing Tables Created

Created migration file: `supabase/migrations/20260526000001_missing_tables.sql`

This migration adds 23 missing tables with:
- ✅ Primary keys and foreign key constraints
- ✅ Appropriate indexes on foreign keys and query columns
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ RLS policies for user access control
- ✅ Timestamps (created_at, updated_at where appropriate)
- ✅ Status/type enums with CHECK constraints
- ✅ JSONB fields for flexible metadata

## Critical Issues to Resolve

### 1. Table Name Inconsistencies
- **credit_transactions vs credits_transactions** - Code uses both. Standardize on one.
- **businesses vs companies** - Backend uses "businesses" but schema has "companies". Are these the same?
- **transactions** - Generic name used in multiple contexts. May cause confusion.

### 2. Multi-Tenancy Tables
The worker references a full multi-tenancy setup:
- nano_tenants
- nano_customers
- nano_ledger
- nano_webhooks
- nano_api_keys

These suggest a planned SaaS infrastructure that's partially implemented.

### 3. Agent Infrastructure
Backend references agent tables not in migrations:
- agent_conversations - Chat/interaction history
- agent_memories - Long-term memory/context
- agent_tasks - Task queue system

These are critical for agent functionality.

### 4. CRM/Contact Management
Backend has contact management tables:
- contacts
- contact_interactions

Not in schema. May be planned feature.

## How to Apply This Migration

### Option 1: Apply via Supabase Dashboard (Recommended)
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `/tmp/verify-schema.sql` and run to audit current state
3. Copy contents of `supabase/migrations/20260526000001_missing_tables.sql`
4. Paste into SQL Editor and execute
5. Verify all tables created successfully

### Option 2: Apply via Supabase CLI
```bash
cd /Users/jordan/Dev/nanowork-web
supabase db push
```

## Verification Steps

After applying the migration:

1. **Run verification script** - Execute `/tmp/verify-schema.sql` in Supabase SQL Editor
2. **Check RLS** - Verify all tables have `rowsecurity = true`
3. **Check policies** - Ensure each table has appropriate SELECT/INSERT/UPDATE/DELETE policies
4. **Test queries** - Run sample queries from each component to verify access

## Next Steps

1. ✅ **Apply migration** - Add missing tables to production Supabase
2. ⚠️ **Fix naming inconsistencies** - Decide on credit_transactions vs credits_transactions
3. ⚠️ **Clarify businesses vs companies** - Document or merge these concepts
4. ⚠️ **Add seed data** - linq_plan_limits needs default plan data
5. ⚠️ **Enable pgvector** - If using agent_memories with embeddings
6. ⚠️ **Test all queries** - Verify frontend/backend/worker can access tables

## Files Created

1. `/tmp/verify-schema.sql` - Audit script to run in Supabase
2. `/tmp/schema-comparison.md` - Detailed comparison analysis
3. `supabase/migrations/20260526000001_missing_tables.sql` - Migration to add missing tables
4. `supabase/SCHEMA_AUDIT_2026-05-26.md` - This document

## Breaking Changes

None. All new tables, no modifications to existing schema.

## Rollback

To rollback this migration:
```sql
DROP TABLE IF EXISTS payment_links CASCADE;
DROP TABLE IF EXISTS landing_pages CASCADE;
DROP TABLE IF EXISTS generated_apps CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS deployments CASCADE;
DROP TABLE IF EXISTS contact_interactions CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS app_files CASCADE;
DROP TABLE IF EXISTS agent_tasks CASCADE;
DROP TABLE IF EXISTS agent_memories CASCADE;
DROP TABLE IF EXISTS agent_conversations CASCADE;
DROP TABLE IF EXISTS nano_webhooks CASCADE;
DROP TABLE IF EXISTS nano_ledger CASCADE;
DROP TABLE IF EXISTS nano_customers CASCADE;
DROP TABLE IF EXISTS nano_tenants CASCADE;
DROP TABLE IF EXISTS nano_api_keys CASCADE;
DROP TABLE IF EXISTS nano_waitlist CASCADE;
DROP TABLE IF EXISTS nano_app_schemas CASCADE;
DROP TABLE IF EXISTS linq_usage CASCADE;
DROP TABLE IF EXISTS linq_url_cache CASCADE;
DROP TABLE IF EXISTS linq_plan_limits CASCADE;
DROP TABLE IF EXISTS linq_jobs CASCADE;
```
