---
description: Remove bloat and optimize codebase after major commits
allowed-tools: Read, Edit, Write, Bash, Agent, Glob
model: claude-sonnet-4-20250514
---

# Codebase Optimization & Bloat Removal

After major commits to the codebase, this command launches subagents to analyze and remove bloat from primary project folders.

## Purpose
- Identify and remove unused code, imports, and dependencies
- Optimize file sizes and bundle performance
- Clean up commented-out code and debug logs
- Standardize code patterns and remove duplication
- Improve overall code health

## Target Directories

### 1. Applications (`apps/`)
```bash
apps/web/src/        # Frontend application
apps/worker/src/     # Cloudflare Worker
```

### 2. Backend (`backend/`)
```bash
backend/src/         # Express backend server
```

### 3. Documentation (`docs/`)
```bash
docs/                # Project documentation
```

### 4. Configuration Files
```bash
*.config.js
*.config.ts
package.json files
```

## Optimization Process

### Phase 1: Analysis

**Unused Imports**
```bash
# Find unused imports in TypeScript files
grep -r "^import.*from" apps/web/src backend/src | analyze
```

**Unused Functions/Components**
```bash
# Find exported but never imported items
find . -name "*.ts" -o -name "*.tsx" | xargs grep "^export"
```

**Dead Code**
- Commented-out code blocks
- Unreachable code after returns
- Unused variables (check TypeScript errors)
- Debug console.logs in production

**Large Files**
```bash
# Find files > 500 lines that might need splitting
find apps/web/src backend/src -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn | head -20
```

**Duplicate Code**
- Similar function implementations
- Copy-pasted components with minor variations
- Repeated logic that could be abstracted

### Phase 2: Cleanup Actions

#### Remove Unused Imports
```typescript
// Before
import { useState, useEffect, useMemo } from 'react';
import { format, parse } from 'date-fns';
import { apiClient } from './api';

// After (only used imports)
import { useState, useEffect } from 'react';
import { apiClient } from './api';
```

#### Remove Commented Code
```typescript
// Remove blocks like:
// function oldImplementation() {
//   return 'deprecated';
// }

// Keep only TODO comments with context:
// TODO(jordan): Implement pagination after API supports it
```

#### Remove Debug Logs
```typescript
// Remove development-only logs:
console.log('Debug:', data);
console.debug('State:', state);

// Keep error logs and warnings:
console.error('Failed to fetch:', error);
console.warn('Deprecated API usage');
```

#### Optimize Imports
```typescript
// Before: Individual imports
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';

// After: Barrel imports (if available)
import { Button, Card, Input } from '../components';
```

### Phase 3: Bundle Optimization

**Check Bundle Size**
```bash
cd apps/web
bun run build
# Analyze dist/ output size
du -sh dist/assets/*.js | sort -h
```

**Identify Heavy Dependencies**
```bash
# Check node_modules size
du -sh node_modules/* | sort -h | tail -20
```

**Lazy Load Routes**
```typescript
// Convert static imports to lazy loading
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
```

### Phase 4: Code Quality

**Standardize Patterns**
- Consistent error handling
- Uniform API call patterns
- Standard component structure
- Consistent styling approach

**Remove Magic Numbers**
```typescript
// Before
setTimeout(callback, 300);
array.slice(0, 10);

// After
const DEBOUNCE_DELAY = 300;
const MAX_ITEMS = 10;
setTimeout(callback, DEBOUNCE_DELAY);
array.slice(0, MAX_ITEMS);
```

**Extract Repeated Logic**
```typescript
// Before: Repeated in 5 files
const handleError = (error) => {
  console.error(error);
  toast.error(error.message);
};

// After: Shared utility
import { handleApiError } from '@/lib/errors';
```

## Execution Strategy

### Option 1: Sequential Review (Thorough)
```bash
# Analyze each directory one by one
/optimize apps/web
/optimize apps/worker  
/optimize backend
/optimize docs
```

### Option 2: Parallel Agents (Fast)
Launch multiple agents simultaneously:

```typescript
// Apps optimization
Agent({
  description: "Optimize web app",
  prompt: "Remove bloat from apps/web/src following optimization guidelines",
  isolation: "worktree",
  run_in_background: true
});

// Backend optimization
Agent({
  description: "Optimize backend",
  prompt: "Remove bloat from backend/src following optimization guidelines",
  isolation: "worktree",
  run_in_background: true
});

// Docs cleanup
Agent({
  description: "Clean up docs",
  prompt: "Remove outdated documentation and ensure consistency",
  run_in_background: true
});
```

### Option 3: Focused Optimization
Optimize specific aspects:
```bash
/optimize imports    # Just unused imports
/optimize logs       # Just debug logs
/optimize duplicates # Just code duplication
/optimize bundle     # Just bundle size
```

## Checklist

After optimization, verify:

- [ ] `npm run typecheck` passes with no errors
- [ ] `npm run lint` passes (or errors reduced)
- [ ] `npm run build` completes successfully
- [ ] Bundle size reduced (check dist/ folder)
- [ ] No broken imports or missing dependencies
- [ ] Tests still pass (if tests exist)
- [ ] Application still runs correctly
- [ ] No unintended behavior changes

## Safety Rules

**Never Remove:**
- ✅ Error handling code
- ✅ Type definitions that might be used by tooling
- ✅ Public API exports (even if unused internally)
- ✅ Configuration that might be environment-specific
- ✅ Comments explaining WHY (only remove WHAT comments)

**Always Verify:**
- Run type checking after removing imports
- Test critical user flows after changes
- Check git diff before committing
- Ensure no breaking changes to APIs

## Output Report

After optimization, provide:

```markdown
# Optimization Report

## Summary
- Files analyzed: 234
- Lines removed: 1,847
- Unused imports removed: 67
- Commented code removed: 23 blocks
- Debug logs removed: 89
- Bundle size: 2.3MB → 1.8MB (-21%)

## Changes by Category

### Unused Imports (67)
- apps/web/src/components/Button.tsx: 3 imports
- apps/web/src/pages/Dashboard.tsx: 5 imports
[...]

### Dead Code (23 blocks)
- backend/src/routes/legacy-api.ts: Removed 145 lines
[...]

### Debug Logs (89)
- Removed from 34 files
[...]

## Recommendations

1. Consider lazy loading Dashboard page (400KB)
2. Replace moment.js with date-fns (smaller bundle)
3. Enable tree-shaking for lodash imports

## Files Modified
[List of changed files]
```

## Usage Examples

```bash
# Full optimization
/optimize

# Specific directory
/optimize apps/web

# Specific aspect  
/optimize imports

# With safety checks
/optimize --verify

# Parallel mode
/optimize --parallel
```
