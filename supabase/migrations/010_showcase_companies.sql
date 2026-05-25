-- Migration: Showcase Companies
-- Description: Tables for pre-built AI companies that users can claim/purchase
-- Created: 2026-05-24

-- ============================================================================
-- TABLE: showcase_companies
-- ============================================================================

CREATE TABLE IF NOT EXISTS showcase_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Company details
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  tagline VARCHAR(255),
  industry VARCHAR(100),
  logo_url TEXT,

  -- Pricing tier
  tier VARCHAR(50) NOT NULL CHECK (tier IN ('basic', 'growth', 'premium')),
  price_cents INTEGER NOT NULL,
  estimated_arr_min INTEGER,
  estimated_arr_max INTEGER,

  -- Generated company data
  company_data JSONB NOT NULL DEFAULT '{}',
  preview_images TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'reserved', 'hidden')),
  claimed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  claimed_at TIMESTAMP WITH TIME ZONE,

  -- Engagement metrics
  view_count INTEGER DEFAULT 0,
  claim_count INTEGER DEFAULT 0,

  -- Stripe integration
  stripe_product_id VARCHAR(255),
  stripe_price_id VARCHAR(255),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_showcase_companies_status ON showcase_companies(status);
CREATE INDEX IF NOT EXISTS idx_showcase_companies_tier ON showcase_companies(tier);
CREATE INDEX IF NOT EXISTS idx_showcase_companies_industry ON showcase_companies(industry);
CREATE INDEX IF NOT EXISTS idx_showcase_companies_claimed_by ON showcase_companies(claimed_by);

-- ============================================================================
-- TABLE: showcase_claims
-- ============================================================================

CREATE TABLE IF NOT EXISTS showcase_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  showcase_company_id UUID NOT NULL REFERENCES showcase_companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,

  -- Payment
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  amount_paid_cents INTEGER NOT NULL,

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),

  -- Timestamps
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_showcase_claims_user_id ON showcase_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_showcase_claims_showcase_company_id ON showcase_claims(showcase_company_id);
CREATE INDEX IF NOT EXISTS idx_showcase_claims_status ON showcase_claims(status);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to increment view count atomically
CREATE OR REPLACE FUNCTION increment_showcase_views(company_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE showcase_companies
  SET view_count = view_count + 1,
      updated_at = NOW()
  WHERE id = company_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE showcase_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_claims ENABLE ROW LEVEL SECURITY;

-- Public read access to available/claimed showcase companies
CREATE POLICY "Public can view available showcase companies"
  ON showcase_companies FOR SELECT
  USING (status IN ('available', 'claimed'));

-- Users can view their own claims
CREATE POLICY "Users can view own claims"
  ON showcase_claims FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything (for webhooks and admin operations)
CREATE POLICY "Service role has full access to showcase_companies"
  ON showcase_companies FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role has full access to showcase_claims"
  ON showcase_claims FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert a few sample showcase companies
INSERT INTO showcase_companies (
  name,
  description,
  tagline,
  industry,
  tier,
  price_cents,
  estimated_arr_min,
  estimated_arr_max,
  features,
  company_data,
  status
) VALUES
(
  'EcoBox',
  'Sustainable subscription box service delivering curated eco-friendly products monthly. Complete with supplier partnerships, fulfillment automation, and customer retention workflows.',
  'Monthly eco-friendly products for sustainable living',
  'E-commerce',
  'growth',
  79900,
  50000,
  200000,
  ARRAY[
    'Complete branding & logo design',
    'E-commerce website with checkout',
    'Email marketing automation',
    'Customer retention workflows',
    'Supplier management system',
    'Social media content calendar'
  ],
  '{"agents_configured": true, "website_ready": true, "marketing_setup": true}'::jsonb,
  'available'
),
(
  'LocalLaunch',
  'Hyperlocal delivery platform connecting local businesses with customers. Includes driver app, merchant dashboard, and automated dispatch system.',
  'Same-day delivery for local businesses',
  'Logistics',
  'premium',
  249900,
  100000,
  500000,
  ARRAY[
    'Complete branding & logo design',
    'Customer mobile app (PWA)',
    'Merchant dashboard',
    'Driver coordination system',
    'Automated dispatch logic',
    'Payment processing setup',
    'Marketing automation'
  ],
  '{"agents_configured": true, "website_ready": true, "mobile_app_ready": true}'::jsonb,
  'available'
),
(
  'SkillSwap',
  'Community platform for skill exchange and peer learning. Members trade knowledge instead of money, with built-in scheduling and video conferencing.',
  'Trade skills, learn from peers',
  'Education',
  'basic',
  14900,
  10000,
  50000,
  ARRAY[
    'Complete branding & logo design',
    'Community platform website',
    'User matching algorithm',
    'Scheduling system',
    'Email notifications',
    'Basic analytics'
  ],
  '{"agents_configured": true, "website_ready": true}'::jsonb,
  'available'
);

COMMENT ON TABLE showcase_companies IS 'Pre-built AI companies available for purchase/claim';
COMMENT ON TABLE showcase_claims IS 'Records of users claiming showcase companies';
