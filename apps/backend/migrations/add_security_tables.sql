-- Security and cost protection tables
-- Run this migration to add rate limiting and cost tracking

-- Rate limits table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_request TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, operation_type)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_operation ON rate_limits(user_id, operation_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

-- Credit transactions table (for tracking credit usage)
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Negative for deductions, positive for additions
  operation_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user transaction history
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id, created_at DESC);

-- AI operation logs (for monitoring and cost analysis)
CREATE TABLE IF NOT EXISTS ai_operation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cost_cents INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for cost analysis
CREATE INDEX IF NOT EXISTS idx_ai_operation_logs_user ON ai_operation_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_operation_logs_type ON ai_operation_logs(operation_type, created_at DESC);

-- Add credits column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 1000;

-- Function to deduct credits atomically
CREATE OR REPLACE FUNCTION deduct_credits(user_id UUID, amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  UPDATE profiles
  SET credits = GREATEST(credits - amount, 0),
      updated_at = NOW()
  WHERE id = user_id
  RETURNING credits INTO new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  RETURN new_balance;
END;
$$;

-- Function to add credits
CREATE OR REPLACE FUNCTION add_credits(user_id UUID, amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  UPDATE profiles
  SET credits = credits + amount,
      updated_at = NOW()
  WHERE id = user_id
  RETURNING credits INTO new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  RETURN new_balance;
END;
$$;

-- Enable Row Level Security
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_operation_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
CREATE POLICY rate_limits_user_policy ON rate_limits
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY credit_transactions_user_policy ON credit_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY ai_operation_logs_user_policy ON ai_operation_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything (bypass RLS)
-- This is handled by using service key in backend

COMMENT ON TABLE rate_limits IS 'Tracks rate limits per user per operation type';
COMMENT ON TABLE credit_transactions IS 'Logs all credit additions and deductions';
COMMENT ON TABLE ai_operation_logs IS 'Logs all AI operations for cost monitoring and analysis';
COMMENT ON COLUMN profiles.credits IS 'User credit balance (1 credit = $0.01)';
