---
description: Auto-label GitHub issues based on content analysis
allowed-tools: Bash, Read
argument-hint: [issue-numbers or 'all']
---

Label GitHub issues: $ARGUMENTS

## Auto-Labeling Strategy

Analyze issue content and apply appropriate labels based on keywords, patterns, and context.

## Label Categories

### Type Labels
- `bug` - Something isn't working
- `feature` - New feature request
- `enhancement` - Improvement to existing feature
- `documentation` - Documentation updates
- `refactor` - Code refactoring
- `performance` - Performance improvements
- `security` - Security-related issues

### Priority Labels
- `priority: critical` - Production broken, security issue
- `priority: high` - Important, affects many users
- `priority: medium` - Should be fixed soon
- `priority: low` - Nice to have

### Component Labels
- `backend` - Backend/API related
- `frontend` - Frontend/UI related
- `database` - Database schema or queries
- `deployment` - CI/CD, hosting, infrastructure
- `auth` - Authentication/authorization
- `billing` - Stripe, payments, subscriptions

### Status Labels
- `needs-investigation` - Requires more info
- `good-first-issue` - Good for newcomers
- `help-wanted` - Community help appreciated
- `wontfix` - Will not be addressed
- `duplicate` - Duplicate of another issue

## Execution Steps

### 1. Fetch Issues
```bash
# Single issue
gh issue view $ARGUMENTS --json title,body,labels

# Multiple issues
for issue in $ARGUMENTS; do
  gh issue view $issue --json title,body,labels
done

# All open issues
gh issue list --state open --json number,title,body,labels --limit 100
```

### 2. Analyze Content

For each issue, look for:

**Bug Indicators**
- Keywords: "error", "broken", "crash", "not working", "fail"
- Stack traces, error messages
- Steps to reproduce

**Feature Indicators**
- Keywords: "add", "new", "feature request", "would be nice"
- User stories ("As a user, I want...")

**Component Detection**
- Mentions of: API, endpoint, backend, server → `backend`
- Mentions of: UI, button, page, component → `frontend`
- Mentions of: database, query, schema, migration → `database`
- Mentions of: deploy, build, CI, hosting → `deployment`
- Mentions of: login, auth, permissions, signup → `auth`
- Mentions of: payment, stripe, subscription, billing → `billing`

**Priority Detection**
- Production down, security breach → `priority: critical`
- Many users affected, blocking → `priority: high`
- Inconvenient but not blocking → `priority: medium`
- Nice to have, minor issue → `priority: low`

### 3. Apply Labels
```bash
gh issue edit <number> --add-label "bug,backend,priority: high"
```

### 4. Add Comment
Optionally add a comment explaining the auto-labeling:
```bash
gh issue comment <number> --body "🤖 Auto-labeled as: bug, backend, priority: high based on content analysis"
```

## Example Analysis

**Issue Title**: "API returns 500 error when creating agent"
**Issue Body**: Contains stack trace, mentions `/api/agents` endpoint
**Labels**: `bug`, `backend`, `priority: high`

**Issue Title**: "Add dark mode to dashboard"
**Issue Body**: Feature request for UI theming
**Labels**: `feature`, `frontend`, `priority: medium`

**Issue Title**: "Improve email processing performance"
**Issue Body**: Current processing is slow, affects users
**Labels**: `enhancement`, `performance`, `backend`, `priority: high`

## Notes
- Review auto-labels before applying to avoid mistakes
- Ask user for confirmation on ambiguous issues
- Use `gh label list` to see available labels
- Create new labels if needed: `gh label create "new-label" --color "ff0000"`
- Batch labeling: process multiple issues efficiently
