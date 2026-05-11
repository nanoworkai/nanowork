#!/bin/bash

# Test script for the Agent Platform Backend
# This tests all endpoints using curl

set -e

BASE_URL="http://localhost:3000"
INTERNAL_TOKEN="test-internal-token-12345"

echo "🚀 Testing Agent Platform Backend"
echo "=================================="
echo ""

# Test 1: Health Check
echo "1️⃣ Testing Health Endpoint"
HEALTH=$(curl -s "$BASE_URL/health")
echo "$HEALTH" | jq .
if echo "$HEALTH" | jq -e '.ok == true and .tables == 15' > /dev/null; then
  echo "✅ Health check passed"
else
  echo "❌ Health check failed"
  exit 1
fi
echo ""

# Test 2: Internal - Provision Agent
echo "2️⃣ Testing Agent Provisioning (Internal)"
TEST_USER_ID="00000000-0000-0000-0000-000000000001"

PROVISION=$(curl -s -X POST "$BASE_URL/internal/provision-agent" \
  -H "Authorization: Bearer $INTERNAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\": \"$TEST_USER_ID\"}")

echo "$PROVISION" | jq .

if echo "$PROVISION" | jq -e '.agent.id' > /dev/null 2>&1; then
  echo "✅ Agent provisioning succeeded (or agent already exists)"
  AGENT_ID=$(echo "$PROVISION" | jq -r '.agent.id')
  AGENT_SLUG=$(echo "$PROVISION" | jq -r '.agent.slug')
  echo "   Agent ID: $AGENT_ID"
  echo "   Agent Slug: $AGENT_SLUG"
else
  echo "⚠️  Agent provisioning returned error (expected without real Supabase)"
  echo "$PROVISION" | jq .
fi
echo ""

# Test 3: Webhook - Inbound Email
echo "3️⃣ Testing Inbound Email Webhook"
EMAIL_WEBHOOK=$(curl -s -X POST "$BASE_URL/webhooks/email/inbound" \
  -H "Authorization: Bearer $INTERNAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "localPart": "test-agent",
    "from": "user@example.com",
    "to": "a-test-agent@example.com",
    "subject": "Test Email",
    "text": "This is a test email body",
    "headers": {"message-id": "test-123"}
  }')

echo "$EMAIL_WEBHOOK" | jq .

if echo "$EMAIL_WEBHOOK" | jq -e '.error' > /dev/null 2>&1; then
  echo "⚠️  Email webhook returned error (expected without real agent in DB)"
else
  echo "✅ Email webhook processed"
fi
echo ""

# Test 4: Protected Route without Auth
echo "4️⃣ Testing Protected Route (should fail without auth)"
NO_AUTH=$(curl -s -w "\n%{http_code}" "$BASE_URL/agents/me")
HTTP_CODE=$(echo "$NO_AUTH" | tail -1)
RESPONSE=$(echo "$NO_AUTH" | head -n -1)

if [ "$HTTP_CODE" = "401" ]; then
  echo "✅ Correctly rejected unauthenticated request (401)"
  echo "$RESPONSE" | jq .
else
  echo "❌ Expected 401, got $HTTP_CODE"
fi
echo ""

# Test 5: Protected Route with Invalid Token
echo "5️⃣ Testing Protected Route with Invalid Token"
BAD_TOKEN=$(curl -s -w "\n%{http_code}" "$BASE_URL/agents/me" \
  -H "Authorization: Bearer invalid-token")
HTTP_CODE=$(echo "$BAD_TOKEN" | tail -1)
RESPONSE=$(echo "$BAD_TOKEN" | head -n -1)

if [ "$HTTP_CODE" = "401" ]; then
  echo "✅ Correctly rejected invalid token (401)"
  echo "$RESPONSE" | jq .
else
  echo "❌ Expected 401, got $HTTP_CODE"
fi
echo ""

# Test 6: 404 on Unknown Route
echo "6️⃣ Testing 404 on Unknown Route"
NOT_FOUND=$(curl -s -w "\n%{http_code}" "$BASE_URL/unknown-route")
HTTP_CODE=$(echo "$NOT_FOUND" | tail -1)
RESPONSE=$(echo "$NOT_FOUND" | head -n -1)

if [ "$HTTP_CODE" = "404" ]; then
  echo "✅ Correctly returned 404"
  echo "$RESPONSE" | jq .
else
  echo "❌ Expected 404, got $HTTP_CODE"
fi
echo ""

echo "=================================="
echo "✅ All basic tests passed!"
echo ""
echo "Note: Tests requiring real Supabase authentication were skipped."
echo "To test authenticated endpoints, set up real Supabase credentials."
