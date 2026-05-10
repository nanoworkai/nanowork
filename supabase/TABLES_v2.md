# Nanowork Database Tables v2 - Complete Schema

Copy the SQL below and paste it into your Supabase SQL Editor to create all tables.

---

## SQL to Run in Supabase

```sql
-- ============================================================================
-- PROFILES TABLE (Updated)
-- User accounts with enhanced billing and account management
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  
  -- Account status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  email_verified BOOLEAN DEFAULT FALSE,
  
  -- Subscription & billing
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'growth', 'scale', 'enterprise')),
  stripe_customer_id TEXT UNIQUE,
  subscription_status TEXT CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'paused')),
  subscription_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  
  -- Usage & credits
  credits_balance INTEGER DEFAULT 0,
  monthly_company_limit INTEGER DEFAULT 1, -- Based on plan
  total_companies_created INTEGER DEFAULT 0,
  
  -- Preferences
  timezone TEXT DEFAULT 'UTC',
  notification_preferences JSONB DEFAULT '{"email": true, "activity": true, "billing": true}'::jsonb,
  
  -- Metadata
  last_login_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_plan ON profiles(plan);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

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
-- COMPANIES TABLE (Updated)
-- Multiple AI companies per user with team collaboration
-- ============================================================================

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Company basics
  name TEXT NOT NULL,
  description TEXT NOT NULL, -- Original prompt
  slug TEXT UNIQUE, -- URL-safe identifier
  industry TEXT,
  logo_url TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'initializing' CHECK (status IN ('initializing', 'active', 'paused', 'archived', 'deleted')),
  
  -- Legal entity
  entity_type TEXT, -- LLC, C-Corp, etc
  entity_state TEXT,
  ein TEXT,
  legal_entity_id TEXT,
  
  -- Branding
  brand_colors JSONB, -- {"primary": "#...", "secondary": "#..."}
  brand_guidelines_url TEXT,
  
  -- Domain & web presence
  subdomain TEXT UNIQUE, -- company.nanowork.app
  custom_domain_id UUID, -- References custom_domains table
  website_url TEXT,
  website_status TEXT CHECK (website_status IN ('building', 'live', 'maintenance', 'offline')),
  
  -- Financial tracking
  total_revenue DECIMAL(12,2) DEFAULT 0,
  mrr DECIMAL(12,2) DEFAULT 0,
  total_spend DECIMAL(12,2) DEFAULT 0, -- How much agents have spent
  
  -- Settings
  settings JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  launched_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_companies_owner_id ON companies(owner_id);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_subdomain ON companies(subdomain);
CREATE INDEX idx_companies_created_at ON companies(created_at DESC);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own companies"
  ON companies FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Team members can view their companies"
  ON companies FOR SELECT
  USING (
    id IN (
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

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
-- COMPANY_MEMBERS TABLE (New)
-- Team collaboration - invite members to observe/manage companies
-- ============================================================================

CREATE TABLE IF NOT EXISTS company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Role & permissions
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  permissions JSONB DEFAULT '{"view": true, "edit": false, "invite": false, "billing": false}'::jsonb,
  
  -- Invitation
  invited_by UUID REFERENCES profiles(id),
  invitation_email TEXT,
  invitation_token TEXT UNIQUE,
  invitation_status TEXT NOT NULL DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'accepted', 'declined', 'expired')),
  invitation_sent_at TIMESTAMPTZ,
  invitation_accepted_at TIMESTAMPTZ,
  invitation_expires_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(company_id, user_id)
);

CREATE INDEX idx_company_members_company_id ON company_members(company_id);
CREATE INDEX idx_company_members_user_id ON company_members(user_id);
CREATE INDEX idx_company_members_role ON company_members(role);
CREATE INDEX idx_company_members_invitation_token ON company_members(invitation_token);

ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

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

-- ============================================================================
-- CUSTOM_DOMAINS TABLE (New)
-- Custom domain management per company
-- ============================================================================

CREATE TABLE IF NOT EXISTS custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Domain details
  domain TEXT NOT NULL UNIQUE,
  subdomain TEXT, -- Optional subdomain (www, app, etc)
  
  -- DNS & verification
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
  verification_token TEXT,
  verification_method TEXT CHECK (verification_method IN ('dns_txt', 'dns_cname', 'html_meta')),
  
  -- SSL
  ssl_status TEXT NOT NULL DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'active', 'failed', 'expired')),
  ssl_provider TEXT, -- 'cloudflare', 'letsencrypt'
  ssl_expires_at TIMESTAMPTZ,
  
  -- DNS records
  dns_records JSONB, -- Array of required DNS records
  
  -- Status
  is_primary BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'failed', 'removed')),
  
  -- Metadata
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_custom_domains_company_id ON custom_domains(company_id);
CREATE INDEX idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX idx_custom_domains_status ON custom_domains(status);

ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;

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
-- AGENT_EMAILS TABLE (New)
-- Dedicated email infrastructure per agent
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Email details
  email_address TEXT NOT NULL UNIQUE, -- finance@company.nanowork.ai
  display_name TEXT, -- "Finance Agent - Acme Corp"
  
  -- Provider details
  provider TEXT NOT NULL DEFAULT 'resend' CHECK (provider IN ('resend', 'sendgrid', 'ses', 'postmark')),
  provider_id TEXT,
  api_key_id TEXT, -- Reference to encrypted API key
  
  -- Status & stats
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'bounced')),
  emails_sent_total INTEGER DEFAULT 0,
  emails_received_total INTEGER DEFAULT 0,
  bounce_count INTEGER DEFAULT 0,
  complaint_count INTEGER DEFAULT 0,
  
  -- Configuration
  forwarding_enabled BOOLEAN DEFAULT TRUE,
  forwarding_address TEXT,
  auto_reply_enabled BOOLEAN DEFAULT FALSE,
  auto_reply_template TEXT,
  signature TEXT,
  
  -- Metadata
  last_sent_at TIMESTAMPTZ,
  last_received_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_emails_agent_id ON agent_emails(agent_id);
CREATE INDEX idx_agent_emails_company_id ON agent_emails(company_id);
CREATE INDEX idx_agent_emails_email ON agent_emails(email_address);
CREATE INDEX idx_agent_emails_status ON agent_emails(status);

ALTER TABLE agent_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view emails for their company agents"
  ON agent_emails FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- CREDITS_TRANSACTIONS TABLE (New)
-- Track credit purchases, usage, and refunds
-- ============================================================================

CREATE TABLE IF NOT EXISTS credits_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Transaction details
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus', 'expiration')),
  amount INTEGER NOT NULL, -- Positive for additions, negative for usage
  balance_after INTEGER NOT NULL,
  
  -- Context
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  
  -- Payment details (for purchases)
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  price_paid DECIMAL(10,2), -- USD amount paid
  
  -- Usage details (for usage type)
  usage_type TEXT CHECK (usage_type IN ('company_creation', 'agent_action', 'email_sent', 'api_call')),
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credits_user_id ON credits_transactions(user_id);
CREATE INDEX idx_credits_company_id ON credits_transactions(company_id);
CREATE INDEX idx_credits_type ON credits_transactions(type);
CREATE INDEX idx_credits_created_at ON credits_transactions(created_at DESC);

ALTER TABLE credits_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit transactions"
  ON credits_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- SUBSCRIPTIONS TABLE (New)
-- Detailed subscription tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Stripe details
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  
  -- Subscription details
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'growth', 'scale', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('incomplete', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused')),
  
  -- Billing
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  amount DECIMAL(10,2) NOT NULL, -- Amount in USD
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Dates
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  
  -- Features
  features JSONB DEFAULT '{}'::jsonb,
  limits JSONB DEFAULT '{}'::jsonb, -- {"companies": 10, "agents": 70, "credits_per_month": 10000}
  
  -- Metadata
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_current_period_end ON subscriptions(current_period_end);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- INVOICES TABLE (New)
-- Billing invoices from Stripe
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  
  -- Stripe details
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  
  -- Invoice details
  invoice_number TEXT,
  amount_due DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  
  -- Payment
  payment_intent_id TEXT,
  charge_id TEXT,
  paid_at TIMESTAMPTZ,
  
  -- Dates
  invoice_date TIMESTAMPTZ NOT NULL,
  due_date TIMESTAMPTZ,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  
  -- URLs
  invoice_pdf_url TEXT,
  hosted_invoice_url TEXT,
  
  -- Line items
  line_items JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date DESC);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- PAYMENT_METHODS TABLE (New)
-- Stored payment methods for billing
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Stripe details
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  
  -- Payment method details
  type TEXT NOT NULL CHECK (type IN ('card', 'bank_account', 'sepa_debit', 'us_bank_account')),
  
  -- Card details
  card_brand TEXT, -- visa, mastercard, amex
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  card_fingerprint TEXT,
  
  -- Bank account details
  bank_name TEXT,
  bank_last4 TEXT,
  
  -- Status
  is_default BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'removed')),
  
  -- Metadata
  billing_details JSONB, -- Name, address, etc
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_stripe_pm_id ON payment_methods(stripe_payment_method_id);
CREATE INDEX idx_payment_methods_is_default ON payment_methods(is_default);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment methods"
  ON payment_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own payment methods"
  ON payment_methods FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- ACCOUNT_DELETIONS TABLE (New)
-- Track account deletion requests and data retention
-- ============================================================================

CREATE TABLE IF NOT EXISTS account_deletions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Deletion details
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'canceled')),
  deletion_type TEXT NOT NULL CHECK (deletion_type IN ('soft', 'hard')), -- soft = data retained, hard = complete removal
  
  -- Reason & feedback
  reason TEXT,
  feedback TEXT,
  
  -- Scheduled deletion
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_for TIMESTAMPTZ NOT NULL, -- Grace period (30 days)
  completed_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  
  -- Data snapshot
  data_export_url TEXT, -- URL to download user data
  data_retention_until TIMESTAMPTZ, -- Legal retention period
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_account_deletions_user_id ON account_deletions(user_id);
CREATE INDEX idx_account_deletions_status ON account_deletions(status);
CREATE INDEX idx_account_deletions_scheduled_for ON account_deletions(scheduled_for);

ALTER TABLE account_deletions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deletion requests"
  ON account_deletions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- EXISTING TABLES (agents, agent_activities, financial_infrastructure, etc.)
-- These remain the same as before
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

CREATE INDEX idx_agents_company_id ON agents(company_id);
CREATE INDEX idx_agents_department ON agents(department);
CREATE INDEX idx_agents_status ON agents(status);
CREATE UNIQUE INDEX idx_agents_company_department ON agents(company_id, department);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view agents for their companies"
  ON agents FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
      UNION
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

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

CREATE INDEX idx_activities_agent_id ON agent_activities(agent_id);
CREATE INDEX idx_activities_company_id ON agent_activities(company_id);
CREATE INDEX idx_activities_created_at ON agent_activities(created_at DESC);
CREATE INDEX idx_activities_status ON agent_activities(status);
CREATE INDEX idx_activities_type ON agent_activities(activity_type);

ALTER TABLE agent_activities ENABLE ROW LEVEL SECURITY;

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

CREATE INDEX idx_financial_infra_agent_id ON financial_infrastructure(agent_id);
CREATE INDEX idx_financial_infra_company_id ON financial_infrastructure(company_id);
CREATE INDEX idx_financial_infra_type ON financial_infrastructure(type);

ALTER TABLE financial_infrastructure ENABLE ROW LEVEL SECURITY;

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

CREATE INDEX idx_transactions_agent_id ON transactions(agent_id);
CREATE INDEX idx_transactions_company_id ON transactions(company_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(type);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

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

CREATE INDEX idx_prospects_company_id ON prospects(company_id);
CREATE INDEX idx_prospects_status ON prospects(status);
CREATE INDEX idx_prospects_score ON prospects(score DESC);
CREATE INDEX idx_prospects_email ON prospects(email);
CREATE INDEX idx_prospects_next_followup ON prospects(next_followup_date);

ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;

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

CREATE INDEX idx_communications_company_id ON communications(company_id);
CREATE INDEX idx_communications_agent_id ON communications(agent_id);
CREATE INDEX idx_communications_prospect_id ON communications(prospect_id);
CREATE INDEX idx_communications_direction ON communications(direction);
CREATE INDEX idx_communications_status ON communications(status);
CREATE INDEX idx_communications_sent_at ON communications(sent_at DESC);
CREATE INDEX idx_communications_thread_id ON communications(thread_id);

ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

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

CREATE INDEX idx_assets_company_id ON assets(company_id);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_status ON assets(status);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

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

CREATE INDEX idx_metrics_company_id ON metrics(company_id);
CREATE INDEX idx_metrics_type ON metrics(metric_type);
CREATE INDEX idx_metrics_period ON metrics(period);
CREATE INDEX idx_metrics_period_start ON metrics(period_start DESC);
CREATE UNIQUE INDEX idx_metrics_unique_period ON metrics(company_id, metric_type, metric_name, period_start, period_end);

ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

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
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user has reached company creation limit
CREATE OR REPLACE FUNCTION check_company_creation_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_limit INTEGER;
  user_count INTEGER;
BEGIN
  -- Get user's company limit
  SELECT monthly_company_limit INTO user_limit
  FROM profiles
  WHERE id = NEW.owner_id;
  
  -- Count user's active companies
  SELECT COUNT(*) INTO user_count
  FROM companies
  WHERE owner_id = NEW.owner_id
  AND status NOT IN ('archived', 'deleted');
  
  -- Check if limit exceeded
  IF user_count >= user_limit THEN
    RAISE EXCEPTION 'Company creation limit reached. Upgrade your plan to create more companies.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_company_limit_before_insert
  BEFORE INSERT ON companies
  FOR EACH ROW EXECUTE FUNCTION check_company_creation_limit();

-- Function to update credits balance after transaction
CREATE OR REPLACE FUNCTION update_credits_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET credits_balance = credits_balance + NEW.amount
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_credits_after_transaction
  AFTER INSERT ON credits_transactions
  FOR EACH ROW EXECUTE FUNCTION update_credits_balance();
```

