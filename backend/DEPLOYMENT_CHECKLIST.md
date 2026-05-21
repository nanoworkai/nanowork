# Agent Auto-Provisioning Deployment Checklist

## Overview

This checklist covers deploying the agent auto-provisioning feature that ensures new users automatically get an agent record when they first authenticate.

## Pre-Deployment

### 1. Environment Variables

Ensure these environment variables are configured in your production environment:

```bash
# Required
AGENT_EMAIL_DOMAIN=nanowork.ai          # Domain for agent email addresses
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# Optional (for manual provisioning endpoint)
INTERNAL_TOKEN=your-secret-token
```

### 2. Database Migration

Apply the migration to create the agents and generated_apps tables:

**For Supabase CLI:**
```bash
cd /path/to/nanowork-web
supabase db push
```

**For Manual SQL Execution:**
```bash
# Copy and run the migration file:
# supabase/migrations/20260520000001_add_agents_table.sql
```

**Verify Migration:**
```sql
-- Check that tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('agents', 'generated_apps');

-- Check indexes
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('agents', 'generated_apps');
```

## Deployment Steps

### 1. Deploy Backend Code

**Files Changed:**
- `src/middleware/auth.ts` - Added auto-provisioning logic
- `src/routes/internal/provision.ts` - Updated (no changes needed)
- `src/services/supabase.ts` - Updated (no changes needed)

**Deploy Steps:**
```bash
# Build the backend
cd backend
npm run build

# Deploy to your hosting platform (Render, Heroku, etc.)
git push production main
```

### 2. Test Auto-Provisioning

After deployment, test that auto-provisioning works:

```bash
# Run the test script
cd backend
BACKEND_URL=https://your-production-url.com \
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_ANON_KEY=your-anon-key \
node test-auto-provision.mjs
```

Or manually test:
1. Create a new user account
2. Log in with the new user
3. Try to create a build
4. Verify no 403 error occurs
5. Check that an agent was created in the database

### 3. Monitor Logs

Watch your application logs for these messages:

**Success:**
```
Auto-provisioning agent for new user {user_id}
Successfully auto-provisioned agent {agent_id} for user {user_id}
```

**Failure:**
```
Failed to auto-provision agent: {error_message}
```

## Post-Deployment Verification

### 1. Database Checks

```sql
-- Count agents
SELECT COUNT(*) FROM agents;

-- Check agent structure
SELECT id, user_id, slug, email, status, created_at 
FROM agents 
LIMIT 5;

-- Verify unique constraints
SELECT slug, COUNT(*) 
FROM agents 
GROUP BY slug 
HAVING COUNT(*) > 1;  -- Should return no rows

SELECT email, COUNT(*) 
FROM agents 
GROUP BY email 
HAVING COUNT(*) > 1;  -- Should return no rows
```

### 2. End-to-End Test

1. **Create Test User:**
   - Sign up at your production frontend
   - Verify email (if required)
   - Log in

2. **Create First Build:**
   - Navigate to build creation page
   - Enter a prompt
   - Click "Generate"
   - Should work without 403 errors

3. **Verify Agent Created:**
   ```sql
   SELECT * FROM agents WHERE user_id = 'test-user-uuid';
   ```

4. **Verify Build Created:**
   ```sql
   SELECT * FROM generated_apps WHERE agent_id = 'test-agent-uuid';
   ```

## Rollback Plan

If issues occur, you can rollback:

### Option 1: Rollback Code Only

```bash
# Redeploy previous version
git revert <commit-hash>
git push production main
```

Note: The database migration (adding tables) is safe to leave in place.

### Option 2: Full Rollback (Code + Database)

```sql
-- Drop tables (WARNING: This deletes all data)
DROP TABLE IF EXISTS generated_apps CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
```

Then redeploy the previous backend version.

## Common Issues & Solutions

### Issue: AGENT_EMAIL_DOMAIN not configured

**Error:** `AGENT_EMAIL_DOMAIN must be configured`

**Solution:**
```bash
# Add to environment variables
AGENT_EMAIL_DOMAIN=yourdomain.com
```

### Issue: Agent creation fails with unique constraint error

**Error:** `duplicate key value violates unique constraint "agents_slug_key"`

**Solution:** This is a rare race condition. The slug generation uses nanoid which has very low collision probability. If it occurs:
1. Check logs for the problematic slug
2. Verify there are no duplicate slugs in database
3. The user should retry (auto-provisioning will retry on next request)

### Issue: RLS policies blocking agent creation

**Error:** `new row violates row-level security policy for table "agents"`

**Solution:** Verify the service role policy exists:
```sql
SELECT * FROM pg_policies WHERE tablename = 'agents';
```

Ensure `SUPABASE_SERVICE_KEY` (not anon key) is being used in backend.

### Issue: Users seeing 403 after deployment

**Possible Causes:**
1. Migration not applied - Check database for agents table
2. Environment variable missing - Check AGENT_EMAIL_DOMAIN
3. Code not deployed - Verify latest commit is live

**Debug Steps:**
```bash
# Check if agent exists
psql $DATABASE_URL -c "SELECT * FROM agents WHERE user_id = 'problem-user-uuid';"

# Check backend logs for auto-provisioning attempts
grep "Auto-provisioning" /path/to/logs

# Try manual provisioning
curl -X POST https://your-api.com/internal/provision-agent \
  -H "Authorization: Bearer $INTERNAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "problem-user-uuid"}'
```

## Success Metrics

Track these metrics to verify successful deployment:

1. **Agent Creation Rate:**
   ```sql
   SELECT DATE(created_at) as date, COUNT(*) as agents_created
   FROM agents
   WHERE created_at >= NOW() - INTERVAL '7 days'
   GROUP BY DATE(created_at)
   ORDER BY date;
   ```

2. **403 Error Rate:**
   - Should drop to near zero for authenticated users
   - Monitor application error logs

3. **Build Creation Success Rate:**
   ```sql
   SELECT status, COUNT(*) as count
   FROM generated_apps
   WHERE created_at >= NOW() - INTERVAL '24 hours'
   GROUP BY status;
   ```

## Additional Notes

- The auto-provisioning is **synchronous** - agents are created during the auth middleware flow
- Stripe account creation is **deferred** - agents are created without Stripe accounts initially
- The provisioning is **idempotent** - safe to call multiple times for the same user
- The Edge Function (`supabase/functions/on-signup`) is **optional** - middleware handles provisioning

## Support Contacts

If issues persist, escalate to:
- Backend Team: backend@yourdomain.com
- DevOps: devops@yourdomain.com
- Database Admin: dba@yourdomain.com
