---
description: Prevent documentation file generation and clean up existing docs
allowed-tools: Read, Edit, Write, Bash, Glob
---

# No Documentation Generation & Cleanup

This command is invoked to:
1. **Prevent automatic documentation generation** going forward
2. **Clean up existing documentation files** (except README.md)

## Purpose
- Stops Claude from creating unnecessary documentation files
- Removes bloated documentation from the project
- Keeps only the essential README.md file
- Focus on code implementation, not documentation

## Two-Phase Operation

### Phase 1: Clean Up Existing Documentation

When invoked, scan for and **delete** these common documentation files:

**Files to Delete** (case-insensitive, except README.md):
- ❌ CONTRIBUTING.md / Contributing.md / contributing.md
- ❌ CHANGELOG.md / Changelog.md / changelog.md
- ❌ LICENSE / License / license.txt
- ❌ CODE_OF_CONDUCT.md / code_of_conduct.md
- ❌ SECURITY.md / security.md
- ❌ AUTHORS.md / authors.md
- ❌ CONTRIBUTORS.md / contributors.md
- ❌ INSTALL.md / install.md
- ❌ USAGE.md / usage.md
- ❌ FAQ.md / faq.md
- ❌ SUPPORT.md / support.md
- ❌ ROADMAP.md / roadmap.md

**Protect README** (all case variations):
- ✅ Keep: README.md
- ✅ Keep: readme.md
- ✅ Keep: Readme.md
- ✅ Keep: ReadMe.md
- ✅ Keep: README.MD

**Scan Locations**:
```bash
# Root directory
./CONTRIBUTING.md
./CHANGELOG.md
./LICENSE

# docs/ directory (if exists)
./docs/CONTRIBUTING.md
./docs/guide.md
./docs/api.md

# Common doc folders
./.github/CONTRIBUTING.md
```

### Phase 2: Prevention Mode

After cleanup, set prevention guidelines:

1. **Do NOT create documentation files** automatically
2. **Only create docs when explicitly asked** by the user
3. Focus on code implementation, not documentation
4. If asked to "document", clarify what specific documentation is needed

## Execution Workflow

### Step 1: Scan for Documentation Files

```bash
# Find all documentation files (case-insensitive)
find . -maxdepth 3 -type f \
  \( -iname "contributing.md" \
  -o -iname "changelog.md" \
  -o -iname "license*" \
  -o -iname "code_of_conduct.md" \
  -o -iname "security.md" \
  -o -iname "authors.md" \
  -o -iname "contributors.md" \
  -o -iname "install.md" \
  -o -iname "usage.md" \
  -o -iname "faq.md" \
  -o -iname "support.md" \
  -o -iname "roadmap.md" \) \
  | grep -v node_modules \
  | grep -v ".git"
```

### Step 2: Confirm Deletion

Before deleting, show the user what will be removed:

```
Found the following documentation files:
- ./CONTRIBUTING.md (2.3 KB)
- ./CHANGELOG.md (15.7 KB)
- ./LICENSE (1.1 KB)
- ./docs/api.md (8.4 KB)

Total: 4 files, 27.5 KB

⚠️  README.md will be preserved.

Proceed with deletion? (yes/no)
```

### Step 3: Execute Deletion

Only after user confirmation:

```bash
# Delete files (preserve README in any case)
find . -maxdepth 3 -type f \
  \( -iname "contributing.md" \
  -o -iname "changelog.md" \
  -o -iname "license*" \
  -o -iname "code_of_conduct.md" \
  -o -iname "security.md" \
  -o -iname "authors.md" \
  -o -iname "contributors.md" \
  -o -iname "install.md" \
  -o -iname "usage.md" \
  -o -iname "faq.md" \
  -o -iname "support.md" \
  -o -iname "roadmap.md" \) \
  ! -iname "readme.md" \
  -exec rm {} \;
```

### Step 4: Confirm Results

```
✅ Deleted 4 documentation files
✅ README.md preserved
✅ Documentation prevention mode activated

Going forward, I will:
- Focus on code implementation
- Not create documentation files automatically
- Ask before adding any documentation
```

## Exceptions

✅ **DO create** these when appropriate:
- Code comments for complex logic
- JSDoc/TSDoc for public APIs
- Type definitions and interfaces
- Inline documentation in configuration files
- Error messages and user-facing text
- Technical documentation in `.claude/` folder

✅ **ALWAYS preserve**:
- README.md (any case variation)
- Technical specs in `.claude/`
- API documentation that's part of code (JSDoc, etc.)
- Generated documentation (like TypeDoc output in dist/)

## Safety Rules

1. **Always ask for confirmation** before deleting files
2. **Show file list and sizes** before deletion
3. **Never delete README.md** (case-insensitive protection)
4. **Skip node_modules** and `.git` folders
5. **Limit scan depth** to 3 levels to avoid deep recursion
6. **Create backup recommendation** if large files found

## Response Templates

### When scanning finds files:
> "Found 4 documentation files (27.5 KB total) that can be removed. README.md will be preserved. Review the list above. Should I proceed with deletion?"

### After successful cleanup:
> "✅ Deleted 4 documentation files. README.md preserved. Documentation prevention mode is now active."

### If no docs found:
> "✅ No unnecessary documentation files found. README.md exists and is preserved. Documentation prevention mode is now active."

### When user asks to document later:
> "I've completed the implementation. Would you like me to add documentation for any specific aspect?"

## Advanced Options

### Dry Run Mode
```bash
/nodocs --dry-run
# Shows what would be deleted without actually deleting
```

### Aggressive Mode
```bash
/nodocs --aggressive
# Includes deeper scans and more file types
# Also removes .github/FUNDING.yml, .github/ISSUE_TEMPLATE/, etc.
```

### Preserve Specific Files
```bash
/nodocs --keep LICENSE
# Delete all docs except README.md and LICENSE
```

## Usage Examples

### Basic Usage
```bash
/nodocs
# Scan, show files, ask for confirmation, delete
```

### Quick Start (New Project)
```bash
/nodocs
# Clean up generated docs from project templates
```

### Maintenance (Existing Project)
```bash
/nodocs
# Remove accumulated documentation bloat
```