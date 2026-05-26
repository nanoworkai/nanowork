# CI/CD Pipeline Documentation

## 🚀 Overview

This project uses GitHub Actions for continuous integration and deployment. We have comprehensive checks to catch issues before they reach production.

## 📋 Workflows

### 1. **CI Pipeline** (`ci.yml`)
Runs on: Every push to `main`/`develop` and all pull requests

**What it checks:**
- ✅ **Web App TypeScript** - Type checking for frontend
- ✅ **Web App Build** - Ensures production build succeeds
- ✅ **Worker TypeScript** - Type checking for Cloudflare Worker
- ✅ **Worker Lint** - Code quality checks
- ✅ **Backend TypeScript** - Type checking for Express API
- ✅ **Backend Build** - Structure validation
- ✅ **Monorepo Check** - Validates workspace structure
- ✅ **Secret Detection** - Prevents committed secrets

**Status:** 🟢 Required to pass before merge

---

### 2. **Deploy Check** (`deploy-check.yml`)
Runs on: Pull requests to `main` branch

**What it checks:**
- 🔒 **Environment Config** - Validates `.env.example` completeness
- 📦 **Bundle Size** - Warns if JavaScript bundles > 1MB
- 🔍 **Vulnerability Scan** - Checks for vulnerable dependencies
- 🔗 **API Contract** - Documents API endpoints

**Status:** 🟡 Warning-only (doesn't block merge)

---

### 3. **PR Lint & Quality** (`lint-pr.yml`)
Runs on: All pull requests

**What it checks:**
- 📝 **PR Title Format** - Suggests conventional commits format
- 📊 **Changed Files Analysis** - Categorizes changes by workspace
- 🔍 **Console.log Detection** - Warns about debug statements
- 🚫 **Debugger Detection** - BLOCKS if `debugger;` found
- 📌 **TODO Tracking** - Lists new TODO comments
- 📏 **File Size Check** - Warns about large files (>100KB)
- 🎯 **Type Safety** - Detects `any` types and `@ts-ignore`

**Status:** 🟡 Most checks are warnings, debugger blocks merge

---

### 4. **Status Check** (`status-check.yml`)
Runs on: Every 6 hours + manual trigger

**What it checks:**
- 🏥 **Production Health** - Pings production URLs
- 📦 **Dependency Updates** - Lists outdated packages

**Status:** 🔵 Informational only

---

## 🔧 Local Testing

Before pushing, run these commands locally:

```bash
# TypeScript check (all workspaces)
bun run typecheck

# Build web app
cd apps/web && bun run build

# Check worker
cd apps/worker && npm run typecheck

# Check backend
cd backend && npx tsc --noEmit
```

---

## 🚨 Common Failures & Fixes

### ❌ TypeScript Errors
```
Fix: Run `bun run typecheck` locally and resolve type errors
Location: File path shown in error message
```

### ❌ Build Failure
```
Fix: Ensure all environment variables have placeholders
Check: apps/web build step in ci.yml uses placeholder env vars
```

### ❌ Secret Detection
```
Fix: Never commit API keys or tokens
Check: Review .gitignore and use .env.local for secrets
```

### ❌ Debugger Statement
```
Fix: Remove all `debugger;` statements before committing
Search: grep -r "debugger" apps/*/src
```

---

## 📊 CI Status Badges

Add these to your `README.md`:

```markdown
![CI](https://github.com/YOUR_USERNAME/nanowork-web/workflows/CI/badge.svg)
![Deploy Check](https://github.com/YOUR_USERNAME/nanowork-web/workflows/Deploy%20Check/badge.svg)
```

---

## 🔐 Required Secrets

These GitHub secrets need to be configured for full CI/CD:

| Secret | Required | Description |
|--------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ | For build testing |
| `VITE_SUPABASE_ANON_KEY` | ✅ | For build testing |

**To add secrets:**
1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each required secret

---

## 🎯 Adding New Checks

### Add a new job to `ci.yml`:

```yaml
  my-new-check:
    name: My New Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run my check
        run: |
          echo "Running custom check..."
          # Your commands here
```

### Add dependency to summary job:

```yaml
  ci-summary:
    needs:
      - my-new-check  # Add here
```

---

## 🐛 Debugging Failed Workflows

1. **View logs:** Click on failed check in GitHub PR
2. **Re-run:** Click "Re-run failed jobs" if it was a fluke
3. **Local reproduction:** Copy failing command and run locally
4. **Check environment:** Ensure all required env vars are set

---

## 📚 Best Practices

### ✅ DO:
- Run `bun run typecheck` before pushing
- Keep PRs small and focused
- Write descriptive PR titles
- Fix TypeScript errors immediately
- Test builds locally before pushing

### ❌ DON'T:
- Commit secrets or API keys
- Use `@ts-ignore` without a comment explaining why
- Leave `debugger;` statements in code
- Skip CI checks by force-pushing
- Merge PRs with failing checks

---

## 🚀 Deployment Workflow

### Development → Staging → Production

1. **Create PR** → All checks run
2. **Review** → Code review + CI passes
3. **Merge to develop** → Auto-deploy to staging (configure this)
4. **Merge to main** → Auto-deploy to production (configure this)

---

## 📞 Support

If CI is failing and you can't figure out why:

1. Check workflow logs in GitHub Actions tab
2. Run the failing command locally
3. Check this guide for common fixes
4. Ask in team chat or create an issue

---

## 🔄 Maintenance

### Weekly:
- Check for dependency updates (automatic via status-check.yml)
- Review and update outdated packages

### Monthly:
- Update GitHub Actions to latest versions
- Review and optimize CI run times
- Check for new security best practices

---

Last updated: 2026-05-26
