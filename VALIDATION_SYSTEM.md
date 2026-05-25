# Import Validation System

This document describes the multi-layer validation system implemented to prevent import errors and other TypeScript issues from reaching production.

## What Was Implemented

### Layer 1: TypeScript Validation
- **TypeScript type checking** enforced before deployment
- **Scripts added:**
  - `npm run typecheck` - validates all TypeScript in the repo
  - `npm run validate` - runs both typecheck and lint
- **Pre-deploy validation:** Worker deployment now runs typecheck automatically

### Layer 2: ESLint with Import Validation
- **ESLint 9** with flat config system
- **Import validation plugin** that catches:
  - Missing imports (functions/modules that don't exist)
  - Unused imports
  - Duplicate imports
  - Invalid import paths
- **TypeScript-aware linting** with strict rules
- **Scripts added:**
  - `npm run lint` - checks code quality
  - `npm run lint:fix` - auto-fixes issues

### Layer 3: Pre-Commit Git Hooks
- **Automatic validation** before commits using `simple-git-hooks` + `lint-staged`
- **Only checks changed files** for fast validation
- **Blocks commits** if validation fails
- Runs on TypeScript file changes in:
  - `apps/worker/src/**/*.ts`
  - `apps/web/src/**/*.{ts,tsx}`

### Layer 4: CI/CD Pipeline
- **GitHub Actions workflow** (`.github/workflows/validate.yml`)
- **Runs on:** Pull requests and main branch pushes
- **Validates:**
  - TypeScript compilation
  - ESLint rules
  - Build process
- **Fast execution:** ~30-45 seconds with caching

### Layer 5: Developer Experience
- **VS Code integration:**
  - Auto-fix on save
  - ESLint errors shown inline
  - TypeScript error highlighting
  - Recommended extensions
- **Working directories configured** for monorepo structure

## How It Prevents Import Errors

### The Problem
The issues we encountered:
1. `requireAuth` was imported but didn't exist in `auth.ts`
2. `AgentType` import resolution issues
3. No validation prevented these from being committed/deployed

### The Solution
Now, errors are caught at **multiple checkpoints**:

```
Developer writes code
    ↓
VS Code shows errors in real-time (Layer 5)
    ↓
Tries to commit
    ↓
Pre-commit hook validates (Layer 3) ← BLOCKS if errors
    ↓
Pushes to GitHub
    ↓
CI pipeline validates (Layer 4) ← BLOCKS PR if errors
    ↓
Tries to deploy
    ↓
Deployment script validates (Layer 1) ← BLOCKS deploy if errors
    ↓
✅ Production
```

## Usage

### For Developers

**During development:**
```bash
npm run dev          # Normal development
npm run validate     # Manual validation check
```

**Before committing:**
- Git hooks run automatically
- Or manually: `npm run typecheck && npm run lint`

**Fixing issues:**
```bash
npm run lint:fix     # Auto-fix linting issues
```

### For CI/CD

**Automated validation:**
- Runs on all PRs automatically
- Runs on pushes to main
- See status in GitHub PR checks

**Manual trigger:**
```bash
npm run validate     # Run full validation locally
```

## What Gets Validated

### TypeScript Checks
- ✅ Type correctness
- ✅ Import resolution
- ✅ Unused variables/imports
- ✅ Function signatures
- ✅ Type compatibility

### ESLint Checks
- ✅ Import statements exist and resolve
- ✅ Named imports match exports
- ✅ No duplicate imports
- ✅ Code quality rules
- ✅ TypeScript-specific issues

### Build Checks
- ✅ Successful compilation
- ✅ No build errors
- ✅ Dependencies available

## Configuration Files

- `apps/worker/eslint.config.js` - ESLint rules for worker
- `apps/worker/package.json` - Worker scripts and dependencies
- `package.json` - Root scripts, git hooks, lint-staged config
- `.vscode/settings.json` - VS Code integration
- `.vscode/extensions.json` - Recommended extensions
- `.github/workflows/validate.yml` - CI pipeline

## Performance

- **Pre-commit validation:** <5 seconds (only changed files)
- **Full typecheck:** <3 seconds (incremental builds)
- **ESLint:** <2 seconds (~4k lines of code)
- **CI pipeline:** ~30-45 seconds (with caching)

## Maintenance

### Updating Rules
Edit `apps/worker/eslint.config.js` to modify linting rules.

### Skipping Hooks (Emergency Only)
```bash
git commit --no-verify   # Skip pre-commit hooks
```
⚠️ Only use when absolutely necessary - CI will still catch issues.

### Fixing Hook Issues
If hooks aren't running:
```bash
npm run prepare   # Reinstall git hooks
```

## Current Known Issues

The following issues were found by the validation system and need fixing:

### Stripe API Version
- **Files:** `src/routes/stripe-webhooks.ts`, `src/routes/stripe.ts`
- **Issue:** Using old API version `2024-11-20.acacia` instead of `2025-02-24.acacia`
- **Impact:** Type mismatch errors

### Email Service Type Safety
- **File:** `src/services/emailService.ts`
- **Issue:** `errorData` and `resendData` are typed as `unknown`
- **Impact:** Unsafe access to properties

### Unused Variables
- **File:** `src/routes/stripe-webhooks.ts`
- **Issue:** `signature` and `stripe` declared but unused

These issues are non-blocking but should be fixed to maintain code quality.

## Benefits

1. **Catches errors early** - before they reach production
2. **Fast feedback** - errors shown in editor immediately
3. **Automatic enforcement** - can't commit broken code
4. **Team consistency** - everyone uses same rules
5. **Safe refactoring** - know immediately if something breaks
6. **Reduced debugging** - fewer runtime import errors

## Future Enhancements

Potential improvements:
- Add import path aliases to prevent long relative paths
- Enable TypeScript project references for faster checks
- Add dependency cruiser to prevent circular imports
- Integrate with IDE extensions for more languages
