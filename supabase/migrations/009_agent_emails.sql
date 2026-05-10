-- ===========================================================================
-- Migration 009: Agent Emails Table
-- ===========================================================================
-- Purpose: Dedicated email infrastructure for each AI agent
-- Dependencies: agents, companies tables (agents created in future migration)
-- Author: Claude
-- Date: 2026-05-09
-- ===========================================================================

/**
 * Agent emails table - each agent gets a professional email address
 * Examples: finance@company.nanowork.ai, sales@company.nanowork.ai
 * Providers: resend, sendgrid, ses, postmark
 */
CREATE TABLE IF NOT EXISTS agent_emails (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID,  -- Will reference agents(id) once agents table is created
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Email details
  email_address TEXT NOT NULL UNIQUE,
  display_name TEXT,  -- "Finance Agent - Acme Corp"

  -- Provider configuration
  provider TEXT NOT NULL DEFAULT 'resend' CHECK (provider IN ('resend', 'sendgrid', 'ses', 'postmark')),
  provider_id TEXT,
  api_key_id TEXT,  -- Reference to encrypted API key storage

  -- Status & statistics
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'bounced')),
  emails_sent_total INTEGER DEFAULT 0,
  emails_received_total INTEGER DEFAULT 0,
  bounce_count INTEGER DEFAULT 0,
  complaint_count INTEGER DEFAULT 0,

  -- Email configuration
  forwarding_enabled BOOLEAN DEFAULT TRUE,
  forwarding_address TEXT,  -- Forward to user's email
  auto_reply_enabled BOOLEAN DEFAULT FALSE,
  auto_reply_template TEXT,
  signature TEXT,

  -- Timestamps
  last_sent_at TIMESTAMPTZ,
  last_received_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

/**
 * Indexes for performance
 */
CREATE INDEX IF NOT EXISTS idx_agent_emails_agent_id ON agent_emails(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_emails_company_id ON agent_emails(company_id);
CREATE INDEX IF NOT EXISTS idx_agent_emails_email ON agent_emails(email_address);
CREATE INDEX IF NOT EXISTS idx_agent_emails_status ON agent_emails(status);
CREATE INDEX IF NOT EXISTS idx_agent_emails_provider ON agent_emails(provider);

/**
 * Enable Row Level Security
 */
ALTER TABLE agent_emails ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view emails for their company agents" ON agent_emails;
DROP POLICY IF EXISTS "Owners can manage agent emails" ON agent_emails;

/**
 * RLS Policy: Users can view emails for their company agents
 */
CREATE POLICY "Users can view emails for their company agents"
  ON agent_emails FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
      UNION
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

/**
 * RLS Policy: Company owners can manage agent emails
 */
CREATE POLICY "Owners can manage agent emails"
  ON agent_emails FOR ALL
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

/**
 * Trigger function: Auto-update updated_at timestamp
 */
CREATE OR REPLACE FUNCTION update_agent_emails_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_agent_emails_updated_at ON agent_emails;

-- Create trigger for updated_at
CREATE TRIGGER set_agent_emails_updated_at
  BEFORE UPDATE ON agent_emails
  FOR EACH ROW EXECUTE FUNCTION update_agent_emails_updated_at();

/**
 * Trigger function: Update statistics on email send
 */
CREATE OR REPLACE FUNCTION update_agent_email_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update sent timestamp
  NEW.last_sent_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/**
 * Helper function: Generate agent email address
 */
CREATE OR REPLACE FUNCTION generate_agent_email(
  p_department TEXT,
  p_company_subdomain TEXT
)
RETURNS TEXT AS $$
BEGIN
  RETURN p_department || '@' || p_company_subdomain || '.nanowork.ai';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

/**
 * Helper function: Create default signature
 */
CREATE OR REPLACE FUNCTION generate_agent_signature(
  p_department TEXT,
  p_company_name TEXT
)
RETURNS TEXT AS $$
BEGIN
  RETURN E'---\n' ||
    INITCAP(p_department) || ' Agent\n' ||
    p_company_name || '\n' ||
    'Powered by Nanowork AI';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

/**
 * View: Agent emails with company details
 */
CREATE OR REPLACE VIEW agent_emails_with_company AS
SELECT
  ae.id,
  ae.agent_id,
  ae.company_id,
  ae.email_address,
  ae.display_name,
  ae.provider,
  ae.status,
  ae.emails_sent_total,
  ae.emails_received_total,
  ae.bounce_count,
  c.name AS company_name,
  c.owner_id,
  c.subdomain AS company_subdomain
FROM agent_emails ae
JOIN companies c ON ae.company_id = c.id
WHERE ae.status IN ('pending', 'active');

/**
 * Verification: Check migration success
 */
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'agent_emails') THEN
    RAISE NOTICE '✅ Migration 009 successful! Agent emails table created.';
  ELSE
    RAISE WARNING '⚠️ Migration 009 failed. Agent_emails table does not exist.';
  END IF;
END $$;

/**
 * Note: Agent FK constraint will be added once agents table is created
 * Run this after agents table exists:
 *
 * ALTER TABLE agent_emails
 *   ADD CONSTRAINT fk_agent_emails_agent
 *   FOREIGN KEY (agent_id)
 *   REFERENCES agents(id)
 *   ON DELETE CASCADE;
 */
