-- ============================================================================
-- Nanowork Minimal Schema
-- ============================================================================
-- User-based agents (one per user) for build generation and credit management

-- ============================================================================
-- AGENTS TABLE
-- ============================================================================
-- One agent per user for managing builds and businesses

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

CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_slug ON agents(slug);
CREATE INDEX IF NOT EXISTS idx_agents_email ON agents(email);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);

-- RLS policies for agents
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY agents_select_own ON agents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY agents_insert_own ON agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY agents_update_own ON agents FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- User profiles with credit balances

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_credits ON profiles(credits);

-- RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY profiles_update_own ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- BUILDS TABLE
-- ============================================================================
-- AI-generated build plans

CREATE TABLE IF NOT EXISTS builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  prompt TEXT NOT NULL,
  tagline TEXT,
  status TEXT NOT NULL DEFAULT 'preview' CHECK (status IN ('preview', 'generating', 'unlocked', 'failed')),
  build_data JSONB,
  credits_cost INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unlocked_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_builds_user_id ON builds(user_id);
CREATE INDEX IF NOT EXISTS idx_builds_status ON builds(status);
CREATE INDEX IF NOT EXISTS idx_builds_created_at ON builds(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_builds_last_activity_at ON builds(last_activity_at DESC);

-- RLS policies for builds
ALTER TABLE builds ENABLE ROW LEVEL SECURITY;

CREATE POLICY builds_select_own ON builds FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY builds_insert_own ON builds FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY builds_update_own ON builds FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY builds_delete_own ON builds FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- CREDIT_TRANSACTIONS TABLE
-- ============================================================================
-- Audit log for all credit operations

CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('topup', 'spend', 'refund')),
  description TEXT,
  task_id UUID,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_stripe_payment_intent_id ON credit_transactions(stripe_payment_intent_id);

-- RLS policies for credit_transactions
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY credit_transactions_select_own ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY credit_transactions_insert_own ON credit_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- POSTGRES FUNCTIONS
-- ============================================================================

-- Atomic credit deduction function
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER
) RETURNS INTEGER AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Lock the row for update
  SELECT credits INTO v_current_balance
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check if user exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Calculate new balance
  v_new_balance := v_current_balance - p_amount;

  -- Check if sufficient credits
  IF v_new_balance < 0 THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;

  -- Update balance
  UPDATE profiles
  SET credits = v_new_balance,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Return new balance
  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic credit addition function (for Stripe webhooks)
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER
) RETURNS INTEGER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Lock the row for update and increment atomically
  UPDATE profiles
  SET credits = credits + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING credits INTO v_new_balance;

  -- Check if user exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Return new balance
  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agents_updated_at BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
