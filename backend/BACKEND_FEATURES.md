# Backend Features Documentation

## Overview

This document describes the backend infrastructure and features implemented for the Nanowork agent platform.

## New Features Implemented

### 1. Rate Limiting (`/backend/src/middleware/rateLimiter.ts`)

In-memory rate limiting middleware to prevent abuse and ensure fair resource usage.

**Features:**
- Configurable rate limits per endpoint
- Per-user and per-IP tracking
- Standard rate limit headers (X-RateLimit-*)
- 429 responses when limits exceeded

**Pre-configured limiters:**
- `apiRateLimiter`: 100 requests/minute (general API)
- `strictRateLimiter`: 10 requests/minute (expensive operations)
- `authRateLimiter`: 5 requests/minute (authentication)

**Production Note:** Replace with Redis-backed rate limiting for multi-instance deployments.

### 2. Request Logging (`/backend/src/middleware/requestLogger.ts`)

Structured request/response logging for debugging and monitoring.

**Features:**
- Logs all incoming requests with timing
- Captures request metadata (query, body, user, IP)
- Measures response time
- Error tracking for 4xx/5xx responses
- Audit logging placeholder for compliance

**Usage:**
```typescript
app.use(requestLogger);
```

### 3. Analytics Service (`/backend/src/services/analytics.ts`)

Dashboard statistics and insights for agents and businesses.

**Functions:**
- `getAgentStats(agentId)`: Comprehensive agent statistics
  - Businesses by status
  - Contacts by status
  - Tasks by status
  - Email counts
  - Conversation and document totals

- `getBusinessStats(businessId)`: Business-specific metrics
  - Deployment statistics
  - Revenue tracking
  - Contact and conversation counts

- `getAgentActivity(agentId, limit)`: Recent activity timeline
  - Tasks, conversations, emails
  - Sorted by timestamp

**API Endpoints:**
- `GET /api/analytics/agent` - Agent statistics
- `GET /api/analytics/business/:businessId` - Business statistics
- `GET /api/analytics/activity` - Activity timeline

### 4. Search Service (`/backend/src/services/search.ts`)

Full-text search across multiple resource types.

**Features:**
- Unified search across businesses, contacts, conversations, documents
- PostgreSQL ILIKE-based text search
- Scoped to agent (with optional business filter)
- Configurable result limits

**Functions:**
- `searchAll(options)`: Search all resource types
- Individual search functions for each resource type

**API Endpoints:**
- `GET /api/search?q=query&limit=10&business_id=uuid` - Global search
- `GET /api/search/suggestions` - Search suggestions

**Production Note:** Add PostgreSQL GIN indexes on search columns for performance.

### 5. Batch Operations (`/backend/src/services/batch.ts`)

Efficient bulk operations for contacts and tasks.

**Features:**
- Batch update contacts
- Batch archive contacts
- Batch import from CSV
- Batch export to CSV
- Batch update tasks

**Functions:**
- `batchUpdateContacts(agentId, updates)`: Update multiple contacts
- `batchArchiveContacts(agentId, contactIds)`: Archive multiple contacts
- `batchImportContacts(agentId, businessId, contacts)`: Import from data
- `batchExportContacts(agentId, businessId)`: Export to CSV
- `batchUpdateTasks(agentId, updates)`: Update multiple tasks

**API Endpoints:**
- `PATCH /api/batch/contacts` - Batch update contacts (max 100)
- `POST /api/batch/contacts/archive` - Batch archive (max 100)
- `POST /api/batch/contacts/import` - Import contacts (max 1000)
- `GET /api/batch/contacts/export` - Export to CSV
- `PATCH /api/batch/tasks` - Batch update tasks (max 100)

### 6. Embeddings Service (`/backend/src/services/embeddings.ts`)

Text embeddings for semantic search and RAG (Retrieval Augmented Generation).

**Supported Providers:**
1. **Voyage AI** (recommended for quality)
   - Set `VOYAGE_API_KEY` env var
   - Model: `voyage-3-lite` (1024 dimensions)