---

## Quick Reference

**New Tables Added (v2):**
1. `company_members` - Team collaboration & invitations
2. `custom_domains` - Custom domain management with DNS verification
3. `agent_emails` - Dedicated email infrastructure per agent
4. `credits_transactions` - Credits purchasing, usage tracking, refunds
5. `subscriptions` - Stripe subscription management
6. `invoices` - Billing invoices with line items
7. `payment_methods` - Stored payment methods
8. `account_deletions` - GDPR-compliant account deletion workflow

**Enhanced Tables:**
- `profiles` - Added billing, credits, usage limits, account status
- `companies` - Added slug, custom_domain_id, team support, total_spend

**Updated Tables (from v1):**
- All existing tables (agents, agent_activities, financial_infrastructure, transactions, prospects, communications, assets, metrics)
- Updated RLS policies to support team members

**Total Tables:** 18

**New Features:**
- ✅ Multiple companies per user
- ✅ Team collaboration with roles (owner, admin, member, viewer)
- ✅ Custom domain management with DNS verification
- ✅ Dedicated agent email infrastructure
- ✅ Credits system with purchases and usage tracking
- ✅ Full Stripe subscription & billing integration
- ✅ Payment methods management
- ✅ GDPR-compliant account deletion with grace period
- ✅ Company creation limits based on plan
- ✅ Automatic credits balance updates

## How to Use

1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the sidebar
3. Click "New query"
4. Copy the SQL above and paste it
5. Click "Run" or press Cmd/Ctrl + Enter
6. Verify tables were created by checking the "Table Editor"
