-- Nanowork Database Schema v2 - PHONE AUTHENTICATION VERSION
-- This version uses phone numbers as primary identifier (not email)

-- ============================================================================
-- PROFILES TABLE - Phone-based authentication
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    -- Add phone column if using email
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

    -- Make phone unique
    CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone) WHERE phone IS NOT NULL;

    -- Add new columns for v2
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_id TEXT;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 0;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_company_limit INTEGER DEFAULT 1;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_companies_created INTEGER DEFAULT 0;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"sms": true, "activity": true, "billing": true}'::jsonb;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

    -- Drop old constraints
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;

    -- Add updated constraints
    ALTER TABLE profiles ADD CONSTRAINT profiles_plan_check
      CHECK (plan IN ('free', 'starter', 'growth', 'scale', 'enterprise'));

    ALTER TABLE profiles ADD CONSTRAINT profiles_status_check
      CHECK (status IN ('active', 'suspended', 'deleted'));

    ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_status_check
      CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'paused'));
  ELSE
    -- Create new profiles table with phone auth
    CREATE TABLE profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      phone TEXT NOT NULL UNIQUE,
      email TEXT,
      name TEXT,
      avatar_url TEXT,
      business_name TEXT,
      business_prompt TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
      phone_verified BOOLEAN DEFAULT FALSE,
      plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'growth', 'scale', 'enterprise')),
      stripe_customer_id TEXT UNIQUE,
      subscription_status TEXT CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'paused')),
      subscription_id TEXT,
      trial_ends_at TIMESTAMPTZ,
      subscription_ends_at TIMESTAMPTZ,
      credits_balance INTEGER DEFAULT 100,
      monthly_company_limit INTEGER DEFAULT 1,
      total_companies_created INTEGER DEFAULT 0,
      subdomain TEXT UNIQUE,
      custom_domain TEXT,
      timezone TEXT DEFAULT 'UTC',
      notification_preferences JSONB DEFAULT '{"sms": true, "activity": true, "billing": true}'::jsonb,
      last_login_at TIMESTAMPTZ,
      deleted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_profiles_phone ON profiles(phone);
    CREATE INDEX idx_profiles_email ON profiles(email);
    CREATE INDEX idx_profiles_stripe_customer ON profiles(stripe_customer_id);
    CREATE INDEX idx_profiles_status ON profiles(status);
    CREATE INDEX idx_profiles_plan ON profiles(plan);
    CREATE INDEX idx_profiles_subdomain ON profiles(subdomain);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Rest of the schema remains the same as TABLES_FIXED.sql
-- Copy everything from "STEP 3: Update companies table" onwards from TABLES_FIXED.sql
