# Agent Platform Setup Guide

Complete end-to-end setup for the Nanowork Agent Platform.

## Overview

This system automatically provisions 7 AI agents (Sales, Marketing, Ops, Finance, Product, HR, Support) for each new user. Each agent gets:
- Unique email address
- Memory storage (pgvector)
- Conversation management
- Task tracking
- Document access

## Architecture

```
User Signup → Supabase Edge Function → FastAPI Backend → Database
Inbound Email → Cloudflare Worker → FastAPI Backend → agent_emails table
Outbound Email → FastAPI Backend → Resend API → Customer
```

## Prerequisites

- Supabase project (free tier works)
- Render account (for Python backend hosting)
- Cloudflare account with domain (free tier works)
- Resend account (free tier works)

---

## Phase 1: Local Backend Setup

### 1.1 Install Python dependencies

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 1.2 Create local environment file

```bash
cp .env.example .env
```

Edit `.env` and fill in:
```
ENVIRONMENT=development
INTERNAL_TOKEN=<generate-random-32-char-string>
FRONTEND_URL=http://localhost:5173
```

Leave Supabase/Anthropic/Resend keys empty for now.

### 1.3 Test local server

```bash
python -m uvicorn app.main:app --reload --port 8000
```

Visit http://localhost:8000/health - should return `{"status": "ok"}`

---

## Phase 2: Database Setup

### 2.1 Get Supabase credentials

From Supabase Dashboard:
- Project URL: Settings → API → Project URL
- Service Role Key: Settings → API → service_role (secret!)
- Project Ref: Settings → General → Reference ID
- Database Password: Settings → Database → Database Password

### 2.2 Link Supabase CLI

```bash
supabase login  # Opens browser
supabase link --project-ref <YOUR_PROJECT_REF>
```

### 2.3 Run database schema

```bash
# From project root
PGPASSWORD="<YOUR_DB_PASSWORD>" psql \
  "postgresql://postgres:<PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres" \
  -f schema.sql
```

### 2.4 Verify tables exist

In Supabase SQL Editor, run:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'agent%';
```

Should return: agents, agent_emails, agent_conversations, agent_tasks, agent_memories, agent_documents

### 2.5 Verify pgvector extension

```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

If not present: Supabase Dashboard → Database → Extensions → search "vector" → Enable

### 2.6 Set database configuration

In Supabase SQL Editor, run:
```sql
ALTER DATABASE postgres SET app.edge_function_url = 'https://<PROJECT_REF>.supabase.co/functions/v1/on-signup';
ALTER DATABASE postgres SET app.supabase_service_key = '<YOUR_SERVICE_ROLE_KEY>';
```

---

## Phase 3: Deploy Edge Function

### 3.1 Deploy the function

```bash
# From project root
supabase functions deploy on-signup
```

### 3.2 Set Edge Function secrets

You'll need your Render backend URL. If not deployed yet, use a placeholder and update later.

```bash
supabase secrets set BACKEND_URL=https://your-app.onrender.com
supabase secrets set INTERNAL_TOKEN=<SAME_AS_BACKEND_ENV>
```

### 3.3 Verify deployment

```bash
supabase functions list
```

Should show `on-signup` with status "Deployed"

---

## Phase 4: Deploy Backend to Render

### 4.1 Push code to GitHub

```bash
git add .
git commit -m "Add agent platform"
git push origin main
```

### 4.2 Create Render service

- Go to Render Dashboard → New → Web Service
- Connect your GitHub repo
- Render should auto-detect the `render.yaml` config
- Click **Create Web Service**

### 4.3 Set environment variables

In Render Dashboard → your service → Environment:

```
SUPABASE_URL = https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY = <service-role-key>
ANTHROPIC_API_KEY = <your-anthropic-key>
INTERNAL_TOKEN = <same-32-char-string-from-local>
AGENT_EMAIL_DOMAIN = agents.yourdomain.com
RESEND_API_KEY = <leave-empty-for-now>
FRONTEND_URL = https://nanowork.app
```

Click **Save Changes** - Render will redeploy.

