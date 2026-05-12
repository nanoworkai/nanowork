-- ============================================================================
-- Agent Platform Schema for Supabase
-- ============================================================================
-- This schema creates all 15 tables needed by the Node.js backend
-- Upload this file to Supabase SQL Editor: https://supabase.com/dashboard/project/[your-project]/sql
--
-- Tables:
-- 1. agents - Core agent records
-- 2. businesses - Businesses managed by agents
-- 3. generated_apps - AI-generated applications
-- 4. app_files - Source files for generated apps
-- 5. landing_pages - Generated landing pages
-- 6. deployments - Deployment records
-- 7. agent_conversations - Chat conversations
-- 8. agent_emails - Email records
-- 9. agent_memories - Vector memory storage
-- 10. agent_tasks - Task queue
-- 11. contacts - Customer/lead contacts
-- 12. contact_interactions - Interaction logs
-- 13. payment_links - Stripe payment links
-- 14. transactions - Payment transactions
-- 15. documents - Text documents with embeddings
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector"; -- For embeddings

-- ============================================================================
-- 1. AGENTS TABLE
-- ============================================================================
-- One agent per user - manages businesses

CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  stripe_account_id TEXT,
  stripe_onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  system_prompt TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_slug ON agents(slug);
CREATE INDEX idx_agents_email ON agents(email);
CREATE INDEX idx_agents_status ON agents(status);

-- ============================================================================
-- 2. BUSINESSES TABLE
-- ============================================================================
-- Businesses managed by agents

CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  idea_prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'building', 'live', 'archived')),
  revenue_cents INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_businesses_agent_id ON businesses(agent_id);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_created_at ON businesses(created_at DESC);

-- ============================================================================
-- 3. GENERATED APPS TABLE
-- ============================================================================
-- AI-generated applications

CREATE TABLE IF NOT EXISTS generated_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  framework TEXT NOT NULL,
  tech_stack TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'ready', 'deployed', 'failed')),
  prompt TEXT NOT NULL,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_generated_apps_business_id ON generated_apps(business_id);
CREATE INDEX idx_generated_apps_status ON generated_apps(status);

-- ============================================================================
-- 4. APP FILES TABLE
-- ============================================================================
-- Source files for generated apps

CREATE TABLE IF NOT EXISTS app_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES generated_apps(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  content TEXT NOT NULL,
  language TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(app_id, path)
);

CREATE INDEX idx_app_files_app_id ON app_files(app_id);

-- ============================================================================
-- 5. LANDING PAGES TABLE
-- ============================================================================
-- Generated landing pages (HTML/CSS/JS)

CREATE TABLE IF NOT EXISTS landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  html TEXT,
  css TEXT,
  js TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'archived')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_landing_pages_business_id ON landing_pages(business_id);
CREATE INDEX idx_landing_pages_status ON landing_pages(status);

-- ============================================================================
-- 6. DEPLOYMENTS TABLE
-- ============================================================================
-- Deployment records for Cloudflare Pages, Vercel, etc.

CREATE TABLE IF NOT EXISTS deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  artifact_type TEXT NOT NULL CHECK (artifact_type IN ('landing_page', 'generated_app')),
  artifact_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('cloudflare_pages', 'vercel', 'netlify')),
  deploy_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'deploying', 'success', 'failed')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deployed_at TIMESTAMPTZ
);

CREATE INDEX idx_deployments_business_id ON deployments(business_id);
CREATE INDEX idx_deployments_artifact_id ON deployments(artifact_id);
CREATE INDEX idx_deployments_status ON deployments(status);

-- ============================================================================
-- 7. AGENT CONVERSATIONS TABLE
-- ============================================================================
-- Chat conversation threads

CREATE TABLE IF NOT EXISTS agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_conversations_agent_id ON agent_conversations(agent_id);
CREATE INDEX idx_agent_conversations_business_id ON agent_conversations(business_id);
CREATE INDEX idx_agent_conversations_created_at ON agent_conversations(created_at DESC);

-- ============================================================================
-- 8. AGENT EMAILS TABLE
-- ============================================================================
-- Inbound and outbound emails

