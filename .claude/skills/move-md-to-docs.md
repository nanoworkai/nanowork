---
description: Move all .md files to the /docs folder
---

# Move Markdown Files to Docs

Move all `.md` files from the repository to the `/docs` folder while preserving the directory structure.

## Instructions

1. Ensure the `/docs` directory exists at the root of the repository
2. Find all `.md` files in the repository (excluding the `/docs` folder itself and `.claude` directory)
3. For each `.md` file found:
   - Calculate the relative path from the repository root
   - Create the corresponding directory structure in `/docs` if needed
   - Move the file to `/docs` preserving its relative path
4. Report a summary of files moved

## Important notes

- Skip files already in `/docs` to avoid infinite loops
- Skip files in `.claude` directory (like skill files)
- Skip hidden directories (starting with `.`)
- Preserve the original directory structure within `/docs`
- Handle spaces in filenames correctly
- Don't move `node_modules`, `.git`, or other dependency directories

## Example

```bash
# If file is at: src/components/README.md
# Move to: docs/src/components/README.md
```
