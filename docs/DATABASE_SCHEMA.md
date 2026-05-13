# Database Schema Overview

Visual reference for the 15-table Agent Platform schema.

## Table Relationships

```
auth.users (Supabase Auth)
    ↓
┌─────────────────────────────────────────────────────────────┐
│  agents                                                      │
│  • One agent per user                                       │
│  • Unique slug (8 chars)                                    │
│  • Email: a-{slug}@domain.com                               │
│  • Stripe Connect account ID                                │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│  businesses                                                  │
│  • Multiple businesses per agent                            │
│  • Status: planning → building → live → archived            │
│  • Tracks revenue_cents                                     │
└─────────────────────────────────────────────────────────────┘
    ↓
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  generated_apps  │  │  landing_pages   │  │  deployments     │
│  • Framework     │  │  • HTML/CSS/JS   │  │  • Cloudflare    │
│  • Tech stack    │  │  • Status        │  │  • Deploy URL    │
│  • Files[]       │  │  • Metadata      │  │  • Status        │
└──────────────────┘  └──────────────────┘  └──────────────────┘
    ↓
┌──────────────────┐
│  app_files       │
│  • Path          │
│  • Content       │
│  • Language      │
└──────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Agent Data (linked to agents table)                        │
├──────────────────┬──────────────────┬──────────────────────┤
│ agent_emails     │ agent_memories   │ agent_tasks          │
│ • Inbound        │ • Vector store   │ • Task queue         │
│ • Outbound       │ • Embeddings     │ • Status tracking    │
│ • Reply threads  │ • RAG search     │ • Error handling     │
├──────────────────┼──────────────────┼──────────────────────┤
│ conversations    │ contacts         │ documents            │
│ • Chat threads   │ • Leads          │ • Text docs          │
│ • Messages[]     │ • Customers      │ • Embeddings         │
│ • Business link  │ • Interactions   │ • Search index       │
└──────────────────┴──────────────────┴──────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Payments (Stripe Connect)                                  │
├──────────────────────────────┬──────────────────────────────┤
│  payment_links               │  transactions                │
│  • Stripe payment link ID    │  • Payment intent ID         │
│  • Amount + currency         │  • Amount + status           │
│  • URL                       │  • Links to payment_link     │
└──────────────────────────────┴──────────────────────────────┘
```

## Table Specifications

### 1. agents
**Purpose:** Core agent record - one per user

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → auth.users, unique |
| slug | TEXT | 8-char unique identifier |
| email | TEXT | a-{slug}@domain.com |
| name | TEXT | Display name |
| stripe_account_id | TEXT | Stripe Connect account |
| stripe_onboarding_complete | BOOLEAN | Onboarding status |
| system_prompt | TEXT | Custom AI instructions |
| status | TEXT | active/paused/archived |
| metadata | JSONB | Flexible storage |

**Indexes:** user_id, slug, email, status

---

### 2. businesses
**Purpose:** Businesses managed by agents

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| agent_id | UUID | FK → agents |
| name | TEXT | Business name |
| tagline | TEXT | Short description |
| description | TEXT | Full description |
| idea_prompt | TEXT | Original idea |
| status | TEXT | planning/building/live/archived |
| revenue_cents | INTEGER | Total revenue tracking |
| metadata | JSONB | Custom data |

**Indexes:** agent_id, status, created_at

---

### 3. generated_apps
**Purpose:** AI-generated applications

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| business_id | UUID | FK → businesses |
| framework | TEXT | React, Next.js, etc. |
| tech_stack | TEXT[] | Array of technologies |
| status | TEXT | generating/ready/deployed/failed |
| prompt | TEXT | Generation prompt |
| error_message | TEXT | Error details if failed |

**Indexes:** business_id, status

---

### 4. app_files
**Purpose:** Source code files for generated apps

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| app_id | UUID | FK → generated_apps |
| path | TEXT | File path (e.g., src/index.ts) |
| content | TEXT | File contents |
| language | TEXT | typescript, javascript, css, etc. |

**Unique:** (app_id, path)
**Indexes:** app_id

---

### 5. landing_pages
**Purpose:** Generated landing pages

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| business_id | UUID | FK → businesses |
| html | TEXT | HTML content |
| css | TEXT | CSS styles |
| js | TEXT | JavaScript code |
| status | TEXT | draft/live/archived |

**Indexes:** business_id, status

---

### 6. deployments
**Purpose:** Deployment tracking

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| business_id | UUID | FK → businesses |
| artifact_type | TEXT | landing_page/generated_app |
| artifact_id | UUID | ID of deployed artifact |
| platform | TEXT | cloudflare_pages/vercel/netlify |
| deploy_url | TEXT | Public URL |
| status | TEXT | pending/deploying/success/failed |
| deployed_at | TIMESTAMPTZ | Deployment timestamp |

**Indexes:** business_id, artifact_id, status

---

### 7. agent_conversations
**Purpose:** Chat conversation threads

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| agent_id | UUID | FK → agents |
| business_id | UUID | FK → businesses (optional) |
| messages | JSONB | Array of {role, content} |
| metadata | JSONB | Custom data |

**Indexes:** agent_id, business_id, created_at

---

