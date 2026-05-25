#!/bin/bash

# Nanowork Deployment Verification Script
# NOTE: This validates the optional Render deployment configuration (Express backend),
# NOT the primary Cloudflare deployment (Worker + Pages). Use this to verify Render setup.

echo "🔍 Verifying Nanowork Deployment Configuration"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check backend structure
echo "📦 Checking Backend..."
if [ -d "backend" ]; then
    echo -e "${GREEN}✓${NC} backend/ directory exists"

    if [ -f "backend/package.json" ]; then
        echo -e "${GREEN}✓${NC} backend/package.json exists"

        # Check for start script
        if grep -q '"start"' backend/package.json; then
            echo -e "${GREEN}✓${NC} start script found in backend/package.json"
        else
            echo -e "${RED}✗${NC} start script missing in backend/package.json"
        fi
    else
        echo -e "${RED}✗${NC} backend/package.json missing"
    fi

    if [ -f "backend/tsconfig.json" ]; then
        echo -e "${GREEN}✓${NC} backend/tsconfig.json exists"
    else
        echo -e "${RED}✗${NC} backend/tsconfig.json missing"
    fi
else
    echo -e "${RED}✗${NC} backend/ directory missing"
fi

echo ""

# Check frontend structure
echo "🌐 Checking Frontend..."
if [ -d "apps/web" ]; then
    echo -e "${GREEN}✓${NC} apps/web/ directory exists"

    if [ -f "apps/web/package.json" ]; then
        echo -e "${GREEN}✓${NC} apps/web/package.json exists"
    fi

    if [ -f "apps/web/public/_redirects" ]; then
        echo -e "${GREEN}✓${NC} apps/web/public/_redirects exists (SPA routing)"
        echo "    Content: $(cat apps/web/public/_redirects)"
    else
        echo -e "${YELLOW}⚠${NC} apps/web/public/_redirects missing (needed for SPA)"
    fi
else
    echo -e "${RED}✗${NC} apps/web/ directory missing"
fi

echo ""

# Check render.yaml
echo "🚀 Checking Render Configuration..."
if [ -f "render.yaml" ]; then
    echo -e "${GREEN}✓${NC} render.yaml exists"

    # Check rootDir
    if grep -q 'rootDir: backend' render.yaml; then
        echo -e "${GREEN}✓${NC} rootDir set to 'backend'"
    else
        echo -e "${RED}✗${NC} rootDir NOT set to 'backend'"
    fi

    # Check runtime
    if grep -q 'runtime: node' render.yaml; then
        echo -e "${GREEN}✓${NC} runtime set to 'node'"
    else
        echo -e "${RED}✗${NC} runtime NOT set to 'node'"
    fi

    # Check start command
    if grep -q 'startCommand: npm start' render.yaml || grep -q 'startCommand: node dist/index.js' render.yaml; then
        echo -e "${GREEN}✓${NC} startCommand configured"
    else
        echo -e "${YELLOW}⚠${NC} startCommand may need verification"
    fi
else
    echo -e "${YELLOW}⚠${NC} render.yaml missing (optional, but recommended)"
fi

echo ""

# Test backend build
echo "🔨 Testing Backend Build..."
cd backend 2>/dev/null
if [ $? -eq 0 ]; then
    if npm run build >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Backend builds successfully"

        if [ -f "dist/index.js" ]; then
            echo -e "${GREEN}✓${NC} dist/index.js exists after build"
        else
            echo -e "${RED}✗${NC} dist/index.js missing after build"
        fi
    else
        echo -e "${RED}✗${NC} Backend build failed"
    fi
    cd ..
else
    echo -e "${RED}✗${NC} Cannot cd into backend/"
fi

echo ""

# Check for common issues
echo "⚠️  Common Issues..."

if [ -f "package.json" ]; then
    if ! grep -q '"start"' package.json; then
        echo -e "${GREEN}✓${NC} Root package.json has no start script (correct)"
    else
        ROOT_START=$(grep '"start"' package.json)
        if echo "$ROOT_START" | grep -q "ERROR"; then
            echo -e "${GREEN}✓${NC} Root start script shows helpful error (correct)"
        else
            echo -e "${YELLOW}⚠${NC} Root package.json has start script (may cause issues)"
            echo "    Make sure Render uses rootDir: backend"
        fi
    fi
fi

echo ""
echo "=============================================="
echo "📋 Summary"
echo "=============================================="
echo ""
echo "If deploying to Render, make sure:"
echo "  1. Root Directory is set to: backend"
echo "  2. Build Command is: npm ci && npm run build"
echo "  3. Start Command is: npm start"
echo "  4. Runtime is: Node"
echo ""
echo "If you see 'npm start not found' error on Render:"
echo "  → Check that 'Root Directory' is set to 'backend' in Render settings"
echo ""
echo "Frontend should be deployed to Cloudflare Pages:"
echo "  → Run: npm run deploy:web"
echo ""
