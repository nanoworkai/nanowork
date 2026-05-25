# Slash Command SDK Implementation

A skeleton implementation of Claude Code's Slash Command SDK for discovering, parsing, and executing custom slash commands.

## Overview

This implementation mirrors the Claude Agent SDK's slash command functionality as described in the official documentation. It provides:

1. **Command Discovery** - Automatically finds and loads commands from `.claude/commands/` and `.claude/skills/` directories
2. **Command Parsing** - Parses slash commands with arguments from user input
3. **Command Execution** - Executes commands with argument substitution
4. **Built-in Commands** - Supports `/clear`, `/compact`, and `/context` commands
5. **Frontend Integration** - React hooks for easy UI integration

## Architecture

### Backend Components

#### `backend/src/services/slashCommandSDK.ts`
Core SDK service that handles:
- Command discovery from filesystem
- Frontmatter parsing (YAML metadata)
- Command execution with placeholder replacement
- Built-in command handling

#### `backend/src/routes/slash-commands.ts`
REST API endpoints:
- `GET /api/slash-commands` - List all available commands
- `GET /api/slash-commands/init` - Get system initialization message
- `GET /api/slash-commands/:name` - Get command details
- `POST /api/slash-commands/execute` - Execute a command
- `POST /api/slash-commands/parse` - Parse command from input

### Frontend Components

#### `apps/web/src/lib/slashCommandSDK.ts`
Client-side SDK with:
- `query()` - Generator function for streaming command execution
- `getAvailableCommands()` - Fetch command list
- `getInitMessage()` - Get system init data
- `executeCommand()` - Execute a command
- `parseSlashCommand()` - Parse input string
- `useSlashCommands()` - React hook

#### `apps/web/src/components/SlashCommandDemo.tsx`
Demo component showing SDK usage

## Command File Format

Commands are markdown files with optional YAML frontmatter:

```markdown
---
description: Short description of what this command does
allowed-tools: Read, Edit, Write, Bash
model: claude-sonnet-4-20250514
argument-hint: [arg1] [arg2]
---

Command instructions here.

Use $1, $2, etc. for positional arguments.
Use $ARGUMENTS for all arguments joined.

## Context

- Current file: @filename.ts
- Git status: !`git status`
```

### Frontmatter Fields

- `description` - Brief command description (shown in command list)
- `allowed-tools` - Comma-separated list of tools this command can use
- `model` - Claude model to use for execution
- `argument-hint` - Usage hint for command arguments

### Special Syntax

- `$1`, `$2`, `$N` - Replaced with positional arguments
- `$ARGUMENTS` - Replaced with all arguments joined
- `@filename` - Include file contents (not yet implemented)
- `` !`command` `` - Execute bash command and include output (not yet implemented)

## Example Commands

### `/refactor`
Located at `.claude/commands/refactor.md`:

```markdown
---
description: Refactor code for improved readability and maintainability
allowed-tools: Read, Edit, Write, Bash
---

Refactor the selected code to improve readability and maintainability.
Focus on clean code principles and best practices.
```

### `/test`
Located at `.claude/commands/test.md`:

```markdown
---
description: Run tests with optional pattern
allowed-tools: Bash, Read, Edit
argument-hint: [test-pattern]
---

Run tests matching pattern: $ARGUMENTS

1. Detect test framework (Jest, Vitest, pytest, etc.)
2. Run tests with the provided pattern
3. If tests fail, analyze the failures
```

## Usage Examples

### Backend (Node.js)

```typescript
import { getSlashCommandSDK, initializeSlashCommandSDK } from './services/slashCommandSDK';

// Initialize on startup
await initializeSlashCommandSDK();

// Get available commands
const sdk = getSlashCommandSDK();
const commands = sdk.getAvailableCommands();
console.log('Available:', commands.map(c => c.name));

// Execute a command
const result = await sdk.executeCommand('refactor', ['src/app.ts']);
console.log(result);

// Execute built-in command
const compactResult = await sdk.executeBuiltinCommand('compact');
console.log(compactResult);
```

### Frontend (React)

```tsx
import { useSlashCommands, query } from '../lib/slashCommandSDK';

function MyComponent() {
  const { commands, loading, execute } = useSlashCommands();

  const handleCommand = async (input: string) => {
    // Using query API (mirrors Claude Agent SDK)
    for await (const message of query({
      prompt: input,
      options: { maxTurns: 1 }
    })) {
      console.log(message);
    }

    // Or execute directly
    const result = await execute('test', ['unit']);
    console.log(result);
  };

  return (
    <div>
      <h2>Available Commands</h2>
      <ul>
        {commands.map(cmd => (
          <li key={cmd.name}>/{cmd.name} - {cmd.description}</li>
        ))}
      </ul>
    </div>
  );
}
```

