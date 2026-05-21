-- Nanowork Database Schema (LEGACY - DEPRECATED)
-- AI-run company builder with 7 autonomous agent departments
-- NOTE: This schema has been superseded by the user-based agents system
-- The 'agents' table below conflicts with the new schema in 20260520000001
-- A cleanup migration (20260521000001) handles this conflict

-- ============================================================================
-- PROFILES TABLE
-- User accounts with subscription plans
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  business_name TEXT,
  business_prompt TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'growth', 'scale')),
  custom_domain TEXT,
  subdomain TEXT UNIQUE,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_subdomain ON profiles(subdomain);

-- RLS Policies for profiles
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
-- COMPANIES TABLE
-- AI companies created from user prompts
-- ============================================================================

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL, -- Original user prompt
  industry TEXT,
  status TEXT NOT NULL DEFAULT 'initializing' CHECK (status IN ('initializing', 'active', 'paused', 'archived')),

  -- Company details built by agents
  entity_type TEXT, -- LLC, C-Corp, etc
  entity_state TEXT,
  ein TEXT,
  legal_entity_id TEXT,

  -- Branding
  logo_url TEXT,
  brand_colors JSONB, -- {"primary": "#...", "secondary": "#..."}
  brand_guidelines_url TEXT,

  -- Web presence
  website_url TEXT,
  website_status TEXT,

  -- Financial tracking
  total_revenue DECIMAL(12,2) DEFAULT 0,
  mrr DECIMAL(12,2) DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  launched_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_created_at ON companies(created_at DESC);

-- RLS Policies for companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own companies"
  ON companies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create companies"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own companies"
  ON companies FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- AGENTS TABLE
-- The 7 department agents with real infrastructure
-- ============================================================================

CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Agent identity
  department TEXT NOT NULL CHECK (department IN ('legal', 'brand', 'web', 'marketing', 'sales', 'finance', 'operations')),
  name TEXT NOT NULL, -- e.g., "Finance Agent", "Legal Agent"
  status TEXT NOT NULL DEFAULT 'initializing' CHECK (status IN ('initializing', 'active', 'paused', 'error')),

  -- Real infrastructure
  email_address TEXT UNIQUE, -- finance@company.nanowork.ai
  virtual_card_id TEXT, -- Stripe Issuing card ID
  bank_account_id TEXT, -- Connected bank account

  -- Financial limits
  daily_spend_limit DECIMAL(10,2) DEFAULT 1000.00,
  monthly_budget DECIMAL(10,2) DEFAULT 10000.00,
  current_month_spend DECIMAL(10,2) DEFAULT 0,

  -- Performance metrics
  tasks_completed INTEGER DEFAULT 0,
  total_spend DECIMAL(12,2) DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ
);

CREATE INDEX idx_agents_company_id ON agents(company_id);
CREATE INDEX idx_agents_department ON agents(department);
CREATE INDEX idx_agents_status ON agents(status);
CREATE UNIQUE INDEX idx_agents_company_department ON agents(company_id, department);

-- RLS Policies for agents
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company agents"
  ON agents FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- AGENT_ACTIVITIES TABLE
-- Real-time activity feed of what agents are doing
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Activity details
  department TEXT NOT NULL,
  action TEXT NOT NULL, -- "Sent email to prospect", "Created invoice"
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'research', 'communication', 'financial', 'content_creation',
    'outreach', 'analysis', 'automation', 'filing', 'payment'
  )),

  -- Context
  metadata JSONB, -- Flexible data about the activity
  result TEXT, -- Outcome description
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ
);

CREATE INDEX idx_activities_agent_id ON agent_activities(agent_id);
CREATE INDEX idx_activities_company_id ON agent_activities(company_id);
CREATE INDEX idx_activities_created_at ON agent_activities(created_at DESC);
CREATE INDEX idx_activities_status ON agent_activities(status);
CREATE INDEX idx_activities_type ON agent_activities(activity_type);

-- RLS Policies for agent_activities
ALTER TABLE agent_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company activities"
  ON agent_activities FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- FINANCIAL_INFRASTRUCTURE TABLE
-- Virtual cards, bank accounts, payment details per agent
-- ============================================================================

CREATE TABLE IF NOT EXISTS financial_infrastructure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Infrastructure type
  type TEXT NOT NULL CHECK (type IN ('virtual_card', 'bank_account', 'payment_method')),

  -- Virtual card details
  card_id TEXT, -- Stripe Issuing card ID
  card_last4 TEXT,
  card_brand TEXT, -- Visa, Mastercard
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  card_status TEXT CHECK (card_status IN ('active', 'inactive', 'canceled')),

  -- Bank account details
  bank_name TEXT,
  account_last4 TEXT,
  routing_number TEXT,
  account_type TEXT CHECK (account_type IN ('checking', 'savings')),
  account_status TEXT CHECK (account_status IN ('active', 'inactive', 'pending_verification')),

  -- Balance tracking
  current_balance DECIMAL(12,2) DEFAULT 0,
  available_balance DECIMAL(12,2) DEFAULT 0,

  -- Spending limits
  daily_limit DECIMAL(10,2),
  monthly_limit DECIMAL(10,2),

  -- Metadata
  provider TEXT, -- 'stripe', 'plaid', etc
  provider_id TEXT, -- External provider ID
  metadata JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_financial_infra_agent_id ON financial_infrastructure(agent_id);
