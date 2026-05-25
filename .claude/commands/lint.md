---
name: lint
description: Run linters and code quality checks across the project
type: command
---

# Lint Command

Runs linting and code quality checks for the Nanowork monorepo.

## Usage

```bash
/lint
/lint web       # Only lint web app
/lint worker    # Only lint worker
/lint fix       # Run with auto-fix enabled
```

## What it does

1. **Worker linting**: Runs ESLint on all TypeScript files in `apps/worker/src`
2. **Web type checking**: Runs TypeScript compiler checks on `apps/web/src`
3. **Validation**: Combines both typecheck and lint for full validation

## Implementation

```bash
# Full project lint (default)
npm run lint

# Individual workspace linting
cd apps/worker && npm run lint       # ESLint for worker
cd apps/web && bun run typecheck     # TypeScript for web

# Full validation (typecheck + lint)
bun run validate

# Auto-fix mode
cd apps/worker && npm run lint:fix
```

## Pre-commit hooks

The project uses `lint-staged` with `simple-git-hooks` to automatically lint changed files on commit:

- Worker TypeScript files: runs typecheck and lint
- Web TypeScript/TSX files: runs TypeScript compiler check

## Notes

- The web app currently doesn't have ESLint configured (only TypeScript checking)
- The worker uses ESLint for linting
- Use `npm run validate` to run both typecheck and lint across all workspaces