### 8. agent_emails
**Purpose:** Email records (inbound/outbound)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| agent_id | UUID | FK → agents |
| business_id | UUID | FK → businesses (optional) |
| direction | TEXT | inbound/outbound |
| from_address | TEXT | Sender email |
| to_addresses | TEXT[] | Recipients |
| subject | TEXT | Email subject |
| body_text | TEXT | Plain text body |
| body_html | TEXT | HTML body |
| external_message_id | TEXT | Provider message ID |
| reply_to_email_id | UUID | FK → agent_emails (threading) |

**Indexes:** agent_id, business_id, direction, created_at, external_message_id

---

### 9. agent_memories
**Purpose:** Vector-based memory storage (RAG)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| agent_id | UUID | FK → agents |
| business_id | UUID | FK → businesses (optional) |
| content | TEXT | Memory text |
| memory_type | TEXT | conversation/fact/action/etc. |
| source | TEXT | Where memory came from |
| embedding | vector(1536) | OpenAI/Voyage embedding |
| metadata | JSONB | Custom data |

**Indexes:** agent_id, business_id, memory_type, embedding (IVFFlat)
**Function:** `match_agent_memories(embedding, agent_id)` for similarity search

---

### 10. agent_tasks
**Purpose:** Task queue for agents

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| agent_id | UUID | FK → agents |
| business_id | UUID | FK → businesses (optional) |
| task_type | TEXT | email_received/business_created/etc. |
| status | TEXT | pending/in_progress/completed/failed |
| payload | JSONB | Task input data |
| result | JSONB | Task output data |
| error_message | TEXT | Error if failed |
| completed_at | TIMESTAMPTZ | Completion timestamp |

**Indexes:** agent_id, business_id, status, task_type, created_at

---

### 11. contacts
**Purpose:** Customer/lead contact records

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| agent_id | UUID | FK → agents |
| business_id | UUID | FK → businesses (optional) |
| name | TEXT | Contact name |
| email | TEXT | Email address |
| phone | TEXT | Phone number |
| company | TEXT | Company name |
| status | TEXT | lead/customer/partner/archived |

**Unique:** (agent_id, email)
**Indexes:** agent_id, business_id, status, email

---

### 12. contact_interactions
**Purpose:** Interaction logs with contacts

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| contact_id | UUID | FK → contacts |
| agent_id | UUID | FK → agents |
| interaction_type | TEXT | email/call/meeting/note |
| notes | TEXT | Interaction notes |

**Indexes:** contact_id, agent_id, interaction_type, created_at

---

### 13. payment_links
**Purpose:** Stripe payment links

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| agent_id | UUID | FK → agents |
| business_id | UUID | FK → businesses |
| stripe_payment_link_id | TEXT | Stripe ID (unique) |
| title | TEXT | Payment description |
| amount_cents | INTEGER | Amount in cents |
| currency | TEXT | USD, EUR, etc. |
| url | TEXT | Stripe payment URL |
| status | TEXT | active/expired/archived |

**Indexes:** agent_id, business_id, status, stripe_payment_link_id

---

### 14. transactions
**Purpose:** Payment transaction records

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| agent_id | UUID | FK → agents |
| business_id | UUID | FK → businesses |
| payment_link_id | UUID | FK → payment_links (optional) |
| stripe_payment_intent_id | TEXT | Stripe payment intent |
| amount_cents | INTEGER | Amount in cents |
| currency | TEXT | USD, EUR, etc. |
| status | TEXT | pending/succeeded/failed/refunded |

**Indexes:** agent_id, business_id, payment_link_id, stripe_payment_intent_id, status, created_at

---

### 15. documents
**Purpose:** Text documents with embeddings

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| agent_id | UUID | FK → agents |
| business_id | UUID | FK → businesses (optional) |
| title | TEXT | Document title |
| content | TEXT | Document body |
| embedding | vector(1536) | Text embedding |

**Indexes:** agent_id, business_id, created_at, embedding (IVFFlat)
**Function:** `match_documents(embedding, agent_id)` for similarity search

---

## Security Features

### Row Level Security (RLS)

All 15 tables have RLS enabled with policies ensuring:
- Users can only access data for their own agent
- Complete data isolation between users
- Service role key bypasses RLS for backend operations

### Automatic Triggers

- `updated_at` automatically updated on all applicable tables
- Cascading deletes maintain referential integrity

### Vector Search

Two similarity search functions:
- `match_agent_memories` - Search memories by semantic similarity
- `match_documents` - Search documents by semantic similarity

Both use cosine similarity with configurable threshold.

## Performance Optimizations

- **65+ indexes** covering all foreign keys and frequently filtered columns
- **IVFFlat indexes** for fast vector similarity search
- **JSONB columns** for flexible metadata without schema changes
- **Timestamp indexes** for efficient date range queries
- **Partial indexes** on status columns for active records

## Data Flow Example

```
1. User signs up → auth.users created
2. Backend provisions agent → agents table
3. Agent creates business → businesses table
4. Generate landing page → landing_pages table
5. Deploy to Cloudflare → deployments table
6. Contact fills form → contacts table
7. Agent sends follow-up → agent_emails table (outbound)
8. Contact replies → agent_emails table (inbound)
9. Task created → agent_tasks table
10. Conversation logged → agent_memories table (with embedding)
11. Payment link sent → payment_links table
12. Payment received → transactions table
13. Revenue updated → businesses.revenue_cents
```

## Backup Strategy

- Daily automated backups (Supabase Pro/Team)
- Point-in-time recovery available
- Manual exports via `pg_dump`
- All data encrypted at rest
