-- ===========================================================================
-- Migration 004: Company Members (Team Collaboration)
-- ===========================================================================
-- Purpose: Enable team collaboration - invite members to companies
-- Dependencies: profiles, companies tables
-- Author: Claude
-- Date: 2026-05-09
-- ===========================================================================

/**
 * Company members table - team collaboration with role-based access
 * Roles:
 * - owner: Full access (assigned to company creator)
 * - admin: Can manage members, settings, billing
 * - member: Can view and edit company data
 * - viewer: Read-only access
 */
CREATE TABLE IF NOT EXISTS company_members (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Role & permissions
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  permissions JSONB DEFAULT '{"view": true, "edit": false, "invite": false, "billing": false}'::jsonb,

  -- Invitation tracking
  invited_by UUID REFERENCES profiles(id),
  invitation_email TEXT,
  invitation_token TEXT UNIQUE,
  invitation_status TEXT NOT NULL DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'accepted', 'declined', 'expired')),
  invitation_sent_at TIMESTAMPTZ,
  invitation_accepted_at TIMESTAMPTZ,
  invitation_expires_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique user per company
  UNIQUE(company_id, user_id)
);

/**
 * Indexes for performance
 */
CREATE INDEX IF NOT EXISTS idx_company_members_company_id ON company_members(company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_user_id ON company_members(user_id);
CREATE INDEX IF NOT EXISTS idx_company_members_role ON company_members(role);
CREATE INDEX IF NOT EXISTS idx_company_members_invitation_token ON company_members(invitation_token);
CREATE INDEX IF NOT EXISTS idx_company_members_status ON company_members(invitation_status);

/**
 * Enable Row Level Security
 */
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view memberships for their companies" ON company_members;
DROP POLICY IF EXISTS "Owners and admins can manage members" ON company_members;
DROP POLICY IF EXISTS "Users can accept invitations" ON company_members;

/**
 * RLS Policy: Users can view memberships for companies they own or are members of
 */
CREATE POLICY "Users can view memberships for their companies"
  ON company_members FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    ) OR user_id = auth.uid()
  );

/**
 * RLS Policy: Owners and admins can manage members
 */
CREATE POLICY "Owners and admins can manage members"
  ON company_members FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

/**
 * RLS Policy: Users can accept their own invitations
 */
CREATE POLICY "Users can accept invitations"
  ON company_members FOR UPDATE
  USING (user_id = auth.uid() OR invitation_email = (SELECT email FROM profiles WHERE id = auth.uid()));

/**
 * Update companies RLS to include team member access
 * Now team members can also view companies they're invited to
 */
DROP POLICY IF EXISTS "Team members can view their companies" ON companies;

CREATE POLICY "Team members can view their companies"
  ON companies FOR SELECT
  USING (
    id IN (
      SELECT company_id
      FROM company_members
      WHERE user_id = auth.uid()
      AND invitation_status = 'accepted'
    )
  );

/**
 * Trigger function: Auto-update updated_at timestamp
 */
CREATE OR REPLACE FUNCTION update_company_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_company_members_updated_at ON company_members;

-- Create trigger for updated_at
CREATE TRIGGER set_company_members_updated_at
  BEFORE UPDATE ON company_members
  FOR EACH ROW EXECUTE FUNCTION update_company_members_updated_at();

/**
 * Helper function: Generate invitation token
 */
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$$ LANGUAGE plpgsql;

/**
 * Helper function: Invite team member
 */
CREATE OR REPLACE FUNCTION invite_team_member(
  p_company_id UUID,
  p_inviter_id UUID,
  p_email TEXT,
  p_role TEXT DEFAULT 'member'
)
RETURNS UUID AS $$
DECLARE
  v_invitation_id UUID;
  v_token TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Check if inviter has permission
  IF NOT EXISTS (
    SELECT 1 FROM company_members
    WHERE company_id = p_company_id
    AND user_id = p_inviter_id
    AND role IN ('owner', 'admin')
  ) THEN
    RAISE EXCEPTION 'You do not have permission to invite members to this company.';
  END IF;

  -- Generate token and expiry
  v_token := generate_invitation_token();
  v_expires_at := NOW() + INTERVAL '7 days';

  -- Check if user already exists
  DECLARE
    v_user_id UUID;
  BEGIN
    SELECT id INTO v_user_id FROM profiles WHERE email = p_email OR phone = p_email;

    -- Insert invitation
    INSERT INTO company_members (
      company_id,
      user_id,
      role,
      invited_by,
      invitation_email,
      invitation_token,
      invitation_status,
      invitation_sent_at,
      invitation_expires_at
    ) VALUES (
      p_company_id,
      COALESCE(v_user_id, gen_random_uuid()),  -- Use existing or temp ID
      p_role,
      p_inviter_id,
      p_email,
      v_token,
      'pending',
      NOW(),
      v_expires_at
    )
    ON CONFLICT (company_id, user_id) DO UPDATE
    SET
      invitation_token = v_token,
      invitation_status = 'pending',
      invitation_sent_at = NOW(),
      invitation_expires_at = v_expires_at
    RETURNING id INTO v_invitation_id;

    RETURN v_invitation_id;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/**
 * Verification: Check migration success
 */
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'company_members') THEN
    RAISE NOTICE '✅ Migration 004 successful! Team collaboration enabled.';
  ELSE
    RAISE WARNING '⚠️ Migration 004 failed. Company_members table does not exist.';
  END IF;
END $$;
