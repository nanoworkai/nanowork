---
description: Create a release pull request with changelog
allowed-tools: Bash, Read, Edit, Write
argument-hint: <version>
---

Create release PR for version $ARGUMENTS

## Release PR Creation Plan

1. Verify current git state is clean
2. Create release branch
3. Generate changelog from commits
4. Update version in package.json files
5. Create PR with release notes

## Execution Steps

### 1. Verify Git State
```bash
git status
git log main..HEAD --oneline
```

### 2. Create Release Branch
```bash
git checkout -b release/v$ARGUMENTS
```

### 3. Generate Changelog
Analyze commits since last release:
```bash
git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"%s" --no-merges
```

Categorize changes:
- ✨ **Features**: new functionality
- 🐛 **Bug Fixes**: corrections
- 🔧 **Improvements**: enhancements
- 📚 **Documentation**: docs updates
- ⚡ **Performance**: optimizations
- 🔒 **Security**: security fixes

### 4. Update Version
Update package.json files in workspace:
```bash
# Root package.json
# apps/web/package.json
# backend/package.json
```

### 5. Create Release Commit
```bash
git add -A
git commit -m "chore: release v$ARGUMENTS

Co-Authored-By: Claude Sonnet 4.5 (1M context) <noreply@anthropic.com>"
```

### 6. Create PR
```bash
gh pr create --title "Release v$ARGUMENTS" --body "$(cat <<'EOF'
## Release v$ARGUMENTS

### Features
- [List new features]

### Bug Fixes
- [List bug fixes]

### Improvements
- [List improvements]

### Breaking Changes
- [List breaking changes if any]

## Testing
- [ ] All tests passing
- [ ] Manual testing completed
- [ ] Staging deployment verified

## Deployment Checklist
- [ ] Database migrations ready
- [ ] Environment variables documented
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Smoke tests passed

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## Notes
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Review all commits since last release
- Ensure tests pass before creating PR
- Tag the release after PR is merged: `git tag v$ARGUMENTS && git push --tags`
