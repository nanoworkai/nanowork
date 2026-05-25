# Claude Commands & Skills - Optimized Summary

All Claude Code commands and skills have been optimized with detailed instructions, proper frontmatter, and clear usage guidelines.

## Commands Overview

### `/nodocs` - Documentation Prevention
**Purpose**: Prevent automatic documentation file generation  
**Location**: `.claude/commands/nodocs.md`  
**Key Features**:
- Stops Claude from creating unnecessary docs
- Lists files to avoid creating (README, CONTRIBUTING, etc.)
- Provides exceptions for valid documentation
- Response templates for user guidance

### `/refactor` - Code Refactoring
**Purpose**: Improve code readability and maintainability  
**Location**: `.claude/commands/refactor.md`  
**Key Features**:
- Clean code principles
- Extract complex logic
- Remove duplication
- Improve naming
- Maintain functionality

### `/test` - Test Execution
**Purpose**: Run tests with optional pattern matching  
**Location**: `.claude/commands/test.md`  
**Key Features**:
- Auto-detect test framework (Jest, Vitest, pytest)
- Run specific test patterns
- Analyze failures
- Fix and re-run tests
- Support for `$ARGUMENTS` placeholder

### `/design` - Design Consistency Enforcer
**Purpose**: Ensure design consistency and create design prompts for subagents  
**Location**: `.claude/commands/design.md`  
**Key Features**:
- Analyzes design implementation vs guidelines
- Identifies inconsistencies in colors, typography, spacing
- Creates focused prompt files in `.claude/prompts/`
- Can launch parallel subagents to fix issues
- Provides design system adherence scoring

**Process**:
1. Analyze current component designs
2. Compare against design guidelines
3. Document inconsistencies
4. Create subagent prompts for fixes
5. Optional: Execute subagents in parallel

### `/optimize` - Codebase Optimization
**Purpose**: Remove bloat and optimize after major commits  
**Location**: `.claude/commands/optimize.md`  
**Key Features**:
- Find and remove unused imports
- Remove commented-out code
- Clean up debug logs
- Identify large files for splitting
- Detect code duplication
- Bundle size optimization
- Three execution modes: sequential, parallel, or focused

**Target Directories**:
- `apps/web/src/` - Frontend
- `apps/worker/src/` - Cloudflare Worker
- `backend/src/` - Backend server
- `docs/` - Documentation

**Optimization Types**:
- Unused imports removal
- Dead code elimination
- Debug log cleanup
- Bundle optimization
- Code standardization

## Skills Overview

### `/intro` - Codebase Expert
**Purpose**: Explain codebase architecture and answer technical questions  
**Location**: `.claude/skills/intro.md`  
**Key Features**:
- Deep understanding of entire nanowork-web project
- Navigate users to relevant files
- Answer implementation questions
- Provide architectural context
- Guide new developers

**Common Questions Answered**:
- "Where is X implemented?"
- "How does the agent system work?"
- "What's the tech stack?"
- "Where are types defined?"
- "How do I add a new feature?"

**Quick Reference Included**:
- Dev server commands
- Project structure
- Key files to know
- Tech stack summary

### `/design` (skill) - Core Site Design Guardian
**Purpose**: Enforce strict design guidelines for nanowork.ai core site  
**Location**: `.claude/skills/design.md`  
**Key Features**:
- Protect landing page design from unintended changes
- Require explicit approval for core site modifications
- Allow freedom in dashboard/app pages
- Provide clear approval workflows
- Document design decisions

**Protected Pages**:
- Homepage / Landing page
- Features, Pricing, About pages
- All public marketing pages

**Approval Workflow**:
1. Detect core site design change request
2. Ask user for confirmation
3. Explain visual impact
4. Wait for explicit approval
5. Document the change

### `/backend` - Backend Engineering Specialist
**Purpose**: Backend engineering expert for APIs and deployment  
**Location**: `.claude/skills/backend/backend.md`  
**Key Features**:
- API design and development guidance
- Deployment and infrastructure expertise
- Monorepo best practices
- Failure point analysis
- Production readiness checks

**Critical Checks**:
- Environment variables validation
- Database schema verification
- API contract stability
- Error handling coverage
- Rate limiting and security

**Common Failure Points**:
- Missing database indexes
- Unhandled promise rejections
- Memory leaks (WebSocket cleanup)
- Race conditions
- Secret exposure

**Deployment Checklist**:
- Pre-deployment: Type check, build, env vars
- During: Backend first, migrations, frontend
- Post-deployment: Log monitoring, critical paths

