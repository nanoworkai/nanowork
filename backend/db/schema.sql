-- ============================================================================
-- Nanowork Agent Platform Schema
-- ============================================================================
-- This schema creates the agent department system for AI-run companies
-- Each user gets 7 agents (Sales, Marketing, Ops, Finance, Product, HR, Support)
-- with email addresses, memory, conversations, tasks, and document storage

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable pgvector for AI embeddings (agent memory)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- AGENTS TABLE
-- ============================================================================
-- Core agent records - one per department per company

CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  department TEXT NOT NULL CHECK (department IN (
    'sales', 'marketing', 'operations', 'finance', 'product', 'hr', 'support'
  )),
  email_address TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  model TEXT NOT NULL DEFAULT 'claude-sonnet-4-6',
  system_prompt TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one agent per department per company
  UNIQUE(company_id, department)
);

CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_company_id ON agents(company_id);
CREATE INDEX IF NOT EXISTS idx_agents_email ON agents(email_address);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_department ON agents(department);

-- ============================================================================
-- AGENT_MEMORIES TABLE
-- ============================================================================
-- Vector-based memory storage for agents (RAG)

CREATE TABLE IF NOT EXISTS agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536),
  source TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_memories_agent_id ON agent_memories(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_memories_embedding ON agent_memories USING ivfflat (embedding vector_cosine_ops);

-- ============================================================================
-- AGENT_CONVERSATIONS TABLE
-- ============================================================================
-- Conversation threads (email threads, internal notes, etc.)

CREATE TABLE IF NOT EXISTS agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'archived')),
  participants TEXT[] DEFAULT ARRAY[]::TEXT[],
  external_thread_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_conversations_agent_id ON agent_conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_company_id ON agent_conversations(company_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_status ON agent_conversations(status);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_external_thread_id ON agent_conversations(external_thread_id);

-- ============================================================================
-- AGENT_EMAILS TABLE
-- ============================================================================
-- Individual email messages sent/received by agents

CREATE TABLE IF NOT EXISTS agent_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES agent_conversations(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_address TEXT NOT NULL,
  to_addresses TEXT[] NOT NULL,
  cc_addresses TEXT[] DEFAULT ARRAY[]::TEXT[],
  subject TEXT NOT NULL,
  body_text TEXT,
  body_html TEXT,
  headers JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'sent', 'delivered', 'bounced', 'failed', 'spam'
  )),
  external_message_id TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agent_emails_agent_id ON agent_emails(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_emails_conversation_id ON agent_emails(conversation_id);
CREATE INDEX IF NOT EXISTS idx_agent_emails_company_id ON agent_emails(company_id);
CREATE INDEX IF NOT EXISTS idx_agent_emails_direction ON agent_emails(direction);
CREATE INDEX IF NOT EXISTS idx_agent_emails_status ON agent_emails(status);
CREATE INDEX IF NOT EXISTS idx_agent_emails_from_address ON agent_emails(from_address);
CREATE INDEX IF NOT EXISTS idx_agent_emails_created_at ON agent_emails(created_at DESC);

-- ============================================================================
-- AGENT_TASKS TABLE
-- ============================================================================
-- Tasks assigned to or created by agents

CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'completed', 'blocked', 'cancelled'
  )),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMPTZ,
  assigned_by TEXT,
  related_email_id UUID REFERENCES agent_emails(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent_id ON agent_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_company_id ON agent_tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_priority ON agent_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_due_date ON agent_tasks(due_date);

-- ============================================================================
-- AGENT_DOCUMENTS TABLE
-- ============================================================================
-- Files and documents accessible to agents (contracts, reports, etc.)

CREATE TABLE IF NOT EXISTS agent_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT,
  description TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_documents_company_id ON agent_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_agent_documents_agent_id ON agent_documents(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_documents_uploaded_by ON agent_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_agent_documents_tags ON agent_documents USING gin(tags);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_documents ENABLE ROW LEVEL SECURITY;

-- Users can only see their own agents and related data
CREATE POLICY agents_user_policy ON agents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY agent_memories_user_policy ON agent_memories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = agent_memories.agent_id AND agents.user_id = auth.uid())
  );

CREATE POLICY agent_conversations_user_policy ON agent_conversations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = agent_conversations.agent_id AND agents.user_id = auth.uid())
  );

CREATE POLICY agent_emails_user_policy ON agent_emails
  FOR ALL USING (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = agent_emails.agent_id AND agents.user_id = auth.uid())
  );

CREATE POLICY agent_tasks_user_policy ON agent_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = agent_tasks.agent_id AND agents.user_id = auth.uid())
  );

CREATE POLICY agent_documents_company_policy ON agent_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM company_members
      WHERE company_members.company_id = agent_documents.company_id
      AND company_members.user_id = auth.uid()
    )
  );

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_conversations_updated_at BEFORE UPDATE ON agent_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_tasks_updated_at BEFORE UPDATE ON agent_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_documents_updated_at BEFORE UPDATE ON agent_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SIGNUP TRIGGER
-- ============================================================================
-- Automatically call Edge Function when new user signs up

CREATE OR REPLACE FUNCTION trigger_agent_provisioning()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url TEXT;
  service_key TEXT;
BEGIN
  -- Get config from database settings
  SELECT current_setting('app.edge_function_url', true) INTO edge_function_url;
  SELECT current_setting('app.supabase_service_key', true) INTO service_key;

  -- Call Edge Function asynchronously (fire and forget)
  -- Edge Function will call backend to provision agents
  PERFORM net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := jsonb_build_object(
      'user_id', NEW.id,
      'email', NEW.email
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_agent_provisioning();
