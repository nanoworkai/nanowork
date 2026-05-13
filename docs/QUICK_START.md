# Quick Start - Agent Platform Backend

**5-minute setup guide**

## 1. Setup Supabase (2 min)

```bash
# Visit: https://supabase.com/dashboard
# 1. Create project (or use existing)
# 2. Database → Extensions → Enable "vector"
# 3. SQL Editor → New query
# 4. Copy/paste backend/db/schema.sql
# 5. Click "Run" (takes ~5 seconds)
# 6. Settings → API → Copy URL + Keys
```

## 2. Configure Backend (1 min)

```bash
cd backend
cp .env.example .env

# Edit .env:
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbG...  # Service role key
SUPABASE_ANON_KEY=eyJhbG...     # Anon public key
INTERNAL_TOKEN=your-secret-123  # Generate random string
```

## 3. Install & Run (2 min)

```bash
npm install        # ~7 seconds
npm run build      # ~3 seconds
npm run dev        # Server starts on :3000
```

## 4. Test

```bash
# Health check
curl http://localhost:3000/health

# Expected: {"ok":true,"tables":15,"timestamp":"..."}
```

## 5. Create Test User & Agent

```bash
# In Supabase Dashboard → Authentication → Users
# Click "Add user" → Enter email + password
# Copy the user_id (UUID)

# Provision agent:
curl -X POST http://localhost:3000/internal/provision-agent \
  -H "Authorization: Bearer YOUR_INTERNAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"paste-user-uuid-here"}'

# Expected: {"agent":{...},"created":true}
```

## ✅ Done!

Backend is running and connected to Supabase.

## Next Steps

- Add optional API keys to .env (Anthropic, Stripe, Resend)
- Deploy to Render.com (push to GitHub, connect in dashboard)
- Build frontend that calls these endpoints

## Full Documentation

- `README.md` - Complete docs
- `SUPABASE_SETUP.md` - Detailed database setup
- `DATABASE_SCHEMA.md` - Schema reference
- `DEPLOYMENT_READY.md` - Production checklist

## Troubleshooting

**"SUPABASE_URL must be configured"**
→ Add credentials to .env

**"vector extension does not exist"**
→ Enable in Supabase: Database → Extensions → vector

**Type errors**
→ Run `npx tsc --noEmit` to check

**Port already in use**
→ Change PORT in .env

## Support

- Issues: GitHub Issues
- Docs: /backend/README.md
- Schema verification: Run db/verify-schema.sql in Supabase