### `/inbox-design` - Inbox Design Guidelines
**Purpose**: Comprehensive design spec for email inbox feature  
**Location**: `.claude/skills/inbox-design.md`  
**Key Features**:
- Complete UI/UX specification
- Two-pane email client layout
- Component structure and styling
- Color palette and typography
- Interaction patterns
- Future enhancement roadmap

**Design Principles**:
1. Email client first (familiar patterns)
2. Natural & readable
3. Fast & responsive

**Includes**:
- Grid system and responsive breakpoints
- Message list component specs
- Message detail panel structure
- Status badges (replied, processing, failed)
- Empty states
- Technical implementation notes

## Command/Skill Matrix

| Name | Type | Purpose | Tools | Model |
|------|------|---------|-------|-------|
| nodocs | Command | Prevent docs | Read, Edit, Write | default |
| refactor | Command | Code quality | Read, Edit, Write, Bash | default |
| test | Command | Test execution | Bash, Read, Edit | default |
| design | Command | Design consistency | Read, Write, Agent, Glob | default |
| optimize | Command | Remove bloat | Read, Edit, Write, Bash, Agent, Glob | sonnet-4 |
| intro | Skill | Codebase Q&A | Read, Grep, Glob, Bash | sonnet-4 |
| design | Skill | Core site guardian | Read, Edit | default |
| backend | Skill | Backend expert | Read, Edit, Write, Bash, Grep | sonnet-4 |
| inbox-design | Skill | Inbox spec | N/A (reference doc) | N/A |

## Usage Patterns

### Quick Tasks
```bash
/refactor src/components/Button.tsx
/test unit
/intro Where is the agent orchestrator?
```

### Major Operations
```bash
/optimize              # Full codebase optimization
/optimize --parallel   # Parallel mode
/design                # Design consistency check
```

### Guidance & Questions
```bash
/intro How does email processing work?
/intro Where do I add a new API endpoint?
/backend [reviewing code for deployment]
```

## Integration with Slash Command SDK

All commands are now:
- ✅ Discoverable via SDK (`/api/slash-commands`)
- ✅ Include proper frontmatter metadata
- ✅ Support argument substitution (`$1`, `$2`, `$ARGUMENTS`)
- ✅ Have clear descriptions for command listing
- ✅ Specify allowed tools for safety
- ✅ Include usage examples

## File Organization

```
.claude/
├── commands/              # User-invokable commands
│   ├── nodocs.md         # ✅ Optimized
│   ├── refactor.md       # ✅ Optimized
│   ├── test.md           # ✅ Optimized
│   ├── design.md         # ✅ Optimized
│   └── optimize.md       # ✅ Optimized
├── skills/               # Agent skills
│   ├── intro.md          # ✅ Optimized
│   ├── design.md         # ✅ Optimized
│   ├── inbox-design.md   # ✅ Already comprehensive
│   └── backend/
│       └── backend.md    # ✅ Optimized
└── prompts/              # Generated prompts
    └── example.md        # Template
```

## Best Practices

### When Creating New Commands

1. **Add Frontmatter**:
```yaml
---
description: Brief description (shows in command list)
allowed-tools: Read, Edit, Write, Bash
model: claude-sonnet-4-20250514
argument-hint: [optional-arg] [another-arg]
---
```

2. **Use Clear Structure**:
- Purpose section
- Step-by-step process
- Examples
- Usage patterns

3. **Include Placeholders**:
- `$1`, `$2` for positional args
- `$ARGUMENTS` for all args joined

4. **Document Tool Usage**:
- Why each tool is needed
- Safety considerations

### When Creating New Skills

1. **Define Role Clearly**:
- What expertise does this skill provide?
- When should it be invoked?

2. **Include Examples**:
- Common questions answered
- Example code snippets
- Command outputs

3. **Reference Other Resources**:
- Link to related skills
- Point to relevant documentation

## Maintenance

### Regular Updates Needed

- **After architecture changes**: Update `/intro` skill
- **After design system changes**: Update `/design` skill and `inbox-design.md`
- **After adding dependencies**: Update `/optimize` command
- **After deployment process changes**: Update `/backend` skill

### Quality Checks

Run these periodically:
```bash
# Test command discovery
npm run test:slash-commands

# Verify frontmatter syntax
grep -r "^---" .claude/commands .claude/skills

# Check for broken references
grep -r "@" .claude/commands .claude/skills | verify-files
```

## Migration Notes

All commands have been migrated from basic descriptions to comprehensive guides:

- **Before**: Single-line descriptions
- **After**: Multi-section documents with:
  - Clear purpose statements
  - Detailed processes
  - Usage examples
  - Safety guidelines
  - Integration instructions

This makes commands more useful for:
- New team members learning the codebase
- Automated agents executing commands
- Documentation and onboarding
- Consistent code quality standards
