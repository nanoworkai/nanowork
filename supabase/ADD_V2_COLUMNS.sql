-- Quick migration: Add v2 columns to existing profiles table
-- Safe to run - won't break existing data
-- Run this in Supabase SQL Editor

-- Add new columns to profiles (won't fail if they already exist)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 100;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_company_limit INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_companies_created INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"sms": true, "activity": true, "billing": true}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing users to have 100 free credits if null
UPDATE profiles SET credits_balance = 100 WHERE credits_balance IS NULL OR credits_balance = 0;

-- Add constraints
DO $$
BEGIN
  -- Drop old constraint if exists
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;

  -- Add new constraint with enterprise
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
  WHEN others THEN NULL;  -- Ignore errors if constraints already exist
END $$;

-- Create/update indexes
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_profiles_updated_at();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Profiles table updated successfully! All users now have 100 free credits.';
END $$;
