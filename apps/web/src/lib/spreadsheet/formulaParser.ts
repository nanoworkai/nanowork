/**
 * Formula Parser and Calculator
 *
 * Parses and evaluates Excel-like formulas in spreadsheet cells.
 * Supports cell references (A1, B2), ranges (A1:B10), and common functions.
 */

// ───────────────────────────────────────────────────────────────────────────
// TYPES
// ───────────────────────────────────────────────────────────────────────────

export type CellValue = string | number | boolean | null;

export interface CellReference {
  sheet?: string;
  column: number;
  row: number;
}

export interface RangeReference {
  sheet?: string;
  start: { column: number; row: number };
  end: { column: number; row: number };
}

export interface FormulaError {
  type: 'REF' | 'VALUE' | 'DIV0' | 'NAME' | 'NUM' | 'NA' | 'CIRCULAR';
  message: string;
}

export type FormulaResult = CellValue | FormulaError;

export interface CellData {
  value: CellValue;
  formula?: string;
}

export type CellGetter = (row: number, col: number, sheet?: string) => CellData | null;

// ───────────────────────────────────────────────────────────────────────────
// UTILITIES
// ───────────────────────────────────────────────────────────────────────────

/**
 * Convert column letter(s) to zero-based column index
 * A -> 0, B -> 1, Z -> 25, AA -> 26, etc.
 */
export function columnLetterToIndex(letter: string): number {
  let index = 0;
  for (let i = 0; i < letter.length; i++) {
    index = index * 26 + (letter.charCodeAt(i) - 65 + 1);
  }
  return index - 1;
}

/**
 * Convert zero-based column index to letter(s)
 * 0 -> A, 1 -> B, 25 -> Z, 26 -> AA, etc.
 */
