-- ============================================================================
-- Agents Table - User Agents for Build Creation
-- ============================================================================
-- Creates a simplified agents table where each user has one agent
-- Auto-provisioned on first authenticated request

CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  stripe_account_id TEXT,
  stripe_onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  system_prompt TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_slug ON agents(slug);
CREATE INDEX IF NOT EXISTS idx_agents_email ON agents(email);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);

-- RLS policies
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Users can view their own agent
CREATE POLICY agents_select_own ON agents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own agent
CREATE POLICY agents_update_own ON agents
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can create agents (for auto-provisioning)
CREATE POLICY agents_service_insert ON agents
  FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role' OR true);

-- Service role can do everything
CREATE POLICY agents_service_all ON agents
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Updated_at trigger
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Generated Apps Table
-- ============================================================================
-- Tracks AI-generated application builds for agents

CREATE TABLE IF NOT EXISTS generated_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'New Build',
  prompt TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'complete', 'failed')),
  framework TEXT NOT NULL DEFAULT 'react',
  tech_stack TEXT[] DEFAULT ARRAY[]::TEXT[],
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_generated_apps_agent_id ON generated_apps(agent_id);
CREATE INDEX IF NOT EXISTS idx_generated_apps_status ON generated_apps(status);
CREATE INDEX IF NOT EXISTS idx_generated_apps_last_activity ON generated_apps(last_activity_at DESC);

-- RLS policies
ALTER TABLE generated_apps ENABLE ROW LEVEL SECURITY;

-- Users can view builds for their own agent
CREATE POLICY generated_apps_select_own ON generated_apps
  FOR SELECT
  USING (
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    )
  );

-- Users can insert builds for their own agent
CREATE POLICY generated_apps_insert_own ON generated_apps
  FOR INSERT
  WITH CHECK (
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    )
  );

-- Users can update builds for their own agent
CREATE POLICY generated_apps_update_own ON generated_apps
  FOR UPDATE
  USING (
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    )
  );

-- Users can delete builds for their own agent
CREATE POLICY generated_apps_delete_own ON generated_apps
  FOR DELETE
  USING (
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    )
  );

-- Service role can do everything
CREATE POLICY generated_apps_service_all ON generated_apps
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Updated_at trigger
CREATE TRIGGER update_generated_apps_updated_at
  BEFORE UPDATE ON generated_apps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE agents IS 'User agents for managing builds and businesses';
COMMENT ON COLUMN agents.slug IS 'Unique 8-character slug for agent identification';
COMMENT ON COLUMN agents.email IS 'Agent email address in format a-{slug}@{domain}';
COMMENT ON COLUMN agents.stripe_account_id IS 'Stripe Connect account for payments';

COMMENT ON TABLE generated_apps IS 'AI-generated application builds created by agents';
COMMENT ON COLUMN generated_apps.prompt IS 'Original user prompt for generating the build';
COMMENT ON COLUMN generated_apps.last_activity_at IS 'Last time this build was accessed or modified';
