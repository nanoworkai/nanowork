# Spreadsheets Feature Documentation

## Overview

The Spreadsheets feature provides users with Excel-like functionality directly in the Nanowork dashboard. Users can create financial models, budgets, projections, and other business planning spreadsheets with AI-assisted features.

## Key Features

### 1. **Core Spreadsheet Functionality**
- **Grid System**: Rows and columns with cell selection and editing
- **Formulas**: Full formula support with 30+ functions (SUM, AVERAGE, IF, PMT, etc.)
- **Cell References**: A1 notation, ranges (A1:B10), cross-sheet references
- **Data Types**: Automatic detection (number, currency, date, percent, text)
- **Formatting**: Currency, percentages, decimals, bold/italic, alignment, borders
- **Multiple Sheets**: Tabs for organizing data (Budget, Revenue, Expenses, etc.)
- **Auto-save**: Automatic saving every 30 seconds
- **Import/Export**: CSV import and export

### 2. **Template Library**
Pre-built templates for common business needs:
- **3-Year Financial Projections**: Revenue, expenses, profitability forecasts
- **Startup Budget**: Monthly budget tracking with variance analysis
- **Runway Calculator**: Cash runway and burn rate analysis
- **Unit Economics**: LTV, CAC, and SaaS metrics calculator
- **Hiring Plan**: Headcount and salary expense planning

### 3. **AI-Assisted Features** (Coming Soon)
- **Formula Helper**: Natural language to formula conversion
- **Data Insights**: AI analyzes data and suggests insights
- **Auto-fill**: Predictive data filling based on patterns
- **Scenario Planning**: AI helps model different business scenarios

### 4. **Terminal Aesthetic Integration**
- Monospace fonts (SF Mono)
- Dark theme with sharp corners
- Clean, professional interface
- Keyboard navigation support

## Architecture

### Database Schema

#### Tables
1. **workbooks** - Top-level spreadsheet documents
   - Metadata: name, description, owner, build association
   - Settings: auto-save, theme, display options
   - Templating support

2. **sheets** - Individual tabs within workbooks
   - Properties: name, position, visibility
   - Grid dimensions: row/column count
   - Frozen rows/columns

3. **cells** - Individual cell data (sparse storage)
   - Position: row_index, column_index
   - Content: value, formula, computed_value
   - Formatting: JSONB with all format properties
   - Data type tracking

4. **named_ranges** - Named cell ranges for easier formulas
   - Example: "Revenue" -> A1:A12

5. **spreadsheet_insights** - AI-generated insights
   - Pattern detection
   - Trend analysis
   - Suggestions

6. **spreadsheet_activity** - Audit log
   - User actions
   - Collaboration tracking

### Frontend Components

```
src/
├── components/
│   └── SpreadsheetEditor.tsx         # Main editor component
├── lib/spreadsheet/
│   ├── formulaParser.ts              # Formula evaluation engine
│   ├── formatting.ts                 # Cell formatting utilities
│   └── templates.ts                  # Pre-built templates
└── dashboard/
    └── Spreadsheets.tsx              # Dashboard page
```

### Backend API Routes

```
POST   /api/spreadsheets/workbooks              # Create workbook
GET    /api/spreadsheets/workbooks              # List workbooks
GET    /api/spreadsheets/workbooks/:id          # Get workbook with data
PATCH  /api/spreadsheets/workbooks/:id          # Update workbook
DELETE /api/spreadsheets/workbooks/:id          # Delete workbook

POST   /api/spreadsheets/sheets                 # Create sheet
PATCH  /api/spreadsheets/sheets/:id             # Update sheet
DELETE /api/spreadsheets/sheets/:id             # Delete sheet

POST   /api/spreadsheets/cells/batch            # Batch update cells (auto-save)
DELETE /api/spreadsheets/cells/batch            # Batch delete cells

POST   /api/spreadsheets/workbooks/from-template # Create from template
```

## Formula Engine

### Supported Functions