2. **OpenAI**
   - Set `OPENAI_API_KEY` env var
   - Model: `text-embedding-3-small` (1536 dimensions)

3. **Custom OpenAI-compatible**
   - Set `EMBEDDING_API_KEY` and `EMBEDDING_BASE_URL`
   - Use any OpenAI-compatible endpoint

**Functions:**
- `getEmbedding(text)`: Get embedding for text
- `getBatchEmbeddings(texts)`: Batch embeddings
- `cosineSimilarity(a, b)`: Calculate similarity
- `embeddingsEnabled()`: Check if embeddings are configured

**Configuration:**
```bash
# Option 1: Voyage AI (recommended)
VOYAGE_API_KEY=your_key_here

# Option 2: OpenAI
OPENAI_API_KEY=your_key_here

# Option 3: Custom provider
EMBEDDING_API_KEY=your_key_here
EMBEDDING_BASE_URL=https://api.example.com/v1
EMBEDDING_MODEL=text-embedding-3-small
```

**Integration:**
The embeddings service replaces the stub in `anthropic.ts` and is used by:
- Memory service for semantic search
- Document service for content indexing

### 7. Profile Management (`/backend/src/routes/profile.ts`)

User profile and agent settings management.

**API Endpoints:**
- `GET /api/profile` - Get user profile
- `PATCH /api/profile` - Update profile (name, avatar_url, phone)
- `GET /api/profile/agent` - Get agent associated with profile
- `PATCH /api/profile/agent` - Update agent (name, system_prompt, status)

## Updated Integration

### Main Server (`/backend/src/index-new-routes.ts`)

Enhanced server configuration with new features:

**New Imports:**
```typescript
import { requestLogger } from './middleware/requestLogger';
import { apiRateLimiter } from './middleware/rateLimiter';
import analyticsRouter from './routes/analytics';
import searchRouter from './routes/search';
import profileRouter from './routes/profile';
import batchRouter from './routes/batch';
```

