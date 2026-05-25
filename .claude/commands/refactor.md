---
name: refactor
description: Refactor code for improved readability and maintainability
type: command
allowed-tools: Read, Edit, Write, Bash, Agent
argument-hint: [file-path or description]
---

# Refactor Command

Refactor code to improve readability, maintainability, and consistency while preserving all functionality.

## Usage

```bash
/refactor                                    # Refactor recently modified files
/refactor src/components/auth/LoginForm.tsx  # Refactor specific file
/refactor "extract duplicate validation logic"  # Refactor with specific goal
```

## What it does

Improves code quality through systematic refactoring:

1. **Simplify complex logic** - Break down nested conditions and long functions
2. **Remove duplication** - DRY principle, extract common patterns
3. **Improve naming** - Clear, descriptive variable and function names
4. **Enhance type safety** - Better TypeScript types and narrowing
5. **Optimize performance** - Remove unnecessary re-renders, computations
6. **Follow conventions** - Match project patterns and style

## Refactoring Principles

### DO Refactor For:

✅ **Clarity** - Code is hard to understand at a glance
✅ **Duplication** - Same logic appears in 3+ places
✅ **Complex conditionals** - Deeply nested if/else, hard to follow
✅ **Long functions** - Functions doing too many things
✅ **Poor naming** - Variables like `data`, `temp`, `x`
✅ **Type safety** - Missing types, excessive `any` usage
✅ **Performance issues** - Unnecessary re-renders, inefficient loops

### DON'T Refactor For:

❌ **Premature abstraction** - Don't abstract until pattern emerges (3+ uses)
❌ **Hypothetical features** - Don't design for future requirements
❌ **Personal preference** - Don't change working code just because
❌ **Over-engineering** - Simple code > clever code
❌ **Out of scope** - Don't refactor unrelated code

## Refactoring Patterns

### 1. Extract Function

**Before:**
```typescript
function processOrder(order: Order) {
  // validation
  if (!order.items || order.items.length === 0) return null;
  if (!order.customerId) return null;
  
  // calculation
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  
  return { subtotal, tax, total };
}
```

**After:**
```typescript
function processOrder(order: Order) {
  if (!isValidOrder(order)) return null;
  return calculateOrderTotal(order);
}

function isValidOrder(order: Order): boolean {
  return order.items?.length > 0 && !!order.customerId;
}

function calculateOrderTotal(order: Order) {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  return { subtotal, tax, total: subtotal + tax };
}
```

### 2. Remove Duplication

**Before:**
```typescript
// In ComponentA.tsx
const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// In ComponentB.tsx
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
```

**After:**
```typescript
// In utils/validation.ts
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

### 3. Improve Type Safety

**Before:**
```typescript
function getUserData(id: any): any {
  return fetch(`/api/users/${id}`).then(r => r.json());
}
```

**After:**
```typescript
interface User {
  id: string;
  email: string;
  name: string;
}

async function getUserData(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

### 4. Simplify Conditionals

**Before:**
```typescript
if (user) {
  if (user.role === 'admin') {
    if (user.permissions.includes('delete')) {
      return true;
    }
  }
}
return false;
```

**After:**
```typescript
return user?.role === 'admin' && user.permissions.includes('delete');
```

### 5. React Component Optimization

**Before:**
```typescript
function UserList({ users }) {
  return (
    <div>
      {users.map(user => (
        <div onClick={() => handleClick(user.id)}>
          {user.name} - {user.email}
        </div>
      ))}
    </div>
  );
}
```

**After:**
```typescript
function UserList({ users }: { users: User[] }) {
  const handleClick = useCallback((id: string) => {
    // handle click
  }, []);
  
  return (
    <div>
      {users.map(user => (
        <UserItem key={user.id} user={user} onClick={handleClick} />
      ))}
    </div>
  );
}

const UserItem = memo(({ user, onClick }: UserItemProps) => (
  <div onClick={() => onClick(user.id)}>
    {user.name} - {user.email}
  </div>
));
```

## Execution Steps

### 1. Identify Target
- If file path provided, read and analyze that file
- If description provided, search codebase for matching patterns
- If no args, check recent git changes: `git diff --name-only HEAD~5`

### 2. Analyze Current Code
- Read the target file(s)
- Identify code smells:
  - Functions > 50 lines
  - Cyclomatic complexity > 10
  - Duplicated blocks (same code 3+ times)
  - Poor naming (single letter, abbreviations)
  - Missing types (`any`, implicit types)

### 3. Plan Refactoring
- List specific changes to make
- Ensure changes don't alter behavior
- Consider impact on other files
- Check for test coverage

### 4. Execute Refactoring
- Make small, incremental changes
- Preserve exact functionality
- Update imports/exports as needed
- Maintain existing tests

### 5. Validate Changes
```bash
# Type check
bun run typecheck

# Lint
npm run lint

# Run tests if available
bun test
```

## Project-Specific Patterns

### React/TypeScript Conventions
- Use function components with hooks
- Props interfaces named `<Component>Props`
- Event handlers prefixed with `handle`
- Custom hooks prefixed with `use`
- Memoize expensive computations
- Extract reusable hooks

### File Organization
```
components/
  feature/
    FeatureComponent.tsx     # Main component
    FeatureComponent.test.tsx # Tests
    useFeature.ts            # Custom hooks
    types.ts                 # Type definitions
```

## Notes

- **Preserve functionality** - Refactoring should never change behavior
- **Small iterations** - Make one improvement at a time
- **Test after changes** - Run type check and tests after each refactor
- **Don't over-abstract** - Wait for 3+ uses before extracting
- **Keep it simple** - Readable code > clever code
- **No premature optimization** - Profile before optimizing
- **Commit atomically** - Each refactor should be its own commit

## Common Refactoring Requests

- "Extract this duplicated validation logic"
- "Simplify these nested conditionals"
- "Improve type safety in this API handler"
- "Break this 200-line component into smaller pieces"
- "Remove this prop drilling with context"
- "Optimize these unnecessary re-renders"

## Safety Checks

Before refactoring:
- [ ] Read the current code fully
- [ ] Check if tests exist
- [ ] Understand dependencies
- [ ] Consider breaking changes

After refactoring:
- [ ] Run type checker
- [ ] Run linter
- [ ] Run tests
- [ ] Verify in browser if UI change
