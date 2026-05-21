/**
 * Test script to verify auto-provisioning of agents for new users
 *
 * This tests the updated auth middleware that automatically creates
 * an agent record when a user first authenticates.
 *
 * Prerequisites:
 * - Backend server running (npm run dev)
 * - Valid Supabase credentials in .env
 * - AGENT_EMAIL_DOMAIN configured in .env
 */

import { createClient } from '@supabase/supabase-js';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAutoProvision() {
  console.log('🧪 Testing auto-provision functionality\n');

  // Step 1: Create a test user (or use existing)
  console.log('📝 Step 1: Creating test user...');
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (signUpError) {
    console.error('❌ Failed to create test user:', signUpError.message);
    return false;
  }

  if (!signUpData.user) {
    console.error('❌ No user returned from signup');
    return false;
  }

  console.log(`✅ Created test user: ${signUpData.user.id}\n`);

  // Step 2: Get auth token
  console.log('🔑 Step 2: Getting auth token...');
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !sessionData.session) {
    console.error('❌ Failed to get session:', sessionError?.message);
    return false;
  }

  const token = sessionData.session.access_token;
  console.log(`✅ Got auth token\n`);

  // Step 3: Make first authenticated request (should trigger auto-provision)
  console.log('🚀 Step 3: Making first authenticated request to trigger auto-provision...');
  const response = await fetch(`${BACKEND_URL}/api/build`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Request failed with status ${response.status}:`, errorText);
    return false;
  }

  const data = await response.json();
  console.log(`✅ Request succeeded! Got ${data.builds?.length || 0} builds\n`);

  // Step 4: Verify agent was created
  console.log('🔍 Step 4: Verifying agent was auto-provisioned...');
  const { data: agentData, error: agentError } = await supabase
    .from('agents')
    .select('*')
    .eq('user_id', signUpData.user.id)
    .single();

  if (agentError || !agentData) {
    console.error('❌ Agent was not created:', agentError?.message);
    return false;
  }

  console.log('✅ Agent successfully auto-provisioned!');
  console.log(`   - Agent ID: ${agentData.id}`);
  console.log(`   - Slug: ${agentData.slug}`);
  console.log(`   - Email: ${agentData.email}`);
  console.log(`   - Status: ${agentData.status}\n`);

  // Step 5: Test that subsequent requests work (agent already exists)
  console.log('🔄 Step 5: Testing subsequent request (agent should already exist)...');
  const response2 = await fetch(`${BACKEND_URL}/api/build`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response2.ok) {
    const errorText = await response2.text();
    console.error(`❌ Second request failed with status ${response2.status}:`, errorText);
    return false;
  }

  console.log('✅ Subsequent request succeeded (idempotent)\n');

  // Cleanup: Delete test user and agent
  console.log('🧹 Cleanup: Deleting test data...');

  // Delete agent (will cascade delete builds)
  const { error: deleteAgentError } = await supabase
    .from('agents')
    .delete()
    .eq('id', agentData.id);

  if (deleteAgentError) {
    console.warn('⚠️  Failed to delete agent:', deleteAgentError.message);
  }

  // Delete user (requires admin privileges, may fail)
  const { error: deleteUserError } = await supabase.auth.admin.deleteUser(
    signUpData.user.id
  );

  if (deleteUserError) {
    console.warn('⚠️  Failed to delete user (requires admin privileges)');
  } else {
    console.log('✅ Cleanup completed\n');
  }

  return true;
}

// Run test
console.log('='.repeat(60));
console.log('Auto-Provision Agent Test');
console.log('='.repeat(60) + '\n');

testAutoProvision()
  .then((success) => {
    if (success) {
      console.log('='.repeat(60));
      console.log('✅ ALL TESTS PASSED');
      console.log('='.repeat(60));
      process.exit(0);
    } else {
      console.log('='.repeat(60));
      console.log('❌ TESTS FAILED');
      console.log('='.repeat(60));
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
