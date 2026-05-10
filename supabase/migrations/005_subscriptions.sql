-- ===========================================================================
-- Migration 005: Subscriptions Table
-- ===========================================================================
-- Purpose: Track Stripe subscriptions for billing management
-- Dependencies: profiles table
-- Author: Claude
-- Date: 2026-05-09
-- ===========================================================================

/**
 * Subscriptions table - Stripe subscription tracking
 * Synced via webhooks from Stripe
 * Plans: starter, growth, scale, enterprise
 */
CREATE TABLE IF NOT EXISTS subscriptions (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Stripe references
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,

  -- Subscription details
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'growth', 'scale', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('incomplete', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused')),

  -- Billing details
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Period tracking
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,

  -- Plan features & limits (JSON for flexibility)
  features JSONB DEFAULT '{}'::jsonb,
  limits JSONB DEFAULT '{}'::jsonb,  -- {companies: 10, agents: 70, credits_per_month: 5000}

  -- Metadata
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

/**
 * Indexes for performance
 */
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan);

/**
 * Enable Row Level Security
 */
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;

/**
 * RLS Policy: Users can view their own subscriptions
 */
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

/**
 * Trigger function: Auto-update updated_at timestamp
 */
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_subscriptions_updated_at ON subscriptions;

-- Create trigger for updated_at
CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_subscriptions_updated_at();

/**
 * Helper function: Get plan limits
 * Returns default limits for each plan tier
 */
CREATE OR REPLACE FUNCTION get_plan_limits(p_plan TEXT)
RETURNS JSONB AS $$
BEGIN
  RETURN CASE p_plan
    WHEN 'starter' THEN '{"companies": 3, "team_members": 1, "agents": 21, "credits_per_month": 1000, "custom_domains": 1, "api_access": true}'::jsonb
    WHEN 'growth' THEN '{"companies": 10, "team_members": 5, "agents": 70, "credits_per_month": 5000, "custom_domains": 5, "api_access": true}'::jsonb
    WHEN 'scale' THEN '{"companies": 50, "team_members": 20, "agents": 350, "credits_per_month": 20000, "custom_domains": 25, "api_access": true}'::jsonb
    WHEN 'enterprise' THEN '{"companies": -1, "team_members": -1, "agents": -1, "credits_per_month": 100000, "custom_domains": -1, "api_access": true}'::jsonb
    ELSE '{"companies": 1, "team_members": 0, "agents": 7, "credits_per_month": 100, "custom_domains": 0, "api_access": false}'::jsonb
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

/**
 * Verification: Check migration success
 */
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
    RAISE NOTICE '✅ Migration 005 successful! Subscriptions table created.';
  ELSE
    RAISE WARNING '⚠️ Migration 005 failed. Subscriptions table does not exist.';
  END IF;
END $$;
