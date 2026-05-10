-- ===========================================================================
-- Migration 007: Payment Methods Table
-- ===========================================================================
-- Purpose: Store user payment methods for billing
-- Dependencies: profiles table
-- Author: Claude
-- Date: 2026-05-09
-- ===========================================================================

/**
 * Payment methods table - stored payment methods from Stripe
 * Types: card, bank_account, sepa_debit, us_bank_account
 */
CREATE TABLE IF NOT EXISTS payment_methods (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Stripe references
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,

  -- Payment method type
  type TEXT NOT NULL CHECK (type IN ('card', 'bank_account', 'sepa_debit', 'us_bank_account')),

  -- Card details (for type='card')
  card_brand TEXT,  -- visa, mastercard, amex, discover
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  card_fingerprint TEXT,

  -- Bank account details (for type='bank_account' or 'us_bank_account')
  bank_name TEXT,
  bank_last4 TEXT,

  -- Status & settings
  is_default BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'removed')),

  -- Additional details
  billing_details JSONB,  -- Name, address, email, phone
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

/**
 * Indexes for performance
 */
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_pm_id ON payment_methods(stripe_payment_method_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_customer_id ON payment_methods(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(is_default);
CREATE INDEX IF NOT EXISTS idx_payment_methods_status ON payment_methods(status);

/**
 * Enable Row Level Security
 */
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can manage own payment methods" ON payment_methods;

/**
 * RLS Policy: Users can view their own payment methods
 */
CREATE POLICY "Users can view own payment methods"
  ON payment_methods FOR SELECT
  USING (auth.uid() = user_id);

/**
 * RLS Policy: Users can manage their own payment methods
 */
CREATE POLICY "Users can manage own payment methods"
  ON payment_methods FOR ALL
  USING (auth.uid() = user_id);

/**
 * Trigger function: Auto-update updated_at timestamp
 */
CREATE OR REPLACE FUNCTION update_payment_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_payment_methods_updated_at ON payment_methods;

-- Create trigger for updated_at
CREATE TRIGGER set_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_payment_methods_updated_at();

/**
 * Trigger function: Ensure only one default payment method per user
 * When setting a payment method as default, unset all others
 */
CREATE OR REPLACE FUNCTION enforce_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  -- If this payment method is being set as default
  IF NEW.is_default = TRUE THEN
    -- Unset all other payment methods for this user
    UPDATE payment_methods
    SET is_default = FALSE
    WHERE user_id = NEW.user_id
    AND id != NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS ensure_single_default_pm ON payment_methods;

-- Create trigger to enforce single default
CREATE TRIGGER ensure_single_default_pm
  BEFORE INSERT OR UPDATE OF is_default ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION enforce_single_default_payment_method();

/**
 * View: User payment methods with masked details
 * Convenient view for displaying payment methods securely
 */
CREATE OR REPLACE VIEW user_payment_methods_view AS
SELECT
  pm.id,
  pm.user_id,
  pm.type,
  CASE
    WHEN pm.type = 'card' THEN pm.card_brand || ' •••• ' || pm.card_last4
    WHEN pm.type IN ('bank_account', 'us_bank_account') THEN pm.bank_name || ' •••• ' || pm.bank_last4
    ELSE pm.type
  END AS display_name,
  pm.card_exp_month,
  pm.card_exp_year,
  pm.is_default,
  pm.status,
  pm.created_at
FROM payment_methods pm
WHERE pm.status = 'active';

/**
 * Verification: Check migration success
 */
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_methods') THEN
    RAISE NOTICE '✅ Migration 007 successful! Payment methods table created.';
  ELSE
    RAISE WARNING '⚠️ Migration 007 failed. Payment_methods table does not exist.';
  END IF;
END $$;
