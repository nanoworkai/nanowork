---
description: Generate a conventional commit message based on staged changes
enabled: true
---

You are helping generate a commit message for the staged changes in this repository.

## Instructions

1. **Analyze the changes**: Run `git diff --staged` to see what will be committed
2. **Check recent commits**: Run `git log --oneline -10` to understand the project's commit message style
3. **Generate a commit message** following this format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type
Use one of these types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (white-space, formatting, etc)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Changes to build process, tools, or dependencies
- `ci`: Changes to CI configuration

### Scope
Optional but recommended. Use the affected module, component, or area (e.g., `api`, `auth`, `ui`, `workers`, `db`)

### Subject
- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize first letter
- No period at the end
- Keep under 72 characters

### Body
- Explain the "what" and "why", not the "how"
- Wrap at 72 characters
- Leave a blank line between subject and body
- Optional if the subject is self-explanatory

### Footer
- Reference issues (e.g., `Closes #123`, `Fixes #456`)
- Note breaking changes (`BREAKING CHANGE: description`)
- Always end with: `Co-Authored-By: Claude Sonnet 4.5 (1M context) <noreply@anthropic.com>`

## Example Output

Present the commit message in a code block that the user can easily copy:

```
feat(auth): add OAuth2 provider support

Implement OAuth2 authentication flow with support for Google and GitHub
providers. This allows users to sign in without creating a new password.

Closes #234
Co-Authored-By: Claude Sonnet 4.5 (1M context) <noreply@anthropic.com>
```

## Important Notes

- Focus on being concise but informative
- Match the existing commit style of the repository
- If there are no staged changes, let the user know
- Don't include file paths or technical implementation details in the subject line
- The commit message should help reviewers understand the change at a glance
