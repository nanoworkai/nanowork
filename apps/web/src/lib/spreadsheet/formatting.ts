/**
 * Cell Formatting Utilities
 *
 * Handles number formatting, currency, percentages, dates, etc.
 */

export interface CellFormat {
  numberFormat?: string; // 'general', 'number', 'currency', 'percent', 'date', 'time', 'custom'
  dateFormat?: 'MM/DD/YYYY' | 'DD-MMM-YYYY' | 'YYYY-MM-DD' | 'MMM D, YYYY' | 'D MMM YYYY';
  decimals?: number;
  currencySymbol?: string;
  thousandsSeparator?: boolean;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  color?: string;
  backgroundColor?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderAll?: string;
}

/**
 * Format a cell value for display based on format settings
 */
export function formatCellValue(value: unknown, format: CellFormat = {}): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const numberFormat = format.numberFormat || 'general';

  switch (numberFormat) {
    case 'number':
      return formatNumber(value, format);

    case 'currency':
      return formatCurrency(value, format);

    case 'percent':
      return formatPercent(value, format);

    case 'date':
      return formatDate(value, format);

    case 'time':
      return formatTime(value);

    case 'general':
    default:
      return String(value);
  }
}

/**
 * Format as number with optional decimals and thousands separator
 */
function formatNumber(value: unknown, format: CellFormat): string {
  const num = Number(value);
  if (isNaN(num)) return String(value);

  const decimals = format.decimals ?? 2;
  const fixed = num.toFixed(decimals);

  if (format.thousandsSeparator) {
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  return fixed;
}

/**
 * Format as currency
 */
function formatCurrency(value: unknown, format: CellFormat): string {
  const num = Number(value);
  if (isNaN(num)) return String(value);

  const symbol = format.currencySymbol || '$';
  const decimals = format.decimals ?? 2;
  const fixed = Math.abs(num).toFixed(decimals);

  // Add thousands separator
  const parts = fixed.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formatted = parts.join('.');

  // Handle negative values
  if (num < 0) {
    return `(${symbol}${formatted})`;
  }

  return `${symbol}${formatted}`;
}

/**
 * Format as percentage
 */
function formatPercent(value: unknown, format: CellFormat): string {
  const num = Number(value);
  if (isNaN(num)) return String(value);

  const decimals = format.decimals ?? 1;
  const percent = (num * 100).toFixed(decimals);

  return `${percent}%`;
}

/**
 * Format as date with support for multiple formats
 */
function formatDate(value: unknown, format?: CellFormat): string {
  const date = new Date(String(value));
  if (isNaN(date.getTime())) return String(value);

  const dateFormat = format?.dateFormat || 'MM/DD/YYYY';
  const month = date.getMonth();
  const day = date.getDate();
  const year = date.getFullYear();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  switch (dateFormat) {
    case 'MM/DD/YYYY':
      return `${String(month + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}/${year}`;
    case 'DD-MMM-YYYY':
      return `${String(day).padStart(2, '0')}-${monthNames[month]}-${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    case 'MMM D, YYYY':
      return `${monthNames[month]} ${day}, ${year}`;
    case 'D MMM YYYY':
      return `${day} ${monthNames[month]} ${year}`;
    default:
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
  }
}

/**
 * Format as time
 */
function formatTime(value: unknown): string {
  const date = new Date(String(value));
  if (isNaN(date.getTime())) return String(value);

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Parse a formatted value back to raw value
 * Useful when user edits a formatted cell
 */
export function parseFormattedValue(formatted: string, format: CellFormat = {}): string | number {
  const numberFormat = format.numberFormat || 'general';

  switch (numberFormat) {
    case 'currency':
    case 'number': {
      // Remove formatting characters
      const cleaned = formatted.replace(/[$,()]/g, '').trim();
      const num = parseFloat(cleaned);
      if (isNaN(num)) return formatted;
      // Check if it was negative (in parentheses)
      if (formatted.includes('(') && formatted.includes(')')) {
        return -num;
      }
      return num;
    }

    case 'percent': {
      const cleaned = formatted.replace(/%/g, '').trim();
      const num = parseFloat(cleaned);
      if (isNaN(num)) return formatted;
      return num / 100; // Store as decimal
    }

    default:
      return formatted;
  }
}

/**
 * Get CSS styles from cell format
 */
export function getCellStyles(format: CellFormat = {}): React.CSSProperties {
  const styles: React.CSSProperties = {
    fontFamily: format.fontFamily || 'SF Mono, Monaco, monospace',
    fontSize: format.fontSize ? `${format.fontSize}px` : '12px',
    fontWeight: format.fontWeight || 'normal',
    fontStyle: format.fontStyle || 'normal',
    textDecoration: format.textDecoration || 'none',
    textAlign: format.textAlign || 'left',
    verticalAlign: format.verticalAlign || 'middle',
    color: format.color || '#ffffff',
    backgroundColor: format.backgroundColor || 'transparent',
  };

  // Apply individual borders or all borders
  if (format.borderAll) {
    styles.border = format.borderAll;
  } else {
    if (format.borderTop) styles.borderTop = format.borderTop;
    if (format.borderRight) styles.borderRight = format.borderRight;
    if (format.borderBottom) styles.borderBottom = format.borderBottom;
    if (format.borderLeft) styles.borderLeft = format.borderLeft;
  }

  return styles;
}

/**
 * Detect data type from value
 */
export function detectDataType(value: string): 'number' | 'date' | 'boolean' | 'formula' | 'string' {
  if (!value || typeof value !== 'string') return 'string';

  // Formula
  if (value.startsWith('=')) return 'formula';

  // Boolean
  if (value === 'TRUE' || value === 'FALSE' || value === 'true' || value === 'false') {
    return 'boolean';
  }

  // Number (including currency and percentages)
  const numberPattern = /^[$]?-?\d{1,3}(,?\d{3})*(\.\d+)?%?$/;
  if (numberPattern.test(value.replace(/\s/g, ''))) {
    return 'number';
  }

  // Date
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{1,2}\/\d{1,2}\/\d{4}$/, // MM/DD/YYYY
    /^\d{1,2}-\d{1,2}-\d{4}$/, // MM-DD-YYYY
  ];
  if (datePatterns.some(pattern => pattern.test(value))) {
    return 'date';
  }

  return 'string';
}

/**
 * Auto-detect and apply appropriate formatting
 */
export function autoFormat(value: string): CellFormat {
  const dataType = detectDataType(value);

  switch (dataType) {
    case 'number':
      if (value.includes('$')) {
        return {
          numberFormat: 'currency',
          decimals: 2,
          currencySymbol: '$',
          thousandsSeparator: true,
        };
      }
      if (value.includes('%')) {
        return {
          numberFormat: 'percent',
          decimals: 1,
        };
      }
      return {
        numberFormat: 'number',
        decimals: value.includes('.') ? 2 : 0,
        thousandsSeparator: value.includes(','),
      };

    case 'date':
      return {
        numberFormat: 'date',
      };

    default:
      return {
        numberFormat: 'general',
      };
  }
}

/**
 * Common format presets
 */
export const FORMAT_PRESETS: Record<string, CellFormat> = {
  general: {
    numberFormat: 'general',
  },
  number: {
    numberFormat: 'number',
    decimals: 2,
    thousandsSeparator: true,
  },
  numberComma: {
    numberFormat: 'number',
    decimals: 0,
    thousandsSeparator: true,
  },
  currency: {
    numberFormat: 'currency',
    decimals: 2,
    currencySymbol: '$',
    thousandsSeparator: true,
  },
  percent: {
    numberFormat: 'percent',
    decimals: 1,
  },
  date: {
    numberFormat: 'date',
    dateFormat: 'MM/DD/YYYY',
  },
  dateShort: {
    numberFormat: 'date',
    dateFormat: 'DD-MMM-YYYY',
  },
  dateISO: {
    numberFormat: 'date',
    dateFormat: 'YYYY-MM-DD',
  },
  dateLong: {
    numberFormat: 'date',
    dateFormat: 'MMM D, YYYY',
  },
  header: {
    numberFormat: 'general',
    fontWeight: 'bold',
    backgroundColor: '#262626',
    textAlign: 'left',
  },
  total: {
    numberFormat: 'currency',
    decimals: 2,
    currencySymbol: '$',
    thousandsSeparator: true,
    fontWeight: 'bold',
    borderTop: '2px solid #ffffff',
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  underline: {
    textDecoration: 'underline',
  },
};
