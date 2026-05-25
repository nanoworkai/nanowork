---
description: Run tests with optional pattern
allowed-tools: Bash, Read, Edit
argument-hint: [test-pattern]
---

Run tests matching pattern: $ARGUMENTS

## Test Execution Plan

1. Detect test framework (Jest, Vitest, pytest, etc.)
2. Run tests with the provided pattern
3. If tests fail, analyze the failures
4. Fix failing tests if requested
5. Re-run to verify fixes

## Current Context

- Test framework: Detect from package.json
- Pattern: $1
- Working directory: !`pwd`
