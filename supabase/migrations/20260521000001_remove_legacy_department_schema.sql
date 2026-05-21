-- ============================================================================
-- Remove Legacy Department-Based Schema
-- ============================================================================
-- The original 001_initial_schema.sql created a department-based agents system
-- (7 agents per company: legal, brand, web, marketing, sales, finance, operations)
-- This has been superseded by the user-based agents system (1 agent per user)
-- This migration removes the old unused tables to prevent conflicts

-- Drop tables that reference the old agents table first (cascade order)
DROP TABLE IF EXISTS agent_emails CASCADE;
DROP TABLE IF EXISTS communications CASCADE;
DROP TABLE IF EXISTS prospects CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS financial_infrastructure CASCADE;
DROP TABLE IF EXISTS agent_activities CASCADE;

-- Now safe to drop the old agents table structure
-- Note: This won't affect the NEW agents table created in 20260520000001
-- because that migration runs AFTER this cleanup

-- If somehow the wrong agents table got created, drop it
DO $$
BEGIN
  -- Check if agents table has 'department' column (old schema)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'department'
  ) THEN
    -- Old schema exists, drop it
    DROP TABLE agents CASCADE;
    RAISE NOTICE 'Dropped legacy department-based agents table';
  END IF;
END $$;

COMMENT ON SCHEMA public IS 'Cleaned up legacy department-based agent system. Using user-based agents from 20260520000001.';
