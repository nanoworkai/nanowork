# Build Creation Solution - Complete Fix

## Problems Identified

### 1. **API Path Mismatch (404 Errors)** ❌
- **Frontend calls:** `/api/build/*`, `/api/agents/*`, etc.
- **Backend mounted at:** `/build`, `/agents`, etc.
- **Result:** All API calls returned 404 Not Found

### 2. **Database Schema Mismatch** ❌
- **Backend code referenced:** `generated_apps` table
- **Actual database table:** `builds` table
- **Different schemas:** Incompatible field names and structure
- **Result:** Build creation would fail even if it reached the database

### 3. **Missing Agent Auto-Provisioning** ❌
- **Build creation requires:** An `agent` record for the user
- **New users had:** No agent record created automatically
- **Result:** 403 Forbidden error - "No agent found for this user"

### 4. **CORS Issues (503 Errors)** ❌
- **Previous setup:** Separate frontend/backend Render services
- **Result:** Cross-origin requests with CORS preflight failures

---

## Solutions Implemented ✅

### 1. Fixed API Path Mismatch ✅
**File:** `/backend/src/index.ts`

**Changed all route mounts to include `/api` prefix:**
```javascript
// Before
app.use('/build', buildsRouter);
app.use('/agents', agentsRouter);
// ... etc

// After
app.use('/api/build', buildsRouter);
app.use('/api/agents', agentsRouter);
// ... etc (14 routes total)
```

**Preserved routes without prefix:**
- `/internal/*` - Internal API endpoints
- `/webhooks/*` - Stripe/email webhooks (no auth needed at route level)

**Result:** Frontend `/api/build` calls now match backend routes ✅

---

### 2. Fixed Database Schema Mismatch ✅
**File:** `/backend/src/routes/builds.ts`

**Changed from `generated_apps` table to `builds` table:**
```javascript
// Before
.from('generated_apps')
.eq('agent_id', req.agent.id)

// After
.from('builds')
.eq('user_id', req.user.id)
```

**Updated field mappings to match actual schema:**

| Backend Expected | Actual `builds` Table |
|-----------------|----------------------|
| `agent_id` → `user_id` |
| `name` → `company_name` |
| `framework` → (removed, not needed) |
| `tech_stack` → (removed, not needed) |
| `last_activity_at` → `created_at` |
| (none) → `credits_cost` (100) |
| (none) → `build_data` (JSONB) |

**Result:** Build CRUD operations now work with correct schema ✅

---

### 3. Implemented Agent Auto-Provisioning ✅
**File:** `/backend/src/middleware/auth.ts`

**Added automatic agent creation during authentication:**
```javascript
// Check if user has an agent
let agent = await getAgentByUserId(user.id);

// If no agent exists, create one automatically
if (!agent) {
  agent = await createAgentForUser(user.id);
}

req.user = user;
req.agent = agent;
```

**Creates agent with:**
- Unique 8-character slug (e.g., `a-x7k9m2p4`)
- Email address: `{slug}@{AGENT_EMAIL_DOMAIN}`
- Status: `active`
- Linked to user via `user_id`

**Database Migration:** `supabase/migrations/20260520000001_add_agents_table.sql`
- Creates `agents` table with proper constraints
- Creates `generated_apps` table for future features
- Sets up RLS policies
- Enforces one agent per user

**Result:** New users automatically get an agent on first login ✅

---

### 4. Single-Origin Deployment (No CORS) ✅
**Files:**
- `/backend/src/index.ts` - Static file serving
- `/render.yaml` - Single web service config
- `/package.json` - Unified build scripts
- `apps/web/.env.production` - Empty `VITE_API_URL`

**Architecture:**
```
Single Render Service (https://nanowork.onrender.com)
├── Express Backend (port 3000)
│   ├── API routes: /api/build/*, /api/agents/*, etc.
│   └── Static files: Serves apps/web/dist
└── Frontend (React/Vite)
    └── API calls are relative: /api/build (same origin)
```

**Result:** No CORS preflight, all requests are same-origin ✅

---

## User Flow - How Build Creation Works

### 1. **User Signs Up**
- Creates account via Supabase Auth
- Gets authenticated JWT token
- ✅ Agent auto-created via middleware

### 2. **User Opens Dashboard**
- Frontend loads at `https://nanowork.onrender.com`
- Makes API call: `GET /api/build` (list existing builds)
- Backend validates JWT, attaches agent, returns empty array `[]`
- ✅ No 404, no 403 errors

