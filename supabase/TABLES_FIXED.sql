-- Nanowork Database Schema v2 - FIXED for Supabase
-- This version fixes common errors and ensures proper table creation order

-- ============================================================================
-- STEP 1: Drop existing tables if needed (commented out - uncomment if needed)
-- ============================================================================

/*
DROP TABLE IF EXISTS account_deletions CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS credits_transactions CASCADE;
DROP TABLE IF EXISTS agent_emails CASCADE;
DROP TABLE IF EXISTS custom_domains CASCADE;
DROP TABLE IF EXISTS company_members CASCADE;
DROP TABLE IF EXISTS metrics CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS communications CASCADE;
DROP TABLE IF EXISTS prospects CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS financial_infrastructure CASCADE;
DROP TABLE IF EXISTS agent_activities CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
*/

-- ============================================================================
-- STEP 2: Create profiles table (or alter existing)
-- ============================================================================

-- Check if profiles table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    -- Table exists, add new columns
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_id TEXT;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 0;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_company_limit INTEGER DEFAULT 1;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_companies_created INTEGER DEFAULT 0;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "activity": true, "billing": true}'::jsonb;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

    -- Drop old constraint if exists
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;

    -- Add new constraint with enterprise
    ALTER TABLE profiles ADD CONSTRAINT profiles_plan_check
      CHECK (plan IN ('free', 'starter', 'growth', 'scale', 'enterprise'));

    -- Add new constraint for status
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
    ALTER TABLE profiles ADD CONSTRAINT profiles_status_check
      CHECK (status IN ('active', 'suspended', 'deleted'));

    -- Add new constraint for subscription_status
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;
    ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_status_check
      CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'paused'));
  ELSE
    -- Create new table
    CREATE TABLE profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      avatar_url TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
      email_verified BOOLEAN DEFAULT FALSE,
      plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'growth', 'scale', 'enterprise')),
      stripe_customer_id TEXT UNIQUE,
      subscription_status TEXT CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'paused')),
      subscription_id TEXT,
      trial_ends_at TIMESTAMPTZ,
      subscription_ends_at TIMESTAMPTZ,
      credits_balance INTEGER DEFAULT 0,
      monthly_company_limit INTEGER DEFAULT 1,
      total_companies_created INTEGER DEFAULT 0,
      timezone TEXT DEFAULT 'UTC',
      notification_preferences JSONB DEFAULT '{"email": true, "activity": true, "billing": true}'::jsonb,
      last_login_at TIMESTAMPTZ,
      deleted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- STEP 3: Update companies table (rename user_id to owner_id)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'companies') THEN
    -- Rename user_id to owner_id if it exists
    IF EXISTS (SELECT FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'user_id') THEN
      ALTER TABLE companies RENAME COLUMN user_id TO owner_id;
    END IF;

    -- Add new columns
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS slug TEXT;
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT;
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS subdomain TEXT;
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS custom_domain_id UUID;
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS total_spend DECIMAL(12,2) DEFAULT 0;
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

    -- Add constraints
    ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_status_check;
    ALTER TABLE companies ADD CONSTRAINT companies_status_check
      CHECK (status IN ('initializing', 'active', 'paused', 'archived', 'deleted'));

    ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_website_status_check;
    ALTER TABLE companies ADD CONSTRAINT companies_website_status_check
      CHECK (website_status IN ('building', 'live', 'maintenance', 'offline'));

    -- Add unique constraints
    CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug) WHERE slug IS NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_subdomain ON companies(subdomain) WHERE subdomain IS NOT NULL;
  ELSE
    -- Create new table
    CREATE TABLE companies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      slug TEXT,
      industry TEXT,
      logo_url TEXT,
      status TEXT NOT NULL DEFAULT 'initializing' CHECK (status IN ('initializing', 'active', 'paused', 'archived', 'deleted')),
      entity_type TEXT,
      entity_state TEXT,
      ein TEXT,
      legal_entity_id TEXT,
      brand_colors JSONB,
      brand_guidelines_url TEXT,
      subdomain TEXT,
      custom_domain_id UUID,
      website_url TEXT,
      website_status TEXT CHECK (website_status IN ('building', 'live', 'maintenance', 'offline')),
      total_revenue DECIMAL(12,2) DEFAULT 0,
      mrr DECIMAL(12,2) DEFAULT 0,
      total_spend DECIMAL(12,2) DEFAULT 0,
      settings JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      launched_at TIMESTAMPTZ,
      archived_at TIMESTAMPTZ,
      deleted_at TIMESTAMPTZ
    );

    CREATE INDEX idx_companies_owner_id ON companies(owner_id);
    CREATE INDEX idx_companies_status ON companies(status);
    CREATE UNIQUE INDEX idx_companies_slug ON companies(slug) WHERE slug IS NOT NULL;
    CREATE UNIQUE INDEX idx_companies_subdomain ON companies(subdomain) WHERE subdomain IS NOT NULL;
    CREATE INDEX idx_companies_created_at ON companies(created_at DESC);
  END IF;