CREATE TABLE IF NOT EXISTS agent_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_address TEXT NOT NULL,
  to_addresses TEXT[] NOT NULL,
  subject TEXT NOT NULL,
  body_text TEXT,
  body_html TEXT,
  external_message_id TEXT,
  reply_to_email_id UUID REFERENCES agent_emails(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_emails_agent_id ON agent_emails(agent_id);
CREATE INDEX idx_agent_emails_business_id ON agent_emails(business_id);
CREATE INDEX idx_agent_emails_direction ON agent_emails(direction);
CREATE INDEX idx_agent_emails_created_at ON agent_emails(created_at DESC);
CREATE INDEX idx_agent_emails_external_message_id ON agent_emails(external_message_id);

-- ============================================================================
-- 9. AGENT MEMORIES TABLE
-- ============================================================================
-- Vector-based memory storage for RAG

CREATE TABLE IF NOT EXISTS agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  memory_type TEXT NOT NULL,
  source TEXT NOT NULL,
  embedding vector(1536), -- OpenAI/Voyage embedding dimension
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_memories_agent_id ON agent_memories(agent_id);
CREATE INDEX idx_agent_memories_business_id ON agent_memories(business_id);
CREATE INDEX idx_agent_memories_memory_type ON agent_memories(memory_type);

-- Vector similarity search index (requires pgvector)
CREATE INDEX idx_agent_memories_embedding ON agent_memories
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================================================
-- 10. AGENT TASKS TABLE
-- ============================================================================
-- Task queue for agents

CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_agent_tasks_agent_id ON agent_tasks(agent_id);
CREATE INDEX idx_agent_tasks_business_id ON agent_tasks(business_id);
CREATE INDEX idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX idx_agent_tasks_task_type ON agent_tasks(task_type);
CREATE INDEX idx_agent_tasks_created_at ON agent_tasks(created_at DESC);

-- ============================================================================
-- 11. CONTACTS TABLE
-- ============================================================================
-- Customer/lead contacts

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'customer', 'partner', 'archived')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(agent_id, email)
);

CREATE INDEX idx_contacts_agent_id ON contacts(agent_id);
CREATE INDEX idx_contacts_business_id ON contacts(business_id);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_email ON contacts(email);

-- ============================================================================
-- 12. CONTACT INTERACTIONS TABLE
-- ============================================================================
-- Interaction logs with contacts

CREATE TABLE IF NOT EXISTS contact_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_interactions_contact_id ON contact_interactions(contact_id);
CREATE INDEX idx_contact_interactions_agent_id ON contact_interactions(agent_id);
CREATE INDEX idx_contact_interactions_interaction_type ON contact_interactions(interaction_type);
CREATE INDEX idx_contact_interactions_created_at ON contact_interactions(created_at DESC);

-- ============================================================================
-- 13. PAYMENT LINKS TABLE
-- ============================================================================
-- Stripe payment links

CREATE TABLE IF NOT EXISTS payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  stripe_payment_link_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'archived')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_links_agent_id ON payment_links(agent_id);
CREATE INDEX idx_payment_links_business_id ON payment_links(business_id);
CREATE INDEX idx_payment_links_status ON payment_links(status);
CREATE INDEX idx_payment_links_stripe_payment_link_id ON payment_links(stripe_payment_link_id);

-- ============================================================================
-- 14. TRANSACTIONS TABLE
-- ============================================================================
-- Payment transaction records

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  payment_link_id UUID REFERENCES payment_links(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_agent_id ON transactions(agent_id);
CREATE INDEX idx_transactions_business_id ON transactions(business_id);
CREATE INDEX idx_transactions_payment_link_id ON transactions(payment_link_id);
CREATE INDEX idx_transactions_stripe_payment_intent_id ON transactions(stripe_payment_intent_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- ============================================================================
-- 15. DOCUMENTS TABLE
-- ============================================================================
-- Text documents with embeddings

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_agent_id ON documents(agent_id);
CREATE INDEX idx_documents_business_id ON documents(business_id);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

-- Vector similarity search index
CREATE INDEX idx_documents_embedding ON documents
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================
-- Automatically update updated_at timestamp on row updates

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_apps_updated_at
  BEFORE UPDATE ON generated_apps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_files_updated_at
  BEFORE UPDATE ON app_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_landing_pages_updated_at
  BEFORE UPDATE ON landing_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_conversations_updated_at
  BEFORE UPDATE ON agent_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_tasks_updated_at
  BEFORE UPDATE ON agent_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enable RLS on all tables

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own agent's data

-- Agents: Users can only see their own agent
CREATE POLICY agents_user_policy ON agents
  FOR ALL USING (auth.uid() = user_id);

-- Businesses: Via agent ownership
CREATE POLICY businesses_user_policy ON businesses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = businesses.agent_id AND agents.user_id = auth.uid())
  );