### 4.4 Verify deployment

Once deployed, visit: `https://your-app.onrender.com/health`

Should return JSON with configuration status.

### 4.5 Update Edge Function with real backend URL

```bash
supabase secrets set BACKEND_URL=https://your-app.onrender.com
```

---

## Phase 5: Email Setup (Outbound)

Follow **RESEND_SETUP.md** for detailed instructions.

**Quick steps:**
1. Sign up at resend.com
2. Add domain: `agents.yourdomain.com`
3. Add DNS records (Cloudflare recommended)
4. Verify domain
5. Create API key
6. Add to Render env vars: `RESEND_API_KEY`

---

## Phase 6: Email Setup (Inbound)

Follow **CLOUDFLARE_EMAIL_SETUP.md** for detailed instructions.

**Quick steps:**
1. Cloudflare Dashboard → Email → Enable Email Routing
2. Verify email routing
3. Deploy worker: `cd apps/worker && wrangler deploy`
4. Set worker secrets: BACKEND_URL, INTERNAL_TOKEN, AGENT_DOMAIN
5. Configure catch-all rule → Send to Worker

---

## Phase 7: Testing

### 7.1 Test manual provisioning

```bash
curl -X POST https://your-app.onrender.com/api/agents/internal/provision-agent \
  -H "Content-Type: application/json" \
  -H "X-Internal-Token: YOUR_INTERNAL_TOKEN" \
  -d '{
    "user_id": "00000000-0000-0000-0000-000000000001",
    "email": "test@example.com"
  }'
```

Expected: `{"agents": [...], "created": true}` with 7 agents

### 7.2 Verify in database

Supabase → Table Editor → agents table → should see 7 rows

### 7.3 Test signup flow

1. Supabase Dashboard → Authentication → Users → Invite User
2. Enter email, confirm
3. Wait 5 seconds
4. Check agents table - should have 7 new agents for that user

### 7.4 Test inbound email

```bash
echo "Test message" | mail -s "Test" <agent-email-from-database>
```

Check agent_emails table - should see the email stored.

---

## Troubleshooting

### Agents not provisioning on signup

**Check Edge Function logs:**
```bash
supabase functions logs on-signup --limit 20
```

**Common issues:**
- BACKEND_URL incorrect (check for trailing slash)
- INTERNAL_TOKEN mismatch
- Backend not responding (check Render logs)

### Emails not arriving

**Inbound emails:**
- Verify Cloudflare Email Routing is enabled
- Check catch-all rule points to worker
- Check worker logs: `wrangler tail`

**Outbound emails:**
- Verify Resend domain is verified
- Check RESEND_API_KEY is set
- View Resend Dashboard → Logs

### Database connection issues

- Verify SUPABASE_SERVICE_ROLE_KEY is correct (not anon key!)
- Check RLS policies allow service role access
- Verify pgvector extension is enabled

---

## Next Steps

Once the foundation is working:

1. **Agent Chat UI** - Build frontend for users to chat with agents
2. **Email Processing** - Implement agent email response logic
3. **Memory System** - Add RAG with pgvector embeddings
4. **Task Automation** - Build task creation and completion flows
5. **Stripe Connect** - Add per-company payment processing
6. **Multi-company** - Allow users to manage multiple companies

---

## Security Checklist

- [ ] `INTERNAL_TOKEN` is strong (32+ random characters)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is never exposed to frontend
- [ ] RLS policies are enabled on all agent tables
- [ ] Cloudflare Email Worker only accepts Cloudflare-routed emails
- [ ] Resend domain is verified (prevents spoofing)
- [ ] Environment variables are set in Render (not committed to git)

---

## Support

If you encounter issues:
1. Check Render logs: Dashboard → your service → Logs
2. Check Supabase Edge Function logs: `supabase functions logs on-signup`
3. Check Cloudflare Worker logs: `wrangler tail`
4. Verify all environment variables are set correctly
5. Test each phase independently before moving to the next

The system is designed to be modular - if emails aren't working, provisioning should still work, etc.
