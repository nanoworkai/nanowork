-- Add claimed_at column to companies table
-- This tracks when a business was claimed from the marketplace

ALTER TABLE companies ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

-- Add source column to track where the company came from
ALTER TABLE companies ADD COLUMN IF NOT EXISTS source TEXT CHECK (source IN ('marketplace', 'manual', 'claimed', 'imported'));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_companies_claimed_at ON companies(claimed_at);
CREATE INDEX IF NOT EXISTS idx_companies_source ON companies(source);
