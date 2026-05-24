-- Add ai_email column to profiles table
-- This will store the AI agent's email address (e.g., a-abc123@agent.nanowork.ai)

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS ai_email TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_ai_email ON profiles(ai_email);

-- Add comment
COMMENT ON COLUMN profiles.ai_email IS 'Auto-generated AI agent email address for this user (e.g., a-abc123@agent.nanowork.ai)';
