# Agent Auto-Provisioning Implementation Summary

## Problem Statement

New users were experiencing 403 errors when attempting to create builds because they didn't have an agent record in the database. The system required manual provisioning of agents, which blocked first-time users from using core functionality.

## Solution

Implemented automatic agent provisioning in the authentication middleware that creates an agent record for users on their first authenticated request. This ensures a seamless onboarding experience without manual intervention.

## Changes Made

### 1. Updated Authentication Middleware

**File:** `src/middleware/auth.ts`

**Changes:**
- Added agent auto-provisioning logic to `requireUserAuth()` middleware
- When a user authenticates without an agent, one is automatically created
- Added `nanoid` for generating unique 8-character agent slugs
- Added helper function `agentEmailAddress()` to generate agent email addresses
- Improved error handling and logging for provisioning failures

**Key Features:**
- **Synchronous:** Agent creation happens during request processing
- **Idempotent:** Safe to call multiple times (checks if agent exists first)
- **Non-blocking:** Stripe account creation is deferred (can be added later)
- **Secure:** Uses service key for database operations

### 2. Fixed Edge Function Endpoint

**File:** `supabase/functions/on-signup/index.ts`

**Changes:**
- Corrected endpoint URL from `/api/agents/internal/provision-agent` to `/internal/provision-agent`
- Updated authorization header to use `Bearer` token format
- Simplified response to match actual endpoint response structure
- Fixed to call provision for single agent (not multiple agents)

**Note:** This Edge Function is now optional since the middleware handles provisioning automatically.

### 3. Created Database Migration

**File:** `supabase/migrations/20260520000001_add_agents_table.sql`

**What It Creates:**
- **agents table:** Stores one agent per user with unique slug and email
- **generated_apps table:** Tracks AI-generated builds for each agent
- **Indexes:** For efficient queries on user_id, slug, email, status
- **RLS Policies:** Secure row-level access control
- **Triggers:** Automatic updated_at timestamp updates

**Schema Highlights:**
```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,      -- One agent per user
  slug TEXT NOT NULL UNIQUE,          -- 8-char identifier
  email TEXT NOT NULL UNIQUE,         -- a-{slug}@{domain}
  name TEXT NOT NULL,
  stripe_account_id TEXT,             -- Optional, added later
  stripe_onboarding_complete BOOLEAN,
  system_prompt TEXT,
  status TEXT DEFAULT 'active',
  metadata JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### 4. Created Test Script

**File:** `test-auto-provision.mjs`

**Purpose:**
- Automated testing of auto-provisioning functionality
- Creates a test user, makes authenticated request, verifies agent creation
- Tests idempotency (subsequent requests work correctly)
- Cleans up test data automatically

**Usage:**
```bash
npm run dev  # Start backend
node test-auto-provision.mjs
```

### 5. Created Documentation

**Files:**
- `AGENT_PROVISIONING.md` - Technical documentation of how provisioning works
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step deployment guide
- `AGENT_AUTO_PROVISION_CHANGES.md` - This summary document

## Architecture

### Request Flow

```
User Authentication
       ↓
requireUserAuth() middleware
       ↓
Verify JWT with Supabase
       ↓
Check if agent exists
       ↓
    [No agent?]
       ↓
Generate slug & email
       ↓
Create agent record
       ↓
Attach agent to request
       ↓
