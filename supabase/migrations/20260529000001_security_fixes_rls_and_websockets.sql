-- ============================================================================
-- CRITICAL SECURITY FIXES - RLS Policies & Access Control
-- Migration: 20260529000001
-- Created: 2026-05-29
-- Purpose: Fix critical security vulnerabilities in RLS policies and add
--          database-level security for WebSocket subscriptions
-- ============================================================================

-- ============================================================================
-- PART 1: FIX CREDIT TRANSACTIONS RLS (CRITICAL)
-- ============================================================================
-- ISSUE: Users can INSERT their own credit transactions and give themselves
--        unlimited free credits. This is a critical security flaw.
-- FIX: Remove INSERT policy for regular users. Only service role should
--      be able to insert credits via backend webhooks and functions.

-- Drop the dangerous policy that allows users to insert credits
DROP POLICY IF EXISTS "Users can insert credit transactions" ON credits_transactions;

-- Users can ONLY view their transactions, never insert/update/delete
-- All credit modifications must go through backend service role or functions
CREATE POLICY "Users can view own credit transactions"
  ON credits_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything (backend webhooks, payment processing)
CREATE POLICY "Service role can manage all credit transactions"
  ON credits_transactions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON POLICY "Service role can manage all credit transactions" ON credits_transactions IS
  'Only backend service can insert credits. Users cannot give themselves free credits.';

-- ============================================================================
-- PART 2: ADD BUILD OWNERSHIP VERIFICATION FUNCTION
-- ============================================================================
-- This function will be used for WebSocket subscription validation and RLS

CREATE OR REPLACE FUNCTION verify_build_ownership(
  p_user_id UUID,
  p_build_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_owner_id UUID;
BEGIN
  -- Check if build belongs to user's agent
  SELECT ga.user_id INTO v_owner_id
  FROM generated_apps ga
  JOIN agents a ON a.id = ga.agent_id
  WHERE ga.id = p_build_id;

  RETURN v_owner_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION verify_build_ownership IS
  'Verifies that a build belongs to a user. Used for WebSocket auth and RLS.';

-- ============================================================================
-- PART 3: ADD WEBSOCKET SUBSCRIPTIONS TABLE
-- ============================================================================
-- Track active WebSocket subscriptions for security auditing
-- Backend will verify ownership before registering subscriptions

CREATE TABLE IF NOT EXISTS websocket_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  build_id UUID NOT NULL REFERENCES generated_apps(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure user can only subscribe to builds they own
  CONSTRAINT check_build_ownership CHECK (verify_build_ownership(user_id, build_id))
);

CREATE INDEX idx_websocket_subscriptions_user ON websocket_subscriptions(user_id);
CREATE INDEX idx_websocket_subscriptions_build ON websocket_subscriptions(build_id);
CREATE INDEX idx_websocket_subscriptions_session ON websocket_subscriptions(session_id);

ALTER TABLE websocket_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON websocket_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions"
  ON websocket_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id AND verify_build_ownership(user_id, build_id));

CREATE POLICY "Users can delete own subscriptions"
  ON websocket_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE websocket_subscriptions IS
  'Tracks active WebSocket subscriptions with ownership verification';

-- ============================================================================
-- PART 4: FIX DEPLOYMENTS TABLE RLS
-- ============================================================================
-- ISSUE: Only SELECT policy exists, but deployments are created by backend
-- FIX: Add proper INSERT/UPDATE policies with ownership checks

ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view deployments for own companies" ON deployments;

-- Users can view deployments for their own companies
CREATE POLICY "Users can view deployments for own companies"
  ON deployments FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- Backend service role can insert deployments
CREATE POLICY "Service role can create deployments"
  ON deployments FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Backend service role can update deployment status
CREATE POLICY "Service role can update deployments"
  ON deployments FOR UPDATE
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- PART 5: FIX DOCUMENTS TABLE RLS
-- ============================================================================
-- ISSUE: Uses "FOR ALL" which is too broad
-- FIX: Separate policies for SELECT, INSERT, UPDATE, DELETE

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policy
DROP POLICY IF EXISTS "Users can manage documents for own companies" ON documents;

