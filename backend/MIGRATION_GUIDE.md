# Migration Guide: Integrating New Backend Features

## Quick Start (5 minutes)

### Step 1: Replace Main Server File
```bash
cd /Users/jordan/Dev/nanowork-web/backend/src
mv index.ts index.ts.backup
mv index-new-routes.ts index.ts
```

### Step 2: Update Anthropic Service
```bash
mv services/anthropic.ts services/anthropic.ts.backup
mv services/anthropic-updated.ts services/anthropic.ts
```

### Step 3: Configure Embeddings (Optional but Recommended)
Choose one of these options:

**Option A: Voyage AI (best quality)**
```bash
# Add to .env
VOYAGE_API_KEY=your_voyage_api_key
```

**Option B: OpenAI**
```bash
# Add to .env
OPENAI_API_KEY=your_openai_api_key
```

**Option C: Custom Provider**
```bash
# Add to .env
EMBEDDING_API_KEY=your_api_key
EMBEDDING_BASE_URL=https://api.example.com/v1
EMBEDDING_MODEL=text-embedding-3-small
```

### Step 4: Test
```bash
npm run typecheck  # Should pass with no errors
npm run dev        # Start development server
```

### Step 5: Test New Endpoints
```bash
# Health check (should show all services)
curl http://localhost:3000/health

# Get agent stats (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/analytics/agent

# Search (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/search?q=test"
```

## Detailed Integration Steps

### 1. File Structure

Your backend should now have these new files:

```
backend/src/
├── middleware/
│   ├── auth.ts                    # Existing
│   ├── rateLimiter.ts            # NEW
│   └── requestLogger.ts          # NEW
├── services/
│   ├── anthropic.ts              # UPDATED (was stub, now real)
│   ├── analytics.ts              # NEW
│   ├── batch.ts                  # NEW
│   ├── embeddings.ts             # NEW
│   ├── search.ts                 # NEW
│   └── [existing services...]
├── routes/
│   ├── analytics.ts              # NEW
│   ├── batch.ts                  # NEW
│   ├── profile.ts                # NEW
│   ├── search.ts                 # NEW
│   └── [existing routes...]
└── index.ts                      # UPDATED (with new imports)
```

### 2. Database Setup

#### Add Search Indexes (Optional but Recommended)

Connect to your Supabase database and run:

```sql
-- Enable trigram extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Search indexes for better performance
CREATE INDEX IF NOT EXISTS idx_businesses_name_gin 
  ON businesses USING gin(name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_contacts_name_gin 
  ON contacts USING gin(name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_contacts_email_gin 
  ON contacts USING gin(email gin_trgm_ops);

-- Filter indexes for common queries
CREATE INDEX IF NOT EXISTS idx_businesses_agent_status 
  ON businesses(agent_id, status);

CREATE INDEX IF NOT EXISTS idx_contacts_agent_status 
  ON contacts(agent_id, status);

CREATE INDEX IF NOT EXISTS idx_tasks_agent_status 
  ON agent_tasks(agent_id, status);

-- Timestamp indexes for ordering
CREATE INDEX IF NOT EXISTS idx_businesses_created 
  ON businesses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contacts_created 
  ON contacts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tasks_created 
  ON agent_tasks(created_at DESC);
```

#### Add Vector Search (If Using Embeddings)

If you're using embeddings and have the pgvector extension:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Vector indexes for semantic search
CREATE INDEX IF NOT EXISTS idx_memories_embedding 
  ON agent_memories USING ivfflat(embedding vector_cosine_ops) 
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_documents_embedding 
  ON documents USING ivfflat(embedding vector_cosine_ops) 
  WITH (lists = 100);
```

### 3. Environment Variables

#### Required (Already Set)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `ANTHROPIC_API_KEY`

#### New Optional Variables

```bash
# Embeddings - Choose ONE of these options:

# Option 1: Voyage AI (recommended)
VOYAGE_API_KEY=voyage_abc123...

# Option 2: OpenAI  
OPENAI_API_KEY=sk-abc123...

# Option 3: Custom OpenAI-compatible
EMBEDDING_API_KEY=your_key
EMBEDDING_BASE_URL=https://api.together.xyz/v1
EMBEDDING_MODEL=togethercomputer/m2-bert-80M-8k-retrieval
```

### 4. Testing New Features

#### Test Rate Limiting

```bash
# Send 110 requests rapidly (should get 429 after 100)
for i in {1..110}; do
  curl -H "Authorization: Bearer $TOKEN" \
    http://localhost:3000/api/agents/me
done
```

#### Test Analytics

```bash
# Get agent statistics
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/analytics/agent | jq

# Get activity timeline
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/analytics/activity | jq
```

#### Test Search

```bash
# Search for businesses
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/search?q=business&limit=5" | jq

# Get search suggestions
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/search/suggestions | jq
```

#### Test Batch Operations

```bash
# Export contacts to CSV
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/batch/contacts/export > contacts.csv

