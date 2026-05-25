/**
 * SpreadsheetEditor - Excel-like spreadsheet for Nanowork dashboard
 *
 * Features:
 * - Grid with rows/columns
 * - Cell editing with formulas
 * - Format toolbar
 * - Multiple sheets/tabs
 * - Auto-save
 * - CSV import/export
 * - Terminal aesthetic
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Save,
  Download,
  Upload,
  Plus,
  Trash2,
  Type,
  DollarSign,
  Percent,
  Calendar,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
} from 'lucide-react';
import {
  evaluateFormula,
  columnIndexToLetter,
  parseCellReference,
  isError,
  type CellData,
  type CellGetter,
} from '../lib/spreadsheet/formulaParser';
import {
  formatCellValue,
  parseFormattedValue,
  getCellStyles,
  detectDataType,
  autoFormat,
  FORMAT_PRESETS,
  type CellFormat,
} from '../lib/spreadsheet/formatting';

// ───────────────────────────────────────────────────────────────────────────
// TYPES
// ───────────────────────────────────────────────────────────────────────────

interface Cell {
  value: string | number | null;
  formula?: string;
  format?: CellFormat;
  dataType?: string;
}

interface Sheet {
  id: string;
  name: string;
  cells: Map<string, Cell>;
  rowCount: number;
  columnCount: number;
}

interface Workbook {
  id?: string;
  name: string;
  sheets: Sheet[];
  activeSheetIndex: number;
}

interface CellPosition {
  row: number;
  col: number;
}

// ───────────────────────────────────────────────────────────────────────────
// UTILITIES
// ───────────────────────────────────────────────────────────────────────────

function getCellKey(row: number, col: number): string {
  return `${row},${col}`;
}

function parseCellKey(key: string): CellPosition {
  const [row, col] = key.split(',').map(Number);
  return { row, col };
}

// ───────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ───────────────────────────────────────────────────────────────────────────

interface SpreadsheetEditorProps {
  workbookId?: string;
  buildId?: string;
  onSave?: (workbook: Workbook) => void;
  onClose?: () => void;
}

export default function SpreadsheetEditor({
  workbookId,
  buildId,
  onSave,
  onClose,
}: SpreadsheetEditorProps) {
  // ─── State ───────────────────────────────────────────────────────────────

  const [workbook, setWorkbook] = useState<Workbook>(() => ({
    name: 'Untitled Workbook',
    sheets: [
      {
        id: '1',
        name: 'Sheet1',
        cells: new Map(),
        rowCount: 100,
        columnCount: 26,
      },
    ],
    activeSheetIndex: 0,
  }));

  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null);
  const [editValue, setEditValue] = useState('');
  const [formulaBarValue, setFormulaBarValue] = useState('');
  const [isFormatMenuOpen, setIsFormatMenuOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);
  const cellInputRef = useRef<HTMLInputElement>(null);

  const activeSheet = workbook.sheets[workbook.activeSheetIndex];

  // ─── Cell Operations ─────────────────────────────────────────────────────

  const getCell = useCallback(
    (row: number, col: number, sheetName?: string): Cell | null => {
      let sheet = activeSheet;
      if (sheetName) {
        const found = workbook.sheets.find((s) => s.name === sheetName);
        if (found) sheet = found;
      }
      return sheet.cells.get(getCellKey(row, col)) || null;
    },
    [activeSheet, workbook.sheets]
  );

  const setCell = useCallback(
    (row: number, col: number, cell: Partial<Cell>) => {
      const key = getCellKey(row, col);
      const existing = activeSheet.cells.get(key) || {};
      const updated = { ...existing, ...cell } as Cell;

      // If cell is now empty, remove it
      if (
        !updated.value &&
        !updated.formula &&
        !updated.format &&
        !updated.dataType
      ) {
        activeSheet.cells.delete(key);
      } else {
        activeSheet.cells.set(key, updated);
      }

      setWorkbook({ ...workbook });
      setIsDirty(true);
    },
    [activeSheet, workbook]
  );

  // Cell getter for formula evaluation
  const cellGetter: CellGetter = useCallback(
    (row: number, col: number, sheetName?: string): CellData | null => {
      const cell = getCell(row, col, sheetName);
      if (!cell) return null;
      return {
        value: cell.value,
        formula: cell.formula,
      };
    },
    [getCell]
  );

  // ─── Formula Evaluation ──────────────────────────────────────────────────

  const evaluateCellFormula = useCallback(
    (row: number, col: number): string | number | null => {
      const cell = getCell(row, col);
      if (!cell?.formula) return cell?.value ?? null;

      const result = evaluateFormula(cell.formula, cellGetter, activeSheet.name);

      if (isError(result)) {
        return `#${result.type}!`;
      }

      return result;
    },
    [getCell, cellGetter, activeSheet.name]
  );

  // ─── Cell Selection ──────────────────────────────────────────────────────

  const handleCellClick = (row: number, col: number) => {
    if (editingCell) {
      commitEdit();
    }

    setSelectedCell({ row, col });
    const cell = getCell(row, col);

    // Show formula in formula bar if cell has one
    if (cell?.formula) {
      setFormulaBarValue(cell.formula);
    } else {
      setFormulaBarValue(String(cell?.value ?? ''));
    }
  };

  const handleCellDoubleClick = (row: number, col: number) => {
    const cell = getCell(row, col);
    setEditingCell({ row, col });
    setEditValue(cell?.formula || String(cell?.value ?? ''));
    setTimeout(() => cellInputRef.current?.focus(), 0);
  };

  // ─── Cell Editing ────────────────────────────────────────────────────────

  const commitEdit = () => {
    if (!editingCell) return;

    const { row, col } = editingCell;
    const trimmed = editValue.trim();

    if (trimmed === '') {
      // Clear cell
      setCell(row, col, { value: null, formula: undefined });
    } else if (trimmed.startsWith('=')) {
      // Formula
      setCell(row, col, {
        formula: trimmed,
        value: null,
        dataType: 'formula',
      });
    } else {
      // Regular value
      const dataType = detectDataType(trimmed);
      const format = autoFormat(trimmed);
      const value = parseFormattedValue(trimmed, format);

      setCell(row, col, {
        value,
        formula: undefined,
        dataType,
        format,
      });
    }

    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;

    if (editingCell) {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitEdit();
        setSelectedCell({ row: row + 1, col });
      } else if (e.key === 'Escape') {
        setEditingCell(null);
        setEditValue('');
      }
      return;
    }

    // Navigation
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (row > 0) setSelectedCell({ row: row - 1, col });
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (row < activeSheet.rowCount - 1) setSelectedCell({ row: row + 1, col });
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (col > 0) setSelectedCell({ row, col: col - 1 });
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (col < activeSheet.columnCount - 1) setSelectedCell({ row, col: col + 1 });
        break;
      case 'Enter':
        e.preventDefault();
        handleCellDoubleClick(row, col);
        break;
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        setCell(row, col, { value: null, formula: undefined });
        break;
      default:
        // Start editing if typing
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          handleCellDoubleClick(row, col);
          setEditValue(e.key);
        }
    }
  };

  // ─── Formatting ──────────────────────────────────────────────────────────

  const applyFormat = (format: Partial<CellFormat>) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    const cell = getCell(row, col) || {};
    const currentFormat = cell.format || {};

    setCell(row, col, {
      ...cell,
      format: { ...currentFormat, ...format },
    });
  };

  // ─── Sheets Management ───────────────────────────────────────────────────

  const addSheet = () => {
    const newSheet: Sheet = {
      id: Date.now().toString(),
      name: `Sheet${workbook.sheets.length + 1}`,
      cells: new Map(),
      rowCount: 100,
      columnCount: 26,
    };

    setWorkbook({
      ...workbook,
      sheets: [...workbook.sheets, newSheet],
      activeSheetIndex: workbook.sheets.length,
    });
    setIsDirty(true);
  };

  const deleteSheet = (index: number) => {
    if (workbook.sheets.length === 1) return; // Keep at least one sheet

    const sheets = workbook.sheets.filter((_, i) => i !== index);
    const activeIndex = Math.min(workbook.activeSheetIndex, sheets.length - 1);

    setWorkbook({
      ...workbook,
      sheets,
      activeSheetIndex: activeIndex,
    });
    setIsDirty(true);
  };

  const renameSheet = (index: number, newName: string) => {
    const sheets = [...workbook.sheets];
    sheets[index] = { ...sheets[index], name: newName };
    setWorkbook({ ...workbook, sheets });
    setIsDirty(true);
  };

  // ─── Save/Load ───────────────────────────────────────────────────────────

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(workbook);
      }
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save workbook:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save
  useEffect(() => {
    if (!isDirty) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [isDirty, workbook]);

  // ─── Import/Export ───────────────────────────────────────────────────────

  const exportToCSV = () => {
    const rows: string[][] = [];

    for (let row = 0; row < activeSheet.rowCount; row++) {
      const rowData: string[] = [];
      let hasData = false;

      for (let col = 0; col < activeSheet.columnCount; col++) {
        const cell = getCell(row, col);
        const value = cell?.formula
          ? evaluateCellFormula(row, col)
          : cell?.value;

        const strValue = value === null ? '' : String(value);
        rowData.push(`"${strValue.replace(/"/g, '""')}"`);

        if (strValue) hasData = true;
      }

      if (hasData) {
        rows.push(rowData);
      } else if (rows.length > 0) {
        // Keep empty rows if they're between data
        rows.push(rowData);
      }
    }

    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workbook.name.replace(/[^a-z0-9]/gi, '_')}_${activeSheet.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFromCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target?.result as string;
        const rows = csv.split('\n');

        activeSheet.cells.clear();

        rows.forEach((rowStr, rowIndex) => {
          const values = rowStr.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));

          values.forEach((value, colIndex) => {
            if (value) {
              const dataType = detectDataType(value);
              const format = autoFormat(value);
              const parsedValue = parseFormattedValue(value, format);

              setCell(rowIndex, colIndex, {
                value: parsedValue,
                dataType,
                format,
              });
            }
          });
        });

        setIsDirty(true);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-surface-0" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-surface-1">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={workbook.name}
            onChange={(e) => setWorkbook({ ...workbook, name: e.target.value })}
            className="text-lg font-mono font-bold text-white bg-transparent border-none outline-none"
          />
          {isDirty && (
            <span className="text-xs font-mono text-white/40">UNSAVED</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="px-4 py-2 rounded-none bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-mono text-white border border-white/10 transition-colors"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 rounded-none bg-white/10 hover:bg-white/20 text-xs font-mono text-white border border-white/10 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={importFromCSV}
            className="px-4 py-2 rounded-none bg-white/10 hover:bg-white/20 text-xs font-mono text-white border border-white/10 transition-colors"
          >
            <Upload className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-none bg-white/10 hover:bg-white/20 text-xs font-mono text-white border border-white/10 transition-colors"
            >
              CLOSE
            </button>
          )}
        </div>
      </div>

      {/* Formula Bar */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-white/10 bg-surface-1">
        <div className="flex items-center gap-2 text-xs font-mono text-white/60">
          <span className="font-bold">
            {selectedCell
              ? `${columnIndexToLetter(selectedCell.col)}${selectedCell.row + 1}`
              : ''}
          </span>
        </div>
        <input
          type="text"
          value={formulaBarValue}
          onChange={(e) => setFormulaBarValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && selectedCell) {
              setCell(selectedCell.row, selectedCell.col, {
                formula: formulaBarValue.startsWith('=') ? formulaBarValue : undefined,
                value: formulaBarValue.startsWith('=') ? null : formulaBarValue,
              });
            }
          }}
          placeholder="Enter value or formula (start with =)"
          className="flex-1 px-3 py-1.5 text-xs font-mono text-white bg-surface-2 border border-white/10 rounded-none outline-none focus:border-white/30"
        />
      </div>

      {/* Format Toolbar */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-white/10 bg-surface-1 overflow-x-auto">
        <button
          onClick={() => applyFormat(FORMAT_PRESETS.currency)}
          className="px-3 py-1.5 rounded-none bg-white/5 hover:bg-white/10 text-xs font-mono text-white border border-white/10 transition-colors"
          title="Currency"
        >
          <DollarSign className="w-4 h-4" />
        </button>
        <button
          onClick={() => applyFormat(FORMAT_PRESETS.percent)}
          className="px-3 py-1.5 rounded-none bg-white/5 hover:bg-white/10 text-xs font-mono text-white border border-white/10 transition-colors"
          title="Percent"
        >
          <Percent className="w-4 h-4" />
        </button>
        <button
          onClick={() => applyFormat(FORMAT_PRESETS.number)}
          className="px-3 py-1.5 rounded-none bg-white/5 hover:bg-white/10 text-xs font-mono text-white border border-white/10 transition-colors"
          title="Number"
        >
          <Type className="w-4 h-4" />
        </button>
        <button
          onClick={() => applyFormat(FORMAT_PRESETS.date)}
          className="px-3 py-1.5 rounded-none bg-white/5 hover:bg-white/10 text-xs font-mono text-white border border-white/10 transition-colors"
          title="Date"
        >
          <Calendar className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-white/10 mx-2" />

        <button
          onClick={() => applyFormat({ fontWeight: 'bold' })}
          className="px-3 py-1.5 rounded-none bg-white/5 hover:bg-white/10 text-xs font-mono text-white border border-white/10 transition-colors"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => applyFormat({ fontStyle: 'italic' })}
          className="px-3 py-1.5 rounded-none bg-white/5 hover:bg-white/10 text-xs font-mono text-white border border-white/10 transition-colors"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-white/10 mx-2" />

        <button
          onClick={() => applyFormat({ textAlign: 'left' })}
          className="px-3 py-1.5 rounded-none bg-white/5 hover:bg-white/10 text-xs font-mono text-white border border-white/10 transition-colors"
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => applyFormat({ textAlign: 'center' })}
          className="px-3 py-1.5 rounded-none bg-white/5 hover:bg-white/10 text-xs font-mono text-white border border-white/10 transition-colors"
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => applyFormat({ textAlign: 'right' })}
          className="px-3 py-1.5 rounded-none bg-white/5 hover:bg-white/10 text-xs font-mono text-white border border-white/10 transition-colors"
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="flex-1" />

        <button
          className="flex items-center gap-2 px-4 py-1.5 rounded-none bg-white/5 hover:bg-white/10 text-xs font-mono text-white border border-white/10 transition-colors"
          title="AI Assistant"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI ASSIST</span>
        </button>
      </div>

      {/* Grid */}
      <div ref={gridRef} className="flex-1 overflow-auto bg-surface-0">
        <table className="border-collapse">
          <thead className="sticky top-0 z-10 bg-surface-1">
            <tr>
              <th className="w-12 min-w-12 h-8 border border-white/10 bg-surface-2 text-[10px] font-mono text-white/40">
                {/* Corner cell */}
              </th>
              {Array.from({ length: activeSheet.columnCount }).map((_, col) => (
                <th
                  key={col}
                  className="min-w-[100px] h-8 px-2 border border-white/10 bg-surface-2 text-xs font-mono font-bold text-white/60 text-center"
                >
                  {columnIndexToLetter(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: activeSheet.rowCount }).map((_, row) => (
              <tr key={row}>
                <td className="w-12 min-w-12 h-8 border border-white/10 bg-surface-2 text-[10px] font-mono text-white/40 text-center sticky left-0 z-5">
                  {row + 1}
                </td>
                {Array.from({ length: activeSheet.columnCount }).map((_, col) => {
                  const cell = getCell(row, col);
                  const isSelected =
                    selectedCell?.row === row && selectedCell?.col === col;
                  const isEditing =
                    editingCell?.row === row && editingCell?.col === col;

                  const displayValue = cell?.formula
                    ? evaluateCellFormula(row, col)
                    : cell?.value;

                  const formatted = formatCellValue(displayValue, cell?.format);
                  const styles = getCellStyles(cell?.format);

                  return (
                    <td
                      key={col}
                      className={`h-8 px-2 border border-white/10 cursor-cell transition-colors ${
                        isSelected ? 'ring-2 ring-white/40 ring-inset' : ''
                      } ${isEditing ? 'bg-surface-3' : 'bg-surface-1 hover:bg-surface-2'}`}
                      onClick={() => handleCellClick(row, col)}
                      onDoubleClick={() => handleCellDoubleClick(row, col)}
                      style={styles}
                    >
                      {isEditing ? (
                        <input
                          ref={cellInputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={commitEdit}
                          className="w-full h-full bg-transparent border-none outline-none text-xs font-mono text-white"
                          autoFocus
                        />
                      ) : (
                        <div className="text-xs font-mono truncate">
                          {formatted}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sheet Tabs */}
      <div className="flex items-center gap-2 px-4 py-2 border-t border-white/10 bg-surface-1 overflow-x-auto">
        {workbook.sheets.map((sheet, index) => (
          <button
            key={sheet.id}
            onClick={() => setWorkbook({ ...workbook, activeSheetIndex: index })}
            className={`px-4 py-2 rounded-none text-xs font-mono font-bold uppercase transition-colors ${
              index === workbook.activeSheetIndex
                ? 'bg-white text-black'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            {sheet.name}
          </button>
        ))}
        <button
          onClick={addSheet}
          className="px-3 py-2 rounded-none bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          title="Add Sheet"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
