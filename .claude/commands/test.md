---
name: test
description: Run tests with optional pattern
type: command
allowed-tools: Bash, Read, Edit, Write
argument-hint: [test-pattern or file]
---

# Test Command

Run tests across the project with optional pattern matching and automatic test fixing.

## Usage

```bash
/test                           # Run all tests
/test LoginForm                 # Run tests matching "LoginForm"
/test src/utils/validation.test.ts  # Run specific test file
/test --watch                   # Run tests in watch mode
/test --fix                     # Run tests and fix failures
```

## What it does

1. **Detect test framework** - Automatically identifies Jest, Vitest, Playwright, etc.
2. **Run tests** - Executes tests matching the provided pattern
3. **Analyze failures** - Parses test output to understand what failed
4. **Fix issues** - Optionally fixes failing tests when `--fix` flag is used
5. **Re-run verification** - Confirms fixes work by re-running tests

## Project Test Setup

### Web App (apps/web)
- **Framework**: Not configured yet (needs setup)
- **Type checking**: `bun run typecheck`
- **Location**: Would be in `apps/web/src/**/*.test.tsx`

### Worker (apps/worker)
- **Framework**: Not configured yet (needs setup)  
- **Type checking**: `npm run typecheck`
- **Location**: Would be in `apps/worker/src/**/*.test.ts`

### E2E Tests
- **Framework**: Playwright (installed)
- **Command**: `npx playwright test`
- **Location**: Would be in `e2e/` or `tests/`

## Test Execution

### Detect Test Framework

Check package.json for test configuration:
```bash
# Check for test scripts
grep -E '"test"|"jest"|"vitest"|"playwright"' package.json apps/*/package.json

# Common frameworks
# - Jest: "@testing-library/jest-dom", "jest"
# - Vitest: "vitest"
# - Playwright: "@playwright/test"
```

### Run Tests

**All tests:**
```bash
npm test
# or
bun test
```

**Pattern matching:**
```bash
# Jest/Vitest pattern
npm test -- LoginForm
npm test -- --testPathPattern=validation

# Playwright pattern
npx playwright test login
npx playwright test --grep "@smoke"
```

**Specific file:**
```bash
npm test -- src/components/LoginForm.test.tsx
```

**Watch mode:**
```bash
npm test -- --watch
```

**Coverage:**
```bash
npm test -- --coverage
```

### Playwright E2E Tests

```bash
# All E2E tests
npx playwright test

# Headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug

# Specific browser
npx playwright test --project=chromium

# UI mode
npx playwright test --ui

# Update snapshots
npx playwright test --update-snapshots
```

## Test Analysis

### Parse Test Failures

When tests fail, analyze output:

**Jest/Vitest failure:**
```
FAIL src/components/LoginForm.test.tsx
  ● LoginForm › validates email input
    
    expect(received).toBe(expected)
    
    Expected: true
    Received: false
    
      12 |   fireEvent.change(input, { target: { value: 'invalid' } });
      13 |   fireEvent.blur(input);
    > 14 |   expect(screen.getByText('Invalid email')).toBe(true);
         |                                              ^
```

**Playwright failure:**
```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for selector ".login-button"
```

### Common Failure Patterns

1. **Assertion failures** - Expected vs received mismatch
2. **Timeout errors** - Elements not found, async operations
3. **Type errors** - TypeScript compilation failures in tests
4. **Mock issues** - Mocked functions not behaving correctly
5. **Snapshot mismatches** - UI or data structure changed

## Auto-Fix Tests (--fix flag)

When `--fix` is provided, attempt to fix common issues:

### 1. Update Snapshots
```bash
npm test -- --updateSnapshot
npx playwright test --update-snapshots
```

### 2. Fix Type Errors
- Add missing imports
- Update types to match implementation
- Fix incorrect assertions

### 3. Fix Timeouts
- Increase timeout for slow operations
- Add proper waits for async operations
- Use `waitFor` utilities correctly

### 4. Fix Mocks
- Update mock return values to match new types
- Fix mock function signatures
- Add missing mock implementations

## Test Writing Guidelines

### Unit Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { validateEmail } from './validation';

describe('validateEmail', () => {
  it('returns true for valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('returns false for invalid email', () => {
    expect(validateEmail('invalid')).toBe(false);
  });

  it('handles edge cases', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('a@b.c')).toBe(true);
  });
});
```

### React Component Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('shows validation error for invalid email', async () => {
    render(<LoginForm />);
    
    const input = screen.getByLabelText('Email');
    fireEvent.change(input, { target: { value: 'invalid' } });
    fireEvent.blur(input);
    
    expect(await screen.findByText('Invalid email')).toBeInTheDocument();
  });
});
```

### Playwright E2E Test

```typescript
import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
  await page.goto('/login');
  
  await page.fill('[name="email"]', 'user@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('.welcome-message')).toBeVisible();
});
```

## Setting Up Tests (if not configured)

### Install Vitest for Web App

```bash
cd apps/web
bun add -d vitest @testing-library/react @testing-library/user-event jsdom
```

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
```

### Configure Playwright

```bash
npx playwright install
```

**playwright.config.ts:**
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
  },
});
```

## CI/CD Integration

Tests should run in CI:

```yaml
# .github/workflows/test.yml
- name: Run type check
  run: bun run typecheck

- name: Run unit tests
  run: bun test

- name: Run E2E tests
  run: npx playwright test
```

## Notes

- **Run tests before committing** - Catch issues early
- **Write tests for bugs** - Prevent regressions
- **Keep tests fast** - Unit tests should be < 100ms
- **E2E tests for critical paths** - Login, checkout, etc.
- **Mock external dependencies** - APIs, databases, third-party services
- **Use test IDs for stability** - `data-testid` over CSS selectors
- **Test user behavior** - Not implementation details

## Troubleshooting

**Tests not found:**
- Check test file naming convention (*.test.ts, *.spec.ts)
- Verify test directory in config

**Import errors:**
- Check tsconfig paths alignment
- Verify test setup file imports

**Timeouts:**
- Increase timeout in test config
- Check for missing awaits on async operations

**Flaky tests:**
- Add proper waits instead of arbitrary sleeps
- Mock time-dependent code
- Isolate test state between tests
