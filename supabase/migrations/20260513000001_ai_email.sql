-- Add ai_email column to profiles table
-- This allows users to have a dedicated AI agent email address like nova@nanowork.ai

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS ai_email TEXT;

-- Add unique constraint to ensure no two users can have the same AI email
CREATE UNIQUE INDEX IF NOT EXISTS profiles_ai_email_unique
ON profiles(ai_email)
WHERE ai_email IS NOT NULL;

-- Add check constraint to validate email format (must end with @nanowork.ai)
ALTER TABLE profiles
ADD CONSTRAINT ai_email_format_check
CHECK (ai_email IS NULL OR ai_email ~ '^[a-z0-9]+@nanowork\.ai$');

-- Add comment for documentation
COMMENT ON COLUMN profiles.ai_email IS 'AI agent email address for sending emails on behalf of the user (e.g., nova@nanowork.ai)';