END $$;

-- Update RLS policies for companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own companies" ON companies;
DROP POLICY IF EXISTS "Team members can view their companies" ON companies;
DROP POLICY IF EXISTS "Owners can create companies" ON companies;
DROP POLICY IF EXISTS "Owners can update own companies" ON companies;
DROP POLICY IF EXISTS "Owners can delete own companies" ON companies;

CREATE POLICY "Owners can view own companies"
  ON companies FOR SELECT
  USING (auth.uid() = owner_id);

-- Team member policy will be added after company_members table is created

CREATE POLICY "Owners can create companies"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own companies"
  ON companies FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own companies"
  ON companies FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================================================
-- STEP 4: Create company_members table
-- ============================================================================

CREATE TABLE IF NOT EXISTS company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  permissions JSONB DEFAULT '{"view": true, "edit": false, "invite": false, "billing": false}'::jsonb,
  invited_by UUID REFERENCES profiles(id),
  invitation_email TEXT,
  invitation_token TEXT UNIQUE,
  invitation_status TEXT NOT NULL DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'accepted', 'declined', 'expired')),
  invitation_sent_at TIMESTAMPTZ,
  invitation_accepted_at TIMESTAMPTZ,
  invitation_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_company_members_company_id ON company_members(company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_user_id ON company_members(user_id);
CREATE INDEX IF NOT EXISTS idx_company_members_role ON company_members(role);
CREATE INDEX IF NOT EXISTS idx_company_members_invitation_token ON company_members(invitation_token);

ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view memberships for their companies" ON company_members;
DROP POLICY IF EXISTS "Owners and admins can manage members" ON company_members;

CREATE POLICY "Users can view memberships for their companies"
  ON company_members FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Owners and admins can manage members"
  ON company_members FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Now add team member view policy to companies
CREATE POLICY "Team members can view their companies"
  ON companies FOR SELECT
  USING (
    id IN (
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 5: Create custom_domains table
-- ============================================================================

CREATE TABLE IF NOT EXISTS custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  subdomain TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
  verification_token TEXT,
  verification_method TEXT CHECK (verification_method IN ('dns_txt', 'dns_cname', 'html_meta')),
  ssl_status TEXT NOT NULL DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'active', 'failed', 'expired')),
  ssl_provider TEXT,
  ssl_expires_at TIMESTAMPTZ,
  dns_records JSONB,
  is_primary BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'failed', 'removed')),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_domains_company_id ON custom_domains(company_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX IF NOT EXISTS idx_custom_domains_status ON custom_domains(status);

ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view domains for their companies" ON custom_domains;
DROP POLICY IF EXISTS "Owners can manage domains" ON custom_domains;

CREATE POLICY "Users can view domains for their companies"
  ON custom_domains FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage domains"
  ON custom_domains FOR ALL
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 6: Create agents table (update if exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  department TEXT NOT NULL CHECK (department IN ('legal', 'brand', 'web', 'marketing', 'sales', 'finance', 'operations')),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'initializing' CHECK (status IN ('initializing', 'active', 'paused', 'error')),
  email_address TEXT UNIQUE,
  virtual_card_id TEXT,
  bank_account_id TEXT,
  daily_spend_limit DECIMAL(10,2) DEFAULT 1000.00,
  monthly_budget DECIMAL(10,2) DEFAULT 10000.00,
  current_month_spend DECIMAL(10,2) DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  total_spend DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agents_company_id ON agents(company_id);
CREATE INDEX IF NOT EXISTS idx_agents_department ON agents(department);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_agents_company_department ON agents(company_id, department);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view agents for their companies" ON agents;

CREATE POLICY "Users can view agents for their companies"
  ON agents FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
      UNION
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 7: Create agent_emails table
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL UNIQUE,
  display_name TEXT,
  provider TEXT NOT NULL DEFAULT 'resend' CHECK (provider IN ('resend', 'sendgrid', 'ses', 'postmark')),
  provider_id TEXT,
  api_key_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'bounced')),
  emails_sent_total INTEGER DEFAULT 0,
  emails_received_total INTEGER DEFAULT 0,
  bounce_count INTEGER DEFAULT 0,
  complaint_count INTEGER DEFAULT 0,
  forwarding_enabled BOOLEAN DEFAULT TRUE,
  forwarding_address TEXT,
  auto_reply_enabled BOOLEAN DEFAULT FALSE,
  auto_reply_template TEXT,
  signature TEXT,
  last_sent_at TIMESTAMPTZ,
  last_received_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_emails_agent_id ON agent_emails(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_emails_company_id ON agent_emails(company_id);
CREATE INDEX IF NOT EXISTS idx_agent_emails_email ON agent_emails(email_address);
CREATE INDEX IF NOT EXISTS idx_agent_emails_status ON agent_emails(status);

ALTER TABLE agent_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view emails for their company agents" ON agent_emails;

CREATE POLICY "Users can view emails for their company agents"
  ON agent_emails FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 8: Create credits_transactions table
-- ============================================================================

CREATE TABLE IF NOT EXISTS credits_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus', 'expiration')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  price_paid DECIMAL(10,2),
  usage_type TEXT CHECK (usage_type IN ('company_creation', 'agent_action', 'email_sent', 'api_call')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credits_user_id ON credits_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_company_id ON credits_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_credits_type ON credits_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credits_created_at ON credits_transactions(created_at DESC);

ALTER TABLE credits_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own credit transactions" ON credits_transactions;

CREATE POLICY "Users can view own credit transactions"
  ON credits_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 9: Create subscriptions table
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'growth', 'scale', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('incomplete', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  features JSONB DEFAULT '{}'::jsonb,
  limits JSONB DEFAULT '{}'::jsonb,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 10: Create invoices table
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  invoice_number TEXT,
  amount_due DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  payment_intent_id TEXT,
  charge_id TEXT,
  paid_at TIMESTAMPTZ,
  invoice_date TIMESTAMPTZ NOT NULL,
  due_date TIMESTAMPTZ,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  invoice_pdf_url TEXT,
  hosted_invoice_url TEXT,
  line_items JSONB DEFAULT '[]'::jsonb,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date DESC);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;

CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 11: Create payment_methods table
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('card', 'bank_account', 'sepa_debit', 'us_bank_account')),
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  card_fingerprint TEXT,
  bank_name TEXT,
  bank_last4 TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'removed')),
  billing_details JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_pm_id ON payment_methods(stripe_payment_method_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(is_default);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can manage own payment methods" ON payment_methods;

CREATE POLICY "Users can view own payment methods"
  ON payment_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own payment methods"
  ON payment_methods FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 12: Create account_deletions table
-- ============================================================================

CREATE TABLE IF NOT EXISTS account_deletions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'canceled')),
  deletion_type TEXT NOT NULL CHECK (deletion_type IN ('soft', 'hard')),
  reason TEXT,
  feedback TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_for TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  data_export_url TEXT,
  data_retention_until TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_account_deletions_user_id ON account_deletions(user_id);