-- Separate policies for better security
CREATE POLICY "Users can view documents for own companies"
  ON documents FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create documents for own companies"
  ON documents FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update documents for own companies"
  ON documents FOR UPDATE
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete documents for own companies"
  ON documents FOR DELETE
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- Service role can do everything
CREATE POLICY "Service role can manage all documents"
  ON documents FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- PART 6: FIX AGENT EXECUTIONS RLS
-- ============================================================================
-- ISSUE: "System can insert/update" using WITH CHECK (true) is too permissive
-- FIX: Only service role should manage agent executions

ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;

-- Drop overly permissive policies
DROP POLICY IF EXISTS "System can insert agent executions" ON agent_executions;
DROP POLICY IF EXISTS "System can update agent executions" ON agent_executions;
DROP POLICY IF EXISTS "Users can view agent executions for their builds" ON agent_executions;

-- Users can view executions for their own builds
CREATE POLICY "Users can view agent executions for own builds"
  ON agent_executions FOR SELECT
  USING (
    build_id IN (
      SELECT ga.id FROM generated_apps ga
      JOIN agents a ON a.id = ga.agent_id
      WHERE a.user_id = auth.uid()
    )
  );

-- Only service role can insert/update agent executions
CREATE POLICY "Service role can manage agent executions"
  ON agent_executions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- PART 7: FIX BUILD DOCUMENTS RLS
-- ============================================================================

ALTER TABLE build_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view documents for their builds" ON build_documents;
DROP POLICY IF EXISTS "System can manage documents" ON build_documents;