### 3. **User Enters Prompt**
- Types in textarea: "Build a dog walking app"
- "Execute" button becomes enabled (was disabled when empty)

### 4. **User Clicks "Execute"**
- **Step 1:** `POST /api/build/generate-name` with prompt
  - Backend uses Anthropic API to generate name
  - Returns: `{ name: "Dog Walking App" }`

- **Step 2:** `POST /api/build` 
  - Creates new build record:
    ```javascript
    {
      prompt: "Build a dog walking app",
      company_name: "Dog Walking App",
      status: "generating",
      credits_cost: 100,
      user_id: "..."
    }
    ```
  - Returns: `{ build: { id: "...", ... } }`

- **Step 3:** Opens SSE connection to `/api/build/stream?buildId=...&prompt=...`
  - Backend streams build generation events in real-time
  - Events: `meta`, `dept_start`, `task`, `dept_done`, `done`
  - Frontend displays departments and tasks as they generate

- **Step 4:** Build completes
  - Status updated to `unlocked`
  - User sees completed build with all departments

✅ **User successfully created their first build!**

---

## Key Environment Variables

### Backend `.env` (Required)
```bash
# Database
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=...
SUPABASE_ANON_KEY=...

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Agent provisioning
AGENT_EMAIL_DOMAIN=nanowork.ai

# Server
PORT=8000  # Development (3000 in production)
NODE_ENV=development

# Payments (optional for builds)
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

### Frontend `.env.local` (Development)
```bash
VITE_API_URL=http://localhost:8000
VITE_SITE_URL=http://localhost:5173
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

### Frontend `.env.production` (Production)
```bash
VITE_API_URL=   # Empty = same-origin
VITE_SITE_URL=https://nanowork.app
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

---

## Testing Locally

### 1. Start Backend
```bash
cd backend
npm run dev
# Server on http://localhost:8000
```

### 2. Start Frontend
```bash
cd apps/web
npm run dev
# Server on http://localhost:5173
```

### 3. Test Flow
1. Open http://localhost:5173
2. Sign up / Log in with Supabase
3. Navigate to dashboard
4. Enter a prompt: "Build a fitness tracker"
5. Click "Execute"
6. Watch build generate in real-time

**Expected result:** Build creates successfully with no errors ✅

---

## Deployment to Render

### 1. Apply Database Migration
```bash
supabase db push
```

### 2. Set Environment Variables in Render Dashboard
- All variables from backend `.env` (except PORT)
- `VITE_*` variables for frontend build

### 3. Deploy from `main` branch
- Render runs: `npm ci && npm run build && cd backend && npm ci`
- Starts: `npm start` (runs backend on port 3000)
- Backend serves both API + frontend static files

### 4. Verify
- Health check: `https://nanowork.onrender.com/health`
- Login and create a build
- No CORS errors, no 404s, no 403s

---

## Files Modified/Created

### Modified
- `/backend/src/index.ts` - API prefix, static serving
- `/backend/src/routes/builds.ts` - Schema mapping
- `/backend/src/middleware/auth.ts` - Auto-provisioning
- `/package.json` - Build scripts
- `/render.yaml` - Single service config
- `/apps/web/.env.production` - Empty API URL
- `/apps/web/src/lib/stripe.ts` - Relative URLs
- `/apps/web/src/lib/scraper.ts` - Relative URLs

### Created
- `/supabase/migrations/20260520000001_add_agents_table.sql`
- `/backend/test-auto-provision.mjs`
- `/backend/AGENT_PROVISIONING.md`
- `/backend/DEPLOYMENT_CHECKLIST.md`
- `/backend/AGENT_AUTO_PROVISION_CHANGES.md`
- `/backend/BUILD_TROUBLESHOOTING.md`
- `/BUILD_CREATION_SOLUTION.md` (this file)

---

## Summary

**All build creation blockers are now fixed:**
✅ API paths aligned (frontend `/api/*` → backend `/api/*`)  
✅ Database schema corrected (`builds` table)  
✅ Agent auto-provisioning implemented  
✅ CORS eliminated (single-origin deployment)  
✅ SSE streaming endpoint working  
✅ Anthropic API integration functional  

**Users can now:**
1. Sign up and get an agent automatically
2. Navigate to dashboard with no errors
3. Enter a prompt and click "Execute"
4. Watch their build generate in real-time
5. See completed builds with all departments

**No broken buttons!** 🎉
