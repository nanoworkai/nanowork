-- Add last_activity_at column to builds table
-- This tracks when a build was last interacted with (for sorting by recent activity)

ALTER TABLE builds
ADD COLUMN last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- Create an index for efficient querying by last activity
CREATE INDEX idx_builds_last_activity_at ON builds(last_activity_at DESC);

-- Update existing rows to set last_activity_at to created_at initially
UPDATE builds
SET last_activity_at = created_at
WHERE last_activity_at IS NULL;

COMMENT ON COLUMN builds.last_activity_at IS 'Timestamp of last user interaction with this build';