CREATE POLICY "Users can view documents for own builds"
  ON build_documents FOR SELECT
  USING (
    build_id IN (
      SELECT ga.id FROM generated_apps ga
      JOIN agents a ON a.id = ga.agent_id
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage build documents"
  ON build_documents FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- PART 8: FIX BUILD SPREADSHEETS RLS
-- ============================================================================

ALTER TABLE build_spreadsheets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view spreadsheets for their builds" ON build_spreadsheets;
DROP POLICY IF EXISTS "System can manage spreadsheets" ON build_spreadsheets;

CREATE POLICY "Users can view spreadsheets for own builds"
  ON build_spreadsheets FOR SELECT
  USING (
    build_id IN (
      SELECT ga.id FROM generated_apps ga
      JOIN agents a ON a.id = ga.agent_id
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage build spreadsheets"
  ON build_spreadsheets FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- PART 9: FIX BUILD PITCH DECKS RLS
-- ============================================================================

ALTER TABLE build_pitch_decks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view pitch decks for their builds" ON build_pitch_decks;
DROP POLICY IF EXISTS "System can manage pitch decks" ON build_pitch_decks;

CREATE POLICY "Users can view pitch decks for own builds"
  ON build_pitch_decks FOR SELECT
  USING (
    build_id IN (
      SELECT ga.id FROM generated_apps ga
      JOIN agents a ON a.id = ga.agent_id
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage build pitch decks"
  ON build_pitch_decks FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- PART 10: FIX CONTACT INTERACTIONS RLS
-- ============================================================================
-- ISSUE: Only SELECT policy exists
-- FIX: Add INSERT for users to create interactions

ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view interactions for own contacts" ON contact_interactions;

CREATE POLICY "Users can view interactions for own contacts"
  ON contact_interactions FOR SELECT
  USING (
    contact_id IN (
      SELECT id FROM contacts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create interactions for own contacts"
  ON contact_interactions FOR INSERT
  WITH CHECK (
    contact_id IN (
      SELECT id FROM contacts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all contact interactions"
  ON contact_interactions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- PART 11: ADD GENERATED_APPS OWNERSHIP VERIFICATION
-- ============================================================================
-- Ensure generated_apps table has proper RLS policies

ALTER TABLE generated_apps ENABLE ROW LEVEL SECURITY;

-- Check and add policies if they don't exist
DO $$
BEGIN
  -- Drop existing policies to recreate them properly
  DROP POLICY IF EXISTS "Users can view own generated apps" ON generated_apps;
  DROP POLICY IF EXISTS "Users can create own apps" ON generated_apps;
  DROP POLICY IF EXISTS "Users can update own apps" ON generated_apps;
  DROP POLICY IF EXISTS "Users can delete own apps" ON generated_apps;
  DROP POLICY IF EXISTS "Users can manage own generated apps" ON generated_apps;
END $$;

-- Users can only access apps through their agents
CREATE POLICY "Users can view apps through own agents"
  ON generated_apps FOR SELECT
  USING (
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create apps through own agents"
  ON generated_apps FOR INSERT
  WITH CHECK (
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update apps through own agents"
  ON generated_apps FOR UPDATE
  USING (
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete apps through own agents"
  ON generated_apps FOR DELETE
  USING (
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    )
  );

-- Service role can manage all
CREATE POLICY "Service role can manage all generated apps"
  ON generated_apps FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- PART 12: ADD AGENTS TABLE RLS IMPROVEMENTS
-- ============================================================================
-- Ensure agents table has proper ownership

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Drop existing if it exists
DROP POLICY IF EXISTS "Users can view own company agents" ON agents;

-- Recreate with both company ownership AND direct user ownership
CREATE POLICY "Users can view own agents"
  ON agents FOR SELECT
  USING (
    user_id = auth.uid() OR
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own agents"
  ON agents FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own agents"
  ON agents FOR UPDATE
  USING (user_id = auth.uid());

-- Service role full access
CREATE POLICY "Service role can manage all agents"
  ON agents FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- PART 13: ADD SECURITY AUDIT LOG FUNCTION
-- ============================================================================

CREATE TABLE IF NOT EXISTS security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_security_audit_log_user ON security_audit_log(user_id, created_at DESC);
CREATE INDEX idx_security_audit_log_resource ON security_audit_log(resource_type, resource_id);
CREATE INDEX idx_security_audit_log_event ON security_audit_log(event_type, created_at DESC);

ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can write audit logs
CREATE POLICY "Service role can manage audit logs"
  ON security_audit_log FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON security_audit_log FOR SELECT
  USING (auth.uid() = user_id);

COMMENT ON TABLE security_audit_log IS
  'Security audit trail for sensitive operations';

-- ============================================================================
-- VERIFICATION & SUMMARY
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Security Migration Complete!';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Critical Fixes Applied:';
  RAISE NOTICE '  1. Removed user INSERT policy on credits_transactions';
  RAISE NOTICE '  2. Added verify_build_ownership() function for WebSocket auth';
  RAISE NOTICE '  3. Created websocket_subscriptions table with ownership checks';
  RAISE NOTICE '  4. Fixed deployments RLS (added INSERT/UPDATE policies)';
  RAISE NOTICE '  5. Fixed documents RLS (separated SELECT/INSERT/UPDATE/DELETE)';
  RAISE NOTICE '  6. Fixed agent_executions RLS (service role only)';
  RAISE NOTICE '  7. Fixed build_documents RLS (service role only)';
  RAISE NOTICE '  8. Fixed build_spreadsheets RLS (service role only)';
  RAISE NOTICE '  9. Fixed build_pitch_decks RLS (service role only)';
  RAISE NOTICE '  10. Fixed contact_interactions RLS (added INSERT)';
  RAISE NOTICE '  11. Added proper RLS to generated_apps table';
  RAISE NOTICE '  12. Improved agents table RLS with user_id checks';
  RAISE NOTICE '  13. Added security_audit_log table';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: Update backend WebSocket authentication!';
  RAISE NOTICE '    See: apps/backend/src/services/websocketServer.ts';
  RAISE NOTICE '';
END $$;
