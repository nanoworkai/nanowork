# Black Screen Bug Fix - Post-Mortem

## Issue
After implementing the claim business flow (commit 4b64b55), the application showed a completely black screen with no console errors.

## Root Causes (Identified by Agent Diagnosis)

### 1. **Schema Field Mismatch** (CRITICAL)
**Problem:** The `loadCompanies` function in AuthContext was querying with `user_id`, but the database schema uses `owner_id`.

```typescript
// ❌ BEFORE (incorrect)
.eq("user_id", userId)

// ✅ AFTER (correct)
.eq("owner_id", userId)
```

**Impact:** Companies never loaded from the database, causing the dashboard to show nothing (black screen).

### 2. **Race Condition in Signup Flow** (CRITICAL)
**Problem:** After calling `signUp()`, the code immediately tried to:
1. Call `supabase.auth.getUser()` 
2. Create a company record

However, the auth session wasn't fully established yet, causing `getUser()` to return null/undefined.

```typescript
// ❌ BEFORE (race condition)
const { error } = await signUp(email, password, name);
// Auth session not yet established!
const { data: userData } = await supabase.auth.getUser(); // Returns null
if (userData.user) {
  await supabase.from('companies').insert({...}); // Never executes
}
```

**Solution:** Move claim processing to `AuthContext.loadCompanies()`, which runs after the session is fully established:

```typescript
// ✅ AFTER (correct timing)
const loadCompanies = useCallback(async (userId: string) => {
  // Process pending claim first (session is now established)
  const pendingClaim = localStorage.getItem('pending_claim');
  if (pendingClaim) {
    await supabase.from('companies').insert({
      owner_id: userId, // userId is guaranteed to be valid here
      ...claim.businessData
    });
    localStorage.removeItem('pending_claim');
  }
  
  // Then load all companies
  const { data } = await supabase.from('companies').select('*').eq('owner_id', userId);
  // ...
});
```

## Diagnosis Process

Used agent fanout to diagnose in parallel:

1. **Browser Console Agent**: Checked for JavaScript errors (found none)
2. **Code Review Agent**: Analyzed recent git diff, identified both critical issues
3. **Build Errors Agent**: Verified no TypeScript/build errors

The Code Review Agent successfully identified:
- The schema mismatch (user_id vs owner_id)
- The race condition timing issue
- Missing error handling on database inserts

## Files Fixed

- `apps/web/src/context/AuthContext.tsx`
  - Changed `user_id` → `owner_id` in query
  - Moved claim processing into `loadCompanies()`
  
- `apps/web/src/pages/Login.tsx`
  - Removed immediate claim processing after signup
  - Changed redirect to `?claim_pending=true`
  
- `apps/web/src/dashboard/Create.tsx`
  - Updated to check for `claim_pending` instead of `claimed`
  - Added 1s delay to allow claim processing

## Testing After Fix

1. ✅ Homepage loads correctly
2. ✅ Claim button stores data in localStorage
3. ✅ Signup page shows claim banner
4. ✅ After signup, user is redirected to dashboard
5. ✅ AuthContext processes claim with valid session
6. ✅ Company appears in user's companies list
7. ✅ Success toast shows after 1s delay

## Lessons Learned

1. **Always verify database schema field names** before writing queries
2. **Auth operations are async and session establishment takes time** - don't immediately call auth methods after signup
3. **Agent diagnosis is highly effective** for identifying race conditions and schema mismatches
4. **Black screens with no console errors** usually indicate data isn't loading, not JavaScript errors

## Commits

- Initial implementation: `4b64b55` - feat: claim business flow
- Bug fix: `0535cbb` - fix: resolve black screen - race condition and schema mismatch
