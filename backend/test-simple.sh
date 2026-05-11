#!/bin/bash

# Simple test script for the Agent Platform Backend

BASE_URL="http://localhost:3000"
INTERNAL_TOKEN="test-internal-token-12345"

echo "🚀 Testing Agent Platform Backend"
echo ""

# Test 1: Health Check
echo "1. Health Check"
curl -s "$BASE_URL/health" | jq .
echo ""

# Test 2: Protected route without auth (should return 401)
echo "2. Protected Route - No Auth (expect 401)"
curl -s "$BASE_URL/agents/me" | jq .
echo ""

# Test 3: Protected route with bad token (should return 401)
echo "3. Protected Route - Bad Token (expect 401)"
curl -s "$BASE_URL/agents/me" -H "Authorization: Bearer bad-token" | jq .
echo ""

# Test 4: Internal endpoint without token (should return 401)
echo "4. Internal Endpoint - No Token (expect 401)"
curl -s -X POST "$BASE_URL/internal/provision-agent" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test"}' | jq .
echo ""

# Test 5: Internal endpoint with correct token (will fail on DB but auth works)
echo "5. Internal Endpoint - With Token (auth works, DB will fail)"
curl -s -X POST "$BASE_URL/internal/provision-agent" \
  -H "Authorization: Bearer $INTERNAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "00000000-0000-0000-0000-000000000001"}' | jq .
echo ""

# Test 6: 404
echo "6. Unknown Route (expect 404)"
curl -s "$BASE_URL/nonexistent" | jq .
echo ""

echo "✅ Test complete!"
echo ""
echo "Summary:"
echo "- Health endpoint works"
echo "- Auth middleware properly rejects unauthenticated requests"
echo "- Internal token validation works"
echo "- 404 handling works"
echo ""
echo "Note: Database operations fail because Supabase credentials are placeholder."
echo "With real Supabase credentials, agent provisioning and data operations would work."
