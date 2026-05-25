/**
 * Spreadsheet Templates
 *
 * Pre-built templates for common business financial modeling needs
 */

import type { CellFormat } from './formatting';

export interface TemplateCell {
  row: number;
  col: number;
  value?: string | number;
  formula?: string;
  format?: CellFormat;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'budget' | 'planning' | 'analysis';
  icon: string;
  sheets: {
    name: string;
    cells: TemplateCell[];
  }[];
}

// ───────────────────────────────────────────────────────────────────────────
// TEMPLATES
// ───────────────────────────────────────────────────────────────────────────

export const TEMPLATES: Template[] = [
  // ─── 3-Year Financial Projections ────────────────────────────────────────
  {
    id: 'financial-projections',
    name: '3-Year Financial Projections',
    description: 'Revenue, expenses, and profitability forecasts for startups',
    category: 'financial',
    icon: '📊',
    sheets: [
      {
        name: 'Projections',
        cells: [
          // Header
          { row: 0, col: 0, value: 'FINANCIAL PROJECTIONS', format: { fontWeight: 'bold', fontSize: 14 } },
          { row: 1, col: 0, value: '3-Year Forecast', format: { fontSize: 12, color: '#999999' } },

          // Column headers
          { row: 3, col: 0, value: 'Metric', format: { fontWeight: 'bold', backgroundColor: '#262626' } },
          { row: 3, col: 1, value: 'Year 1', format: { fontWeight: 'bold', backgroundColor: '#262626', textAlign: 'right' } },
          { row: 3, col: 2, value: 'Year 2', format: { fontWeight: 'bold', backgroundColor: '#262626', textAlign: 'right' } },
          { row: 3, col: 3, value: 'Year 3', format: { fontWeight: 'bold', backgroundColor: '#262626', textAlign: 'right' } },

          // Revenue section
          { row: 5, col: 0, value: 'REVENUE', format: { fontWeight: 'bold' } },
          { row: 6, col: 0, value: 'Product Sales' },
          { row: 6, col: 1, value: 100000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 6, col: 2, value: 300000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 6, col: 3, value: 750000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },

          { row: 7, col: 0, value: 'Subscriptions' },
          { row: 7, col: 1, value: 50000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 7, col: 2, value: 200000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 7, col: 3, value: 500000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },

          { row: 8, col: 0, value: 'Total Revenue', format: { fontWeight: 'bold' } },
          { row: 8, col: 1, formula: '=B7+B8', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, fontWeight: 'bold', borderTop: '1px solid #ffffff' } },
          { row: 8, col: 2, formula: '=C7+C8', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, fontWeight: 'bold', borderTop: '1px solid #ffffff' } },
          { row: 8, col: 3, formula: '=D7+D8', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, fontWeight: 'bold', borderTop: '1px solid #ffffff' } },

          // Expenses section
          { row: 10, col: 0, value: 'EXPENSES', format: { fontWeight: 'bold' } },
          { row: 11, col: 0, value: 'Salaries' },
          { row: 11, col: 1, value: 60000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 11, col: 2, value: 120000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 11, col: 3, value: 200000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },

          { row: 12, col: 0, value: 'Marketing' },
          { row: 12, col: 1, value: 20000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 12, col: 2, value: 50000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 12, col: 3, value: 100000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },

          { row: 13, col: 0, value: 'Operations' },
          { row: 13, col: 1, value: 15000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 13, col: 2, value: 30000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 13, col: 3, value: 50000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },

          { row: 14, col: 0, value: 'Total Expenses', format: { fontWeight: 'bold' } },
          { row: 14, col: 1, formula: '=SUM(B12:B14)', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, fontWeight: 'bold', borderTop: '1px solid #ffffff' } },
          { row: 14, col: 2, formula: '=SUM(C12:C14)', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, fontWeight: 'bold', borderTop: '1px solid #ffffff' } },
          { row: 14, col: 3, formula: '=SUM(D12:D14)', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, fontWeight: 'bold', borderTop: '1px solid #ffffff' } },

          // Profit section
          { row: 16, col: 0, value: 'NET PROFIT', format: { fontWeight: 'bold', fontSize: 13 } },
          { row: 16, col: 1, formula: '=B9-B15', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, fontWeight: 'bold', fontSize: 13, borderTop: '2px solid #ffffff' } },
          { row: 16, col: 2, formula: '=C9-C15', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, fontWeight: 'bold', fontSize: 13, borderTop: '2px solid #ffffff' } },
          { row: 16, col: 3, formula: '=D9-D15', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, fontWeight: 'bold', fontSize: 13, borderTop: '2px solid #ffffff' } },

          { row: 17, col: 0, value: 'Profit Margin', format: { fontWeight: 'bold' } },
          { row: 17, col: 1, formula: '=B17/B9', format: { numberFormat: 'percent', decimals: 1, fontWeight: 'bold' } },
          { row: 17, col: 2, formula: '=C17/C9', format: { numberFormat: 'percent', decimals: 1, fontWeight: 'bold' } },
          { row: 17, col: 3, formula: '=D17/D9', format: { numberFormat: 'percent', decimals: 1, fontWeight: 'bold' } },
        ],
      },
    ],
  },

  // ─── Startup Budget Template ─────────────────────────────────────────────
  {
    id: 'startup-budget',
    name: 'Startup Budget',
    description: 'Monthly budget and cash flow tracking for early-stage startups',
    category: 'budget',
    icon: '💰',
    sheets: [
      {
        name: 'Monthly Budget',
        cells: [
          // Header
          { row: 0, col: 0, value: 'STARTUP BUDGET', format: { fontWeight: 'bold', fontSize: 14 } },
          { row: 1, col: 0, value: 'Monthly Breakdown', format: { fontSize: 12, color: '#999999' } },

          // Column headers
          { row: 3, col: 0, value: 'Category', format: { fontWeight: 'bold', backgroundColor: '#262626' } },
          { row: 3, col: 1, value: 'Budget', format: { fontWeight: 'bold', backgroundColor: '#262626', textAlign: 'right' } },
          { row: 3, col: 2, value: 'Actual', format: { fontWeight: 'bold', backgroundColor: '#262626', textAlign: 'right' } },
          { row: 3, col: 3, value: 'Variance', format: { fontWeight: 'bold', backgroundColor: '#262626', textAlign: 'right' } },
          { row: 3, col: 4, value: '%', format: { fontWeight: 'bold', backgroundColor: '#262626', textAlign: 'right' } },

          // Income
          { row: 5, col: 0, value: 'INCOME', format: { fontWeight: 'bold' } },
          { row: 6, col: 0, value: 'Revenue' },
          { row: 6, col: 1, value: 10000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 6, col: 2, value: 8500, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 6, col: 3, formula: '=C7-B7', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 6, col: 4, formula: '=D7/B7', format: { numberFormat: 'percent', decimals: 1 } },

          // Expenses
          { row: 8, col: 0, value: 'EXPENSES', format: { fontWeight: 'bold' } },
          { row: 9, col: 0, value: 'Salaries & Payroll' },
          { row: 9, col: 1, value: 5000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 9, col: 2, value: 5000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 9, col: 3, formula: '=C10-B10', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 9, col: 4, formula: '=D10/B10', format: { numberFormat: 'percent', decimals: 1 } },

          { row: 10, col: 0, value: 'Office & Rent' },
          { row: 10, col: 1, value: 1500, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 10, col: 2, value: 1500, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 10, col: 3, formula: '=C11-B11', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 10, col: 4, formula: '=D11/B11', format: { numberFormat: 'percent', decimals: 1 } },

          { row: 11, col: 0, value: 'Marketing' },
          { row: 11, col: 1, value: 2000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 11, col: 2, value: 1800, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 11, col: 3, formula: '=C12-B12', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 11, col: 4, formula: '=D12/B12', format: { numberFormat: 'percent', decimals: 1 } },

          { row: 12, col: 0, value: 'Software & Tools' },
          { row: 12, col: 1, value: 500, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 12, col: 2, value: 450, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 12, col: 3, formula: '=C13-B13', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 12, col: 4, formula: '=D13/B13', format: { numberFormat: 'percent', decimals: 1 } },

          { row: 13, col: 0, value: 'Total Expenses', format: { fontWeight: 'bold' } },
          { row: 13, col: 1, formula: '=SUM(B10:B13)', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, fontWeight: 'bold', borderTop: '1px solid #ffffff' } },
          { row: 13, col: 2, formula: '=SUM(C10:C13)', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, fontWeight: 'bold', borderTop: '1px solid #ffffff' } },
          { row: 13, col: 3, formula: '=C14-B14', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, fontWeight: 'bold', borderTop: '1px solid #ffffff' } },
          { row: 13, col: 4, formula: '=D14/B14', format: { numberFormat: 'percent', decimals: 1, fontWeight: 'bold', borderTop: '1px solid #ffffff' } },

          // Net
          { row: 15, col: 0, value: 'NET CASH FLOW', format: { fontWeight: 'bold', fontSize: 13 } },
          { row: 15, col: 1, formula: '=B7-B14', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, fontWeight: 'bold', fontSize: 13, borderTop: '2px solid #ffffff' } },
          { row: 15, col: 2, formula: '=C7-C14', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, fontWeight: 'bold', fontSize: 13, borderTop: '2px solid #ffffff' } },
        ],
      },
    ],
  },

  // ─── Runway Calculator ───────────────────────────────────────────────────
  {
    id: 'runway-calculator',
    name: 'Runway Calculator',
    description: 'Calculate how long your startup can survive with current cash',
    category: 'planning',
    icon: '🛫',
    sheets: [
      {
        name: 'Runway',
        cells: [
          // Header
          { row: 0, col: 0, value: 'RUNWAY CALCULATOR', format: { fontWeight: 'bold', fontSize: 14 } },
          { row: 1, col: 0, value: 'Cash runway analysis', format: { fontSize: 12, color: '#999999' } },

          // Inputs
          { row: 3, col: 0, value: 'CURRENT SITUATION', format: { fontWeight: 'bold', backgroundColor: '#262626' } },
          { row: 4, col: 0, value: 'Cash in Bank' },
          { row: 4, col: 1, value: 500000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, backgroundColor: '#1e1e1e' } },

          { row: 5, col: 0, value: 'Monthly Burn Rate' },
          { row: 5, col: 1, value: 50000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, backgroundColor: '#1e1e1e' } },

          { row: 6, col: 0, value: 'Monthly Revenue' },
          { row: 6, col: 1, value: 10000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, backgroundColor: '#1e1e1e' } },

          // Calculations
          { row: 8, col: 0, value: 'RUNWAY ANALYSIS', format: { fontWeight: 'bold', backgroundColor: '#262626' } },
          { row: 9, col: 0, value: 'Net Monthly Burn' },
          { row: 9, col: 1, formula: '=B6-B7', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, fontWeight: 'bold' } },

          { row: 10, col: 0, value: 'Runway (months)' },
          { row: 10, col: 1, formula: '=B5/B10', format: { numberFormat: 'number', decimals: 1, fontWeight: 'bold', fontSize: 14, color: '#ff6b6b' } },

          { row: 11, col: 0, value: 'Runway End Date' },
          { row: 11, col: 1, value: 'Calculate manually', format: { color: '#999999' } },

          // Scenarios
          { row: 13, col: 0, value: 'SCENARIOS', format: { fontWeight: 'bold', backgroundColor: '#262626' } },
          { row: 14, col: 0, value: 'If revenue grows 50%' },
          { row: 14, col: 1, formula: '=B5/(B6-(B7*1.5))', format: { numberFormat: 'number', decimals: 1 } },
          { row: 14, col: 2, value: 'months' },

          { row: 15, col: 0, value: 'If burn reduced 20%' },
          { row: 15, col: 1, formula: '=B5/((B6*0.8)-B7)', format: { numberFormat: 'number', decimals: 1 } },
          { row: 15, col: 2, value: 'months' },

          { row: 16, col: 0, value: 'If raise $500k' },
          { row: 16, col: 1, formula: '=(B5+500000)/B10', format: { numberFormat: 'number', decimals: 1 } },
          { row: 16, col: 2, value: 'months' },
        ],
      },
    ],
  },

  // ─── Unit Economics ──────────────────────────────────────────────────────
  {
    id: 'unit-economics',
    name: 'Unit Economics',
    description: 'Calculate LTV, CAC, and other key SaaS metrics',
    category: 'analysis',
    icon: '📈',
    sheets: [
      {
        name: 'Metrics',
        cells: [
          // Header
          { row: 0, col: 0, value: 'UNIT ECONOMICS', format: { fontWeight: 'bold', fontSize: 14 } },
          { row: 1, col: 0, value: 'SaaS metrics calculator', format: { fontSize: 12, color: '#999999' } },

          // Inputs
          { row: 3, col: 0, value: 'INPUTS', format: { fontWeight: 'bold', backgroundColor: '#262626' } },
          { row: 4, col: 0, value: 'Avg Monthly Recurring Revenue per Customer' },
          { row: 4, col: 1, value: 100, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, backgroundColor: '#1e1e1e' } },

          { row: 5, col: 0, value: 'Avg Customer Lifetime (months)' },
          { row: 5, col: 1, value: 24, format: { numberFormat: 'number', decimals: 0, backgroundColor: '#1e1e1e' } },

          { row: 6, col: 0, value: 'Gross Margin %' },
          { row: 6, col: 1, value: 0.8, format: { numberFormat: 'percent', decimals: 0, backgroundColor: '#1e1e1e' } },

          { row: 7, col: 0, value: 'Total Marketing & Sales Spend' },
          { row: 7, col: 1, value: 50000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, backgroundColor: '#1e1e1e' } },

          { row: 8, col: 0, value: 'New Customers Acquired' },
          { row: 8, col: 1, value: 100, format: { numberFormat: 'number', decimals: 0, backgroundColor: '#1e1e1e' } },

          // Calculations
          { row: 10, col: 0, value: 'KEY METRICS', format: { fontWeight: 'bold', backgroundColor: '#262626' } },
          { row: 11, col: 0, value: 'Customer Lifetime Value (LTV)' },
          { row: 11, col: 1, formula: '=B5*B6*B7', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, fontWeight: 'bold', fontSize: 13 } },

          { row: 12, col: 0, value: 'Customer Acquisition Cost (CAC)' },
          { row: 12, col: 1, formula: '=B8/B9', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, fontWeight: 'bold', fontSize: 13 } },

          { row: 13, col: 0, value: 'LTV:CAC Ratio' },
          { row: 13, col: 1, formula: '=B12/B13', format: { numberFormat: 'number', decimals: 2, fontWeight: 'bold', fontSize: 13 } },

          { row: 14, col: 0, value: 'CAC Payback Period (months)' },
          { row: 14, col: 1, formula: '=B13/(B5*B7)', format: { numberFormat: 'number', decimals: 1, fontWeight: 'bold' } },

          // Benchmarks
          { row: 16, col: 0, value: 'BENCHMARKS', format: { fontWeight: 'bold', backgroundColor: '#262626' } },
          { row: 17, col: 0, value: 'Healthy LTV:CAC Ratio: > 3:1' },
          { row: 18, col: 0, value: 'Healthy Payback: < 12 months' },
          { row: 19, col: 0, value: 'Excellent LTV:CAC: > 5:1' },
        ],
      },
    ],
  },

  // ─── Hiring Plan ─────────────────────────────────────────────────────────
  {
    id: 'hiring-plan',
    name: 'Hiring Plan',
    description: 'Plan headcount and salary expenses over time',
    category: 'planning',
    icon: '👥',
    sheets: [
      {
        name: 'Headcount',
        cells: [
          // Header
          { row: 0, col: 0, value: 'HIRING PLAN', format: { fontWeight: 'bold', fontSize: 14 } },
          { row: 1, col: 0, value: 'Headcount & salary planning', format: { fontSize: 12, color: '#999999' } },

          // Column headers
          { row: 3, col: 0, value: 'Role', format: { fontWeight: 'bold', backgroundColor: '#262626' } },
          { row: 3, col: 1, value: 'Count', format: { fontWeight: 'bold', backgroundColor: '#262626', textAlign: 'right' } },
          { row: 3, col: 2, value: 'Salary', format: { fontWeight: 'bold', backgroundColor: '#262626', textAlign: 'right' } },
          { row: 3, col: 3, value: 'Total Cost', format: { fontWeight: 'bold', backgroundColor: '#262626', textAlign: 'right' } },
          { row: 3, col: 4, value: 'Start Date', format: { fontWeight: 'bold', backgroundColor: '#262626' } },

          // Roles
          { row: 5, col: 0, value: 'ENGINEERING', format: { fontWeight: 'bold' } },
          { row: 6, col: 0, value: 'Senior Engineer' },
          { row: 6, col: 1, value: 2, format: { numberFormat: 'number', decimals: 0 } },
          { row: 6, col: 2, value: 150000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 6, col: 3, formula: '=B7*C7', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, fontWeight: 'bold' } },
          { row: 6, col: 4, value: 'Q1 2024' },

          { row: 7, col: 0, value: 'Mid-level Engineer' },
          { row: 7, col: 1, value: 3, format: { numberFormat: 'number', decimals: 0 } },
          { row: 7, col: 2, value: 120000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 7, col: 3, formula: '=B8*C8', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, fontWeight: 'bold' } },
          { row: 7, col: 4, value: 'Q2 2024' },

          { row: 9, col: 0, value: 'PRODUCT', format: { fontWeight: 'bold' } },
          { row: 10, col: 0, value: 'Product Manager' },
          { row: 10, col: 1, value: 1, format: { numberFormat: 'number', decimals: 0 } },
          { row: 10, col: 2, value: 140000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 10, col: 3, formula: '=B11*C11', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, fontWeight: 'bold' } },
          { row: 10, col: 4, value: 'Q1 2024' },

          { row: 11, col: 0, value: 'Designer' },
          { row: 11, col: 1, value: 2, format: { numberFormat: 'number', decimals: 0 } },
          { row: 11, col: 2, value: 110000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 11, col: 3, formula: '=B12*C12', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, fontWeight: 'bold' } },
          { row: 11, col: 4, value: 'Q2 2024' },

          { row: 13, col: 0, value: 'SALES & MARKETING', format: { fontWeight: 'bold' } },
          { row: 14, col: 0, value: 'Sales Rep' },
          { row: 14, col: 1, value: 2, format: { numberFormat: 'number', decimals: 0 } },
          { row: 14, col: 2, value: 80000, format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true } },
          { row: 14, col: 3, formula: '=B15*C15', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, fontWeight: 'bold' } },
          { row: 14, col: 4, value: 'Q3 2024' },

          // Total
          { row: 16, col: 0, value: 'TOTAL', format: { fontWeight: 'bold', fontSize: 13 } },
          { row: 16, col: 1, formula: '=SUM(B7,B8,B11,B12,B15)', format: { numberFormat: 'number', decimals: 0, fontWeight: 'bold', borderTop: '2px solid #ffffff' } },
          { row: 16, col: 2, value: '', format: { borderTop: '2px solid #ffffff' } },
          { row: 16, col: 3, formula: '=SUM(D7,D8,D11,D12,D15)', format: { numberFormat: 'currency', decimals: 0, currencySymbol: '$', thousandsSeparator: true, fontWeight: 'bold', fontSize: 13, borderTop: '2px solid #ffffff' } },
        ],
      },
    ],
  },
];

/**
 * Get template by ID
 */
export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: Template['category']): Template[] {
  return TEMPLATES.filter((t) => t.category === category);
}
