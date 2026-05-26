-- ============================================================================
-- MISSING TABLES MIGRATION
-- Created: 2026-05-26
-- Purpose: Add tables that are referenced in code but missing from schema
-- ============================================================================

-- ============================================================================
-- LINQ JOBS (Frontend/Worker)
-- ============================================================================
CREATE TABLE IF NOT EXISTS linq_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  job_type TEXT NOT NULL,
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_linq_jobs_user_id ON linq_jobs(user_id);
CREATE INDEX idx_linq_jobs_status ON linq_jobs(status);
CREATE INDEX idx_linq_jobs_created_at ON linq_jobs(created_at DESC);

ALTER TABLE linq_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs"
  ON linq_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create jobs"
  ON linq_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- LINQ PLAN LIMITS (Worker)
-- ============================================================================
CREATE TABLE IF NOT EXISTS linq_plan_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL UNIQUE,
  max_requests_per_month INTEGER NOT NULL DEFAULT 1000,
  max_cache_size_mb INTEGER NOT NULL DEFAULT 100,
  features JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE linq_plan_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view plan limits"
  ON linq_plan_limits FOR SELECT
  USING (true);

-- ============================================================================
-- LINQ URL CACHE (Worker)
-- ============================================================================
CREATE TABLE IF NOT EXISTS linq_url_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  url_hash TEXT NOT NULL UNIQUE,
  cached_data JSONB,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  hit_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_linq_url_cache_hash ON linq_url_cache(url_hash);
CREATE INDEX idx_linq_url_cache_expires ON linq_url_cache(expires_at);

ALTER TABLE linq_url_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage cache"
  ON linq_url_cache FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- LINQ USAGE (Worker)
-- ============================================================================
CREATE TABLE IF NOT EXISTS linq_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  requests_count INTEGER NOT NULL DEFAULT 0,
  cache_hits INTEGER NOT NULL DEFAULT 0,
  cache_misses INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, usage_date)
);

CREATE INDEX idx_linq_usage_user_date ON linq_usage(user_id, usage_date DESC);

ALTER TABLE linq_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON linq_usage FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- NANO APP SCHEMAS (Frontend)
-- ============================================================================
CREATE TABLE IF NOT EXISTS nano_app_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL,
  schema_version TEXT NOT NULL DEFAULT 'v1',
  schema_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nano_app_schemas_user_id ON nano_app_schemas(user_id);

ALTER TABLE nano_app_schemas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own app schemas"
  ON nano_app_schemas FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- NANO WAITLIST (Frontend)
-- ============================================================================
CREATE TABLE IF NOT EXISTS nano_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  company TEXT,
  use_case TEXT,
  referral_source TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'invited', 'rejected')),
  priority INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nano_waitlist_email ON nano_waitlist(email);
CREATE INDEX idx_nano_waitlist_status ON nano_waitlist(status);
CREATE INDEX idx_nano_waitlist_created_at ON nano_waitlist(created_at DESC);

ALTER TABLE nano_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
  ON nano_waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can view waitlist"
  ON nano_waitlist FOR SELECT
  USING (auth.role() = 'service_role');

-- ============================================================================
-- NANO API KEYS (Worker)
-- ============================================================================
CREATE TABLE IF NOT EXISTS nano_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  name TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nano_api_keys_user_id ON nano_api_keys(user_id);
CREATE INDEX idx_nano_api_keys_key_hash ON nano_api_keys(key_hash) WHERE revoked_at IS NULL;

ALTER TABLE nano_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own API keys"
  ON nano_api_keys FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- NANO TENANTS (Worker - Multi-tenancy)
-- ============================================================================
CREATE TABLE IF NOT EXISTS nano_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nano_tenants_owner_id ON nano_tenants(owner_id);
CREATE INDEX idx_nano_tenants_slug ON nano_tenants(slug);

ALTER TABLE nano_tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage own tenants"
  ON nano_tenants FOR ALL
  USING (auth.uid() = owner_id);

-- ============================================================================
-- NANO CUSTOMERS (Worker)
-- ============================================================================
CREATE TABLE IF NOT EXISTS nano_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES nano_tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  stripe_customer_id TEXT UNIQUE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);

