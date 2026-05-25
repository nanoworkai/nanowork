---
name: fix-github-issue
description: Fix a GitHub issue by number
type: command
allowed-tools: Bash, Read, Edit, Write, Agent
argument-hint: <issue-number>
---

# Fix GitHub Issue Command

Automatically fetch, analyze, fix, and close a GitHub issue.

## Usage

```bash
/fix-github-issue 123
/fix-github-issue 42
```

## What it does

This command automates the entire workflow for fixing a GitHub issue:

1. **Fetch issue details** - Retrieves full issue context including title, body, labels, comments, and metadata
2. **Analyze requirements** - Understands what needs to be fixed and the scope of work
3. **Locate relevant code** - Finds the files and components that need changes
4. **Implement the fix** - Makes necessary code changes following project patterns
5. **Validate changes** - Runs tests and validation where applicable
6. **Commit with reference** - Creates a properly formatted commit that will auto-close the issue
7. **Optionally create PR** - Can create a pull request linking to the issue

## Implementation

### Step 1: Fetch Issue Details

```bash
gh issue view $ARGUMENTS --json title,body,labels,assignees,state,comments,author
```

Retrieves complete issue information including:
- Title and description
- Labels (bug, feature, enhancement, etc.)
- Current state and assignees
- All comments and discussion
- Author information

### Step 2: Analyze & Plan

- Parse the issue description to understand the problem
- Identify if it's a bug fix, feature request, or refactor
- Check labels for priority and type indicators
- Review comments for additional context or clarification
- Check for related issues or existing PRs
- Determine affected files/components using codebase search

### Step 3: Locate Relevant Code

Use a combination of:
- `grep` for finding relevant functions/variables mentioned in issue
- `find` for locating related files
- Read existing code to understand current implementation
- Check git history if issue mentions a regression

### Step 4: Implement the Fix

- Make code changes following project conventions
- Ensure changes match the issue requirements
- Follow existing patterns in the codebase
- Add or update tests if the issue involves testable logic
- Update comments/documentation only if necessary (avoid over-documenting)

### Step 5: Validate Changes

Depending on the project:
- Run type checking: `bun run typecheck`
- Run linting: `npm run lint`
- Run tests: `bun test` or relevant test command
- Manual validation if it's a UI/UX change

### Step 6: Create Commit

Create a well-formatted commit message:

```bash
git add <changed-files>
git commit -m "$(cat <<'EOF'
fix: <short description of fix>

<optional longer explanation if needed>

Fixes #$ARGUMENTS

Co-Authored-By: Claude Sonnet 4.5 (1M context) <noreply@anthropic.com>
EOF
)"
```

**Commit message guidelines:**
- Use conventional commit format: `fix:`, `feat:`, `refactor:`, etc.
- Keep first line under 70 characters
- Include `Fixes #<number>` to auto-close the issue when merged
- Add explanation only if the "why" isn't obvious from the code

### Step 7: Optional PR Creation

Ask the user if they want to create a PR:

```bash
gh pr create --title "Fix: <issue title>" --body "$(cat <<'EOF'
## Summary
Fixes #$ARGUMENTS

<brief description of changes>

## Changes Made
- <change 1>
- <change 2>

## Testing
<how the fix was validated>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## Issue Comment Updates

Optionally add a comment to the issue to provide status updates:

```bash
gh issue comment $ARGUMENTS --body "Working on this issue. Will update with a fix shortly."
```

## Examples

### Bug Fix Example
```bash
/fix-github-issue 45
# Fetches issue #45 about a broken login form
# Identifies the validation bug in apps/web/src/components/auth/LoginForm.tsx
# Fixes the validation logic
# Adds a test case
# Commits: "fix: correct email validation in login form\n\nFixes #45"
```

### Feature Request Example
```bash
/fix-github-issue 78
# Fetches issue #78 requesting dark mode toggle
# Implements dark mode state management
# Updates UI components with theme support
# Commits: "feat: add dark mode toggle\n\nFixes #78"
```

## Notes

- **GitHub CLI required**: Ensure `gh` is installed and authenticated
- **Auto-close on merge**: Using `Fixes #<number>` in commit message will automatically close the issue when the commit is merged to main
- **Branch strategy**: Consider creating a new branch like `fix/issue-123` for the work
- **Don't over-scope**: Focus on fixing exactly what the issue asks for, avoid refactoring unrelated code
- **Ask for clarification**: If the issue is unclear, ask the user for clarification before implementing
- **Check for duplicates**: Look for related open issues or existing PRs before starting work

## Alternative Keywords

Instead of `Fixes #<number>`, you can use:
- `Closes #<number>`
- `Resolves #<number>`
- `Fixes #<number>`

All will auto-close the issue on merge.

## Troubleshooting

**Issue not found**: Verify the issue number and that you have access to the repository
**gh not authenticated**: Run `gh auth login` to authenticate
**Permission denied**: Ensure you have write access to the repository
**Issue already closed**: Check if someone else has already fixed it
