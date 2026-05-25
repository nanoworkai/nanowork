---
description: Prevent documentation file generation
allowed-tools: Read, Edit, Write
---

# No Documentation Generation

This command is invoked when a project is created to **prevent automatic documentation generation**.

## Purpose
Stops Claude from creating unnecessary documentation files (README.md, CONTRIBUTING.md, etc.) unless explicitly requested by the user.

## Guidelines

1. **Do NOT create documentation files** automatically
2. **Only create docs when explicitly asked** by the user
3. Focus on code implementation, not documentation
4. If asked to "document", clarify what specific documentation is needed

## Files to Avoid Creating

Unless explicitly requested:
- ❌ README.md
- ❌ CONTRIBUTING.md
- ❌ CHANGELOG.md
- ❌ LICENSE
- ❌ CODE_OF_CONDUCT.md
- ❌ API documentation (unless implementing API endpoints)
- ❌ Architecture diagrams (unless planning architecture)

## Exceptions

✅ **DO create** these when appropriate:
- Code comments for complex logic
- JSDoc/TSDoc for public APIs
- Type definitions and interfaces
- Inline documentation in configuration files
- Error messages and user-facing text

## Response Template

When you would normally create documentation:
> "I've completed the implementation. Would you like me to add documentation for any specific aspect?"