CREATE INDEX idx_financial_infra_company_id ON financial_infrastructure(company_id);
CREATE INDEX idx_financial_infra_type ON financial_infrastructure(type);

-- RLS Policies
ALTER TABLE financial_infrastructure ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company financial infrastructure"
  ON financial_infrastructure FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- TRANSACTIONS TABLE
-- All financial transactions by agents
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  infrastructure_id UUID REFERENCES financial_infrastructure(id) ON DELETE SET NULL,

  -- Transaction details
  type TEXT NOT NULL CHECK (type IN ('charge', 'payment', 'refund', 'transfer', 'fee')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'canceled')),

  -- Financial details
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT NOT NULL,
  merchant_name TEXT,
  merchant_category TEXT,

  -- External references
  stripe_charge_id TEXT,
  invoice_id TEXT,

  -- Metadata
  metadata JSONB,

  -- Timestamps
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_agent_id ON transactions(agent_id);
CREATE INDEX idx_transactions_company_id ON transactions(company_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(type);

-- RLS Policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company transactions"
  ON transactions FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- PROSPECTS TABLE
-- Sales leads discovered and managed by agents
-- ============================================================================

CREATE TABLE IF NOT EXISTS prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,

  -- Prospect details
  name TEXT,
  email TEXT,
  phone TEXT,
  company_name TEXT,
  title TEXT,
  industry TEXT,
  company_size TEXT,

  -- Lead scoring
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'demo_scheduled', 'proposal_sent', 'negotiation', 'won', 'lost')),
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),

  -- Source & context
  source TEXT, -- "linkedin", "web_scrape", "referral"
  discovery_method TEXT,
  fit_reasoning TEXT, -- Why this is a good lead

  -- Engagement
  last_contact_date TIMESTAMPTZ,
  next_followup_date TIMESTAMPTZ,
  total_emails_sent INTEGER DEFAULT 0,
  total_emails_received INTEGER DEFAULT 0,

  -- Financials
  estimated_value DECIMAL(10,2),
  actual_value DECIMAL(10,2),

  -- Metadata
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

-- RLS Policies
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company prospects"
  ON prospects FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- COMMUNICATIONS TABLE
-- Emails sent/received by agents
-- ============================================================================

CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL,

  -- Email details
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'call')),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),

  -- Sender/Recipient
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  cc_addresses TEXT[],
  bcc_addresses TEXT[],

  -- Content
  subject TEXT,
  body TEXT,
  html_body TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'queued', 'sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'failed')),

  -- Tracking
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,

  -- External IDs
  message_id TEXT,
  thread_id TEXT,

  -- Metadata
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

-- RLS Policies
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company communications"
  ON communications FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- ASSETS TABLE
-- Websites, brand materials, legal docs created by agents
-- ============================================================================

CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,

  -- Asset details
  type TEXT NOT NULL CHECK (type IN (
    'website', 'logo', 'brand_guide', 'legal_document',
    'contract', 'invoice', 'marketing_material', 'content'
  )),
  name TEXT NOT NULL,
  description TEXT,

  -- File details
  file_url TEXT,
  file_type TEXT, -- "pdf", "png", "html"
  file_size INTEGER, -- bytes

  -- Website-specific
  domain TEXT,
  is_live BOOLEAN DEFAULT FALSE,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'published', 'archived')),

  -- Metadata
  metadata JSONB,
  version INTEGER DEFAULT 1,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX idx_assets_company_id ON assets(company_id);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_status ON assets(status);

-- RLS Policies
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company assets"
  ON assets FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- METRICS TABLE
-- Performance tracking and analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,

  -- Metric details
  metric_type TEXT NOT NULL, -- "revenue", "leads", "emails_sent", "website_visitors"
  metric_name TEXT NOT NULL,
  value DECIMAL(12,2) NOT NULL,
  unit TEXT, -- "USD", "count", "percentage"

  -- Time period
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'all_time')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Metadata
  metadata JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_metrics_company_id ON metrics(company_id);
CREATE INDEX idx_metrics_type ON metrics(metric_type);
CREATE INDEX idx_metrics_period ON metrics(period);
CREATE INDEX idx_metrics_period_start ON metrics(period_start DESC);
CREATE UNIQUE INDEX idx_metrics_unique_period ON metrics(company_id, metric_type, metric_name, period_start, period_end);

-- RLS Policies
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company metrics"
  ON metrics FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
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
-- SEED DATA (Optional - for development)
-- ============================================================================

-- This section can be used to insert sample data for testing
-- Uncomment when needed for local development

/*
-- Example: Create a test company with agents
INSERT INTO companies (user_id, name, description, status)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
  'Acme Corp',
  'B2B SaaS for construction teams',
  'active'
) RETURNING id;
*/
