# Spreadsheets Feature - Quick Start Guide

Get the spreadsheet feature running in under 5 minutes.

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Supabase project
- Nanowork project running

## Installation Steps

### 1. Run Database Migration

```bash
# Navigate to project root
cd /Users/jordan/Dev/nanowork-web

# Run migration
psql $DATABASE_URL -f supabase/migrations/20260524000001_spreadsheets.sql
```

Or using Supabase CLI:

```bash
supabase db push
```

### 2. Verify Backend Routes

Routes should already be registered in `backend/src/index.ts`:

```typescript
import spreadsheetsRouter from './routes/spreadsheets';
app.use('/api/spreadsheets', spreadsheetsRouter);
```

### 3. Verify Frontend Routes

Routes should already be registered in `apps/web/src/App.tsx`:

```typescript
import Spreadsheets from "./dashboard/Spreadsheets";
<Route path="spreadsheets" element={<Spreadsheets />} />
```

### 4. Start Development Server

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd apps/web
npm run dev
```

### 5. Test the Feature

1. Open browser to `http://localhost:5173`
2. Login to dashboard
3. Click "SPREADSHEETS" in sidebar (code: 04)
4. Click "NEW WORKBOOK" or "TEMPLATES"
5. Edit cells, add formulas, format data
6. Verify auto-save works
7. Test CSV export

## Quick Tests

### Test Formula Parser

```typescript
import { evaluateFormula } from '@/lib/spreadsheet/formulaParser';

const cellGetter = (row, col) => ({
  value: row === 0 ? 100 : 200,
});

const result = evaluateFormula('=SUM(A1:A2)', cellGetter);
console.log(result); // Should output: 300
```

### Test Formatting

```typescript
import { formatCellValue } from '@/lib/spreadsheet/formatting';

const formatted = formatCellValue(1234.56, {
  numberFormat: 'currency',
  currencySymbol: '$',
  decimals: 2,
});

console.log(formatted); // Should output: "$1,234.56"
```

### Test Template Loading

```typescript
import { TEMPLATES } from '@/lib/spreadsheet/templates';

console.log(TEMPLATES.length); // Should output: 5
console.log(TEMPLATES[0].name); // Should output: "3-Year Financial Projections"
```

### Test API Endpoint

```bash
# Create workbook
curl -X POST http://localhost:3000/api/spreadsheets/workbooks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Workbook"}'

# List workbooks
curl http://localhost:3000/api/spreadsheets/workbooks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Common Issues

### Issue: Migration Fails

**Solution**: Check if tables already exist:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%workbook%';
```

If tables exist, drop them first (dev only):
```sql
DROP TABLE IF EXISTS cells CASCADE;
DROP TABLE IF EXISTS sheets CASCADE;
DROP TABLE IF EXISTS workbooks CASCADE;
```

### Issue: 404 on API Routes

**Solution**: Verify backend is running and routes are registered:
```bash
# Check backend logs
cd backend
npm run dev

# Should see: "Server listening on port 3000"
```

### Issue: Components Not Found

**Solution**: Check import paths are correct:
```typescript
// Should be absolute imports
import SpreadsheetEditor from '@/components/SpreadsheetEditor';
import { evaluateFormula } from '@/lib/spreadsheet/formulaParser';
```

### Issue: Auto-save Not Working

**Solution**: Check browser console for errors. Verify:
1. Session token is valid
2. API endpoint is reachable
3. Network tab shows POST requests
4. Database has data after save

### Issue: Formulas Not Calculating

**Solution**: Check formula syntax:
```typescript
// Correct
=SUM(A1:A10)
=IF(B1>100, "High", "Low")

// Incorrect
SUM(A1:A10)        // Missing =
=SUM(A1..A10)      // Wrong range syntax
=IF B1>100         // Missing parentheses
```

## Development Workflow

### 1. Adding New Formula Functions

Edit `apps/web/src/lib/spreadsheet/formulaParser.ts`:

```typescript
const FUNCTIONS: Record<string, (args: CellValue[]) => FormulaResult> = {
  // Add your function
  MYFUNCTION: (args) => {
    // Validate args
    if (args.length !== 1) {
      return createError('VALUE', 'MYFUNCTION requires 1 argument');
    }
    
    // Implement logic
    const value = toNumber(args[0]);
    return value * 2;
  },
};
```

### 2. Creating New Templates

Edit `apps/web/src/lib/spreadsheet/templates.ts`:

