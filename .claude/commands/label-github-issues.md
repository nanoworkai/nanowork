---
name: label-github-issues
description: Auto-label GitHub issues based on content analysis
type: command
allowed-tools: Bash, Read, Agent
argument-hint: [issue-numbers or 'all']
---

# Label GitHub Issues Command

Automatically analyze and label GitHub issues based on content, keywords, and patterns.

## Usage

```bash
/label-github-issues 42              # Label single issue
/label-github-issues 42 43 44        # Label multiple issues
/label-github-issues all             # Label all unlabeled open issues
/label-github-issues --dry-run       # Preview labels without applying
```

## What it does

Intelligently analyzes GitHub issues and applies appropriate labels:

1. **Fetch issue content** - Retrieves title, body, comments, and current labels
2. **Content analysis** - Uses NLP patterns and keywords to understand issue type
3. **Label classification** - Determines appropriate type, priority, and component labels
4. **Apply labels** - Adds labels via GitHub CLI
5. **Optional comment** - Can add a comment explaining the labeling

## Label Categories

### Type Labels (Primary Classification)

| Label | When to Apply | Keywords |
|-------|--------------|----------|
| `bug` | Something broken or not working | error, crash, broken, fail, exception, bug |
| `feature` | New capability request | add, new, feature, would like, want, need |
| `enhancement` | Improvement to existing feature | improve, enhance, better, optimize, update |
| `documentation` | Docs need updating | docs, documentation, readme, guide, tutorial |
| `refactor` | Code quality improvement | refactor, cleanup, simplify, reorganize |
| `performance` | Speed/efficiency issue | slow, performance, lag, timeout, optimize |
| `security` | Security vulnerability or concern | security, vulnerability, CVE, exploit, XSS |
| `question` | User has a question | question, how to, help, clarify |

### Priority Labels

| Label | When to Apply | Indicators |
|-------|--------------|-----------|
| `priority: critical` | Production down, data loss, security breach | "production down", "not working for anyone", "security", "data loss" |
| `priority: high` | Major feature broken, many users affected | "blocks", "urgent", "important", "affects everyone" |
| `priority: medium` | Normal issue, should fix soon | Most issues default here |
| `priority: low` | Nice to have, minor issue | "minor", "nice to have", "eventually", "low priority" |

### Component Labels (Area of Codebase)

| Label | When to Apply | Keywords |
|-------|--------------|----------|
| `frontend` | UI/UX, React components | UI, button, page, component, React, CSS, frontend |
| `backend` | API, server logic, workers | API, endpoint, server, worker, backend, route |
| `database` | Database queries, schema | database, query, schema, migration, SQL, Supabase |
| `auth` | Authentication/authorization | login, signup, auth, permissions, session, OAuth |
| `billing` | Payments, subscriptions | Stripe, payment, billing, subscription, invoice |
| `deployment` | CI/CD, infrastructure | deploy, CI, Docker, Cloudflare, build, pipeline |
| `testing` | Tests, test infrastructure | test, jest, playwright, coverage, testing |

### Status Labels

| Label | When to Apply | Use Case |
|-------|--------------|----------|
| `needs-investigation` | Issue needs more info or reproduction | Can't reproduce, unclear requirements |
| `good-first-issue` | Simple, well-defined issue | Small scope, clear requirements, good for newcomers |
| `help-wanted` | Community help appreciated | Non-critical, could use external contribution |
| `wontfix` | Will not be addressed | Out of scope, won't implement |
| `duplicate` | Duplicate of another issue | Same as existing issue |
| `blocked` | Blocked by external dependency | Waiting on third-party, other issue |

## Implementation

### Step 1: Fetch Issue Data

```bash
# Single issue with full context
gh issue view $ARGUMENTS --json number,title,body,labels,comments,author,state

# Multiple issues
for issue_num in $ARGUMENTS; do
  gh issue view $issue_num --json number,title,body,labels,comments,author
done

# All open unlabeled issues
gh issue list --state open --json number,title,body,labels --limit 100 \
  --jq '.[] | select(.labels | length == 0)'
```

### Step 2: Analyze Content

For each issue, build a keyword frequency map:

```typescript
interface IssueAnalysis {
  number: number;
  title: string;
  body: string;
  keywords: string[];
  hasStackTrace: boolean;
  hasStepsToReproduce: boolean;
  mentionsProduction: boolean;
  suggestedLabels: string[];
  confidence: 'high' | 'medium' | 'low';
}
```

**Analysis Rules:**

1. **Bug Detection:**
   - Contains error message or stack trace → high confidence `bug`
   - Keywords: "error", "crash", "broken", "not working", "throws"
   - Has "Steps to reproduce" section → definitely a bug

2. **Feature Detection:**
   - Starts with "Add", "New", "Feature Request" → `feature`
   - Contains user story format → `feature`
   - Keywords: "would be nice", "could we", "suggestion"

3. **Component Detection:**
   - Mentions file paths: `apps/web/` → `frontend`, `apps/worker/` → `backend`
   - Mentions technologies: React/Tailwind → `frontend`, Hono → `backend`
   - Mentions services: Supabase → `database`, Stripe → `billing`

4. **Priority Detection:**
   - "production" + "down"/"broken" → `priority: critical`
   - "urgent", "blocker", "ASAP" → `priority: high`  
   - No urgency indicators → `priority: medium`
   - "minor", "eventually", "nice to have" → `priority: low`

### Step 3: Build Label List