CREATE INDEX idx_nano_customers_tenant_id ON nano_customers(tenant_id);
CREATE INDEX idx_nano_customers_email ON nano_customers(email);
CREATE INDEX idx_nano_customers_stripe ON nano_customers(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

ALTER TABLE nano_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant owners can manage customers"
  ON nano_customers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM nano_tenants
      WHERE nano_tenants.id = nano_customers.tenant_id
        AND nano_tenants.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- NANO LEDGER (Worker - Financial tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS nano_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES nano_tenants(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT,
  reference_id TEXT,
  reference_type TEXT,
  balance_after DECIMAL(12,2),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nano_ledger_tenant_id ON nano_ledger(tenant_id, created_at DESC);
CREATE INDEX idx_nano_ledger_reference ON nano_ledger(reference_type, reference_id);

ALTER TABLE nano_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant owners can view ledger"
  ON nano_ledger FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM nano_tenants
      WHERE nano_tenants.id = nano_ledger.tenant_id
        AND nano_tenants.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- NANO WEBHOOKS (Worker)
-- ============================================================================
CREATE TABLE IF NOT EXISTS nano_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES nano_tenants(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  secret TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  failure_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nano_webhooks_tenant_id ON nano_webhooks(tenant_id);
CREATE INDEX idx_nano_webhooks_active ON nano_webhooks(is_active) WHERE is_active = true;

ALTER TABLE nano_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant owners can manage webhooks"
  ON nano_webhooks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM nano_tenants
      WHERE nano_tenants.id = nano_webhooks.tenant_id
        AND nano_tenants.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- AGENT CONVERSATIONS (Backend)
-- ============================================================================
CREATE TABLE IF NOT EXISTS agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  messages JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_conversations_agent_id ON agent_conversations(agent_id);
CREATE INDEX idx_agent_conversations_user_id ON agent_conversations(user_id, created_at DESC);

ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own conversations"
  ON agent_conversations FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- AGENT MEMORIES (Backend)
-- ============================================================================
CREATE TABLE IF NOT EXISTS agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('fact', 'preference', 'context', 'goal')),
  content TEXT NOT NULL,
  importance INTEGER NOT NULL DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),
  embedding VECTOR(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_memories_agent_id ON agent_memories(agent_id, importance DESC);
CREATE INDEX idx_agent_memories_type ON agent_memories(memory_type);

ALTER TABLE agent_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can manage own memories"
  ON agent_memories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM agents, companies
      WHERE agents.id = agent_memories.agent_id
        AND agents.company_id = companies.id
        AND companies.user_id = auth.uid()
    )
  );

-- ============================================================================
-- AGENT TASKS (Backend)
-- ============================================================================
CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_tasks_agent_id ON agent_tasks(agent_id, status, priority DESC);
CREATE INDEX idx_agent_tasks_status ON agent_tasks(status, due_at);

ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks for own agents"
  ON agent_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agents, companies
      WHERE agents.id = agent_tasks.agent_id
        AND agents.company_id = companies.id
        AND companies.user_id = auth.uid()
    )
  );

-- ============================================================================
-- APP FILES (Backend)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'app-files',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_app_files_user_id ON app_files(user_id, created_at DESC);
CREATE INDEX idx_app_files_path ON app_files(file_path);

ALTER TABLE app_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own files"
  ON app_files FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- CONTACTS (Backend)
-- ============================================================================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  company_name TEXT,
  title TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_fields JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, email)
);

CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_company_id ON contacts(company_id);
CREATE INDEX idx_contacts_email ON contacts(email);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage contacts for own companies"
  ON contacts FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- CONTACT INTERACTIONS (Backend)
-- ============================================================================
CREATE TABLE IF NOT EXISTS contact_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('email', 'call', 'meeting', 'note')),
  subject TEXT,
  content TEXT,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_interactions_contact_id ON contact_interactions(contact_id, created_at DESC);
CREATE INDEX idx_contact_interactions_type ON contact_interactions(interaction_type);

ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view interactions for own contacts"
  ON contact_interactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = contact_interactions.contact_id
        AND contacts.user_id = auth.uid()
    )
  );

-- ============================================================================
-- DEPLOYMENTS (Backend)
-- ============================================================================
CREATE TABLE IF NOT EXISTS deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  deployment_type TEXT NOT NULL CHECK (deployment_type IN ('website', 'api', 'app')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'deploying', 'live', 'failed')),
  url TEXT,
  build_log TEXT,
  error_message TEXT,
  deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deployments_company_id ON deployments(company_id, created_at DESC);
CREATE INDEX idx_deployments_status ON deployments(status);

ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view deployments for own companies"
  ON deployments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = deployments.company_id
        AND companies.user_id = auth.uid()
    )
  );

-- ============================================================================
-- DOCUMENTS (Backend)
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'archived')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_company_id ON documents(company_id, created_at DESC);
CREATE INDEX idx_documents_type ON documents(document_type);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage documents for own companies"
  ON documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = documents.company_id
        AND companies.user_id = auth.uid()
    )
  );

-- ============================================================================
-- GENERATED APPS (Backend)
-- ============================================================================
CREATE TABLE IF NOT EXISTS generated_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL,
  app_type TEXT NOT NULL,
  description TEXT,
  source_code TEXT,
  config JSONB,
  deployed_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'building', 'deployed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_generated_apps_user_id ON generated_apps(user_id, created_at DESC);

ALTER TABLE generated_apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own generated apps"
  ON generated_apps FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- LANDING PAGES (Backend)
-- ============================================================================
CREATE TABLE IF NOT EXISTS landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  seo_meta JSONB,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_landing_pages_company_id ON landing_pages(company_id);
CREATE INDEX idx_landing_pages_slug ON landing_pages(slug);

ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published pages"
  ON landing_pages FOR SELECT
  USING (is_published = true);

CREATE POLICY "Users can manage pages for own companies"
  ON landing_pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = landing_pages.company_id
        AND companies.user_id = auth.uid()
    )
  );

-- ============================================================================
-- PAYMENT LINKS (Backend)
-- ============================================================================
CREATE TABLE IF NOT EXISTS payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  link_id TEXT NOT NULL UNIQUE,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT,
  stripe_payment_link_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_links_company_id ON payment_links(company_id);
CREATE INDEX idx_payment_links_link_id ON payment_links(link_id);

ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active payment links"
  ON payment_links FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Users can manage links for own companies"
  ON payment_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = payment_links.company_id
        AND companies.user_id = auth.uid()
    )
  );

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