CREATE INDEX IF NOT EXISTS idx_account_deletions_status ON account_deletions(status);
CREATE INDEX IF NOT EXISTS idx_account_deletions_scheduled_for ON account_deletions(scheduled_for);

ALTER TABLE account_deletions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own deletion requests" ON account_deletions;

CREATE POLICY "Users can view own deletion requests"
  ON account_deletions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 13: Create remaining tables (if they don't exist)
-- ============================================================================

-- These tables should already exist from v1, but create if missing

CREATE TABLE IF NOT EXISTS agent_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'research', 'communication', 'financial', 'content_creation',
    'outreach', 'analysis', 'automation', 'filing', 'payment'
  )),
  metadata JSONB,
  result TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_activities_agent_id ON agent_activities(agent_id);
CREATE INDEX IF NOT EXISTS idx_activities_company_id ON agent_activities(company_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON agent_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_status ON agent_activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_type ON agent_activities(activity_type);

ALTER TABLE agent_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view activities for their companies" ON agent_activities;

CREATE POLICY "Users can view activities for their companies"
  ON agent_activities FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
      UNION
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS financial_infrastructure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('virtual_card', 'bank_account', 'payment_method')),
  card_id TEXT,
  card_last4 TEXT,
  card_brand TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  card_status TEXT CHECK (card_status IN ('active', 'inactive', 'canceled')),
  bank_name TEXT,
  account_last4 TEXT,
  routing_number TEXT,
  account_type TEXT CHECK (account_type IN ('checking', 'savings')),
  account_status TEXT CHECK (account_status IN ('active', 'inactive', 'pending_verification')),
  current_balance DECIMAL(12,2) DEFAULT 0,
  available_balance DECIMAL(12,2) DEFAULT 0,
  daily_limit DECIMAL(10,2),
  monthly_limit DECIMAL(10,2),
  provider TEXT,
  provider_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_financial_infra_agent_id ON financial_infrastructure(agent_id);
