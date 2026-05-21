# Agent Auto-Provisioning

## Overview

The Nanowork backend automatically provisions an agent record for each new user on their first authenticated request. This ensures users can immediately start creating builds without encountering 403 errors.

## How It Works

### 1. Automatic Provisioning (Primary Method)

**Location**: `src/middleware/auth.ts` - `requireUserAuth()` middleware

**Flow**:
1. User authenticates with Supabase JWT
2. Middleware verifies the token and retrieves the user
3. Middleware checks if an agent exists for the user
4. **If no agent exists**: Automatically creates one with:
   - Unique 8-character slug (lowercase alphanumeric)
   - Email address: `a-{slug}@{AGENT_EMAIL_DOMAIN}`
   - Default name: `Agent {slug}`
   - Active status
5. Request proceeds with agent attached to `req.agent`

**Benefits**:
- Zero configuration required for new users
- Synchronous and reliable
- Works in all environments (dev, staging, production)
- Idempotent - safe to call multiple times
- No external dependencies (Edge Functions, database triggers)

### 2. Manual Provisioning (Fallback/Admin)

**Location**: `src/routes/internal/provision.ts` - `/internal/provision-agent` endpoint

**Purpose**:
- Admin/internal tool for manually provisioning agents
- Used by Edge Functions or scripts
- Debugging and testing

**Usage**:
```bash
curl -X POST http://localhost:3000/internal/provision-agent \
  -H "Authorization: Bearer {INTERNAL_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "uuid-here"}'
```

### 3. Supabase Edge Function (Optional)

**Location**: `supabase/functions/on-signup/index.ts`

**Purpose**:
- Alternative provisioning method via Supabase trigger
- Can be configured to run on user signup
- Not required since middleware handles it automatically

**Note**: This Edge Function exists but is **not necessary** for production. The middleware auto-provisioning is the primary mechanism.

## Environment Variables Required

```bash
# Required for agent provisioning
AGENT_EMAIL_DOMAIN=yourdomain.com

# Required for internal endpoint
INTERNAL_TOKEN=your-secret-token

# Required for Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
```

## Database Schema

The `agents` table stores one agent per user:

```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  stripe_account_id TEXT,
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
  system_prompt TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id)  -- One agent per user
);
```

## Testing

A test script is provided to verify auto-provisioning works correctly:

```bash
cd backend
npm run dev  # Start backend in another terminal
node test-auto-provision.mjs
```

The test will:
1. Create a new test user
2. Make an authenticated request (triggering auto-provision)
3. Verify the agent was created with correct attributes
4. Test that subsequent requests work (idempotent)
5. Clean up test data

## Error Handling

### Missing AGENT_EMAIL_DOMAIN
If `AGENT_EMAIL_DOMAIN` is not configured, the middleware will return a 500 error:
```json
{
  "error": "Failed to create agent account",
  "message": "AGENT_EMAIL_DOMAIN must be configured"
}
```

### Agent Creation Failure
If agent creation fails for any reason (database error, unique constraint violation, etc.), the middleware returns a 500 error with details:
```json
{
  "error": "Failed to create agent account",
  "message": "Specific error message here"
}
```

## Migration Notes

### Before (Old Behavior)
- Users had to manually provision agents via `/internal/provision-agent`
- First-time users would get 403 errors when trying to create builds
- Required external triggers or frontend logic to create agents

### After (New Behavior)
- Agents are automatically provisioned on first authenticated request
- Users can immediately start creating builds after signup
- No manual intervention required

## Monitoring

Check server logs for auto-provisioning events:

```
Auto-provisioning agent for new user {user_id}
Successfully auto-provisioned agent {agent_id} for user {user_id}
```

Failed provisioning attempts will log:
```
Failed to auto-provision agent: {error_message}
```

## Future Enhancements

Potential improvements to consider:

1. **Stripe Account Creation**: Optionally create Stripe Connect account during provisioning
2. **Customizable Agent Names**: Allow users to customize agent name on first login
3. **Multiple Agents**: Support multiple agents per user (e.g., one per department)
4. **Provisioning Webhooks**: Trigger webhooks when new agents are created
5. **Analytics**: Track provisioning success rates and timing

## Related Files

- `src/middleware/auth.ts` - Auto-provisioning logic
- `src/routes/internal/provision.ts` - Manual provisioning endpoint
- `src/services/supabase.ts` - Database helpers (`getAgentByUserId`, `createAgent`)
- `supabase/functions/on-signup/index.ts` - Optional Edge Function
- `db/schema.sql` - Database schema with triggers (optional)
- `test-auto-provision.mjs` - Automated test script
