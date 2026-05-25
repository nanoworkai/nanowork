# Spreadsheet Library

Excel-like spreadsheet functionality for Nanowork dashboard.

## Quick Start

```tsx
import SpreadsheetEditor from '@/components/SpreadsheetEditor';

function MyPage() {
  return (
    <SpreadsheetEditor
      workbookId="uuid"
      onSave={(workbook) => {
        // Handle save
      }}
      onClose={() => {
        // Handle close
      }}
    />
  );
}
```

## Features

- ✅ Cell editing with formulas
- ✅ 30+ Excel functions (SUM, IF, PMT, etc.)
- ✅ Multiple sheets/tabs
- ✅ Currency, percent, date formatting
- ✅ Auto-save
- ✅ CSV import/export
- ✅ Pre-built templates
- ⏳ AI formula assistant (coming soon)

## Formula Examples

```javascript
=SUM(A1:A10)                    // Sum range
=AVERAGE(B1:B5)                 // Average
=IF(C1>100, "High", "Low")      // Conditional
=PMT(0.05/12, 360, 200000)      // Loan payment
=B2*C2                          // Arithmetic
=CONCAT("Total: ", A1)          // Text
```

## Using Templates

```typescript
import { TEMPLATES, getTemplate } from '@/lib/spreadsheet/templates';

// Get template
const template = getTemplate('financial-projections');

// Create workbook from template
const response = await fetch('/api/spreadsheets/workbooks/from-template', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    template_id: template.id,
    name: 'My Projections',
    template_data: template,
  }),
});
```

## Custom Formatting

```typescript
import { formatCellValue, FORMAT_PRESETS } from '@/lib/spreadsheet/formatting';

// Format as currency
const formatted = formatCellValue(1234.56, FORMAT_PRESETS.currency);
// Output: "$1,234.56"

// Format as percent
const percent = formatCellValue(0.25, FORMAT_PRESETS.percent);
// Output: "25.0%"

// Custom format
const custom = formatCellValue(1000, {
  numberFormat: 'number',
  decimals: 0,
  thousandsSeparator: true,
});
// Output: "1,000"
```

## Adding New Functions

Edit `formulaParser.ts`:

```typescript
const FUNCTIONS: Record<string, (args: CellValue[]) => FormulaResult> = {
  // ... existing functions
  
  // Add new function
  MYFUNC: (args) => {
    if (args.length !== 2) {
      return createError('VALUE', 'MYFUNC requires 2 arguments');
    }
    const a = toNumber(args[0]);
    const b = toNumber(args[1]);
    return a * b + 10;
  },
};
```

## Creating Templates

Edit `templates.ts`:

```typescript
export const TEMPLATES: Template[] = [
  // ... existing templates
  
  {
    id: 'my-template',
    name: 'My Template',
    description: 'Description here',
    category: 'financial',
    icon: '📊',
    sheets: [
      {
        name: 'Sheet1',
        cells: [
          {
            row: 0,
            col: 0,
            value: 'Header',
            format: { fontWeight: 'bold' }
          },
          {
            row: 1,
            col: 0,
            formula: '=SUM(A2:A10)',
            format: { numberFormat: 'currency' }
          },
        ],
      },
    ],
  },
];
```

## Architecture

```
src/lib/spreadsheet/
├── formulaParser.ts       # Formula evaluation engine
├── formatting.ts          # Cell formatting utilities
└── templates.ts           # Pre-built templates

src/components/
└── SpreadsheetEditor.tsx  # Main editor component

backend/src/routes/
└── spreadsheets.ts        # API routes

supabase/migrations/
└── 20260524000001_spreadsheets.sql  # Database schema
```

## Performance Tips

1. **Sparse Storage**: Empty cells aren't stored
2. **Batch Updates**: Use batch API for multiple cell changes
3. **Formula Caching**: Computed values are cached
4. **Lazy Evaluation**: Formulas only run when needed

## Common Patterns

### Load Workbook

```typescript
const response = await fetch(`/api/spreadsheets/workbooks/${id}`, {
  headers: { 'Authorization': `Bearer ${token}` },
});
const { workbook, sheets } = await response.json();
```

### Update Cells (Auto-save)

```typescript
const cells = [
  { row_index: 0, column_index: 0, value: 'Revenue', data_type: 'string' },
  { row_index: 1, column_index: 0, formula: '=SUM(A2:A10)', data_type: 'formula' },
];

await fetch('/api/spreadsheets/cells/batch', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ sheet_id, cells }),
});
```

### Export to CSV

```typescript
// Client-side CSV export (no API call needed)
const csv = exportSheetToCSV(sheet);
downloadFile(csv, 'data.csv', 'text/csv');
```

## Testing

```bash
# Run tests
npm test -- spreadsheet

# Test specific file
npm test -- formulaParser.test.ts
```

## Debugging

```typescript
// Enable debug logging
localStorage.setItem('debug_formulas', 'true');

// Check formula evaluation
const result = evaluateFormula('=SUM(A1:A10)', cellGetter);
console.log('Result:', result);
```

## See Also

- [Full Documentation](../../../../docs/SPREADSHEETS.md)
- [API Reference](../../../../backend/src/routes/spreadsheets.ts)
- [Database Schema](../../../../supabase/migrations/20260524000001_spreadsheets.sql)
