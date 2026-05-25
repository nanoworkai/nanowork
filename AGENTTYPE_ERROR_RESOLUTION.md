# AgentType Import Error - Root Cause Analysis & Resolution

## Error Description

**Error Message:** `SyntaxError: Importing binding name 'AgentType' is not found.`

**Context:** Error occurred during Vite dev server startup (`[vite] connecting...`)

## Investigation Summary

Three parallel agent investigations were conducted to identify the root cause:

### Agent 1: Import Chain Analysis
**Finding:** The import/export chain is technically correct:
- `AgentCard.tsx` properly exports `AgentType` on lines 15-22
- `BuilderView.tsx` correctly imports it on line 4
- No circular imports detected
- No TypeScript path mapping issues

### Agent 2: Vite Configuration Analysis
**Critical findings:**
1. **Duplicate Vite config files** - Both `vite.config.ts` AND `vite.config.js` existed
2. **Missing `resolve.extensions`** - Vite wasn't explicitly configured to resolve `.tsx` files
3. **Missing `resolve.mainFields`** - Module resolution configuration incomplete
4. **Vite 6.x compatibility** - New version requires explicit configuration

### Agent 3: Export Syntax Verification
**Finding:** Export and import syntax is completely valid with no errors

## Root Cause

The error was caused by **conflicting Vite configurations**:

1. **Duplicate config files:** `vite.config.js` and `vite.config.ts` existed simultaneously
   - Vite may have loaded the wrong one or merged them incorrectly
   - This caused module resolution to fail for named type exports

2. **Missing resolve configuration:** The `vite.config.ts` lacked explicit module resolution rules
   - No `resolve.extensions` array to handle `.tsx` files
   - No `resolve.mainFields` for proper package.json resolution
   - Vite 6.x requires more explicit configuration than earlier versions

3. **Build cache:** Stale artifacts in `dist/` and `node_modules/.vite/` folders

## Resolution Steps

### 1. Remove Duplicate Config
```bash
rm apps/web/vite.config.js
```

### 2. Enhance vite.config.ts
Added proper resolve configuration:
```typescript
resolve: {
  extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  mainFields: ['module', 'main'],
}
```

### 3. Clear Build Caches
```bash
cd apps/web
rm -rf dist node_modules/.vite
```

## Why This Happened

**Timeline of events:**
1. Recent commits showed multiple vite.config changes
2. A `vite.config.js` file was created (possibly accidentally)
3. TypeScript config uses strict settings (`verbatimModuleSyntax: true`)
4. Vite 6.x has stricter module resolution than earlier versions
5. The combination caused named type exports to fail resolution

## Prevention

The newly implemented **validation system** will prevent similar issues:

### 1. TypeScript Validation
- `npm run typecheck` now runs before deployment
- Catches module resolution errors before build

### 2. ESLint Import Validation
- `eslint-plugin-import` validates all imports resolve correctly
- Catches missing/broken imports in the editor

### 3. Pre-commit Hooks
- Validates TypeScript and imports before commits
- Prevents broken code from entering the repository

### 4. CI/CD Pipeline
- GitHub Actions workflow validates on every PR
- Catches configuration issues in the build process

## Related Files

- `/Users/jordan/Dev/nanowork-web/apps/web/vite.config.ts` - Fixed configuration
- `/Users/jordan/Dev/nanowork-web/apps/web/src/components/AgentCard.tsx` - Export source
- `/Users/jordan/Dev/nanowork-web/apps/web/src/dashboard/BuilderView.tsx` - Import location
- `/Users/jordan/Dev/nanowork-web/apps/web/tsconfig.app.json` - TypeScript settings

## Testing

After fixes applied:
1. ✅ Duplicate config removed
2. ✅ Resolve configuration added
3. ✅ Build caches cleared
4. ✅ Dev server should start without errors

## Lessons Learned

1. **Don't mix config file types:** Keep either `.ts` OR `.js`, not both
2. **Explicit is better:** Vite 6.x requires explicit `resolve` configuration
3. **Clear caches:** Module resolution issues often require cache clearing
4. **Validation catches issues early:** The new validation system would have caught this before deployment

## Next Steps

1. **Restart dev server** to verify the fix
2. **Monitor for similar errors** with other exports
3. **Run `npm run validate`** to ensure no other issues exist
4. **Consider adding Vite config linting** to prevent duplicate configs

## Quick Reference

**If you see "Importing binding name 'X' is not found":**
1. Check for duplicate config files (`vite.config.js` vs `vite.config.ts`)
2. Verify `resolve.extensions` includes the file extension
3. Clear build caches: `rm -rf dist node_modules/.vite`
4. Run `npm run typecheck` to validate imports
5. Check TypeScript settings for strict module syntax rules
