# Build Creation Troubleshooting Guide

## Common Issues

### 404 - API Path Not Found
**Symptom:** Frontend shows "Cannot POST /api/build" or similar
**Cause:** Backend server not running or incorrect API path
**Fix:** Verify backend runs on port 3000 and frontend uses `/api/build` (not `/build`)

### 401 - Authentication Failed
**Symptom:** "Missing or invalid authorization header"
**Cause:** Missing or expired Supabase JWT token
**Fix:** Check that `Authorization: Bearer <token>` header is sent with valid Supabase session token

### 403 - No Agent Found
**Symptom:** "No agent found for user"
**Cause:** User exists in Supabase auth but no agent record in database
**Fix:** Run provision endpoint: `POST /internal/provision` with user ID to create agent

### 500 - Anthropic API Not Configured
**Symptom:** "Anthropic API not configured" during name generation
**Cause:** Missing `ANTHROPIC_API_KEY` in `.env`
**Fix:** Add valid Anthropic API key to backend `.env` file

### Database Insert Failures
**Symptom:** "Failed to create build" with Supabase error
**Cause:** Missing `generated_apps` table or incorrect schema
**Fix:** Verify table exists with columns: `id`, `agent_id`, `name`, `prompt`, `status`, `framework`, `tech_stack`, `last_activity_at`

## Component Verification

### Backend Server
```bash
cd backend && npm run dev
# Should show: ✅ Server running on port 3000
curl http://localhost:3000/health
```

### Frontend Dev Server
```bash
# From project root
npm run dev
# Should open on http://localhost:5173
```

### Database Connection
```bash
# Check environment variables
cat backend/.env | grep SUPABASE
# Test with: curl localhost:3000/api/agents
```

### Supabase Auth
- Verify user logged in: Check `localStorage` for `supabase.auth.token`
- Test token: Use browser DevTools Network tab to inspect Authorization header

### Anthropic API Key
```bash
# Verify key exists
grep ANTHROPIC_API_KEY backend/.env
# Test with: POST /api/build/generate-name
```

## Step-by-Step Debugging

1. **Browser Console**: Check for JavaScript errors, CORS issues, or network failures
2. **Network Tab**: Verify request URL is `http://localhost:3000/api/build`, status code, and response body
3. **Backend Logs**: Terminal running `npm run dev` shows request logs and errors
4. **Database**: Query `generated_apps` table to verify records inserted correctly

## Quick Fixes

- **CORS Error**: Add frontend URL to `allowedOrigins` in `backend/src/index.ts`
- **Missing Token**: Call `supabase.auth.getSession()` and retry with fresh token
- **Agent Missing**: POST to `/internal/provision` with `Authorization: Bearer <INTERNAL_TOKEN>`
- **DB Schema**: Run migration files in `supabase/migrations/` directory
- **Port Conflict**: Change `PORT=3000` in `.env` if port occupied

## Testing Checklist

- [ ] Backend health endpoint responds: `GET /health`
- [ ] User can authenticate: `POST /api/agents` returns 200
- [ ] Name generation works: `POST /api/build/generate-name` with `{prompt: "test"}`
- [ ] Build creation works: `POST /api/build` with `{name: "Test", prompt: "test"}`
- [ ] Build appears in list: `GET /api/build` includes new build
- [ ] Build details load: `GET /api/build/:id` returns correct build
- [ ] SSE stream connects: `GET /api/build/stream?buildId=<id>&prompt=test` returns events

**Critical Path:** Auth → Agent exists → API key configured → Database writable → Build created