**Middleware Stack:**
1. Stripe webhook (raw body)
2. JSON body parser
3. Request logger
4. CORS
5. Rate limiter (on /api/* routes)

**Route Registration:**
```typescript
app.use('/api/analytics', analyticsRouter);
app.use('/api/search', searchRouter);
app.use('/api/profile', profileRouter);
app.use('/api/batch', batchRouter);
```

## Existing Features (Previously Implemented)

### Authentication & Authorization
- JWT-based authentication via Supabase
- Auto-provisioning of agents for new users
- User and agent context in requests
- Internal token authentication for admin endpoints

### Core Resources
- **Agents**: User's autonomous business agents
- **Businesses**: Agent-managed businesses
- **Contacts**: Contact management with status tracking
- **Conversations**: Chat history with Claude
- **Tasks**: Asynchronous task queue
- **Documents**: Document storage with embeddings
- **Emails**: Inbound/outbound email tracking

### Payment & Billing
- Stripe integration for payments
- Credit system for usage tracking
- Payment links for businesses
- Billing portal access
- Subscription management

### Code Generation
- Full app generation via Claude
- Landing page generation
- File-based code storage
- Multiple tech stack support

### Webhooks
- Stripe payment webhooks
- Email inbound webhooks
- Webhook signature verification

## Database Schema

Key tables (in Supabase):
- `profiles` - User profiles
- `agents` - Autonomous agents
- `businesses` - Agent businesses
- `contacts` - Contact database
- `agent_conversations` - Chat history
- `agent_tasks` - Task queue
- `agent_emails` - Email tracking
- `agent_memories` - RAG memory with embeddings
- `documents` - Document storage
- `credit_transactions` - Credit usage tracking
- `transactions` - Payment transactions
- `generated_apps` - Generated applications
- `app_files` - App source files
- `landing_pages` - Landing pages
- `deployments` - Deployment tracking

## Environment Variables

### Required
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### Optional but Recommended
```bash
# Embeddings (choose one)
VOYAGE_API_KEY=your_voyage_key
# OR
OPENAI_API_KEY=your_openai_key

# Payments
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Internal
INTERNAL_TOKEN=your_internal_token

# Email
AGENT_EMAIL_DOMAIN=youragents.com

# Frontend
CORS_ORIGIN=https://your-frontend.com
FRONTEND_URL=https://your-frontend.com
```

## Performance Considerations

### Database Indexes
Recommended indexes for production:

```sql
-- Search indexes
CREATE INDEX idx_businesses_name_gin ON businesses USING gin(name gin_trgm_ops);
CREATE INDEX idx_contacts_name_gin ON contacts USING gin(name gin_trgm_ops);
CREATE INDEX idx_contacts_email_gin ON contacts USING gin(email gin_trgm_ops);

-- Filter indexes
CREATE INDEX idx_businesses_agent_status ON businesses(agent_id, status);
CREATE INDEX idx_contacts_agent_status ON contacts(agent_id, status);
CREATE INDEX idx_tasks_agent_status ON agent_tasks(agent_id, status);

-- Timestamp indexes
CREATE INDEX idx_businesses_created ON businesses(created_at DESC);
CREATE INDEX idx_contacts_created ON contacts(created_at DESC);

-- Vector search (if using pgvector)
CREATE INDEX idx_memories_embedding ON agent_memories USING ivfflat(embedding vector_cosine_ops);
CREATE INDEX idx_documents_embedding ON documents USING ivfflat(embedding vector_cosine_ops);
```

### Rate Limiting
- In-memory rate limiting suitable for single instance
- For multi-instance: Use Redis with `express-rate-limit` and `rate-limit-redis`

### Caching
Consider adding Redis caching for:
- Agent stats (cache for 5 minutes)
- Search results (cache for 1 minute)
- User profiles (cache for 10 minutes)

## Security

### Implemented
- JWT authentication for all API routes
- Rate limiting on endpoints
- CORS configuration
- Input validation with Zod
- SQL injection protection (Supabase/Postgres)
- Webhook signature verification

### Recommended Additions
- Helmet.js for security headers
- Request size limits
- IP-based blocking for abuse
- Audit logging to database
- Secrets rotation

## Testing

### Unit Tests (TODO)
- Service layer tests
- Middleware tests
- Route handler tests

### Integration Tests (TODO)
- End-to-end API tests
- Database integration tests
- External service mocks

### Load Tests (TODO)
- Rate limiter behavior
- Concurrent request handling
- Database query performance

## Deployment

### Environment Setup
1. Set all required environment variables
2. Configure embedding provider
3. Set up Supabase database
4. Configure Stripe webhooks
5. Set CORS origins

### Database Migrations
- Use Supabase migrations for schema changes
- Ensure indexes are created
- Verify RLS policies

### Monitoring
- Application logs via request logger
- Error tracking (consider Sentry)
- Performance monitoring (consider New Relic/DataDog)
- Database metrics via Supabase dashboard

## Next Steps / Future Enhancements

1. **Implement missing TODO items**
   - Real memory search with embeddings
   - Audit logs to database
   - Search query tracking

2. **Add more analytics**
   - Revenue trends over time
   - Contact conversion rates
   - Task completion rates
   - Email response rates

3. **Enhance batch operations**
   - Async job queue for large imports
   - Progress tracking for long-running operations
   - More export formats (JSON, Excel)

4. **Improve search**
   - Fuzzy matching
   - Relevance scoring
   - Search filters and facets
   - Saved searches

5. **Add real-time features**
   - WebSocket support for live updates
   - Task status notifications
   - Email arrival notifications

6. **Performance optimization**
   - Query optimization
   - Response caching
   - Database connection pooling
   - Pagination for large result sets

7. **Security enhancements**
   - Two-factor authentication
   - API key management
   - Role-based access control (RBAC)
   - More granular permissions
