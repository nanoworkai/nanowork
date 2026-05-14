-- ===========================================================================
-- Migration: Add Custom Domain Fields to Deployments
-- ===========================================================================
-- Purpose: Add fields to deployments table for custom domain management
-- Date: 2026-05-13
-- ===========================================================================

/**
 * Add custom domain fields to deployments table
 */
ALTER TABLE deployments
  ADD COLUMN IF NOT EXISTS custom_domain TEXT,
  ADD COLUMN IF NOT EXISTS domain_status TEXT CHECK (domain_status IN ('pending_payment', 'pending_configuration', 'pending_dns', 'active', 'payment_failed')),
  ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS domain_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS cloudflare_project_name TEXT;

/**
 * Add index for custom domain lookups
 */
CREATE INDEX IF NOT EXISTS idx_deployments_custom_domain ON deployments(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deployments_domain_subscription ON deployments(domain_subscription_id) WHERE domain_subscription_id IS NOT NULL;

/**
 * Add comments for documentation
 */
COMMENT ON COLUMN deployments.custom_domain IS 'User custom domain (e.g., example.com)';
COMMENT ON COLUMN deployments.domain_status IS 'Status of custom domain setup process';
COMMENT ON COLUMN deployments.domain_verified IS 'Whether DNS has been verified for custom domain';
COMMENT ON COLUMN deployments.domain_subscription_id IS 'Stripe subscription ID for domain billing';
COMMENT ON COLUMN deployments.cloudflare_project_name IS 'Cloudflare Pages project name for this deployment';

/**
 * Verification: Check migration success
 */
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployments'
    AND column_name = 'custom_domain'
  ) THEN
    RAISE NOTICE '✅ Migration successful! Deployment domain fields added.';
  ELSE
    RAISE WARNING '⚠️ Migration failed. Domain fields not added to deployments.';
  END IF;
END $$;
