-- ===========================================================================
-- Migration 008: Custom Domains Table
-- ===========================================================================
-- Purpose: Custom domain management with DNS verification
-- Dependencies: companies table
-- Author: Claude
-- Date: 2026-05-09
-- ===========================================================================

/**
 * Custom domains table - allows companies to use their own domains
 * Includes DNS verification and SSL management
 */
CREATE TABLE IF NOT EXISTS custom_domains (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Domain details
  domain TEXT NOT NULL UNIQUE,
  subdomain TEXT,  -- Optional subdomain (www, app, etc.)

  -- DNS verification
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
  verification_token TEXT,  -- Token to add in DNS TXT record
  verification_method TEXT CHECK (verification_method IN ('dns_txt', 'dns_cname', 'html_meta')),

  -- SSL/TLS management
  ssl_status TEXT NOT NULL DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'active', 'failed', 'expired')),
  ssl_provider TEXT,  -- 'cloudflare', 'letsencrypt', etc.
  ssl_expires_at TIMESTAMPTZ,

  -- DNS records (instructions for user)
  dns_records JSONB,  -- [{type: 'A', name: '@', value: '1.2.3.4'}, ...]

  -- Status & settings
  is_primary BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'failed', 'removed')),

  -- Timestamps
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

/**
 * Indexes for performance
 */
CREATE INDEX IF NOT EXISTS idx_custom_domains_company_id ON custom_domains(company_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX IF NOT EXISTS idx_custom_domains_verification_status ON custom_domains(verification_status);
CREATE INDEX IF NOT EXISTS idx_custom_domains_ssl_status ON custom_domains(ssl_status);
CREATE INDEX IF NOT EXISTS idx_custom_domains_status ON custom_domains(status);

/**
 * Enable Row Level Security
 */
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view domains for their companies" ON custom_domains;
DROP POLICY IF EXISTS "Owners can manage domains" ON custom_domains;

/**
 * RLS Policy: Users can view domains for their companies
 */
CREATE POLICY "Users can view domains for their companies"
  ON custom_domains FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
      UNION
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

/**
 * RLS Policy: Company owners can manage domains
 */
CREATE POLICY "Owners can manage domains"
  ON custom_domains FOR ALL
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

/**
 * Trigger function: Auto-update updated_at timestamp
 */
CREATE OR REPLACE FUNCTION update_custom_domains_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_custom_domains_updated_at ON custom_domains;

-- Create trigger for updated_at
CREATE TRIGGER set_custom_domains_updated_at
  BEFORE UPDATE ON custom_domains
  FOR EACH ROW EXECUTE FUNCTION update_custom_domains_updated_at();

/**
 * Trigger function: Ensure only one primary domain per company
 */
CREATE OR REPLACE FUNCTION enforce_single_primary_domain()
RETURNS TRIGGER AS $$
BEGIN
  -- If this domain is being set as primary
  IF NEW.is_primary = TRUE THEN
    -- Unset all other domains for this company
    UPDATE custom_domains
    SET is_primary = FALSE
    WHERE company_id = NEW.company_id
    AND id != NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS ensure_single_primary_domain ON custom_domains;

-- Create trigger to enforce single primary
CREATE TRIGGER ensure_single_primary_domain
  BEFORE INSERT OR UPDATE OF is_primary ON custom_domains
  FOR EACH ROW EXECUTE FUNCTION enforce_single_primary_domain();

/**
 * Helper function: Generate verification token
 */
CREATE OR REPLACE FUNCTION generate_domain_verification_token()
RETURNS TEXT AS $$
BEGIN
  RETURN 'nanowork-verify-' || encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

/**
 * Helper function: Get required DNS records for domain
 */
CREATE OR REPLACE FUNCTION get_required_dns_records(p_domain TEXT)
RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_array(
    jsonb_build_object(
      'type', 'A',
      'name', '@',
      'value', '0.0.0.0',  -- Replace with actual IP
      'description', 'Points your root domain to Nanowork'
    ),
    jsonb_build_object(
      'type', 'CNAME',
      'name', 'www',
      'value', p_domain || '.nanowork.app',
      'description', 'Points www subdomain to Nanowork'
    ),
    jsonb_build_object(
      'type', 'TXT',
      'name', '_nanowork-verification',
      'value', generate_domain_verification_token(),
      'description', 'Verifies domain ownership'
    )
  );
END;
$$ LANGUAGE plpgsql;

/**
 * Verification: Check migration success
 */
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'custom_domains') THEN
    RAISE NOTICE '✅ Migration 008 successful! Custom domains table created.';
  ELSE
    RAISE WARNING '⚠️ Migration 008 failed. Custom_domains table does not exist.';
  END IF;
END $$;
