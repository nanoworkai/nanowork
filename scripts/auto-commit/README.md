# Auto-Commit

Intelligent git auto-commit tool with AI-generated commit messages powered by Claude.

## Features

- **AI-Generated Commit Messages**: Uses Claude to analyze diffs and generate meaningful, conventional commit messages
- **Smart File Watching**: Monitors your repository for changes and auto-commits when appropriate
- **Batch Commit Splitting**: Intelligently splits large change sets into focused, atomic commits
- **Conventional Commits**: Follows the conventional commits specification
- **TypeScript**: Fully typed for better developer experience

## Quick Start

```bash
cd scripts/auto-commit
npm install
npm run build
```

## Installation

### Local Installation

```bash
cd scripts/auto-commit
npm install
npm run build
```

### Environment Setup

Create a `.env` file in the auto-commit directory:

```bash
ANTHROPIC_API_KEY=your_api_key_here
```

Or export the environment variable:

```bash
export ANTHROPIC_API_KEY=your_api_key_here
```

## Usage

### Start Auto-Commit Watcher

Monitor your repository and automatically commit changes:

```bash
npm start -- start
# or with custom options
npm start -- start --watch-path /path/to/repo --interval 300
```

Options:
- `--watch-path <path>`: Path to repository to watch (default: current directory)
- `--interval <seconds>`: Time between commits in seconds (default: 300)
- `--ignore <patterns>`: Comma-separated list of patterns to ignore

### Split Large Changes

Split your current uncommitted changes into multiple focused commits:

```bash
npm start -- split <max-commits>
# Example: split into up to 10 commits
npm start -- split 10
```

Options:
- `--dry-run`: Preview commits without actually creating them
- `--max-files <number>`: Maximum files per commit (default: 5)

### Generate Commit Message

Generate a commit message for staged changes without committing:

```bash
npm start -- message
```

### Development Mode

Run in development mode with hot reload:

```bash
npm run dev
```

## Configuration

### Configuration File

Create a `.auto-commit.json` file in your repository root:

```json
{
  "enabled": true,
  "interval": 300,
  "maxFilesPerCommit": 5,
  "ignorePatterns": [
    "node_modules/**",
    "dist/**",
    "*.log",
    ".env*"
  ],
  "commitMessageTemplate": {
    "type": "conventional",
    "maxLength": 72,
    "includeScope": true
  },
  "autoStage": true,
  "smartSplitting": true
}
```

### CLI Options

All configuration options can be overridden via CLI flags:

```bash
npm start -- start \
  --interval 600 \
  --max-files 3 \
  --ignore "*.tmp,*.log"
```

## Architecture

### Core Components

```
src/
├── cli.ts              # CLI entry point and argument parsing
├── index.ts            # Main orchestration logic
├── watcher.ts          # File watching and change detection
├── commit-splitter.ts  # Intelligent commit splitting logic
├── ai-service.ts       # Claude AI integration
├── git-service.ts      # Git operations wrapper
└── utils.ts            # Shared utilities
```

### How It Works

1. **File Watching**: Chokidar monitors the repository for file changes
2. **Change Detection**: When changes are detected, waits for a stable period (no new changes)
3. **Diff Analysis**: Retrieves git diff and analyzes changes
4. **AI Processing**: Sends diff to Claude to generate commit message
5. **Smart Staging**: Groups related changes together
6. **Commit Creation**: Creates atomic commits with AI-generated messages

### Commit Message Generation

The tool uses Claude to analyze git diffs and generate commit messages following these principles:

- **Conventional Commits**: Uses types like `feat:`, `fix:`, `docs:`, etc.
- **Atomic Changes**: Each commit represents a single logical change
- **Descriptive**: Clear, concise description of what changed and why
- **Context-Aware**: Considers file paths, change patterns, and code context

Example generated messages:
```
feat(auth): add JWT token refresh mechanism
fix(api): handle null response in user endpoint
docs(readme): update installation instructions
refactor(utils): simplify date formatting logic
```

