-- ============================================================================
-- Preview Builds - Freemium Conversion Flow
-- ============================================================================
-- Tracks both preview builds (before signup) and unlocked full builds

CREATE TABLE IF NOT EXISTS builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Build details
  prompt TEXT NOT NULL,
  company_name TEXT,
  tagline TEXT,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'preview' CHECK (status IN ('preview', 'generating', 'unlocked', 'failed')),

  -- URLs
  preview_url TEXT,
  full_url TEXT,

  -- Pricing & credits
  credits_cost INTEGER NOT NULL DEFAULT 100,

  -- Ownership (nullable for anonymous previews)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Generated content
  build_data JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unlocked_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_builds_user_id ON builds(user_id);
CREATE INDEX IF NOT EXISTS idx_builds_status ON builds(status);
CREATE INDEX IF NOT EXISTS idx_builds_created_at ON builds(created_at DESC);

-- RLS policies
ALTER TABLE builds ENABLE ROW LEVEL SECURITY;

-- Anyone can create preview builds (anonymous users)
CREATE POLICY builds_create_anonymous ON builds
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own builds
CREATE POLICY builds_select_own ON builds
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own builds (for unlocking)
CREATE POLICY builds_update_own ON builds
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can do everything
CREATE POLICY builds_service_all ON builds
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE builds IS 'Preview and unlocked website builds for freemium conversion';
COMMENT ON COLUMN builds.status IS 'preview = limited free preview, unlocked = full paid version';
COMMENT ON COLUMN builds.credits_cost IS 'Credits required to unlock full build';
