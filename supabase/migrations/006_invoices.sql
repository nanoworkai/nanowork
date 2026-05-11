-- ===========================================================================
-- Migration 006: Invoices Table
-- ===========================================================================
-- Purpose: Store billing invoices from Stripe
-- Dependencies: profiles, subscriptions tables
-- Author: Claude
-- Date: 2026-05-09
-- ===========================================================================

/**
 * Invoices table - billing invoice records from Stripe
 * Synced via webhooks when invoices are created/paid
 */
CREATE TABLE IF NOT EXISTS invoices (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

  -- Stripe references
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  invoice_number TEXT,

  -- Amount details
  amount_due DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Status tracking
  status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),

  -- Payment details
  payment_intent_id TEXT,
  charge_id TEXT,
  paid_at TIMESTAMPTZ,

  -- Date tracking
  invoice_date TIMESTAMPTZ NOT NULL,
  due_date TIMESTAMPTZ,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,

  -- URLs for user access
  invoice_pdf_url TEXT,
  hosted_invoice_url TEXT,

  -- Line items (JSON array)
  line_items JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

/**
 * Indexes for performance
 */
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_customer_id ON invoices(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_paid_at ON invoices(paid_at DESC);

/**
 * Enable Row Level Security
 */
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;

/**
 * RLS Policy: Users can view their own invoices
 */
CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

/**
 * Trigger function: Auto-update updated_at timestamp
 */
CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_invoices_updated_at ON invoices;

-- Create trigger for updated_at
CREATE TRIGGER set_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_invoices_updated_at();

/**
 * View: User billing history with details
 * Convenient view for displaying billing information
 */
CREATE OR REPLACE VIEW user_billing_history AS
SELECT
  i.id,
  i.user_id,
  i.invoice_number,
  i.amount_due,
  i.amount_paid,
  i.currency,
  i.status,
  i.invoice_date,
  i.paid_at,
  i.invoice_pdf_url,
  i.hosted_invoice_url,
  s.plan,
  s.billing_cycle,
  p.email,
  p.phone,
  p.name
FROM invoices i
LEFT JOIN subscriptions s ON i.subscription_id = s.id
LEFT JOIN profiles p ON i.user_id = p.id;

/**
 * Verification: Check migration success
 */
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'invoices') THEN
    RAISE NOTICE '✅ Migration 006 successful! Invoices table created.';
  ELSE
    RAISE WARNING '⚠️ Migration 006 failed. Invoices table does not exist.';
  END IF;
END $$;
