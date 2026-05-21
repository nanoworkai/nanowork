-- ============================================================================
-- Rename Legacy Department-Based Schema to Avoid Conflict
-- ============================================================================
-- The original 001_initial_schema.sql created a department-based agents system
-- This migration renames it to 'department_agents' to avoid conflict with
-- the new user-based 'agents' table

-- Only run if the old schema exists
DO $$
BEGIN
  -- Check if agents table has 'department' column (old schema)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'department'
  ) THEN
    -- Rename the old agents table
    ALTER TABLE agents RENAME TO department_agents;

    -- Rename indexes
    ALTER INDEX IF EXISTS idx_agents_company_id RENAME TO idx_department_agents_company_id;
    ALTER INDEX IF EXISTS idx_agents_department RENAME TO idx_department_agents_department;
    ALTER INDEX IF EXISTS idx_agents_status RENAME TO idx_department_agents_status;
    ALTER INDEX IF EXISTS idx_agents_company_department RENAME TO idx_department_agents_company_department;

    -- Update foreign key references in related tables
    -- agent_activities
    ALTER TABLE IF EXISTS agent_activities
      DROP CONSTRAINT IF EXISTS agent_activities_agent_id_fkey,
      ADD CONSTRAINT agent_activities_department_agent_id_fkey
        FOREIGN KEY (agent_id) REFERENCES department_agents(id) ON DELETE CASCADE;

    -- financial_infrastructure
    ALTER TABLE IF EXISTS financial_infrastructure
      DROP CONSTRAINT IF EXISTS financial_infrastructure_agent_id_fkey,
      ADD CONSTRAINT financial_infrastructure_department_agent_id_fkey
        FOREIGN KEY (agent_id) REFERENCES department_agents(id) ON DELETE CASCADE;

    -- transactions
    ALTER TABLE IF EXISTS transactions
      DROP CONSTRAINT IF EXISTS transactions_agent_id_fkey,
      ADD CONSTRAINT transactions_department_agent_id_fkey
        FOREIGN KEY (agent_id) REFERENCES department_agents(id) ON DELETE CASCADE;

    -- prospects
    ALTER TABLE IF EXISTS prospects
      DROP CONSTRAINT IF EXISTS prospects_agent_id_fkey,
      ADD CONSTRAINT prospects_department_agent_id_fkey
        FOREIGN KEY (agent_id) REFERENCES department_agents(id) ON DELETE SET NULL;

    -- communications
    ALTER TABLE IF EXISTS communications
      DROP CONSTRAINT IF EXISTS communications_agent_id_fkey,
      ADD CONSTRAINT communications_department_agent_id_fkey
        FOREIGN KEY (agent_id) REFERENCES department_agents(id) ON DELETE SET NULL;

    -- agent_emails
    ALTER TABLE IF EXISTS agent_emails
      DROP CONSTRAINT IF EXISTS agent_emails_agent_id_fkey,
      ADD CONSTRAINT agent_emails_department_agent_id_fkey
        FOREIGN KEY (agent_id) REFERENCES department_agents(id) ON DELETE SET NULL;

    RAISE NOTICE 'Renamed agents to department_agents to avoid conflict';
  END IF;
END $$;

COMMENT ON TABLE department_agents IS 'Legacy department-based agent system (7 agents per company). Superseded by user-based agents table.';