#### Math Functions
- `SUM(range)` - Sum of values
- `AVERAGE(range)` - Average of values
- `COUNT(range)` - Count numbers
- `COUNTA(range)` - Count non-empty cells
- `MIN(range)` - Minimum value
- `MAX(range)` - Maximum value
- `ROUND(number, decimals)` - Round number
- `ABS(number)` - Absolute value
- `SQRT(number)` - Square root
- `POWER(base, exponent)` - Power function

#### Financial Functions
- `PMT(rate, nper, pv, [fv], [type])` - Loan payment
- `NPV(rate, values...)` - Net present value
- `IRR(values, [guess])` - Internal rate of return

#### Logical Functions
- `IF(condition, true_value, false_value)` - Conditional
- `AND(values...)` - Logical AND
- `OR(values...)` - Logical OR
- `NOT(value)` - Logical NOT

#### Text Functions
- `CONCAT(values...)` - Concatenate strings
- `LEFT(text, [num_chars])` - Left substring
- `RIGHT(text, [num_chars])` - Right substring
- `LEN(text)` - String length
- `UPPER(text)` - Convert to uppercase
- `LOWER(text)` - Convert to lowercase

#### Date Functions
- `TODAY()` - Current date
- `NOW()` - Current date and time
- `YEAR(date)` - Extract year
- `MONTH(date)` - Extract month
- `DAY(date)` - Extract day

### Formula Syntax

```
=SUM(A1:A10)                    # Sum range
=B2*C2                          # Arithmetic
=IF(A1>100, "High", "Low")      # Conditional
=SUM(Sheet2!A1:A10)             # Cross-sheet reference
=PMT(0.05/12, 360, 200000)      # Loan payment
```

### Cell References
- `A1` - Single cell
- `A1:B10` - Range
- `Sheet2!A1` - Cross-sheet reference
- `Sheet2!A1:B10` - Cross-sheet range

## Data Flow

### Creating a Workbook

```typescript
// 1. User creates blank workbook
POST /api/spreadsheets/workbooks
{
  "name": "Q1 Budget",
  "build_id": "uuid" // Optional - associate with build
}

// Response includes default sheet
{
  "workbook": { id, name, ... },
  "sheets": [{ id, name: "Sheet1", ... }]
}
```

### Auto-Save Flow

```typescript
// Every 30 seconds, batch update changed cells
POST /api/spreadsheets/cells/batch
{
  "sheet_id": "uuid",
  "cells": [
    {
      "row_index": 0,
      "column_index": 0,
      "value": "Revenue",
      "data_type": "string",
      "format": { fontWeight: "bold" }
    },
    {
      "row_index": 1,
      "column_index": 0,
      "value": null,
      "formula": "=SUM(A2:A10)",
      "computed_value": "150000",
      "data_type": "formula"
    }
  ]
}
```

### Using Templates

```typescript
// 1. Select template from frontend
const template = TEMPLATES.find(t => t.id === 'financial-projections');

// 2. Create workbook from template
POST /api/spreadsheets/workbooks/from-template
{
  "template_id": "financial-projections",
  "name": "My Projections",
  "template_data": template // Full template object
}

// Backend creates workbook, sheets, and pre-fills cells
```

## Usage Examples

### Example 1: Financial Projections

```typescript
// Create 3-year projection
const template = getTemplate('financial-projections');
const workbook = await createFromTemplate(template);

// Customize values
updateCell(6, 1, 250000); // Year 1 revenue
updateCell(6, 2, 750000); // Year 2 revenue
updateCell(6, 3, 2000000); // Year 3 revenue

// Formulas auto-calculate totals
```

### Example 2: Budget Tracking

```typescript
// Create monthly budget
const template = getTemplate('startup-budget');
const workbook = await createFromTemplate(template);

// Update actual expenses
updateCell(9, 2, 5200); // Actual salaries
updateCell(10, 2, 1450); // Actual rent

// Variance calculations are automatic
```

### Example 3: Custom Spreadsheet

