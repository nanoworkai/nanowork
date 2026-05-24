---
description: Automatically commit changes every 60 seconds when files are modified
schedule: "*/1 * * * *"
---

# Auto-commit skill

Check for uncommitted changes and create a commit if any exist.

## Instructions

1. Run `git status --porcelain` to check for changes
2. If there are any changes (staged or unstaged):
   - Stage all changes with `git add -A`
   - Create a commit with timestamp: `git commit -m "auto: <timestamp>"`
   - Report what was committed
3. If no changes, silently continue (no output needed)

## Important notes

- Only commit if there are actual changes
- Use a clear commit message with timestamp for easy identification
- Skip if git repository is in a conflicted or invalid state