export function columnIndexToLetter(index: number): string {
  let letter = '';
  let num = index + 1;
  while (num > 0) {
    const mod = (num - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    num = Math.floor((num - mod) / 26);
  }
  return letter;
}

/**
 * Parse cell reference like "A1" or "Sheet1!B5"
 */
export function parseCellReference(ref: string): CellReference | null {
  const match = ref.match(/^(?:([A-Za-z0-9_]+)!)?([A-Z]+)(\d+)$/);
  if (!match) return null;

  const [, sheet, colLetter, rowStr] = match;
  return {
    sheet: sheet || undefined,
    column: columnLetterToIndex(colLetter),
    row: parseInt(rowStr) - 1, // Convert to 0-based
  };
}

/**
 * Parse range reference like "A1:B10" or "Sheet1!A1:B10"
 */
export function parseRangeReference(ref: string): RangeReference | null {
  const match = ref.match(/^(?:([A-Za-z0-9_]+)!)?([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
  if (!match) return null;

  const [, sheet, startCol, startRow, endCol, endRow] = match;
  return {
    sheet: sheet || undefined,
    start: {
      column: columnLetterToIndex(startCol),
      row: parseInt(startRow) - 1,
    },
    end: {
      column: columnLetterToIndex(endCol),
      row: parseInt(endRow) - 1,
    },
  };
}

/**
 * Check if value is an error
 */
export function isError(value: unknown): value is FormulaError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'message' in value
  );
}

/**
 * Create error object
 */
export function createError(type: FormulaError['type'], message: string): FormulaError {
  return { type, message };
}

/**
 * Convert value to number, handling errors and edge cases
 */
function toNumber(value: CellValue): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value === null || value === '') return 0;
  if (typeof value === 'string') {
    // Remove common formatting
    const cleaned = value.replace(/[$,]/g, '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

// ───────────────────────────────────────────────────────────────────────────
// FORMULA FUNCTIONS
// ───────────────────────────────────────────────────────────────────────────

const FUNCTIONS: Record<string, (args: CellValue[]) => FormulaResult> = {
  // ─── Math Functions ─────────────────────────────────────────────────────

  SUM: (args) => {
    return args.reduce((sum, val) => sum + toNumber(val), 0);
  },

  AVERAGE: (args) => {
    if (args.length === 0) return createError('VALUE', 'AVERAGE requires at least one argument');
    const sum = args.reduce((sum, val) => sum + toNumber(val), 0);
    return sum / args.length;
  },

  COUNT: (args) => {
    return args.filter(val => typeof val === 'number' || !isNaN(toNumber(val))).length;
  },

  COUNTA: (args) => {
    return args.filter(val => val !== null && val !== '').length;
  },

  MIN: (args) => {
    if (args.length === 0) return createError('VALUE', 'MIN requires at least one argument');
    const numbers = args.map(toNumber);
    return Math.min(...numbers);
  },

  MAX: (args) => {
    if (args.length === 0) return createError('VALUE', 'MAX requires at least one argument');
    const numbers = args.map(toNumber);
    return Math.max(...numbers);
  },

  ROUND: (args) => {
    if (args.length < 1) return createError('VALUE', 'ROUND requires at least 1 argument');
    const num = toNumber(args[0]);
    const decimals = args[1] !== undefined ? toNumber(args[1]) : 0;
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
  },

  ABS: (args) => {
    if (args.length !== 1) return createError('VALUE', 'ABS requires exactly 1 argument');
    return Math.abs(toNumber(args[0]));
  },

  SQRT: (args) => {
    if (args.length !== 1) return createError('VALUE', 'SQRT requires exactly 1 argument');
    const num = toNumber(args[0]);
    if (num < 0) return createError('NUM', 'Cannot take square root of negative number');
    return Math.sqrt(num);
  },

  POWER: (args) => {
    if (args.length !== 2) return createError('VALUE', 'POWER requires exactly 2 arguments');
    return Math.pow(toNumber(args[0]), toNumber(args[1]));
  },

  // ─── Financial Functions ────────────────────────────────────────────────

  PMT: (args) => {
    // PMT(rate, nper, pv, [fv], [type])
    // Calculate loan payment
    if (args.length < 3) return createError('VALUE', 'PMT requires at least 3 arguments');
    const rate = toNumber(args[0]);
    const nper = toNumber(args[1]);
    const pv = toNumber(args[2]);
    const fv = args[3] !== undefined ? toNumber(args[3]) : 0;
    const type = args[4] !== undefined ? toNumber(args[4]) : 0;

    if (rate === 0) return -(pv + fv) / nper;

    const pvif = Math.pow(1 + rate, nper);
    const pmt = (rate * (pv * pvif + fv)) / ((type === 1 ? 1 + rate : 1) * (pvif - 1));
    return -pmt;
  },

  NPV: (args) => {
    // NPV(rate, value1, [value2], ...)
    // Net present value
    if (args.length < 2) return createError('VALUE', 'NPV requires at least 2 arguments');
    const rate = toNumber(args[0]);
    const values = args.slice(1);

    return values.reduce((npv, value, index) => {
      return npv + toNumber(value) / Math.pow(1 + rate, index + 1);
    }, 0);
  },

  IRR: (args) => {
    // IRR(values, [guess])
    // Internal rate of return - simplified Newton's method
    if (args.length < 1) return createError('VALUE', 'IRR requires at least 1 argument');
    const values = args.map(toNumber);
    const guess = 0.1; // 10% initial guess

    // Simplified IRR calculation (Newton's method, max 20 iterations)
    let rate = guess;
    for (let i = 0; i < 20; i++) {
      let npv = 0;
      let dnpv = 0;

      for (let j = 0; j < values.length; j++) {
        const pow = Math.pow(1 + rate, j);
        npv += values[j] / pow;
        dnpv -= j * values[j] / ((1 + rate) * pow);
      }

      const newRate = rate - npv / dnpv;
      if (Math.abs(newRate - rate) < 0.000001) return newRate;
      rate = newRate;
    }

    return createError('NUM', 'IRR did not converge');
  },

  // ─── Logical Functions ──────────────────────────────────────────────────

  IF: (args) => {
    if (args.length < 2) return createError('VALUE', 'IF requires at least 2 arguments');
    const condition = args[0];
    const trueValue = args[1];
    const falseValue = args.length > 2 ? args[2] : null;

    // Evaluate condition
    const isTrue = typeof condition === 'boolean' ? condition : toNumber(condition) !== 0;
    return isTrue ? trueValue : falseValue;
  },

  AND: (args) => {
    if (args.length === 0) return createError('VALUE', 'AND requires at least 1 argument');
    return args.every(val => {
      if (typeof val === 'boolean') return val;
      return toNumber(val) !== 0;
    });
  },

  OR: (args) => {
    if (args.length === 0) return createError('VALUE', 'OR requires at least 1 argument');
    return args.some(val => {
      if (typeof val === 'boolean') return val;
      return toNumber(val) !== 0;
    });
  },

  NOT: (args) => {
    if (args.length !== 1) return createError('VALUE', 'NOT requires exactly 1 argument');
    const val = args[0];
    if (typeof val === 'boolean') return !val;
    return toNumber(val) === 0;
  },

  // ─── Text Functions ─────────────────────────────────────────────────────

  CONCAT: (args) => {
    return args.map(val => val === null ? '' : String(val)).join('');
  },

  LEFT: (args) => {
    if (args.length < 1) return createError('VALUE', 'LEFT requires at least 1 argument');
    const text = String(args[0] ?? '');
    const numChars = args[1] !== undefined ? toNumber(args[1]) : 1;
    return text.substring(0, numChars);
  },

  RIGHT: (args) => {
    if (args.length < 1) return createError('VALUE', 'RIGHT requires at least 1 argument');
    const text = String(args[0] ?? '');
    const numChars = args[1] !== undefined ? toNumber(args[1]) : 1;
    return text.substring(text.length - numChars);
  },

  MID: (args) => {
    if (args.length < 2) return createError('VALUE', 'MID requires at least 2 arguments');
    const text = String(args[0] ?? '');
    const startPos = toNumber(args[1]) - 1; // Convert to 0-based index
    const numChars = args[2] !== undefined ? toNumber(args[2]) : text.length;
    return text.substring(startPos, startPos + numChars);
  },

  LEN: (args) => {
    if (args.length !== 1) return createError('VALUE', 'LEN requires exactly 1 argument');
    return String(args[0] ?? '').length;
  },

  UPPER: (args) => {
    if (args.length !== 1) return createError('VALUE', 'UPPER requires exactly 1 argument');
    return String(args[0] ?? '').toUpperCase();
  },

  LOWER: (args) => {
    if (args.length !== 1) return createError('VALUE', 'LOWER requires exactly 1 argument');
    return String(args[0] ?? '').toLowerCase();
  },

  TRIM: (args) => {
    if (args.length !== 1) return createError('VALUE', 'TRIM requires exactly 1 argument');
    return String(args[0] ?? '').trim();
  },

  // ─── Date Functions ─────────────────────────────────────────────────────

  TODAY: () => {
    return new Date().toISOString().split('T')[0];
  },

  NOW: () => {
    return new Date().toISOString();
  },

  DATE: (args) => {
    if (args.length !== 3) return createError('VALUE', 'DATE requires exactly 3 arguments');
    const year = toNumber(args[0]);
    const month = toNumber(args[1]) - 1; // JS months are 0-based
    const day = toNumber(args[2]);
    const date = new Date(year, month, day);
    if (isNaN(date.getTime())) return createError('VALUE', 'Invalid date');
    return date.toISOString().split('T')[0];
  },

  YEAR: (args) => {
    if (args.length !== 1) return createError('VALUE', 'YEAR requires exactly 1 argument');
    const date = new Date(String(args[0]));
    if (isNaN(date.getTime())) return createError('VALUE', 'Invalid date');
    return date.getFullYear();
  },

  MONTH: (args) => {
    if (args.length !== 1) return createError('VALUE', 'MONTH requires exactly 1 argument');
    const date = new Date(String(args[0]));
    if (isNaN(date.getTime())) return createError('VALUE', 'Invalid date');
    return date.getMonth() + 1;
  },

  DAY: (args) => {
    if (args.length !== 1) return createError('VALUE', 'DAY requires exactly 1 argument');
    const date = new Date(String(args[0]));
    if (isNaN(date.getTime())) return createError('VALUE', 'Invalid date');
    return date.getDate();
  },

  // ─── Statistical Functions ──────────────────────────────────────────────

  MEDIAN: (args) => {
    if (args.length === 0) return createError('VALUE', 'MEDIAN requires at least one argument');
    const numbers = args.map(toNumber).filter(n => !isNaN(n)).sort((a, b) => a - b);
    if (numbers.length === 0) return createError('VALUE', 'No valid numbers for MEDIAN');
    const mid = Math.floor(numbers.length / 2);
    return numbers.length % 2 === 0 ? (numbers[mid - 1] + numbers[mid]) / 2 : numbers[mid];
  },

  // ─── Math Functions (Extended) ──────────────────────────────────────────

  ROUNDUP: (args) => {
    if (args.length < 1) return createError('VALUE', 'ROUNDUP requires at least 1 argument');
    const num = toNumber(args[0]);
    const decimals = args[1] !== undefined ? toNumber(args[1]) : 0;
    const factor = Math.pow(10, decimals);
    return Math.ceil(num * factor) / factor;
  },

  ROUNDDOWN: (args) => {
    if (args.length < 1) return createError('VALUE', 'ROUNDDOWN requires at least 1 argument');
    const num = toNumber(args[0]);
    const decimals = args[1] !== undefined ? toNumber(args[1]) : 0;
    const factor = Math.pow(10, decimals);
    return Math.floor(num * factor) / factor;
  },

  CEILING: (args) => {
    if (args.length < 1) return createError('VALUE', 'CEILING requires at least 1 argument');
    const num = toNumber(args[0]);
    const significance = args[1] !== undefined ? toNumber(args[1]) : 1;
    if (significance === 0) return 0;
    return Math.ceil(num / significance) * significance;
  },

  FLOOR: (args) => {
    if (args.length < 1) return createError('VALUE', 'FLOOR requires at least 1 argument');
    const num = toNumber(args[0]);
    const significance = args[1] !== undefined ? toNumber(args[1]) : 1;
    if (significance === 0) return 0;
    return Math.floor(num / significance) * significance;
  },

  // ─── Logical Functions (Extended) ───────────────────────────────────────

  IFERROR: (args) => {
    if (args.length < 2) return createError('VALUE', 'IFERROR requires at least 2 arguments');
    const value = args[0];
    const valueIfError = args[1];
    return isError(value) ? valueIfError : value;
  },

  // ─── Lookup Functions ───────────────────────────────────────────────────

  INDEX: (args) => {
    // INDEX(array, row_num, [col_num])
    // Simplified: returns the value at the specified position
    if (args.length < 2) return createError('VALUE', 'INDEX requires at least 2 arguments');
    // For single-column ranges, just return the nth item
    const rowNum = toNumber(args[1]) - 1; // Convert to 0-based
    if (rowNum < 0 || rowNum >= args.length) {
      return createError('REF', 'INDEX out of range');
    }
    return args[rowNum];
  },

  MATCH: (args) => {
    // MATCH(lookup_value, lookup_array, [match_type])
    // Returns position of value in array (1-based)
    if (args.length < 2) return createError('VALUE', 'MATCH requires at least 2 arguments');
    const lookupValue = args[0];
    const matchType = args.length > 2 ? toNumber(args[2]) : 1;

    // Search through the remaining args (the array)
    for (let i = 1; i < args.length; i++) {
      if (String(args[i]) === String(lookupValue)) {
        return i; // Return 1-based position
      }
    }
    return createError('NA', 'Value not found');
  },

  VLOOKUP: (args) => {
    // VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])
    // Simplified: searches first column for value, returns value from specified column
    if (args.length < 3) return createError('VALUE', 'VLOOKUP requires at least 3 arguments');

    const lookupValue = String(args[0]);
    const colIndex = toNumber(args[2]) - 1; // Convert to 0-based

    // This is a simplified implementation
    // In a real implementation, you'd need to handle the table array properly
    return createError('NA', 'VLOOKUP not fully implemented - use simpler cell references');
  },

  HLOOKUP: (args) => {
    // HLOOKUP(lookup_value, table_array, row_index_num, [range_lookup])
    // Similar to VLOOKUP but searches horizontally
    if (args.length < 3) return createError('VALUE', 'HLOOKUP requires at least 3 arguments');

    return createError('NA', 'HLOOKUP not fully implemented - use simpler cell references');
  },
};

// ───────────────────────────────────────────────────────────────────────────
// FORMULA EVALUATOR
// ───────────────────────────────────────────────────────────────────────────

/**
 * Evaluate a formula expression
 * Formula must start with = sign
 */
export function evaluateFormula(
  formula: string,
  cellGetter: CellGetter,
  currentSheet?: string,
  visited: Set<string> = new Set()
): FormulaResult {
  // Remove leading = sign
  if (!formula.startsWith('=')) {
    return createError('VALUE', 'Formula must start with =');
  }

  const expression = formula.substring(1).trim();

  try {
    return evaluateExpression(expression, cellGetter, currentSheet, visited);
  } catch (error) {
    return createError('VALUE', error instanceof Error ? error.message : 'Invalid formula');
  }
}

/**
 * Evaluate an expression (recursive)
 */
function evaluateExpression(
  expr: string,
  cellGetter: CellGetter,
  currentSheet?: string,
  visited: Set<string> = new Set()
): FormulaResult {
  expr = expr.trim();

  // Check for function call
  const funcMatch = expr.match(/^([A-Z]+)\((.*)\)$/s);
  if (funcMatch) {
    const [, funcName, argsStr] = funcMatch;
    const func = FUNCTIONS[funcName];

    if (!func) {
      return createError('NAME', `Unknown function: ${funcName}`);
    }

    // Parse arguments
    const args = parseArguments(argsStr, cellGetter, currentSheet, visited);

    // Check for errors in arguments
    for (const arg of args) {
      if (isError(arg)) return arg;
    }

    return func(args);
  }

  // Check for range reference (for use in functions)
  const rangeRef = parseRangeReference(expr);
  if (rangeRef) {
    const values: CellValue[] = [];
    for (let row = rangeRef.start.row; row <= rangeRef.end.row; row++) {
      for (let col = rangeRef.start.column; col <= rangeRef.end.column; col++) {
        const cell = cellGetter(row, col, rangeRef.sheet || currentSheet);
        if (cell?.formula) {
          const cellKey = `${rangeRef.sheet || currentSheet}!${row},${col}`;
          if (visited.has(cellKey)) {
            return createError('CIRCULAR', 'Circular reference detected');
          }
          visited.add(cellKey);
          const result = evaluateFormula(cell.formula, cellGetter, rangeRef.sheet || currentSheet, visited);
          visited.delete(cellKey);
          values.push(isError(result) ? null : result);
        } else {
          values.push(cell?.value ?? null);
        }
      }
    }
    return values.length === 1 ? values[0] : createError('VALUE', 'Range cannot be used here');
  }

  // Check for cell reference
  const cellRef = parseCellReference(expr);
  if (cellRef) {
    const cellKey = `${cellRef.sheet || currentSheet}!${cellRef.row},${cellRef.column}`;
    if (visited.has(cellKey)) {
      return createError('CIRCULAR', 'Circular reference detected');
    }

    const cell = cellGetter(cellRef.row, cellRef.column, cellRef.sheet || currentSheet);
    if (!cell) return null;

    if (cell.formula) {
      visited.add(cellKey);
      const result = evaluateFormula(cell.formula, cellGetter, cellRef.sheet || currentSheet, visited);
      visited.delete(cellKey);
      return result;
    }

    return cell.value;
  }

  // Check for arithmetic expression
  if (/[+\-*/()]/.test(expr)) {
    return evaluateArithmetic(expr, cellGetter, currentSheet, visited);
  }

  // Try to parse as number
  const num = parseFloat(expr);
  if (!isNaN(num)) return num;

  // Try to parse as string (remove quotes)
  if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
    return expr.substring(1, expr.length - 1);
  }

  // Try to parse as boolean
  if (expr === 'TRUE') return true;
  if (expr === 'FALSE') return false;

  return expr; // Return as string
}

/**
 * Parse function arguments, handling ranges and nested functions
 */
function parseArguments(
  argsStr: string,
  cellGetter: CellGetter,
  currentSheet?: string,
  visited: Set<string> = new Set()
): CellValue[] {
  if (!argsStr.trim()) return [];

  const args: CellValue[] = [];
  let current = '';
  let depth = 0;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < argsStr.length; i++) {
    const char = argsStr[i];

    if (!inString && (char === '"' || char === "'")) {
      inString = true;
      stringChar = char;
      current += char;
    } else if (inString && char === stringChar) {
      inString = false;
      current += char;
    } else if (!inString && char === '(') {
      depth++;
      current += char;
    } else if (!inString && char === ')') {
      depth--;
      current += char;
    } else if (!inString && char === ',' && depth === 0) {
      // Argument separator
      const arg = current.trim();

      // Check if it's a range
      const rangeRef = parseRangeReference(arg);
      if (rangeRef) {
        // Expand range into individual values
        for (let row = rangeRef.start.row; row <= rangeRef.end.row; row++) {
          for (let col = rangeRef.start.column; col <= rangeRef.end.column; col++) {
            const cell = cellGetter(row, col, rangeRef.sheet || currentSheet);
            if (cell?.formula) {
              const result = evaluateFormula(cell.formula, cellGetter, rangeRef.sheet || currentSheet, visited);
              args.push(isError(result) ? null : result);
            } else {
              args.push(cell?.value ?? null);
            }
          }
        }
      } else {
        const result = evaluateExpression(arg, cellGetter, currentSheet, visited);
        args.push(result);
      }

      current = '';
    } else {
      current += char;
    }
  }

  // Add last argument
  if (current.trim()) {
    const arg = current.trim();
    const rangeRef = parseRangeReference(arg);
    if (rangeRef) {
      for (let row = rangeRef.start.row; row <= rangeRef.end.row; row++) {
        for (let col = rangeRef.start.column; col <= rangeRef.end.column; col++) {
          const cell = cellGetter(row, col, rangeRef.sheet || currentSheet);
          if (cell?.formula) {
            const result = evaluateFormula(cell.formula, cellGetter, rangeRef.sheet || currentSheet, visited);
            args.push(isError(result) ? null : result);
          } else {
            args.push(cell?.value ?? null);
          }
        }
      }
    } else {
      const result = evaluateExpression(arg, cellGetter, currentSheet, visited);
      args.push(result);
    }
  }

  return args;
}

/**
 * Evaluate arithmetic expression (simple implementation)
 */
function evaluateArithmetic(
  expr: string,
  cellGetter: CellGetter,
  currentSheet?: string,
  visited: Set<string> = new Set()
): FormulaResult {
  // This is a simplified arithmetic evaluator
  // For production, consider using a proper expression parser library

  try {
    // Replace cell references with their values
    let processed = expr;

    // Find all cell references
    const cellRefs = expr.match(/[A-Z]+\d+/g) || [];
    for (const ref of cellRefs) {
      const cellRef = parseCellReference(ref);
      if (cellRef) {
        const value = evaluateExpression(ref, cellGetter, currentSheet, visited);
        if (isError(value)) return value;
        processed = processed.replace(ref, String(toNumber(value)));
      }
    }

    // Evaluate the expression using Function constructor (safe in this context)
    // In production, use a proper math expression parser
    const result = Function('"use strict"; return (' + processed + ')')();
    return typeof result === 'number' ? result : createError('VALUE', 'Invalid arithmetic expression');
  } catch (error) {
    return createError('VALUE', 'Invalid arithmetic expression');
  }
}
