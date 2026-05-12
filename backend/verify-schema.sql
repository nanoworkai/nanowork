-- ============================================================================
-- Schema Verification Script
-- ============================================================================
-- Run this in Supabase SQL Editor to verify all tables and features are set up correctly
-- ============================================================================

-- Check all 15 tables exist
SELECT
  'Tables Check' AS check_type,
  CASE
    WHEN COUNT(*) = 15 THEN '✅ All 15 tables exist'
    ELSE '❌ Missing tables: ' || (15 - COUNT(*))::TEXT
  END AS status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'agents', 'businesses', 'generated_apps', 'app_files', 'landing_pages',
    'deployments', 'agent_conversations', 'agent_emails', 'agent_memories',
    'agent_tasks', 'contacts', 'contact_interactions', 'payment_links',
    'transactions', 'documents'
  )

UNION ALL

-- Check vector extension
SELECT
  'Vector Extension' AS check_type,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ vector extension enabled'
    ELSE '❌ vector extension missing - enable in Database → Extensions'
  END AS status
FROM pg_extension
WHERE extname = 'vector'

UNION ALL

-- Check RLS enabled
SELECT
  'RLS Status' AS check_type,
  CASE
    WHEN COUNT(*) = 15 THEN '✅ RLS enabled on all 15 tables'
    ELSE '❌ RLS not enabled on some tables'
  END AS status
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true
  AND tablename IN (
    'agents', 'businesses', 'generated_apps', 'app_files', 'landing_pages',
    'deployments', 'agent_conversations', 'agent_emails', 'agent_memories',
    'agent_tasks', 'contacts', 'contact_interactions', 'payment_links',
    'transactions', 'documents'
  )

UNION ALL

-- Check helper functions
SELECT
  'Helper Functions' AS check_type,
  CASE
    WHEN COUNT(*) >= 2 THEN '✅ Vector search functions exist'
    ELSE '❌ Missing helper functions'
  END AS status
FROM pg_proc
WHERE proname IN ('match_agent_memories', 'match_documents')

UNION ALL

-- Check triggers
SELECT
  'Updated_at Triggers' AS check_type,
  COUNT(*)::TEXT || ' triggers found' AS status
FROM pg_trigger
WHERE tgname LIKE '%updated_at%'

UNION ALL

-- Check indexes
SELECT
  'Indexes' AS check_type,
  COUNT(*)::TEXT || ' indexes created' AS status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'agents', 'businesses', 'generated_apps', 'app_files', 'landing_pages',
    'deployments', 'agent_conversations', 'agent_emails', 'agent_memories',
    'agent_tasks', 'contacts', 'contact_interactions', 'payment_links',
    'transactions', 'documents'
  )

UNION ALL

-- Check RLS policies
SELECT
  'RLS Policies' AS check_type,
  CASE
    WHEN COUNT(*) >= 15 THEN '✅ ' || COUNT(*)::TEXT || ' RLS policies active'
    ELSE '⚠️  Only ' || COUNT(*)::TEXT || ' policies found'
  END AS status
FROM pg_policies
WHERE schemaname = 'public';

-- ============================================================================
-- Detailed Table Information
-- ============================================================================

SELECT
  '=== TABLE DETAILS ===' AS info,
  '' AS details
UNION ALL
SELECT
  t.table_name,
  (
    SELECT COUNT(*)::TEXT || ' columns, ' ||
           (SELECT COUNT(*)::TEXT FROM pg_indexes WHERE tablename = t.table_name) || ' indexes'
    FROM information_schema.columns c
    WHERE c.table_schema = 'public' AND c.table_name = t.table_name
  ) AS details
FROM information_schema.tables t
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND t.table_name IN (
    'agents', 'businesses', 'generated_apps', 'app_files', 'landing_pages',
    'deployments', 'agent_conversations', 'agent_emails', 'agent_memories',
    'agent_tasks', 'contacts', 'contact_interactions', 'payment_links',
    'transactions', 'documents'
  )
ORDER BY table_name;

-- ============================================================================
-- Sample Data Check
-- ============================================================================

SELECT '=== RECORD COUNTS ===' AS table_name, 0 AS record_count
UNION ALL
SELECT 'agents', COUNT(*) FROM agents
UNION ALL
SELECT 'businesses', COUNT(*) FROM businesses
UNION ALL
SELECT 'generated_apps', COUNT(*) FROM generated_apps
UNION ALL
SELECT 'app_files', COUNT(*) FROM app_files
UNION ALL
SELECT 'landing_pages', COUNT(*) FROM landing_pages
UNION ALL
SELECT 'deployments', COUNT(*) FROM deployments
UNION ALL
SELECT 'agent_conversations', COUNT(*) FROM agent_conversations
UNION ALL
SELECT 'agent_emails', COUNT(*) FROM agent_emails
UNION ALL
SELECT 'agent_memories', COUNT(*) FROM agent_memories
UNION ALL
SELECT 'agent_tasks', COUNT(*) FROM agent_tasks
UNION ALL
SELECT 'contacts', COUNT(*) FROM contacts
UNION ALL
SELECT 'contact_interactions', COUNT(*) FROM contact_interactions
UNION ALL
SELECT 'payment_links', COUNT(*) FROM payment_links
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'documents', COUNT(*) FROM documents;
