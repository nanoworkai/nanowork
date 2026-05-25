---
description: Fix a GitHub issue by number
allowed-tools: Bash, Read, Edit, Write, Agent
argument-hint: <issue-number>
---

Fix GitHub issue #$ARGUMENTS

## Issue Resolution Plan

1. Fetch issue details using GitHub CLI
2. Analyze the issue requirements
3. Locate relevant code
4. Implement the fix
5. Test the changes
6. Create commit with issue reference
7. Optionally create PR linking to the issue

## Execution Steps

### 1. Fetch Issue
```bash
gh issue view $ARGUMENTS --json title,body,labels,assignees,state
```

### 2. Analyze & Plan
- Read issue description and comments
- Identify affected files/components
- Determine scope (bug fix, feature, refactor)
- Check for related issues or PRs

### 3. Implement Fix
- Make necessary code changes
- Follow existing code patterns
- Add tests if needed
- Update documentation if needed

### 4. Create Commit
```bash
git commit -m "fix: [issue description]

Fixes #$ARGUMENTS

Co-Authored-By: Claude Sonnet 4.5 (1M context) <noreply@anthropic.com>"
```

### 5. Optional PR Creation
Ask user if they want to create a PR that references the issue.

## Notes
- Use `gh issue view <number>` to read full context
- Use `gh issue comment <number>` to add updates
- Use `Fixes #<number>` in commit message to auto-close issue
- Test changes before committing
