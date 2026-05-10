-- ===========================================================================
-- Migration 002: Companies Table
-- ===========================================================================
-- Purpose: Create companies table for multi-company support per user
-- Dependencies: profiles table
-- Author: Claude
-- Date: 2026-05-09
-- ===========================================================================

/**
 * Companies table - allows users to create and manage multiple AI companies
 * Each company has:
 * - 7 AI agent departments
 * - Own revenue tracking
 * - Optional custom domain
 * - Status management
 */
CREATE TABLE IF NOT EXISTS companies (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Company details
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  slug TEXT,
  industry TEXT,
  logo_url TEXT,

  -- Status management
  status TEXT NOT NULL DEFAULT 'initializing' CHECK (status IN ('initializing', 'active', 'paused', 'archived', 'deleted')),

  -- Legal entity (filled by Legal agent)
  entity_type TEXT,
  entity_state TEXT,
  ein TEXT,
  legal_entity_id TEXT,

  -- Branding (filled by Brand agent)
  brand_colors JSONB,
  brand_guidelines_url TEXT,

  -- Domain & web presence
  subdomain TEXT,
  custom_domain_id UUID,  -- FK to custom_domains table (added later)
  website_url TEXT,
  website_status TEXT CHECK (website_status IN ('building', 'live', 'maintenance', 'offline')),

  -- Financial tracking
  total_revenue DECIMAL(12,2) DEFAULT 0,
  mrr DECIMAL(12,2) DEFAULT 0,
  total_spend DECIMAL(12,2) DEFAULT 0,  -- How much agents have spent

  -- Settings & metadata
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  launched_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

/**
 * Indexes for performance
 */
CREATE INDEX IF NOT EXISTS idx_companies_owner_id ON companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at DESC);

-- Unique indexes with partial condition (allows NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_subdomain ON companies(subdomain) WHERE subdomain IS NOT NULL;

/**
 * Enable Row Level Security
 */
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Owners can view own companies" ON companies;
DROP POLICY IF EXISTS "Team members can view their companies" ON companies;
DROP POLICY IF EXISTS "Owners can create companies" ON companies;
DROP POLICY IF EXISTS "Owners can update own companies" ON companies;
DROP POLICY IF EXISTS "Owners can delete own companies" ON companies;

/**
 * RLS Policy: Owners can view their own companies
 */
CREATE POLICY "Owners can view own companies"
  ON companies FOR SELECT
  USING (auth.uid() = owner_id);

/**
 * RLS Policy: Owners can create companies (with limit check via trigger)
 */
CREATE POLICY "Owners can create companies"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

/**
 * RLS Policy: Owners can update their own companies
 */
CREATE POLICY "Owners can update own companies"
  ON companies FOR UPDATE
  USING (auth.uid() = owner_id);

/**
 * RLS Policy: Owners can delete their own companies
 */
CREATE POLICY "Owners can delete own companies"
  ON companies FOR DELETE
  USING (auth.uid() = owner_id);

/**
 * Trigger function: Enforce company creation limits based on user plan
 */
CREATE OR REPLACE FUNCTION check_company_creation_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_limit INTEGER;
  user_count INTEGER;
BEGIN
  -- Get user's company limit from their plan
  SELECT monthly_company_limit INTO user_limit
  FROM profiles
  WHERE id = NEW.owner_id;

  -- Count user's active companies (exclude archived/deleted)
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS check_company_limit_before_insert ON companies;

-- Create trigger to check limits before insert
CREATE TRIGGER check_company_limit_before_insert
  BEFORE INSERT ON companies
  FOR EACH ROW EXECUTE FUNCTION check_company_creation_limit();

/**
 * Trigger function: Auto-update updated_at timestamp
 */
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_companies_updated_at ON companies;

-- Create trigger for updated_at
CREATE TRIGGER set_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_companies_updated_at();

/**
 * Verification: Check migration success
 */
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'companies') THEN
    RAISE NOTICE '✅ Migration 002 successful! Companies table created.';
  ELSE
    RAISE WARNING '⚠️ Migration 002 failed. Companies table does not exist.';
  END IF;
END $$;
