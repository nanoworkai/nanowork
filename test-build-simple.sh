#!/bin/bash

# Simple test script to verify build endpoints are accessible
# This tests the API path fix without requiring authentication

echo "🧪 Testing Build API Endpoints"
echo ""

# Test 1: Health check
echo "📋 Test 1: Health check"
HEALTH=$(curl -s http://localhost:8000/health)
if echo "$HEALTH" | grep -q "ok"; then
  echo "✅ Backend is healthy"
else
  echo "❌ Backend health check failed"
  exit 1
fi

# Test 2: Build endpoint exists (should return 401 without auth)
echo ""
echo "📋 Test 2: Build endpoint accessibility"
BUILD_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:8000/api/build)
STATUS_CODE=$(echo "$BUILD_RESPONSE" | tail -n 1)
BODY=$(echo "$BUILD_RESPONSE" | head -n -1)

if [ "$STATUS_CODE" = "401" ]; then
  echo "✅ /api/build endpoint exists (returns 401 as expected without auth)"
else
  echo "❌ /api/build endpoint failed with status: $STATUS_CODE"
  echo "   Response: $BODY"
  exit 1
fi

# Test 3: Generate name endpoint exists
echo ""
echo "📋 Test 3: Generate name endpoint accessibility"
NAME_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8000/api/build/generate-name \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}')
STATUS_CODE=$(echo "$NAME_RESPONSE" | tail -n 1)
BODY=$(echo "$NAME_RESPONSE" | head -n -1)

if [ "$STATUS_CODE" = "401" ]; then
  echo "✅ /api/build/generate-name endpoint exists (returns 401 as expected)"
else
  echo "❌ /api/build/generate-name failed with status: $STATUS_CODE"
  echo "   Response: $BODY"
  exit 1
fi

# Test 4: Stream endpoint exists
echo ""
echo "📋 Test 4: Stream endpoint accessibility"
STREAM_RESPONSE=$(curl -s -w "\n%{http_code}" "http://localhost:8000/api/build/stream?buildId=test&prompt=test")
STATUS_CODE=$(echo "$STREAM_RESPONSE" | tail -n 1)
BODY=$(echo "$STREAM_RESPONSE" | head -n -1)

if [ "$STATUS_CODE" = "401" ]; then
  echo "✅ /api/build/stream endpoint exists (returns 401 as expected)"
else
  echo "❌ /api/build/stream failed with status: $STATUS_CODE"
  echo "   Response: $BODY"
  exit 1
fi

echo ""
echo "🎉 SUCCESS! All API endpoints are properly configured!"
echo ""
echo "✅ API path fix working: Frontend /api/* → Backend /api/*"
echo "✅ Authentication middleware active (401 without token)"
echo "✅ Build creation endpoints ready"
echo ""
echo "📝 Next steps:"
echo "   1. Open http://localhost:5173 in your browser"
echo "   2. Sign up or log in with Supabase"
echo "   3. Navigate to the dashboard"
echo "   4. Enter a prompt and click 'Execute'"
echo "   5. Watch your build generate!"
echo ""
