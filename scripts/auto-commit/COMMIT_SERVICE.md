# Commit Service Documentation

## Overview

The Commit Service is an intelligent Git commit automation tool that uses Claude AI (Anthropic) to analyze code changes and generate meaningful, conventional commit messages. It groups related files together and creates atomic commits automatically.

## Features

- **AI-Powered Commit Messages**: Uses Claude Sonnet 4 to analyze diffs and generate contextual commit messages
- **Intelligent File Grouping**: Automatically groups related files (e.g., component + test + style files)
- **Conventional Commits**: Follows the Conventional Commits specification (feat, fix, refactor, etc.)
- **Atomic Commits**: Splits large changes into logical, focused commits
- **Smart Categorization**: Categorizes files by type (docs, config, test, source, etc.)
- **Rate Limiting**: Built-in API rate limiting to prevent quota exhaustion
- **Dry Run Mode**: Test commit generation without actually committing
- **Statistics Tracking**: Track commit success rates, API usage, and errors

## Installation

```bash
cd scripts/auto-commit
npm install
```

## Configuration

The service reads the `ANTHROPIC_API_KEY` from `/backend/.env`. Make sure this is set:

```bash
# In backend/.env
ANTHROPIC_API_KEY=sk-ant-api03-...
```

You can also pass the API key directly in the config:

```typescript
const service = new CommitService({
  apiKey: 'your-api-key-here'
});
```

## Usage

### As a CLI Tool

Run directly on current repository changes:

```bash
# Dry run (shows what would be committed)
npm run commit:dry

# Actual commit
npm run commit

# Verbose output
npm run commit:verbose

# Or use tsx directly
tsx commit-service.ts --dry-run
tsx commit-service.ts --verbose
```

### As a Module

```typescript
import { CommitService, getChangedFiles } from './commit-service';

// Initialize service
const service = new CommitService({
  dryRun: false,
  maxFilesPerCommit: 10,
  rateLimitDelay: 1000,
  verbose: true,
  repoPath: '/path/to/repo'
});

// Get changed files
const files = await getChangedFiles('/path/to/repo');

// Create commits
const results = await service.createCommits(files);

// Check stats
const stats = service.getStats();
console.log(`Created ${stats.successfulCommits} commits`);
console.log(`Made ${stats.apiCalls} API calls`);
```

## Configuration Options

```typescript
interface CommitServiceConfig {
  dryRun?: boolean;           // Default: false - Don't actually commit
  maxFilesPerCommit?: number; // Default: 10 - Max files per commit
  apiKey?: string;            // Default: loaded from backend/.env
  repoPath?: string;          // Default: process.cwd()
  rateLimitDelay?: number;    // Default: 1000ms - Delay between API calls
  verbose?: boolean;          // Default: false - Verbose logging
}
```

## File Grouping Logic

The service intelligently groups files into logical commits:

### 1. Categorization
Files are first categorized by type:
- **docs**: Markdown, text files, files in `docs/` directories
- **config**: Configuration files (package.json, tsconfig.json, .env, etc.)
- **test**: Test files (*.test.ts, *.spec.js, files in `__tests__/`)
- **style**: CSS, SCSS, SASS, LESS files
- **ci**: GitHub Actions, GitLab CI configs
- **build**: Dockerfiles, Makefiles, build scripts
- **source**: All other source code files

### 2. Grouping Strategy
Different categories use different grouping strategies:

- **Config/Docs**: Grouped by directory (depth 1) - separate commits for each area
- **Tests**: Grouped by directory (depth 2) - tests for same feature together
- **Source**: Grouped by relationship - component + its test + its style together

### 3. Related File Detection
The service finds related files by:
- Same directory
- Similar base name (e.g., `Button.tsx`, `Button.test.tsx`, `Button.css`)
- Common component patterns

### 4. Size Constraints
Groups exceeding `maxFilesPerCommit` are automatically split into multiple commits.

## Commit Message Generation

### AI-Powered Generation
The service sends the following to Claude:
- List of changed files with their status
- File category
- Complete git diff

Claude analyzes the changes and generates:
- Commit type (feat, fix, refactor, docs, test, chore, style, perf, ci, build)
- Optional scope (affected component/module)
- Subject line (imperative mood, max 72 chars)
- Optional body (explains WHY, not WHAT)
- Breaking change indicator

### Fallback Generation
If API call fails, the service uses template-based generation:
- Infers type from file category and status
- Infers scope from common directory
- Uses group description as subject

## Conventional Commits Format

Generated commits follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Examples:
```
feat(auth): add OAuth2 login flow
fix(api): handle null response in user endpoint
refactor(components): extract shared Button component
docs(readme): update installation instructions
test(auth): add integration tests for login flow
chore(deps): upgrade react to v18
```

## Rate Limiting

The service includes built-in rate limiting to prevent API quota exhaustion:
- Default: 1000ms delay between API calls
- Configurable via `rateLimitDelay` option
- Tracks last API call timestamp

