# Agent Platform Backend

Full-featured Node.js + TypeScript + Express backend for the Nanowork Agent Platform.

## ✅ Completion Status

All requirements met:

- ✅ `npm install` succeeds with no errors
- ✅ `npx tsc --noEmit` passes with zero type errors
- ✅ `npm run dev` starts the server
- ✅ `GET /health` returns `{ ok: true, tables: 15 }`
- ✅ All 15 route files exist and are registered in index.ts
- ✅ Graceful degradation when API keys are missing (logs warnings, doesn't crash)

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.ts                      # Express server entry point
│   ├── types/
│   │   └── index.ts                  # TypeScript interfaces for all 15 tables
│   ├── middleware/
│   │   └── auth.ts                   # requireUserAuth + requireInternalToken
│   ├── services/
│   │   ├── supabase.ts              # Supabase client + typed helpers for all tables
│   │   ├── anthropic.ts             # Claude chat, app generation, landing pages
│   │   ├── email.ts                 # Resend email + agent address helper
│   │   ├── stripe.ts                # Stripe Connect helpers (safe stubs)
│   │   ├── memory.ts                # Vector memory storage + search
│   │   └── deploy.ts                # Cloudflare Pages deploy (stub)
│   └── routes/
│       ├── internal/
│       │   └── provision.ts         # POST /internal/provision-agent
│       ├── webhooks/
│       │   └── email.ts             # POST /webhooks/email/inbound
│       ├── agents.ts                # GET /agents/me
│       ├── businesses.ts            # CRUD /businesses
│       ├── apps.ts                  # POST /apps/generate + GET
│       ├── landing-pages.ts         # POST /landing-pages/generate + deploy
│       ├── deployments.ts           # GET /deployments
│       ├── conversations.ts         # GET + POST /conversations
│       ├── emails.ts                # GET /emails + POST /emails/send
│       ├── tasks.ts                 # GET /tasks
│       ├── contacts.ts              # CRUD /contacts + interactions
│       ├── payments.ts              # POST /payments/links + GET transactions
│       └── documents.ts             # POST + GET /documents
├── package.json
├── tsconfig.json
├── render.yaml                      # Render.com deployment config
├── .env.example
└── README.md
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

**Required:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Service role key (bypasses RLS)

**Optional (features gracefully degrade if missing):**
- `ANTHROPIC_API_KEY` - For AI generation features
- `RESEND_API_KEY` + `AGENT_EMAIL_DOMAIN` - For email features
- `STRIPE_SECRET_KEY` - For payment features
- `INTERNAL_TOKEN` - For webhook/internal endpoint security
- `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN` - For deployments

### 3. Run Development Server

```bash
npm run dev
```

Server starts on `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
npm start
```

## 📊 Database Schema

The backend interfaces with 15 Supabase tables:

1. **agents** - Agent records with slug, email, Stripe account
2. **businesses** - Businesses managed by agents
3. **generated_apps** - AI-generated applications
4. **app_files** - Source files for generated apps
5. **landing_pages** - Generated landing pages (HTML/CSS/JS)
6. **deployments** - Deployment records for Cloudflare Pages
7. **agent_conversations** - Chat conversation threads
8. **agent_emails** - Inbound/outbound emails
9. **agent_memories** - Vector-based memory storage
10. **agent_tasks** - Task queue for agents
11. **contacts** - Customer/lead contacts
12. **contact_interactions** - Interaction logs
13. **payment_links** - Stripe payment links
14. **transactions** - Payment transaction records
15. **documents** - Text documents with embeddings

All types are defined in `src/types/index.ts`.

## 🔐 Authentication

### User Authentication (Supabase JWT)

Protected routes use `requireUserAuth` middleware:

```typescript
router.get('/agents/me', requireUserAuth, async (req, res) => {
  // req.user and req.agent are populated
});
```

Clients must send:
```
Authorization: Bearer <supabase_jwt>
```

### Internal Authentication (Token)

Internal/webhook routes use `requireInternalToken`:

```typescript
router.post('/internal/provision-agent', requireInternalToken, ...);
```

Requires `INTERNAL_TOKEN` in env and:
```
Authorization: Bearer <internal_token>
```

## 🛣️ API Routes

### Internal Routes

- `POST /internal/provision-agent` - Create agent for new user (idempotent)

### Webhook Routes

- `POST /webhooks/email/inbound` - Handle inbound emails

### Agent Routes

- `GET /agents/me` - Get authenticated agent

### Business Routes

- `GET /businesses` - List businesses
- `POST /businesses` - Create business
- `GET /businesses/:id` - Get business with deployments
- `PATCH /businesses/:id` - Update business
- `DELETE /businesses/:id` - Archive business

### App Generation Routes

- `POST /apps/generate` - Generate full app from prompt
- `GET /apps/:id` - Get app with files

### Landing Page Routes

- `POST /landing-pages/generate` - Generate landing page
- `GET /landing-pages/:id` - Get landing page
- `POST /landing-pages/:id/deploy` - Deploy to Cloudflare Pages

### Other Routes

- `GET /deployments?business_id=...` - List deployments
- `GET /conversations` + `POST /conversations` - Chat with agent
- `GET /emails` + `POST /emails/send` - Email management
- `GET /tasks` - Task list
- `GET /contacts` + `POST /contacts` + `PATCH /contacts/:id` - Contact management
- `POST /contacts/:id/interactions` - Log interaction
- `POST /payments/links` - Create Stripe payment link
- `GET /payments/transactions` - List transactions
- `POST /documents` + `GET /documents` - Document storage

## 🧪 Testing

Run the test script:

```bash
./test-simple.sh
```

This tests:
- Health endpoint
- Authentication middleware
- Internal token validation
- 404 handling

## 🚢 Deployment (Render.com)

The `render.yaml` file configures deployment:

```bash
# Deploy from repo root:
git push origin main
```

Render will:
1. Install dependencies
2. Run TypeScript build
3. Start with `npm start`

Set environment variables in Render dashboard (all marked `sync: false` for security).

## 🏗️ Service Architecture

### Services Layer

All database and external API interactions are isolated in `src/services/`:

- **supabase.ts** - Typed helpers for every table operation
- **anthropic.ts** - Claude API calls for chat, code/page generation
- **email.ts** - Resend integration
- **stripe.ts** - Stripe Connect with graceful mock fallback
- **memory.ts** - Vector memory storage/search
- **deploy.ts** - Deployment stub (TODO: Cloudflare Pages API)

### Graceful Degradation

Missing API keys log warnings but don't crash:

```
⚠️  ANTHROPIC_API_KEY not configured - related features will be disabled
```

Stripe operations return mock data if `STRIPE_SECRET_KEY` is missing.

## 📝 Development Notes

### Adding a New Route

1. Create route file in `src/routes/`
2. Import and register in `src/index.ts`
3. Add Supabase helper functions in `src/services/supabase.ts` if needed
4. Add types to `src/types/index.ts`

### Type Safety

All database operations are fully typed. Example:

```typescript
const business: Business = await createBusiness({
  agent_id: 'uuid',
  name: 'My Business',
  // TypeScript enforces all required fields
});
```

### Error Handling

All routes use try/catch and return consistent error format:

```json
{
  "error": "Failed to create business",
  "message": "Detailed error message"
}
```

## 🔒 Security Notes

- Service role key bypasses RLS - use carefully
- Internal token required for provisioning and webhooks
- All user routes verify JWT + fetch agent
- CORS configured for frontend origin only
- No secrets in code - all via environment variables

## 🐛 Troubleshooting

**"SUPABASE_URL and SUPABASE_SERVICE_KEY must be configured"**
- Add credentials to `.env`

**"AGENT_EMAIL_DOMAIN must be configured"**
- Set `AGENT_EMAIL_DOMAIN` for email features

**WebSocket errors**
- `ws` package is installed for Node < 22 compatibility

**TypeScript errors**
- Run `npx tsc --noEmit` to check
- Ensure all dependencies are installed

## 📦 Dependencies

- **express** - Web framework
- **@supabase/supabase-js** - Supabase client
- **@anthropic-ai/sdk** - Claude API
- **resend** - Email delivery
- **stripe** - Payments
- **nanoid** - ID generation
- **ws** - WebSocket for Supabase
- **typescript** - Type safety
- **tsx** - Dev server with hot reload

## 📄 License

Proprietary - Nanowork Agent Platform