```typescript
function suggestLabels(analysis: IssueAnalysis): string[] {
  const labels: string[] = [];
  
  // Type label (required, pick one)
  if (analysis.hasStackTrace) labels.push('bug');
  else if (analysis.title.toLowerCase().includes('add')) labels.push('feature');
  else if (analysis.keywords.includes('improve')) labels.push('enhancement');
  
  // Priority label (required, pick one)
  if (analysis.mentionsProduction) labels.push('priority: high');
  else labels.push('priority: medium');
  
  // Component labels (optional, can be multiple)
  if (analysis.body.includes('apps/web')) labels.push('frontend');
  if (analysis.body.includes('apps/worker')) labels.push('backend');
  if (analysis.keywords.includes('stripe')) labels.push('billing');
  
  // Status labels (optional)
  if (analysis.body.length < 100) labels.push('needs-investigation');
  
  return labels;
}
```

### Step 4: Apply Labels

```bash
# Add labels (preserves existing)
gh issue edit <number> --add-label "bug,backend,priority: high"

# Dry run - just show what would be applied
echo "Would apply labels to #<number>: bug, backend, priority: high"
```

### Step 5: Add Explanation Comment (Optional)

```bash
gh issue comment <number> --body "$(cat <<'EOF'
🤖 **Auto-labeled** based on content analysis:

**Type:** bug (detected error message in description)
**Priority:** high (mentions production environment)
**Component:** backend (references API endpoint)

If these labels are incorrect, feel free to update them.
EOF
)"
```

## Example Scenarios

### Example 1: Bug Report

**Issue #42: "Stripe webhook returns 500 error"**
```
Body: When testing payment webhooks, getting 500 error:
Error: Stripe signature verification failed
  at apps/worker/src/routes/stripe.ts:45
```

**Analysis:**
- Has stack trace → `bug`
- Mentions Stripe → `billing`
- Backend file path → `backend`
- No urgency mentioned → `priority: medium`

**Applied labels:** `bug`, `backend`, `billing`, `priority: medium`

### Example 2: Feature Request

**Issue #78: "Add dark mode to dashboard"**
```
Body: It would be great to have a dark mode toggle in the user settings.
Many users prefer dark themes for late-night work.
```

**Analysis:**
- Starts with "Add" → `feature`
- Mentions dashboard/settings → `frontend`
- Nice-to-have → `priority: low`

**Applied labels:** `feature`, `frontend`, `priority: low`

### Example 3: Critical Bug

**Issue #101: "Production login completely broken"**
```
Body: URGENT - No users can log in to production right now.
Getting "Invalid session" error on /login.
This is affecting all customers.
```

**Analysis:**
- Error in production → `bug`, `priority: critical`
- Login mentioned → `auth`, `frontend`
- All users affected → critical

**Applied labels:** `bug`, `auth`, `frontend`, `priority: critical`

### Example 4: Performance Issue

**Issue #55: "Dashboard loads slowly with many agents"**
```
Body: When viewing dashboard with 100+ agents, page takes 10+ seconds to load.
Should optimize the query or add pagination.
```

**Analysis:**
- Performance complaint → `performance`, `enhancement`
- Dashboard → `frontend`
- Query mentioned → `backend`, `database`
- Not urgent → `priority: medium`

**Applied labels:** `performance`, `enhancement`, `frontend`, `backend`, `priority: medium`

## Confidence Levels

Report confidence with each label suggestion:

- **High confidence**: Stack trace, clear keywords, file paths
- **Medium confidence**: Some keywords match, context is clear
- **Low confidence**: Ambiguous, might need human review

For low confidence issues, suggest labels but ask for user confirmation.

## Batch Processing

For labeling many issues:

```bash
# Get all unlabeled issues
UNLABELED=$(gh issue list --state open --json number,title --jq '.[] | select(.labels | length == 0) | .number')

# Process each
for issue in $UNLABELED; do
  echo "Analyzing issue #$issue..."
  # Fetch, analyze, label
done
```

## Creating Missing Labels

If suggested labels don't exist:

```bash
# Check existing labels
gh label list

# Create new label if needed
gh label create "priority: critical" --color "d73a4a" --description "Critical issue, requires immediate attention"
gh label create "backend" --color "1d76db" --description "Backend/API related"
```

## Dry Run Mode

Use `--dry-run` to preview without applying:

```bash
/label-github-issues 42 --dry-run

# Output:
# Issue #42: "Stripe webhook returns 500 error"
# Would apply: bug, backend, billing, priority: medium
# Confidence: high
```

## Notes

- **Review before batch labeling** - Check a few manually first
- **Don't over-label** - 3-5 labels per issue is ideal
- **Update labels as issues evolve** - Initial triage might change
- **Use label descriptions** - Help future maintainers understand taxonomy
- **Combine with GitHub Actions** - Auto-label on issue creation
- **Ask for confirmation on ambiguous issues** - Better safe than wrong

## Troubleshooting

**Labels not applying:**
- Check GitHub CLI authentication: `gh auth status`
- Verify repo permissions (need write access)

**Wrong labels suggested:**
- Review keyword analysis logic
- Check for context in comments, not just title/body
- Some issues need human judgment

**Creating duplicate labels:**
- Use `gh label list` first to check existing
- Standardize on naming convention (e.g., `priority: X` not `Priority-X`)

## GitHub Actions Integration

Automate labeling on issue creation:

```yaml
# .github/workflows/auto-label.yml
name: Auto Label Issues
on:
  issues:
    types: [opened]
    
jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - run: |
          # Analyze issue and apply labels
          gh issue edit ${{ github.event.issue.number }} --add-label "needs-triage"
```