```typescript
// Create blank workbook
const workbook = await createWorkbook('Custom Model');

// Add headers
updateCell(0, 0, 'Month');
updateCell(0, 1, 'Revenue');
updateCell(0, 2, 'Growth %');

// Add data
updateCell(1, 0, 'Jan');
updateCell(1, 1, 10000);
updateCell(1, 2, '=B2/10000-1'); // Formula for growth

// Apply formatting
applyFormat(0, 0, { fontWeight: 'bold', backgroundColor: '#262626' });
applyFormat(1, 2, { numberFormat: 'percent', decimals: 1 });
```

## Keyboard Shortcuts

- **Arrow Keys**: Navigate cells
- **Enter**: Edit cell / Move down
- **Tab**: Move right
- **Escape**: Cancel edit
- **Delete/Backspace**: Clear cell
- **Type**: Start editing

## Performance Optimizations

1. **Sparse Cell Storage**: Only non-empty cells are stored in database
2. **Batch Updates**: Auto-save batches changes every 30 seconds
3. **Lazy Formula Evaluation**: Formulas only evaluated when needed
4. **Virtual Scrolling**: Only renders visible cells (planned)
5. **Cell Caching**: Computed values cached to avoid re-calculation

## Security

- **Row-Level Security (RLS)**: Users can only access their own workbooks
- **Ownership Verification**: All mutations verify ownership
- **Formula Sandboxing**: Formulas run in safe evaluation context
- **No External Calls**: Formulas cannot access external APIs

## Future Enhancements

### Phase 2: AI Features
- Natural language formula generation
- Automated insights and recommendations
- Data pattern detection
- Anomaly alerts

### Phase 3: Collaboration
- Real-time co-editing
- Cell comments
- Version history
- Share with team members

### Phase 4: Advanced Features
- Charts and visualizations
- Pivot tables
- Data validation rules
- Conditional formatting
- More formula functions
- PDF export
- Print layouts

### Phase 5: Integration
- Link spreadsheets to builds
- Auto-populate from business data
- Export to accounting software
- API access

## Testing

```bash
# Run formula parser tests
npm test -- formulaParser.test.ts

# Run formatting tests
npm test -- formatting.test.ts

# Integration tests
npm test -- spreadsheets.test.ts
```

## Debugging

### Common Issues

1. **Formula not calculating**
   - Check for circular references
   - Verify cell reference syntax
   - Check function name spelling

2. **Auto-save not working**
   - Check network connection
   - Verify session token
   - Check browser console for errors

3. **Formatting not applied**
   - Ensure format object is valid
   - Check cell has been created
   - Verify format is saved to database

### Debug Mode

```typescript
// Enable formula evaluation logging
localStorage.setItem('debug_formulas', 'true');

// Enable auto-save logging
localStorage.setItem('debug_autosave', 'true');
```

## Migration Guide

### Running the Migration

```bash
# Apply spreadsheets migration
cd supabase
psql $DATABASE_URL -f migrations/20260524000001_spreadsheets.sql
```

### Seeding Templates

Templates are defined in code (`src/lib/spreadsheet/templates.ts`) and sent to the backend when creating from template. No database seeding required.

## API Examples

### Create Workbook

```bash
curl -X POST https://api.nanowork.app/api/spreadsheets/workbooks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Budget",
    "description": "Q1 2024 Budget"
  }'
```

### Update Cells

```bash
curl -X POST https://api.nanowork.app/api/spreadsheets/cells/batch \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sheet_id": "uuid",
    "cells": [
      {
        "row_index": 0,
        "column_index": 0,
        "value": "Revenue",
        "data_type": "string"
      }
    ]
  }'
```

### Export to CSV

```bash
# Frontend handles CSV export client-side
# Click Download button in editor
```

## Contributing

When adding new features:

1. **New Formula Functions**: Add to `formulaParser.ts` FUNCTIONS object
2. **New Templates**: Add to `templates.ts` TEMPLATES array
3. **New Formats**: Add to `formatting.ts` FORMAT_PRESETS
4. **API Routes**: Add to `backend/src/routes/spreadsheets.ts`

## Support

For questions or issues:
- GitHub Issues: https://github.com/nanowork/nanowork-web/issues
- Documentation: https://docs.nanowork.app/spreadsheets
- Discord: https://discord.gg/nanowork

---

Built with ❤️ for the Nanowork platform