For high-volume commits, consider increasing the delay:

```typescript
const service = new CommitService({
  rateLimitDelay: 2000 // 2 seconds between calls
});
```

## Statistics Tracking

The service tracks comprehensive statistics:

```typescript
interface CommitStats {
  totalCommits: number;        // Total commit attempts
  successfulCommits: number;   // Successful commits
  failedCommits: number;       // Failed commits
  filesCommitted: number;      // Total files committed
  apiCalls: number;           // API calls made
  errors: string[];           // Error messages
}

// Access stats
const stats = service.getStats();

// Reset stats
service.resetStats();
```

## Error Handling

The service handles errors gracefully:
- **API Errors**: Falls back to template-based commit messages
- **Git Errors**: Returns error in commit result, continues with next group
- **Parse Errors**: Falls back to template-based messages

All errors are logged and tracked in statistics.

## Example Output

```bash
$ tsx commit-service.ts --dry-run

🤖 Auto-Commit Service

Found 8 changed file(s):

  modified src/components/Button.tsx
  added    src/components/Button.test.tsx
  modified src/components/Button.css
  modified src/pages/Home.tsx
  modified docs/README.md
  modified package.json
  added    src/utils/helpers.ts
  modified src/utils/helpers.test.ts

[2024-05-24T12:00:00.000Z] Starting commit process for 8 files
[2024-05-24T12:00:00.001Z] Grouped files into 4 logical commits
[2024-05-24T12:00:00.002Z] Creating commit for: config in .
[2024-05-24T12:00:00.003Z] Generated message: chore(deps): update project dependencies
[DRY RUN] Would commit with message:
chore(deps): update project dependencies

[2024-05-24T12:00:01.005Z] Creating commit for: Button.tsx
[2024-05-24T12:00:02.105Z] Generated message: feat(components): add Button component with tests and styles
[DRY RUN] Would commit with message:
feat(components): add Button component with tests and styles

Added comprehensive Button component with unit tests and CSS styling for reusability across the application.

[2024-05-24T12:00:03.205Z] Creating commit for: helpers.ts
[2024-05-24T12:00:04.305Z] Generated message: feat(utils): add helper utility functions
[DRY RUN] Would commit with message:
feat(utils): add helper utility functions

[2024-05-24T12:00:05.405Z] Creating commit for: README.md
[2024-05-24T12:00:06.505Z] Generated message: docs: update README with new features
[DRY RUN] Would commit with message:
docs: update README with new features

📊 Commit Summary:
  Total commits: 4
  Successful: 4
  Failed: 0
  Files committed: 8
  API calls made: 4

💡 This was a dry run. No commits were actually created.
   Remove --dry-run to create real commits.
```

## Best Practices

1. **Use Dry Run First**: Always test with `--dry-run` before actual commits
2. **Review Generated Messages**: Check that commit messages accurately describe changes
3. **Adjust File Limit**: Set `maxFilesPerCommit` based on your team's preferences
4. **Monitor API Usage**: Track `apiCalls` in stats to manage costs
5. **Stage Incrementally**: Stage and commit related changes together
6. **Use Verbose Mode**: Enable verbose logging when debugging

## Integration with File Watchers

The commit service is designed to work with file watchers for automatic committing:

```typescript
import chokidar from 'chokidar';
import { CommitService, ChangedFile } from './commit-service';

const service = new CommitService();
const changedFiles = new Set<string>();

// Watch for changes
const watcher = chokidar.watch('src/**/*', {
  ignoreInitial: true,
  awaitWriteFinish: true
});

watcher.on('change', (path) => {
  changedFiles.add(path);
});

// Commit periodically
setInterval(async () => {
  if (changedFiles.size === 0) return;

  const files: ChangedFile[] = Array.from(changedFiles).map(path => ({
    path,
    status: 'modified'
  }));

  await service.createCommits(files);
  changedFiles.clear();
}, 60000); // Every minute
```

## Troubleshooting

### API Key Not Found
```
Error: ANTHROPIC_API_KEY not found
```
**Solution**: Set the API key in `backend/.env` or pass it in config.

### Rate Limit Errors
```
Error: Rate limit exceeded
```
**Solution**: Increase `rateLimitDelay` in config.

### Git Command Failed
```
Error: Git command failed: ...
```
**Solution**: Ensure git is installed and repository is initialized.

### Parse Errors
```
Failed to parse commit message
```
**Solution**: Service will fallback to template-based messages automatically.

## API Costs

Approximate costs for Claude Sonnet 4:
- Input: ~$3 per million tokens
- Output: ~$15 per million tokens

Average per commit:
- Input: ~2000 tokens (diff + prompt)
- Output: ~200 tokens (commit message)
- Cost: ~$0.006 per commit

For 100 commits/day: ~$0.60/day or ~$18/month

## License

MIT