Continue to route handler
```

### Provisioning Methods

1. **Primary: Middleware Auto-Provisioning** (Recommended)
   - Happens on first authenticated request
   - Synchronous and reliable
   - No external dependencies

2. **Secondary: Manual Provisioning Endpoint** (Fallback)
   - `/internal/provision-agent` (POST)
   - Requires INTERNAL_TOKEN
   - For admin/debugging use

3. **Optional: Supabase Edge Function** (Not Required)
   - `supabase/functions/on-signup`
   - Triggered on user signup
   - Calls manual provisioning endpoint
   - Redundant with middleware approach

## Environment Variables

### Required

```bash
AGENT_EMAIL_DOMAIN=nanowork.ai
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...
```

### Optional

```bash
INTERNAL_TOKEN=your-secret-token  # For manual provisioning endpoint
```

## Benefits

1. **Zero Friction Onboarding**
   - Users can create builds immediately after signup
   - No 403 errors for new users
   - No manual intervention required

2. **Reliable & Robust**
   - Synchronous provisioning ensures agent exists before processing request
   - Idempotent - safe to retry on errors
   - Works in all environments (dev, staging, prod)

3. **Simple Architecture**
   - No complex trigger/webhook setup required
   - Middleware handles everything automatically
   - Easy to debug and monitor

4. **Secure**
   - Uses Supabase RLS policies
   - Service key only used server-side
   - Each user can only access their own agent

## Testing

### Manual Testing

1. Create a new user account
2. Log in
3. Navigate to build creation
4. Create a build
5. Verify no 403 error occurs
6. Check database for agent record

### Automated Testing

```bash
node test-auto-provision.mjs
```

### Database Verification

```sql
-- Check agent was created
SELECT * FROM agents WHERE user_id = 'your-user-uuid';

-- Verify unique constraints
SELECT slug, COUNT(*) FROM agents GROUP BY slug HAVING COUNT(*) > 1;
SELECT email, COUNT(*) FROM agents GROUP BY email HAVING COUNT(*) > 1;

-- Check builds linked to agent
SELECT * FROM generated_apps WHERE agent_id = 'your-agent-uuid';
```

## Monitoring

### Success Indicators

- **Log Messages:**
  ```
  Auto-provisioning agent for new user {user_id}
  Successfully auto-provisioned agent {agent_id} for user {user_id}
  ```

- **Metrics:**
  - Agents created per day
  - 403 error rate (should be near zero)
  - Build creation success rate

### Failure Indicators

- **Log Messages:**
  ```
  Failed to auto-provision agent: {error_message}
  ```

- **Common Errors:**
  - Missing AGENT_EMAIL_DOMAIN
  - Unique constraint violations (very rare)
  - Database connection issues

## Migration Path

### Before (Old Behavior)

- Users signed up → No agent created
- First build attempt → 403 error
- Manual provisioning required → User blocked

### After (New Behavior)

- Users sign up → No agent yet (OK)
- First authenticated request → Agent auto-created
- Build creation → Works immediately
- No manual intervention needed

## Backward Compatibility

- ✅ Existing users with agents: No impact, continues working
- ✅ New users without agents: Automatically provisioned
- ✅ Manual provisioning endpoint: Still works for admin use
- ✅ Database schema: Additive only, no breaking changes

## Future Enhancements

Potential improvements to consider:

1. **Stripe Integration:** Auto-create Stripe Connect accounts during provisioning
2. **Custom Agent Names:** Allow users to customize agent name on first login
3. **Multiple Agents:** Support multiple agents per user (departments)
4. **Webhooks:** Trigger external systems when agents are created
5. **Analytics:** Track provisioning metrics and success rates
6. **Agent Templates:** Pre-configure agents with department-specific settings

## Files Modified

```
backend/src/middleware/auth.ts                        (Modified)
backend/src/routes/internal/provision.ts              (No changes)
backend/src/services/supabase.ts                      (No changes)
supabase/functions/on-signup/index.ts                 (Modified)
supabase/migrations/20260520000001_add_agents_table.sql  (New)
backend/test-auto-provision.mjs                       (New)
backend/AGENT_PROVISIONING.md                         (New)
backend/DEPLOYMENT_CHECKLIST.md                       (New)
backend/AGENT_AUTO_PROVISION_CHANGES.md              (New)
```

## Deployment Order

1. Apply database migration (creates tables)
2. Deploy backend code (auto-provisioning logic)
3. Test with new user signup
4. Monitor logs and metrics
5. Optional: Deploy Edge Function (if using)

## Rollback Strategy

If issues occur:

1. **Code Rollback:** Revert middleware changes, redeploy
2. **Database:** Safe to leave tables in place (no breaking changes)
3. **Manual Provisioning:** Use `/internal/provision-agent` as fallback

## Support & Troubleshooting

See `DEPLOYMENT_CHECKLIST.md` for:
- Common issues and solutions
- Debug steps
- Verification queries
- Success metrics

See `AGENT_PROVISIONING.md` for:
- Technical architecture details
- API documentation
- Code examples
- Testing procedures