CREATE INDEX IF NOT EXISTS idx_financial_infra_company_id ON financial_infrastructure(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_infra_type ON financial_infrastructure(type);

ALTER TABLE financial_infrastructure ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view financial infrastructure for their companies" ON financial_infrastructure;

CREATE POLICY "Users can view financial infrastructure for their companies"
  ON financial_infrastructure FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
      UNION
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  infrastructure_id UUID REFERENCES financial_infrastructure(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('charge', 'payment', 'refund', 'transfer', 'fee')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'canceled')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT NOT NULL,
  merchant_name TEXT,
  merchant_category TEXT,
  stripe_charge_id TEXT,
  invoice_id TEXT,
  metadata JSONB,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_agent_id ON transactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view transactions for their companies" ON transactions;

CREATE POLICY "Users can view transactions for their companies"
  ON transactions FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
      UNION
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  company_name TEXT,
  title TEXT,
  industry TEXT,
  company_size TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'demo_scheduled', 'proposal_sent', 'negotiation', 'won', 'lost')),
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  source TEXT,
  discovery_method TEXT,
  fit_reasoning TEXT,
  last_contact_date TIMESTAMPTZ,
  next_followup_date TIMESTAMPTZ,
  total_emails_sent INTEGER DEFAULT 0,
  total_emails_received INTEGER DEFAULT 0,
  estimated_value DECIMAL(10,2),
  actual_value DECIMAL(10,2),
  metadata JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prospects_company_id ON prospects(company_id);
CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects(status);
CREATE INDEX IF NOT EXISTS idx_prospects_score ON prospects(score DESC);
CREATE INDEX IF NOT EXISTS idx_prospects_email ON prospects(email);
CREATE INDEX IF NOT EXISTS idx_prospects_next_followup ON prospects(next_followup_date);

ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view prospects for their companies" ON prospects;

