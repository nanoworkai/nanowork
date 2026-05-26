# Build Debug Report
Generated: 2026-05-26

## Summary
- **Web Build**: ✅ Succeeds (with warnings)
- **Web Typecheck**: ❌ Fails with 39 errors
- **Worker Build**: ⚠️ No build script configured
- **Worker Typecheck**: ❌ Fails with 13 errors

---

## Web App TypeScript Errors (39 total)

### Critical Errors (9)

#### 1. Missing CSS Module Imports
- **File**: `src/main.tsx:6`
- **Error**: Cannot find module './index.css' or its corresponding type declarations
- **Fix**: Ensure `index.css` exists or remove import

- **File**: `src/pages/HomeOld.tsx:4`
- **Error**: Cannot find module './Home.module.css' or its corresponding type declarations
- **Fix**: Ensure CSS module exists or remove import

#### 2. Undefined Variable References
- **File**: `src/components/SpreadsheetEditor.tsx:1431`
- **Error**: Cannot find name 'setRenamingSheetIndex'. Did you mean '_setRenamingSheetIndex'?
- **Fix**: Rename to `_setRenamingSheetIndex`

- **File**: `src/components/SpreadsheetEditor.tsx:1432`
- **Error**: Cannot find name 'setRenameValue'. Did you mean '_setRenameValue'?
- **Fix**: Rename to `_setRenameValue`

#### 3. Missing Export from lucide-react
- **File**: `src/components/SpreadsheetFormatToolbar.tsx:26`
- **Error**: Module '"lucide-react"' has no exported member 'BorderAll'
- **Fix**: Use alternative icon or check lucide-react version

#### 4. Type Mismatch
- **File**: `src/dashboard/components/IndustrialSlider.tsx:1`
- **Error**: 'LucideIcon' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled
- **Fix**: Change `import { LucideIcon }` to `import type { LucideIcon }`

#### 5. Formula Parser Type Issues

**File**: `src/lib/spreadsheet/formulaParser.ts`

Line 150:
- Error: 'sum' is possibly 'null'
- Error: Operator '+' cannot be applied to types 'string | number | boolean' and 'number'

Line 155:
- Error: 'sum' is possibly 'null'
- Error: Operator '+' cannot be applied to types 'string | number | boolean' and 'number'

Line 156:
- Error: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type
- Error: 'sum' is possibly 'null'

Line 231:
- Error: 'npv' is possibly 'null'
- Error: Operator '+' cannot be applied to types 'string | number | boolean' and 'number'

Line 672:
- Error: Argument of type 'FormulaResult' is not assignable to parameter of type 'CellValue'
  - Type 'FormulaError' is not assignable to type 'CellValue'

Line 699:
- Error: Argument of type 'FormulaResult' is not assignable to parameter of type 'CellValue'
  - Type 'FormulaError' is not assignable to type 'CellValue'

**Fix**: Add null checks and proper type guards for arithmetic operations

#### 6. SDK Type Error
- **File**: `src/lib/slashCommandSDK.ts:68`
- **Error**: Argument of type 'string | undefined' is not assignable to parameter of type 'string'
- **Fix**: Add null check before passing value

---

### Unused Variable Warnings (30)

These are declared but never used (can be safely removed or prefixed with underscore):

#### Changelog
- `src/changelog/loader.ts:94` - `parseEntry`

#### Components
- `src/components/MarketplaceStats.tsx:12` - `BusinessStatus`
- `src/components/MarketplaceStats.tsx:390` - `onFilterByCategory`
- `src/components/MarketplaceStats.tsx:392` - `liveUpdate`
- `src/components/PitchDeckEditor.tsx:60` - `isSaving`
- `src/components/SpreadsheetEditor.tsx:688` - `_renameSheet`

#### Dashboard
- `src/dashboard/BuilderView.tsx:3` - `Download`
- `src/dashboard/BuildPitchDeck.tsx:372` - `s`
- `src/dashboard/BuildPitchDeck.tsx:555` - `textSize`
- `src/dashboard/Inbox.tsx:22` - `session`
- `src/dashboard/Settings.tsx:702` - `subscriptionId`
- `src/dashboard/Spreadsheets.tsx:19` - `DollarSign`
- `src/dashboard/Spreadsheets.tsx:20` - `Calendar`
- `src/dashboard/Spreadsheets.tsx:21` - `Users`
- `src/dashboard/Spreadsheets.tsx:47` - `navigate`

#### Library Functions
- `src/lib/pdfExport.ts:203` - `templateStyles`
- `src/lib/slashCommandSDK.ts:60` - `queryOptions`
- `src/lib/spreadsheet/formulaParser.ts:459` - `matchType`
- `src/lib/spreadsheet/formulaParser.ts:475` - `lookupValue`
- `src/lib/spreadsheet/formulaParser.ts:476` - `colIndex`
- `src/lib/spreadsheet/hooks.ts:16` - `WorkbookData`

#### Pages
- `src/pages/Home.tsx:246` - `DepartmentGrid`

---

## Worker TypeScript Errors (13 total)

### Critical Errors (11)

#### 1. Stripe API Version Mismatch (7 instances)
All instances require updating from `"2024-11-20.acacia"` to `"2025-02-24.acacia"`:

- `src/routes/stripe-webhooks.ts:15`
- `src/routes/stripe.ts:11`
- `src/routes/stripe.ts:73`
- `src/routes/stripe.ts:107`
- `src/routes/stripe.ts:135`
- `src/routes/stripe.ts:162`
- `src/routes/wallet.ts:134`

**Fix**: Update all Stripe API version strings to `"2025-02-24.acacia"`

#### 2. Email Service Type Safety Issues
**File**: `src/services/emailService.ts`

Line 96 & 151:
- Error: 'errorData' is of type 'unknown'
- **Fix**: Add type assertion or proper type guard

Line 104 & 159:
- Error: 'resendData' is of type 'unknown'
- **Fix**: Add type assertion or proper type guard

### Unused Variable Warnings (2)

- `src/routes/stripe-webhooks.ts:11` - `signature`
- `src/routes/stripe-webhooks.ts:15` - `stripe`

---

## Configuration Issues

### Worker Build Script Missing
The worker package.json has no `build` script defined. Consider adding:
```json
"scripts": {
  "build": "wrangler deploy --dry-run"
}
```

---

## Recommendations

### Immediate Actions (Blocking)
1. Fix SpreadsheetEditor undefined variables (1431-1432)
2. Fix missing CSS imports (main.tsx, HomeOld.tsx)
3. Fix BorderAll import from lucide-react
4. Update all Stripe API versions to 2025-02-24.acacia
5. Fix formula parser null safety issues
6. Add type assertions in emailService.ts

### Quick Wins (Non-blocking)
1. Remove or prefix unused variables with underscore
2. Fix LucideIcon type-only import
3. Add worker build script

### Priority Order
1. **High**: Undefined variables, missing imports, type mismatches
2. **Medium**: Stripe API versions, null safety checks
3. **Low**: Unused variable cleanup

---

## Testing Commands

After fixes, run:
```bash
# Full validation
bun run validate

# Individual checks
bun run typecheck        # Web + Worker typecheck
cd apps/web && bun run build  # Web build
cd apps/worker && npm run typecheck  # Worker typecheck
```
