---
description: Enforce design consistency and create design prompts for subagents
allowed-tools: Read, Write, Agent, Glob
---

# Design Consistency Guardian

When this command is invoked, you will ensure design consistency across the codebase and create design prompt files for subagents.

## Purpose
As subagents work through the codebase, it's easy for design changes to drift from the original vision. This command:
1. Reviews current design implementation against guidelines
2. Identifies design inconsistencies
3. Creates focused design prompts for subagents to fix issues
4. Ensures brand consistency for nanowork.ai

## Process

### Step 1: Analyze Current State
```bash
# Find all frontend component files
find apps/web/src -name "*.tsx" -o -name "*.css"
```

Read and analyze:
- Color usage (Tailwind classes, inline styles)
- Typography (font sizes, weights, families)
- Spacing (padding, margins, gaps)
- Component structure (layouts, grids)
- Design system adherence

### Step 2: Compare Against Guidelines
Check against:
- `.claude/skills/inbox-design.md` - Inbox specific guidelines
- `.claude/skills/design.md` - Core site design rules
- Tailwind config
- Design system components

### Step 3: Identify Issues

Document inconsistencies:
- ❌ Non-standard colors or color values
- ❌ Inconsistent spacing scales
- ❌ Typography that doesn't match system
- ❌ Layout patterns that differ from standards
- ❌ Missing responsive breakpoints
- ❌ Accessibility issues

### Step 4: Create Subagent Prompts

For each issue category, create a focused prompt file in `.claude/prompts/`:

**Example: `design-colors-fix.md`**
```markdown
# Fix Color Inconsistencies in Components

## Issue
Found 12 components using non-standard color values:
- `/components/Button.tsx`: using `#3B82F6` instead of `primary-500`
- `/pages/Dashboard.tsx`: custom gray values instead of `zinc-*` scale

## Task
Replace all custom color values with design system tokens:
- Blue shades → `primary-*` tokens
- Gray shades → `zinc-*` tokens
- Success → `green-*` tokens
- Error → `red-*` tokens

## Files to Update
[List of files]

## Success Criteria
- All colors use Tailwind design system
- No hex/rgb color values in code
- Visual appearance unchanged
```

### Step 5: Execute Subagents (Optional)

Offer to launch subagents to fix issues:
```bash
# Launch parallel fix agents
Agent({ 
  description: "Fix color inconsistencies",
  prompt: "@design-colors-fix.md",
  run_in_background: true
})
```

## Design Guidelines to Enforce

### Color System
- **Background**: `bg-surface-1`, `bg-surface-2`, `bg-surface-3`
- **Text**: `text-zinc-200`, `text-zinc-300`, `text-zinc-500`
- **Borders**: `border-white/5`, `border-white/10`
- **Accents**: `bg-primary-500`, `text-primary-400`

### Typography
- **Headings**: `text-2xl font-bold`, `text-xl font-semibold`
- **Body**: `text-sm`, `text-base`
- **Labels**: `text-xs font-medium`
- **Code**: `font-mono`

### Spacing
- **Consistent scale**: 4px base (0.5, 1, 2, 3, 4, 6, 8, 12, 16, 24)
- **Card padding**: `p-6` standard
- **Section gaps**: `gap-4` or `gap-6`

### Components
- **Cards**: `card` class with `rounded-2xl`
- **Buttons**: Consistent hover states `hover:bg-white/10`
- **Inputs**: `bg-surface-1` with focus states

## Output Structure

Create files in `.claude/prompts/`:
```
.claude/prompts/
├── design-colors-YYYY-MM-DD.md
├── design-typography-YYYY-MM-DD.md
├── design-spacing-YYYY-MM-DD.md
└── design-components-YYYY-MM-DD.md
```

## Example Invocation

```
/design
```

Expected output:
1. Analysis report of design inconsistencies
2. 3-5 focused prompt files created
3. Offer to launch subagents to fix issues
4. Summary of design system adherence score