CREATE POLICY "Users can view prospects for their companies"
  ON prospects FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
      UNION
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'call')),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  cc_addresses TEXT[],
  bcc_addresses TEXT[],
  subject TEXT,
  body TEXT,
  html_body TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'queued', 'sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'failed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  message_id TEXT,
  thread_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_communications_company_id ON communications(company_id);
CREATE INDEX IF NOT EXISTS idx_communications_agent_id ON communications(agent_id);
CREATE INDEX IF NOT EXISTS idx_communications_prospect_id ON communications(prospect_id);
CREATE INDEX IF NOT EXISTS idx_communications_direction ON communications(direction);
CREATE INDEX IF NOT EXISTS idx_communications_status ON communications(status);
CREATE INDEX IF NOT EXISTS idx_communications_sent_at ON communications(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_communications_thread_id ON communications(thread_id);

ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view communications for their companies" ON communications;

CREATE POLICY "Users can view communications for their companies"
  ON communications FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
      UNION
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN (
    'website', 'logo', 'brand_guide', 'legal_document',
    'contract', 'invoice', 'marketing_material', 'content'
  )),
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size INTEGER,
  domain TEXT,
  is_live BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'published', 'archived')),
  metadata JSONB,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_assets_company_id ON assets(company_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view assets for their companies" ON assets;

CREATE POLICY "Users can view assets for their companies"
  ON assets FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
      UNION
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  value DECIMAL(12,2) NOT NULL,
  unit TEXT,
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'all_time')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metrics_company_id ON metrics(company_id);
CREATE INDEX IF NOT EXISTS idx_metrics_type ON metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_metrics_period ON metrics(period);
CREATE INDEX IF NOT EXISTS idx_metrics_period_start ON metrics(period_start DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_metrics_unique_period ON metrics(company_id, metric_type, metric_name, period_start, period_end);

ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view metrics for their companies" ON metrics;

CREATE POLICY "Users can view metrics for their companies"
  ON metrics FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
      UNION
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 14: Create functions and triggers
-- ============================================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
DROP TRIGGER IF EXISTS update_company_members_updated_at ON company_members;
DROP TRIGGER IF EXISTS update_custom_domains_updated_at ON custom_domains;
DROP TRIGGER IF EXISTS update_agent_emails_updated_at ON agent_emails;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;
DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
DROP TRIGGER IF EXISTS update_financial_infrastructure_updated_at ON financial_infrastructure;
DROP TRIGGER IF EXISTS update_prospects_updated_at ON prospects;
DROP TRIGGER IF EXISTS update_assets_updated_at ON assets;

-- Create triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_members_updated_at
  BEFORE UPDATE ON company_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_domains_updated_at
  BEFORE UPDATE ON custom_domains
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_emails_updated_at
  BEFORE UPDATE ON agent_emails
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_infrastructure_updated_at
  BEFORE UPDATE ON financial_infrastructure
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prospects_updated_at
  BEFORE UPDATE ON prospects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Company creation limit check
CREATE OR REPLACE FUNCTION check_company_creation_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_limit INTEGER;
  user_count INTEGER;
BEGIN
  SELECT monthly_company_limit INTO user_limit
  FROM profiles
  WHERE id = NEW.owner_id;

  SELECT COUNT(*) INTO user_count
  FROM companies
  WHERE owner_id = NEW.owner_id
  AND status NOT IN ('archived', 'deleted');

  IF user_count >= user_limit THEN
    RAISE EXCEPTION 'Company creation limit reached. Upgrade your plan to create more companies.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_company_limit_before_insert ON companies;

CREATE TRIGGER check_company_limit_before_insert
  BEFORE INSERT ON companies
  FOR EACH ROW EXECUTE FUNCTION check_company_creation_limit();

-- Credits balance update
CREATE OR REPLACE FUNCTION update_credits_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET credits_balance = credits_balance + NEW.amount
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_credits_after_transaction ON credits_transactions;

CREATE TRIGGER update_user_credits_after_transaction
  AFTER INSERT ON credits_transactions
  FOR EACH ROW EXECUTE FUNCTION update_credits_balance();
