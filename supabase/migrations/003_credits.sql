-- ===========================================================================
-- Migration 003: Credits Transactions System
-- ===========================================================================
-- Purpose: Create credits ledger with automatic balance updates
-- Dependencies: profiles, companies tables
-- Author: Claude
-- Date: 2026-05-09
-- ===========================================================================

/**
 * Credits transactions table - ledger of all credit movements
 * Types:
 * - purchase: User bought credits
 * - usage: User spent credits (company creation, agent actions, etc.)
 * - refund: Credits refunded to user
 * - bonus: Free credits (signup, referral, monthly plan credits)
 * - expiration: Credits expired (unused after 12 months)
 */
CREATE TABLE IF NOT EXISTS credits_transactions (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Transaction details
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus', 'expiration')),
  amount INTEGER NOT NULL,  -- Positive for additions, negative for deductions
  balance_after INTEGER NOT NULL,  -- Balance after this transaction

  -- Context
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  description TEXT NOT NULL,

  -- Payment details (for purchases)
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  price_paid DECIMAL(10,2),  -- USD amount paid

  -- Usage details (for usage type)
  usage_type TEXT CHECK (usage_type IN (
    'company_creation',
    'agent_action',
    'email_sent',
    'api_call',
    'domain_setup'
  )),

  -- Metadata
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

/**
 * Indexes for performance
 */
CREATE INDEX IF NOT EXISTS idx_credits_user_id ON credits_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_company_id ON credits_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_credits_type ON credits_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credits_created_at ON credits_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credits_usage_type ON credits_transactions(usage_type);

/**
 * Enable Row Level Security
 */
ALTER TABLE credits_transactions ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view own credit transactions" ON credits_transactions;
DROP POLICY IF EXISTS "Users can insert credit transactions" ON credits_transactions;

/**
 * RLS Policy: Users can view their own credit transactions
 */
CREATE POLICY "Users can view own credit transactions"
  ON credits_transactions FOR SELECT
  USING (auth.uid() = user_id);

/**
 * RLS Policy: Users can insert credit transactions (for manual purchases)
 * Note: Most inserts will come from backend via service role
 */
CREATE POLICY "Users can insert credit transactions"
  ON credits_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

/**
 * Trigger function: Auto-update user's credits balance
 * This runs AFTER insert to keep profile.credits_balance in sync
 */
CREATE OR REPLACE FUNCTION update_credits_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's credits balance
  UPDATE profiles
  SET credits_balance = credits_balance + NEW.amount
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_user_credits_after_transaction ON credits_transactions;

-- Create trigger to auto-update balance
CREATE TRIGGER update_user_credits_after_transaction
  AFTER INSERT ON credits_transactions
  FOR EACH ROW EXECUTE FUNCTION update_credits_balance();

/**
 * Helper function: Deduct credits (called from application)
 * Returns true if successful, false if insufficient balance
 */
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_usage_type TEXT,
  p_company_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT credits_balance INTO v_current_balance
  FROM profiles
  WHERE id = p_user_id;

  -- Check if user has enough credits
  IF v_current_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Calculate new balance
  v_new_balance := v_current_balance - p_amount;

  -- Insert transaction (trigger will update profile balance)
  INSERT INTO credits_transactions (
    user_id,
    type,
    amount,
    balance_after,
    company_id,
    description,
    usage_type
  ) VALUES (
    p_user_id,
    'usage',
    -p_amount,  -- Negative for deduction
    v_new_balance,
    p_company_id,
    p_description,
    p_usage_type
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/**
 * Helper function: Add credits (called from backend/webhooks)
 */
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT,
  p_stripe_payment_intent_id TEXT DEFAULT NULL,
  p_price_paid DECIMAL DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Get current balance
  SELECT credits_balance INTO v_current_balance
  FROM profiles
  WHERE id = p_user_id;

  -- Calculate new balance
  v_new_balance := v_current_balance + p_amount;

  -- Insert transaction
  INSERT INTO credits_transactions (
    user_id,
    type,
    amount,
    balance_after,
    description,
    stripe_payment_intent_id,
    price_paid
  ) VALUES (
    p_user_id,
    p_type,
    p_amount,
    v_new_balance,
    p_description,
    p_stripe_payment_intent_id,
    p_price_paid
  )
  RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/**
 * Verification: Check migration success
 */
DO $$
DECLARE
  trigger_count INTEGER;
BEGIN
  -- Check table exists
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'credits_transactions') THEN
    RAISE WARNING '⚠️ Migration 003 failed. Credits_transactions table does not exist.';
    RETURN;
  END IF;

  -- Check trigger exists
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE trigger_name = 'update_user_credits_after_transaction';

  IF trigger_count > 0 THEN
    RAISE NOTICE '✅ Migration 003 successful! Credits system with auto-balance is ready.';
  ELSE
    RAISE WARNING '⚠️ Migration 003 incomplete. Trigger not created.';
  END IF;
END $$;