## Examples

### Example 1: Basic Auto-Commit

```bash
cd scripts/auto-commit
npm install
npm run build

# Start watching your repository
npm start -- start

# Make changes to your code...
# Commits are created automatically every 5 minutes
```

### Example 2: Split Large Refactor

```bash
# You've made 50 file changes in a big refactor
git status
# Shows many modified files

# Split into focused commits
npm start -- split 15

# Result: 15 commits, each with related changes and clear messages
```

### Example 3: Custom Configuration

```bash
# Watch specific directory with custom interval
npm start -- start \
  --watch-path /Users/jordan/Dev/nanowork-web \
  --interval 180 \
  --ignore "*.test.ts,*.spec.ts"
```

### Example 4: Preview Mode

```bash
# See what commits would be created without actually committing
npm start -- split 10 --dry-run
```

## Troubleshooting

### Issue: "ANTHROPIC_API_KEY not found"

**Solution**: Set your API key in environment:
```bash
export ANTHROPIC_API_KEY=your_key_here
```
Or create a `.env` file in the auto-commit directory.

### Issue: "No changes detected"

**Solution**: Ensure you have uncommitted changes:
```bash
git status
```
If using `split`, you need unstaged or uncommitted changes.

### Issue: "Permission denied" on git operations

**Solution**: Ensure the tool has access to your git repository:
```bash
# Check git config
git config --list

# Ensure you can commit manually
git commit --allow-empty -m "test"
```

### Issue: TypeScript compilation errors

**Solution**: Clean and rebuild:
```bash
npm run clean
npm install
npm run build
```

### Issue: File watching not working

**Solution**: Check if chokidar can access your files:
```bash
# Test file access
ls -la /path/to/repo

# Try with verbose logging
DEBUG=chokidar:* npm start -- start
```

## Advanced Usage

### Git Hooks Integration

Install git hooks to prevent manual commits:

```bash
npm run install-hooks
```

This adds a pre-commit hook that validates commit messages follow conventions.

### CI/CD Integration

Use in CI/CD pipelines to auto-commit generated files:

```bash
# In your CI script
cd scripts/auto-commit
npm ci
npm run build

# Generate and commit updated files
npm start -- split 1 --max-files 999
```

### Multiple Repository Monitoring

Watch multiple repositories:

```bash
# Terminal 1
npm start -- start --watch-path /path/to/repo1

# Terminal 2
npm start -- start --watch-path /path/to/repo2
```

## Best Practices

1. **Review Generated Commits**: Always review AI-generated commits before pushing
2. **Use Dry Run**: Test with `--dry-run` first on large change sets
3. **Configure Ignores**: Set up `.auto-commit.json` to ignore build artifacts
4. **Reasonable Intervals**: Don't set interval too low (< 60 seconds)
5. **Atomic Commits**: Use split command for focused, reviewable commits
6. **Backup First**: Commit or stash important work before using split

## Performance

- **File Watching**: Minimal CPU usage, event-driven architecture
- **AI API Calls**: Cached for similar diffs, typically < 2 seconds per commit
- **Git Operations**: Uses simple-git for efficient git interactions
- **Memory**: Lightweight, typically < 50MB RAM usage

## Security

- **API Keys**: Never commit API keys, use environment variables
- **Sensitive Files**: Configure ignore patterns for secrets
- **Code Review**: Always review commits before pushing to remote
- **Local Only**: By default, only commits locally (no auto-push)

## Contributing

This is an internal tool for the nanowork-web project. To contribute:

1. Make changes in `src/`
2. Test with `npm run dev`
3. Build with `npm run build`
4. Document changes in this README

## License

MIT

## Changelog

### v1.0.0 (2026-05-24)
- Initial release
- AI-powered commit message generation
- File watching and auto-commit
- Batch commit splitting
- TypeScript support
- Conventional commits support
