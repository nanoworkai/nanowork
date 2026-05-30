# Backend Security Guide

Quick reference for maintaining secure routes and data access.

## ⚠️ Golden Rules

1. **NEVER allow users to INSERT into `credits_transactions` table**
2. **ALWAYS verify ownership before returning build/company data**
3. **ALWAYS use middleware for ownership checks (don't duplicate logic)**
4. **ALWAYS require authentication on WebSocket connections**
5. **NEVER trust client-supplied IDs without verification**

---

## Route Security Checklist

When creating a new API route:

- [ ] Add `requireUserAuth` middleware
- [ ] Add ownership verification middleware if accessing user resources
- [ ] Use service role for backend operations only
- [ ] Log security events for unauthorized attempts
- [ ] Test with invalid/other user's IDs

---

## Ownership Verification Middleware

### When to use:

Use ownership middleware **before** accessing any user-specific resource:

```typescript
import { requireUserAuth } from '../middleware/auth';
import { 
  verifyBuildOwnership,
  verifyCompanyOwnership,
  verifyDocumentOwnership 
} from '../middleware/buildOwnership';

// ✅ CORRECT: Ownership verified
router.get('/builds/:buildId/data', 
  requireUserAuth, 
  verifyBuildOwnership, 
  handler
);

// ❌ WRONG: No ownership check
router.get('/builds/:buildId/data', 
  requireUserAuth, 
  handler  // User could access other users' builds!
);
```

### Available Middleware:

#### `verifyBuildOwnership`
- Checks if user owns the build (via agent ownership)
- Param: `:buildId` or `:id`
- Logs unauthorized attempts

#### `verifyCompanyOwnership`
- Checks if user owns the company
- Param: `:companyId` or `:id`
- Logs unauthorized attempts

#### `verifyDocumentOwnership`
- Checks if user owns the document (via company ownership)
- Param: `:documentId` or `:id`
- Logs unauthorized attempts

---

## Example: Secure Route

```typescript
import { Router, Response } from 'express';
import { requireUserAuth } from '../middleware/auth';
import { verifyBuildOwnership } from '../middleware/buildOwnership';
import { AuthenticatedRequest } from '../types';
import { getSupabase } from '../services/supabase';

const router = Router();

// ✅ SECURE ROUTE
router.get(
  '/builds/:buildId/data', 
  requireUserAuth,           // 1. Verify JWT token
  verifyBuildOwnership,      // 2. Verify user owns build
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { buildId } = req.params;
      
      // Ownership already verified - safe to query
      const { data, error } = await getSupabase()
        .from('generated_apps')
        .select('*')
        .eq('id', buildId)
        .single();
      
      if (error || !data) {
        res.status(404).json({ error: 'Build not found' });
        return;
      }
      
      res.json({ build: data });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch build' });
    }
  }
);
```

---

## Common Security Mistakes

### ❌ MISTAKE 1: No Ownership Check

```typescript
// VULNERABLE CODE
router.get('/builds/:buildId/data', requireUserAuth, async (req, res) => {
  const { buildId } = req.params;
  
  // Anyone can access any build!
  const { data } = await supabase
    .from('generated_apps')
    .select('*')
    .eq('id', buildId)
    .single();
  
  res.json({ build: data });
});
```

**Fix:** Add `verifyBuildOwnership` middleware

---

### ❌ MISTAKE 2: Trusting Client-Supplied User ID

```typescript
// VULNERABLE CODE
router.post('/credits/add', requireUserAuth, async (req, res) => {
  const { userId, amount } = req.body;  // User could supply any userId!
  
  await supabase.from('credits_transactions').insert({
    user_id: userId,  // ❌ Attacker could add credits to any account
    amount: amount,
  });
});
```

**Fix:** Always use `req.user.id` from authenticated session:

```typescript
// SECURE CODE
router.post('/credits/add', requireUserAuth, async (req, res) => {
  const userId = req.user.id;  // ✅ From JWT token
  const { amount } = req.body;
  
  // ... rest of code
});
```

---

### ❌ MISTAKE 3: Inconsistent Ownership Checks

```typescript
// VULNERABLE CODE - Logic drift
router.get('/builds/:buildId/documents', requireUserAuth, async (req, res) => {
  // Check 1: Using agent_id
  const build = await supabase
    .from('generated_apps')
    .select('*')
    .eq('id', buildId)
    .eq('agent_id', req.agent.id)  // ❌ What if agent ownership changes?
    .single();
});

router.get('/builds/:buildId/spreadsheets', requireUserAuth, async (req, res) => {
  // Check 2: Using user_id through join - different logic!
  const build = await supabase
    .from('generated_apps')
    .select('*, agents!inner(user_id)')
    .eq('id', buildId)
    .eq('agents.user_id', req.user.id)
    .single();
});
```

**Fix:** Use centralized middleware with database function:

```typescript
// SECURE CODE - Consistent
router.get('/builds/:buildId/documents', 
  requireUserAuth, 
  verifyBuildOwnership,  // ✅ Uses verify_build_ownership() function
  handler
);

router.get('/builds/:buildId/spreadsheets', 
  requireUserAuth, 
  verifyBuildOwnership,  // ✅ Same function, consistent logic
  handler
);
```

---

## WebSocket Security

### ✅ SECURE: Token-based Authentication

```typescript
// Frontend
const token = supabase.auth.session()?.access_token;
const ws = new WebSocket(`wss://api.nanowork.ai/ws?token=${token}`);

ws.send(JSON.stringify({
  type: 'subscribe',
  buildId: userOwnedBuildId
}));
```

### ❌ INSECURE: No Authentication

```typescript
// VULNERABLE - Anyone can connect
const ws = new WebSocket('wss://api.nanowork.ai/ws');
ws.send(JSON.stringify({
  type: 'subscribe',
  buildId: 'any-build-id'  // ❌ Could be someone else's build
}));
```

---

## RLS Policy Guidelines

When creating new tables, follow these RLS patterns:

### Pattern 1: Direct User Ownership

```sql
-- For tables with direct user_id column
CREATE POLICY "Users can view own records"
  ON table_name FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own records"
  ON table_name FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Pattern 2: Indirect Ownership (via company)

```sql
-- For tables owned through companies
CREATE POLICY "Users can view records for own companies"
  ON table_name FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );
```

### Pattern 3: Service Role Only

```sql
-- For sensitive operations (credits, system records)
CREATE POLICY "Service role only"
  ON table_name FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
```

---

## Security Audit Log

Log unauthorized attempts:

```typescript
import { getSupabase } from '../services/supabase';

async function logSecurityEvent(event: {
  event_type: string;
  user_id: string;
  resource_type: string;
  resource_id: string;
  action: string;
}) {
  try {
    await getSupabase()
      .from('security_audit_log')
      .insert({
        ...event,
        created_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Usage
if (!ownsResource) {
  await logSecurityEvent({
    event_type: 'unauthorized_access',
    user_id: req.user.id,
    resource_type: 'build',
    resource_id: buildId,
    action: 'view_attempt',
  });
  
  res.status(403).json({ error: 'Forbidden' });
}
```

---

## Query Security Audit Logs

```sql
-- Recent unauthorized attempts
SELECT * FROM security_audit_log 
WHERE event_type LIKE 'unauthorized%'
ORDER BY created_at DESC 
LIMIT 100;

-- Suspicious user
SELECT * FROM security_audit_log 
WHERE user_id = 'suspicious-user-id'
ORDER BY created_at DESC;

-- Resource access attempts
SELECT * FROM security_audit_log 
WHERE resource_type = 'build'
  AND resource_id = 'specific-build-id'
ORDER BY created_at DESC;
```

---

## Testing Routes

Test with these scenarios:

### Test 1: Valid Access
```bash
curl -H "Authorization: Bearer $VALID_TOKEN" \
  https://api.nanowork.ai/api/builds/$YOUR_BUILD_ID/data
# Expected: 200 OK
```

### Test 2: No Token
```bash
curl https://api.nanowork.ai/api/builds/$YOUR_BUILD_ID/data
# Expected: 401 Unauthorized
```

### Test 3: Invalid Token
```bash
curl -H "Authorization: Bearer invalid-token" \
  https://api.nanowork.ai/api/builds/$YOUR_BUILD_ID/data
# Expected: 401 Unauthorized
```

### Test 4: Other User's Resource
```bash
curl -H "Authorization: Bearer $YOUR_TOKEN" \
  https://api.nanowork.ai/api/builds/$OTHER_USERS_BUILD_ID/data
# Expected: 403 Forbidden
# Check: Entry in security_audit_log
```

---

## Questions?

- See migration: `supabase/migrations/20260529000001_security_fixes_rls_and_websockets.sql`
- See audit report: `SECURITY_AUDIT_2026-05-29.md`
- See middleware: `apps/backend/src/middleware/buildOwnership.ts`
