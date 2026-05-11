-- ===========================================================================
-- Migration 001: Profiles Table V2 Enhancement
-- ===========================================================================
-- Purpose: Add v2 features to profiles table for credits, subscriptions, etc.
-- Safe: Idempotent, preserves existing data
-- Author: Claude
-- Date: 2026-05-09
-- ===========================================================================

/**
 * Add new columns to profiles table for v2 features
 * - Subscription tracking (Stripe)
 * - Credits system
 * - Account status management
 * - User preferences
 */

-- Add avatar and status columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- Add subscription-related columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;

-- Add credits and limits columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 100;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_company_limit INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_companies_created INTEGER DEFAULT 0;

-- Add preference columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"sms": true, "activity": true, "billing": true}'::jsonb;

-- Add metadata columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

/**
 * Update existing users to have free credits if they don't have any
 * Ensures all users start with 100 credits
 */
UPDATE profiles
SET credits_balance = 100
WHERE credits_balance IS NULL OR credits_balance = 0;

/**
 * Add or update constraints for new columns
 */
DO $$
BEGIN
  -- Drop old plan constraint
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;

  -- Add new plan constraint (includes 'enterprise')
  ALTER TABLE profiles ADD CONSTRAINT profiles_plan_check
    CHECK (plan IN ('free', 'starter', 'growth', 'scale', 'enterprise'));

  -- Add status constraint
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
  ALTER TABLE profiles ADD CONSTRAINT profiles_status_check
    CHECK (status IN ('active', 'suspended', 'deleted'));

  -- Add subscription status constraint
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;
  ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_status_check
    CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'paused'));
EXCEPTION
  WHEN others THEN NULL;  -- Ignore if constraints already exist
END $$;

/**
 * Create indexes for performance
 */
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);
CREATE INDEX IF NOT EXISTS idx_profiles_credits ON profiles(credits_balance);

/**
 * Trigger function to auto-update updated_at timestamp
 */
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;

-- Create trigger for updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_profiles_updated_at();

/**
 * Verification: Check migration success
 */
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  -- Count new columns
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_name = 'profiles'
  AND column_name IN ('credits_balance', 'subscription_status', 'monthly_company_limit', 'avatar_url');

  IF col_count = 4 THEN
    RAISE NOTICE '✅ Migration 001 successful! Added % new columns to profiles table.', col_count;
  ELSE
    RAISE WARNING '⚠️ Migration 001 may be incomplete. Found % of 4 expected columns.', col_count;
  END IF;
END $$;