```typescript
export const TEMPLATES: Template[] = [
  // ... existing templates
  
  {
    id: 'my-template',
    name: 'My Template',
    description: 'Description',
    category: 'financial',
    icon: '📊',
    sheets: [
      {
        name: 'Sheet1',
        cells: [
          { row: 0, col: 0, value: 'Label', format: { fontWeight: 'bold' } },
          { row: 1, col: 0, value: 100, format: { numberFormat: 'currency' } },
        ],
      },
    ],
  },
];
```

### 3. Adding Format Presets

Edit `apps/web/src/lib/spreadsheet/formatting.ts`:

```typescript
export const FORMAT_PRESETS: Record<string, CellFormat> = {
  // ... existing presets
  
  myPreset: {
    numberFormat: 'number',
    decimals: 2,
    fontWeight: 'bold',
    backgroundColor: '#1e1e1e',
  },
};
```

### 4. Extending API

Edit `backend/src/routes/spreadsheets.ts`:

```typescript
// Add new endpoint
router.post('/workbooks/:id/export-pdf', authenticateUser, async (req, res) => {
  // Implementation
});
```

## Testing Checklist

- [ ] Create blank workbook
- [ ] Create from template
- [ ] Edit cell values
- [ ] Enter formulas (=SUM, =IF, etc.)
- [ ] Apply formatting (currency, bold, etc.)
- [ ] Add new sheet
- [ ] Rename sheet
- [ ] Delete sheet
- [ ] Auto-save triggers
- [ ] Export to CSV
- [ ] Import from CSV
- [ ] Keyboard navigation works
- [ ] Search workbooks
- [ ] Delete workbook

## Performance Tips

1. **Use Batch Updates**: Update multiple cells at once via batch API
2. **Limit Formula Complexity**: Deep nesting can slow evaluation
3. **Sparse Storage**: Don't worry about empty cells, they're not stored
4. **Index Usage**: Database has optimized indexes for common queries

## Debugging Tools

### Enable Debug Logging

```typescript
// In browser console
localStorage.setItem('debug_formulas', 'true');
localStorage.setItem('debug_autosave', 'true');
```

### Check Formula Evaluation

```typescript
import { evaluateFormula, isError } from '@/lib/spreadsheet/formulaParser';

const result = evaluateFormula('=SUM(A1:A10)', cellGetter);
if (isError(result)) {
  console.error('Formula error:', result.type, result.message);
} else {
  console.log('Result:', result);
}
```

### Inspect Database

```sql
-- Check workbooks
SELECT id, name, owner_id, created_at FROM workbooks ORDER BY created_at DESC LIMIT 5;

-- Check sheets
SELECT id, workbook_id, name, position FROM sheets WHERE workbook_id = 'YOUR_WORKBOOK_ID';

-- Check cells
SELECT row_index, column_index, value, formula FROM cells 
WHERE sheet_id = 'YOUR_SHEET_ID' 
ORDER BY row_index, column_index 
LIMIT 20;

-- Check activity
SELECT action, details, created_at FROM spreadsheet_activity 
WHERE workbook_id = 'YOUR_WORKBOOK_ID' 
ORDER BY created_at DESC 
LIMIT 10;
```

## Next Steps

1. ✅ Feature is running
2. Run integration tests (when added)
3. User acceptance testing
4. Performance testing with large workbooks (1000+ cells)
5. Security audit
6. Deploy to production

## Resources

- **Full Documentation**: `/docs/SPREADSHEETS.md`
- **Library Docs**: `/apps/web/src/lib/spreadsheet/README.md`
- **Implementation Summary**: `/SPREADSHEETS_IMPLEMENTATION.md`
- **API Routes**: `/backend/src/routes/spreadsheets.ts`
- **Database Schema**: `/supabase/migrations/20260524000001_spreadsheets.sql`

## Support

Questions? Issues?
- Check documentation first
- Review code comments
- Check browser console for errors
- Verify API responses in Network tab
- Check database for data consistency

## Feature Flags (Future)

When adding feature flags:

```typescript
// In environment
VITE_ENABLE_SPREADSHEETS=true

// Check in code
if (import.meta.env.VITE_ENABLE_SPREADSHEETS === 'true') {
  // Show spreadsheets feature
}
```

---

**Status**: Ready to use! 🚀

**Time to First Workbook**: < 5 minutes
**Developer Onboarding**: < 10 minutes

Enjoy building with spreadsheets!