### REST API

```bash
# Get all commands
curl http://localhost:8000/api/slash-commands \
  -H "Authorization: Bearer $TOKEN"

# Get init message
curl http://localhost:8000/api/slash-commands/init \
  -H "Authorization: Bearer $TOKEN"

# Parse input
curl -X POST http://localhost:8000/api/slash-commands/parse \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"input": "/refactor src/app.ts"}'

# Execute command
curl -X POST http://localhost:8000/api/slash-commands/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"command": "refactor", "args": ["src/app.ts"]}'
```

## Command Organization

Commands can be organized in subdirectories for namespacing:

```
.claude/
├── commands/
│   ├── refactor.md          # /refactor
│   ├── test.md              # /test
│   └── frontend/
│       ├── component.md     # /component (frontend namespace)
│       └── style.md         # /style (frontend namespace)
└── skills/
    ├── backend/
    │   └── backend.md       # /backend
    └── design.md            # /design
```

## Built-in Commands

### `/clear`
Resets conversation context (useful for streaming mode)

### `/compact`
Compacts conversation history by summarizing older messages

### `/context`
Shows current context usage (tokens, available commands, etc.)

## Integration Points

### With Agent Orchestration
Commands can trigger the existing agent orchestration system:

```typescript
import { getOrchestrator } from './services/agentOrchestrator';

// In command execution
const orchestrator = getOrchestrator();
await orchestrator.startBuild(buildId, prompt);
```

### With Claude API
Commands integrate with your existing Anthropic SDK setup:

```typescript
import { getAnthropic } from './services/anthropic';

// Execute command with Claude
const anthropic = getAnthropic();
const response = await anthropic.messages.create({
  model: command.metadata.model || 'claude-sonnet-4-20250514',
  max_tokens: 4000,
  messages: [{ role: 'user', content: processedContent }]
});
```

## Next Steps

### Planned Enhancements

1. **File References** - Implement `@filename` syntax to include file contents
2. **Bash Execution** - Implement `` !`command` `` syntax for shell commands
3. **Streaming Execution** - Support streaming responses via WebSocket
4. **Command Chaining** - Allow commands to call other commands
5. **Permission System** - Implement `allowed-tools` enforcement
6. **Command History** - Track command execution history
7. **Custom Arguments** - Support complex argument parsing (flags, options)
8. **Command Templates** - Pre-defined command templates for common tasks

### Production Considerations

1. **Authentication** - Already integrated with `requireUserAuth` middleware
2. **Rate Limiting** - Add rate limiting for command execution
3. **Logging** - Add detailed execution logging
4. **Error Handling** - Enhanced error messages and recovery
5. **Caching** - Cache command definitions for performance
6. **Validation** - Validate command syntax and arguments
7. **Sandboxing** - Secure execution environment for bash commands

## File Structure

```
backend/
├── src/
│   ├── services/
│   │   └── slashCommandSDK.ts      # Core SDK implementation
│   └── routes/
│       └── slash-commands.ts        # REST API endpoints

apps/web/
├── src/
│   ├── lib/
│   │   └── slashCommandSDK.ts      # Frontend client SDK
│   └── components/
│       └── SlashCommandDemo.tsx    # Demo component

.claude/
├── commands/                        # Legacy command directory
│   ├── refactor.md
│   └── test.md
└── skills/                          # Modern skill directory
    ├── backend/
    │   └── backend.md
    └── design.md
```

## Testing

To test the implementation:

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Create a test command in `.claude/commands/hello.md`:
   ```markdown
   ---
   description: Say hello
   ---
   Hello, $1! Your message: $ARGUMENTS
   ```

3. Test the API:
   ```bash
   curl -X POST http://localhost:8000/api/slash-commands/execute \
     -H "Authorization: Bearer $TOKEN" \
     -d '{"command": "hello", "args": ["World", "how", "are", "you"]}'
   ```

4. Expected response:
   ```json
   {
     "type": "result",
     "subtype": "success",
     "command": "hello",
     "result": {
       "command": "hello",
       "content": "Hello, World! Your message: World how are you",
       "metadata": { "name": "hello", "description": "Say hello" },
       "args": ["World", "how", "are", "you"]
     },
     "timestamp": "2026-05-25T..."
   }
   ```

## References

- [Claude Code Documentation](https://code.claude.com/docs/llms.txt)
- [Claude Agent SDK - Slash Commands](https://code.claude.com/docs/agent-sdk/slash-commands)
- [Anthropic API Documentation](https://docs.anthropic.com/)
