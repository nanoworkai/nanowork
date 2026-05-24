# Supabase Setup Guide

Complete guide to setting up the Supabase database for the Agent Platform backend.

## Prerequisites

- Supabase account (free tier works)
- Project created at https://supabase.com/dashboard

## Step-by-Step Setup

### 1. Enable Required Extensions

Go to **Database → Extensions** in your Supabase dashboard and enable:

- ✅ `uuid-ossp` - UUID generation (usually enabled by default)
- ✅ `pgcrypto` - Cryptographic functions (usually enabled by default)
- ✅ **`vector`** - **CRITICAL** - Required for embeddings

**To enable vector extension:**
1. Go to Database → Extensions
2. Search for "vector"
3. Click "Enable" on `vector`

### 2. Run the Schema SQL

1. Open **SQL Editor** in Supabase dashboard
2. Create a new query
3. Copy the entire contents of `db/schema.sql`
4. Paste into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)

You should see: `Success. No rows returned`

### 3. Verify Tables Created

Go to **Database → Tables** and confirm you see all 15 tables:

1. ✅ agents
2. ✅ businesses
3. ✅ generated_apps
4. ✅ app_files
5. ✅ landing_pages
6. ✅ deployments
7. ✅ agent_conversations
8. ✅ agent_emails
9. ✅ agent_memories
10. ✅ agent_tasks
11. ✅ contacts
12. ✅ contact_interactions
13. ✅ payment_links
14. ✅ transactions
15. ✅ documents

### 4. Get Your API Keys

Go to **Settings → API** and copy:

1. **Project URL** (looks like `https://xxxxx.supabase.co`)
2. **anon public key** (starts with `eyJhbG...`)
3. **service_role key** (starts with `eyJhbG...`) - **Keep this secret!**

### 5. Configure Backend Environment

Update `backend/.env`:

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** The backend uses the **service_role** key to bypass RLS (Row Level Security) since it manages all operations server-side.

### 6. Test the Connection

Start your backend:

```bash
cd backend
npm run dev
```

Test agent provisioning:

```bash
curl -X POST http://localhost:3000/internal/provision-agent \
  -H "Authorization: Bearer YOUR_INTERNAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "00000000-0000-0000-0000-000000000001"}'
```

If successful, you'll see an agent created in the `agents` table!

## Schema Features

### Row Level Security (RLS)

All tables have RLS enabled. Policies ensure:
- Users can only access data for their own agent
- Data is isolated between users
- Service role key bypasses RLS for backend operations

### Automatic Timestamps

Tables with `updated_at` columns have triggers that automatically update the timestamp on every update.

### Vector Search

Two helper functions are included:

1. **`match_agent_memories`** - Semantic search over agent memories
   ```sql
   SELECT * FROM match_agent_memories(
     query_embedding := '[0.1, 0.2, ...]'::vector,
     agent_id := 'uuid',
     match_count := 10,
     match_threshold := 0.7
   );
   ```

2. **`match_documents`** - Semantic search over documents
   ```sql
   SELECT * FROM match_documents(
     query_embedding := '[0.1, 0.2, ...]'::vector,
     agent_id := 'uuid',
     match_count := 10,
     match_threshold := 0.7
   );
   ```

### Indexes

All tables have optimized indexes for:
- Foreign key lookups
- Status filtering
- Date range queries
- Vector similarity search (IVFFlat)

## User Authentication Setup

### Enable Email Auth

1. Go to **Authentication → Providers**
2. Enable **Email** provider
3. Configure email templates (optional)

### Create Test User

In SQL Editor:

```sql
-- Create a test user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

Or use the Supabase UI:
1. Go to **Authentication → Users**
2. Click **Add user**
3. Enter email and password

### Provision Agent for Test User

After creating a user, provision their agent:

```bash
# Get the user_id from Supabase dashboard
curl -X POST http://localhost:3000/internal/provision-agent \
  -H "Authorization: Bearer YOUR_INTERNAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user-uuid-from-supabase"}'
```

This creates an agent record with:
- Unique slug (8 characters)
- Email address `a-{slug}@{AGENT_EMAIL_DOMAIN}`
- Active status
- Optional Stripe Connect account

## Database Migrations

The schema is designed to be run once. For future updates:

1. Create new migration SQL files
2. Run them in SQL Editor
3. Never drop tables - use status columns to archive

### Example Migration Pattern

```sql
-- Migration: Add new column
ALTER TABLE agents ADD COLUMN IF NOT EXISTS new_field TEXT;

-- Create index
CREATE INDEX IF NOT EXISTS idx_agents_new_field ON agents(new_field);
```

## Monitoring

### View Table Sizes

```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check RLS Policies

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Count Records by Table

```sql
SELECT 'agents' AS table_name, COUNT(*) FROM agents
UNION ALL
SELECT 'businesses', COUNT(*) FROM businesses
UNION ALL
SELECT 'generated_apps', COUNT(*) FROM generated_apps
UNION ALL
SELECT 'agent_emails', COUNT(*) FROM agent_emails
UNION ALL
SELECT 'contacts', COUNT(*) FROM contacts
ORDER BY table_name;
```

## Backup and Recovery

### Automated Backups

Supabase Pro/Team plans include:
- Daily backups
- Point-in-time recovery
- 7-day retention (Pro) or 14-day (Team)

### Manual Backup

```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Or via pg_dump
pg_dump "postgres://postgres:[password]@db.[project].supabase.co:5432/postgres" > backup.sql
```

### Restore

```bash
psql "postgres://postgres:[password]@db.[project].supabase.co:5432/postgres" < backup.sql
```

## Security Checklist

- ✅ RLS enabled on all tables
- ✅ Service role key kept secret (never exposed to browser)
- ✅ Anon key safe for client-side use
- ✅ Users isolated via RLS policies
- ✅ Foreign key constraints prevent orphaned records
- ✅ Indexes optimize query performance
- ✅ Vector indexes configured for similarity search

## Troubleshooting

### "extension 'vector' does not exist"

Enable the vector extension in Database → Extensions.

### "permission denied for table X"

Check RLS policies. Backend should use service_role key which bypasses RLS.

### Vector search returns no results

1. Ensure embeddings are populated (not null)
2. Check vector index exists: `\d agent_memories` in SQL Editor
3. Verify embedding dimension is 1536

### Slow queries

1. Check indexes exist: `\di` in SQL Editor
2. Analyze query plan: `EXPLAIN ANALYZE SELECT ...`
3. Add missing indexes for frequently filtered columns

## Next Steps

1. ✅ Run schema in Supabase
2. ✅ Configure backend .env with API keys
3. ✅ Create test user
4. ✅ Provision agent for test user
5. ✅ Test API endpoints
6. Configure Resend for emails
7. Configure Stripe for payments
8. Configure Anthropic for AI generation

## Support

- Supabase Docs: https://supabase.com/docs
- Vector Extension: https://github.com/pgvector/pgvector
- Supabase Discord: https://discord.supabase.com