-- Generated Apps: Via business ownership
CREATE POLICY generated_apps_user_policy ON generated_apps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses
      JOIN agents ON agents.id = businesses.agent_id
      WHERE businesses.id = generated_apps.business_id AND agents.user_id = auth.uid()
    )
  );

-- App Files: Via generated app ownership
CREATE POLICY app_files_user_policy ON app_files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM generated_apps
      JOIN businesses ON businesses.id = generated_apps.business_id
      JOIN agents ON agents.id = businesses.agent_id
      WHERE generated_apps.id = app_files.app_id AND agents.user_id = auth.uid()
    )
  );

-- Landing Pages: Via business ownership
CREATE POLICY landing_pages_user_policy ON landing_pages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses
      JOIN agents ON agents.id = businesses.agent_id
      WHERE businesses.id = landing_pages.business_id AND agents.user_id = auth.uid()
    )
  );

-- Deployments: Via business ownership
CREATE POLICY deployments_user_policy ON deployments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses
      JOIN agents ON agents.id = businesses.agent_id
      WHERE businesses.id = deployments.business_id AND agents.user_id = auth.uid()
    )
  );

-- Agent Conversations: Via agent ownership
CREATE POLICY agent_conversations_user_policy ON agent_conversations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = agent_conversations.agent_id AND agents.user_id = auth.uid())
  );

-- Agent Emails: Via agent ownership
CREATE POLICY agent_emails_user_policy ON agent_emails
  FOR ALL USING (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = agent_emails.agent_id AND agents.user_id = auth.uid())
  );

-- Agent Memories: Via agent ownership
CREATE POLICY agent_memories_user_policy ON agent_memories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = agent_memories.agent_id AND agents.user_id = auth.uid())
  );

-- Agent Tasks: Via agent ownership
CREATE POLICY agent_tasks_user_policy ON agent_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = agent_tasks.agent_id AND agents.user_id = auth.uid())
  );

-- Contacts: Via agent ownership
CREATE POLICY contacts_user_policy ON contacts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = contacts.agent_id AND agents.user_id = auth.uid())
  );

-- Contact Interactions: Via agent ownership
CREATE POLICY contact_interactions_user_policy ON contact_interactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = contact_interactions.agent_id AND agents.user_id = auth.uid())
  );

-- Payment Links: Via agent ownership
CREATE POLICY payment_links_user_policy ON payment_links
  FOR ALL USING (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = payment_links.agent_id AND agents.user_id = auth.uid())
  );

-- Transactions: Via agent ownership
CREATE POLICY transactions_user_policy ON transactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = transactions.agent_id AND agents.user_id = auth.uid())
  );

-- Documents: Via agent ownership
CREATE POLICY documents_user_policy ON documents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = documents.agent_id AND agents.user_id = auth.uid())
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Vector similarity search function for memories
CREATE OR REPLACE FUNCTION match_agent_memories(
  query_embedding vector(1536),
  agent_id UUID,
  match_count INT DEFAULT 10,
  match_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  agent_id UUID,
  business_id UUID,
  content TEXT,
  memory_type TEXT,
  source TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    agent_memories.id,
    agent_memories.agent_id,
    agent_memories.business_id,
    agent_memories.content,
    agent_memories.memory_type,
    agent_memories.source,
    agent_memories.metadata,
    agent_memories.created_at,
    1 - (agent_memories.embedding <=> query_embedding) AS similarity
  FROM agent_memories
  WHERE agent_memories.agent_id = match_agent_memories.agent_id
    AND agent_memories.embedding IS NOT NULL
    AND 1 - (agent_memories.embedding <=> query_embedding) > match_threshold
  ORDER BY agent_memories.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Vector similarity search function for documents
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  agent_id UUID,
  match_count INT DEFAULT 10,
  match_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  agent_id UUID,
  business_id UUID,
  title TEXT,
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.agent_id,
    documents.business_id,
    documents.title,
    documents.content,
    documents.metadata,
    documents.created_at,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE documents.agent_id = match_documents.agent_id
    AND documents.embedding IS NOT NULL
    AND 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant all privileges on tables to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION match_agent_memories TO authenticated;
GRANT EXECUTE ON FUNCTION match_documents TO authenticated;

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================
-- Run this entire file in Supabase SQL Editor
-- All 15 tables created with proper indexes, RLS, and triggers
-- ============================================================================