# Import contacts
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contacts": [
      {"name": "John Doe", "email": "john@example.com", "status": "lead"},
      {"name": "Jane Smith", "email": "jane@example.com", "status": "customer"}
    ]
  }' \
  http://localhost:3000/api/batch/contacts/import | jq
```

#### Test Profile Management

```bash
# Get profile
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/profile | jq

# Update agent settings
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "system_prompt": "You are a helpful AI assistant specializing in business operations."
  }' \
  http://localhost:3000/api/profile/agent | jq
```

#### Test Embeddings

```bash
# Create a document (will generate embedding automatically)
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Product Roadmap",
    "content": "Our Q1 goals include launching the mobile app..."
  }' \
  http://localhost:3000/api/documents | jq

# Check logs to verify embedding generation
# Should see: "[Embeddings] Using Voyage AI provider" or similar
```

### 5. Monitoring

#### Check Logs

The new request logger will output:
```
[abc123] GET /api/agents/me { user: 'user-uuid', ip: '127.0.0.1' }
[abc123] 200 GET /api/agents/me - 45ms
```

#### Check Rate Limit Headers

Response headers will include:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-05-23T12:34:56.789Z
```

### 6. Rollback Plan (If Needed)

If something goes wrong, you can quickly rollback:

```bash
cd /Users/jordan/Dev/nanowork-web/backend/src

# Restore original files
mv index.ts.backup index.ts
mv services/anthropic.ts.backup services/anthropic.ts

# Remove new files (optional)
rm middleware/rateLimiter.ts
rm middleware/requestLogger.ts
rm services/analytics.ts
rm services/batch.ts
rm services/embeddings.ts
rm services/search.ts
rm routes/analytics.ts
rm routes/batch.ts
rm routes/profile.ts
rm routes/search.ts

# Restart server
npm run dev
```

### 7. Production Deployment

#### Before Deploying

1. ✅ All tests pass
2. ✅ TypeScript compiles without errors
3. ✅ Environment variables set
4. ✅ Database indexes created
5. ✅ Embeddings configured and working
6. ✅ Rate limits tested and verified

#### Deployment Checklist

```bash
# 1. Build production bundle
npm run build

# 2. Set production environment variables
export NODE_ENV=production
export CORS_ORIGIN=https://yourdomain.com
export FRONTEND_URL=https://yourdomain.com

# 3. Start production server
npm start
```

#### Production Monitoring

- Set up error tracking (Sentry, Rollbar)
- Monitor rate limit 429 responses
- Track embedding API usage/costs
- Monitor database query performance
- Set up alerts for 5xx errors

### 8. Gradual Rollout (Recommended)

You can enable features gradually:

#### Phase 1: Logging Only
```typescript
// In index.ts - enable only logging
app.use(requestLogger);
// Don't add rate limiter yet
```

#### Phase 2: Add Rate Limiting
```typescript
// Add rate limiter after confidence in logging
app.use('/api', apiRateLimiter);
```

#### Phase 3: Enable New Routes
```typescript
// Add new routes one at a time
app.use('/api/analytics', analyticsRouter);
// Test thoroughly before adding others
```

#### Phase 4: Enable Embeddings
```bash
# After Phase 3 is stable
export VOYAGE_API_KEY=your_key
# Restart server
```

## Common Issues & Solutions

### Issue: Rate limiting too strict
**Solution**: Adjust limits in `rateLimiter.ts`
```typescript
export const apiRateLimiter = rateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 200, // Increase from 100
});
```

### Issue: Embeddings not working
**Solution**: Check provider configuration
```bash
# Verify env var is set
echo $VOYAGE_API_KEY

# Check logs for provider initialization
npm run dev | grep Embeddings
```

### Issue: Search results empty
**Solution**: Add database indexes
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- Then add indexes from step 2
```

### Issue: Batch import fails
**Solution**: Check data format
```json
{
  "contacts": [
    {
      "name": "Required field",
      "email": "optional@example.com",
      "status": "lead"  // Must be: lead, customer, partner, or archived
    }
  ]
}
```

### Issue: Analytics slow
**Solution**: Add indexes and consider caching
```sql
-- Add missing indexes from step 2
-- Consider adding Redis caching layer
```

## Getting Help

- Check `BACKEND_FEATURES.md` for detailed feature documentation
- Check `IMPLEMENTATION_SUMMARY.md` for overview of changes
- Review code comments in new files
- Check Supabase logs for database errors
- Check application logs for request/response details

## Success Criteria

You'll know the migration is successful when:

1. ✅ Server starts without errors
2. ✅ All existing endpoints still work
3. ✅ New endpoints return valid data
4. ✅ Rate limiting returns 429 when exceeded
5. ✅ Search returns relevant results
6. ✅ Analytics show correct statistics
7. ✅ Embeddings generate successfully (if configured)
8. ✅ Logs show structured request/response data
