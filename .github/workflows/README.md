# GitHub Actions Workflows

This directory contains all CI/CD workflows for the Nanowork project.

## 📋 Workflow Files

### Core CI/CD
- **`ci.yml`** - Main CI pipeline (TypeScript, builds, tests)
- **`deploy-check.yml`** - Pre-deployment validation (bundle size, vulnerabilities)
- **`lint-pr.yml`** - PR quality checks (title format, code quality)
- **`status-check.yml`** - Scheduled health checks and dependency updates
- **`validate.yml`** - Legacy validation (consider removing if superseded by ci.yml)

## 🚦 When They Run

| Workflow | Trigger | Purpose | Blocks Merge? |
|----------|---------|---------|---------------|
| CI | Push to main/develop, all PRs | Full build & type check | ✅ Yes |
| Deploy Check | PRs to main | Pre-deploy validation | ❌ No (warnings) |
| PR Lint | All PRs | Code quality | ⚠️ Debugger only |
| Status Check | Every 6 hours | Health monitoring | ❌ No |

## 🎯 Quick Reference

### Run All Checks Locally
```bash
# From project root
bun run typecheck           # TypeScript (all workspaces)
cd apps/web && bun run build  # Build test
cd apps/worker && npm run typecheck  # Worker check
cd backend && npx tsc --noEmit  # Backend check
```

### Fix Common Issues
```bash
# Remove console.log statements
grep -r "console.log" apps/*/src backend/src

# Remove debugger statements
grep -r "debugger" apps/*/src backend/src

# Check for secrets
grep -r "sk_live_\|sk_test_" . --exclude-dir=node_modules
```

## 📊 Viewing Results

1. Go to **Actions** tab in GitHub
2. Click on a workflow run
3. Expand failed jobs to see error details
4. Check **Annotations** for specific file/line issues

## 🔧 Modifying Workflows

### Add a New Check
1. Edit the appropriate `.yml` file
2. Add your job under `jobs:`
3. Update `ci-summary` to include new job in `needs:`
4. Test locally first!

### Disable a Check Temporarily
Add `if: false` to the job:
```yaml
my-check:
  if: false  # Temporarily disabled
  name: My Check
  runs-on: ubuntu-latest
```

## 🐛 Debugging Tips

1. **Check workflow logs** - Click on failed step
2. **Look for red X** - Shows exactly where it failed
3. **Copy command** - Run the same command locally
4. **Check environment** - Ensure env vars match

## 📚 Full Documentation

See [CI_CD_GUIDE.md](../CI_CD_GUIDE.md) for complete documentation.

## 🔐 Required Secrets

Currently no secrets required for CI (builds use placeholders).

For deployment workflows, you'll need:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- Other deployment-specific secrets

## 📞 Questions?

- Check [CI_CD_GUIDE.md](../CI_CD_GUIDE.md)
- Review workflow logs in GitHub Actions tab
- Ask team in Slack/Discord
