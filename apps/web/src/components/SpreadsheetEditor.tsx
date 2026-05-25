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
 * - Excel-like keyboard navigation
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Save,
  Download,
  Upload,
  Plus,
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
  Scissors,
  Copy,
  Clipboard,
  Trash2,
  ArrowDownToLine,
  ArrowRightToLine,
  Settings,
  MessageSquare,
  Link,
  EyeOff,
  Eye,
  Maximize,
  Minimize,
  Edit2,
} from 'lucide-react';
import {
  evaluateFormula,
  columnIndexToLetter,
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
import ContextMenu from './office-ui/ContextMenu';

// ───────────────────────────────────────────────────────────────────────────
// TYPES
// ───────────────────────────────────────────────────────────────────────────

interface Cell {
  value: string | number | boolean | null;
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

interface CellRange {
  start: CellPosition;
  end: CellPosition;
}

interface HistoryEntry {
  cells: Map<string, Cell>;
  timestamp: number;
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
  workbookId: _workbookId,
  buildId: _buildId,
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
  const [selectionRange, setSelectionRange] = useState<CellRange | null>(null);
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null);
  const [editValue, setEditValue] = useState('');
  const [formulaBarValue, setFormulaBarValue] = useState('');
  const [_isFormatMenuOpen, _setIsFormatMenuOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Context menus
  const [cellContextMenu, setCellContextMenu] = useState<{ x: number; y: number; row: number; col: number } | null>(null);
  const [rowContextMenu, setRowContextMenu] = useState<{ x: number; y: number; row: number } | null>(null);
  const [columnContextMenu, setColumnContextMenu] = useState<{ x: number; y: number; col: number } | null>(null);
  const [sheetContextMenu, setSheetContextMenu] = useState<{ x: number; y: number; sheetIndex: number } | null>(null);

  // Clipboard for cut/copy/paste
  const [clipboard, setClipboard] = useState<Map<string, Cell> | null>(null);
  const [clipboardRange, setClipboardRange] = useState<CellRange | null>(null);

  // Sheet renaming (for future use)
  const [_renamingSheetIndex, _setRenamingSheetIndex] = useState<number | null>(null);
  const [_renameValue, _setRenameValue] = useState('');

  // Undo/Redo history
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

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
    (row: number, col: number): string | number | boolean | null => {
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

  // ─── History Management ──────────────────────────────────────────────────

  const saveToHistory = useCallback(() => {
    const newEntry: HistoryEntry = {
      cells: new Map(activeSheet.cells),
      timestamp: Date.now(),
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newEntry);
    // Keep last 50 entries
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    setHistory(newHistory);
  }, [activeSheet.cells, history, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return;
    const prevEntry = history[historyIndex - 1];
    activeSheet.cells = new Map(prevEntry.cells);
    setWorkbook({ ...workbook });
    setHistoryIndex(historyIndex - 1);
    setIsDirty(true);
  }, [historyIndex, history, activeSheet, workbook]);

  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const nextEntry = history[historyIndex + 1];
    activeSheet.cells = new Map(nextEntry.cells);
    setWorkbook({ ...workbook });
    setHistoryIndex(historyIndex + 1);
    setIsDirty(true);
  }, [historyIndex, history, activeSheet, workbook]);

  // ─── Clipboard Operations ────────────────────────────────────────────────

  const handleCopy = useCallback(async () => {
    if (!selectedCell) return;
    const range = selectionRange || { start: selectedCell, end: selectedCell };

    try {
      let text = '';
      for (let r = Math.min(range.start.row, range.end.row); r <= Math.max(range.start.row, range.end.row); r++) {
        const rowData: string[] = [];
        for (let c = Math.min(range.start.col, range.end.col); c <= Math.max(range.start.col, range.end.col); c++) {
          const cell = getCell(r, c);
          const value = cell?.formula ? cell.formula : String(cell?.value ?? '');
          rowData.push(value);
        }
        text += rowData.join('\t') + '\n';
      }
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [selectedCell, selectionRange, getCell]);

  const handleCut = useCallback(async () => {
    await handleCopy();
    if (!selectedCell) return;

    saveToHistory();
    const range = selectionRange || { start: selectedCell, end: selectedCell };
    for (let r = Math.min(range.start.row, range.end.row); r <= Math.max(range.start.row, range.end.row); r++) {
      for (let c = Math.min(range.start.col, range.end.col); c <= Math.max(range.start.col, range.end.col); c++) {
        activeSheet.cells.delete(getCellKey(r, c));
      }
    }
    setWorkbook({ ...workbook });
    setIsDirty(true);
  }, [handleCopy, selectedCell, selectionRange, saveToHistory, activeSheet, workbook]);

  const handlePaste = useCallback(async () => {
    if (!selectedCell) return;

    saveToHistory();

    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const rows = text.split('\n').filter(r => r);
        rows.forEach((rowStr, rowOffset) => {
          const values = rowStr.split('\t');
          values.forEach((value, colOffset) => {
            const targetRow = selectedCell.row + rowOffset;
            const targetCol = selectedCell.col + colOffset;

            if (targetRow < activeSheet.rowCount && targetCol < activeSheet.columnCount) {
              if (value.startsWith('=')) {
                setCell(targetRow, targetCol, {
                  formula: value,
                  value: null,
                  dataType: 'formula',
                });
              } else if (value) {
                const dataType = detectDataType(value);
                const format = autoFormat(value);
                const parsedValue = parseFormattedValue(value, format);
                setCell(targetRow, targetCol, {
                  value: parsedValue,
                  formula: undefined,
                  dataType,
                  format,
                });
              }
            }
          });
        });
      }
    } catch (err) {
      console.error('Failed to paste:', err);
    }
  }, [selectedCell, saveToHistory, activeSheet, setCell]);

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

    saveToHistory();

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

  // ─── Enhanced Keyboard Navigation ────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

    // Handle editing mode
    if (editingCell) {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitEdit();
        // Enter: move down, Shift+Enter: move up
        if (e.shiftKey) {
          if (row > 0) setSelectedCell({ row: row - 1, col });
        } else {
          if (row < activeSheet.rowCount - 1) setSelectedCell({ row: row + 1, col });
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        commitEdit();
        // Tab: move right, Shift+Tab: move left
        if (e.shiftKey) {
          if (col > 0) setSelectedCell({ row, col: col - 1 });
        } else {
          if (col < activeSheet.columnCount - 1) setSelectedCell({ row, col: col + 1 });
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setEditingCell(null);
        setEditValue('');
      }
      return;
    }

    // Clipboard operations (Ctrl/Cmd+C, V, X)
    if (ctrlKey) {
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleCopy();
        return;
      } else if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        handlePaste();
        return;
      } else if (e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        handleCut();
        return;
      } else if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      } else if (e.key === 'y' || e.key === 'Y') {
        e.preventDefault();
        handleRedo();
        return;
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        // Select all cells
        setSelectionRange({
          start: { row: 0, col: 0 },
          end: { row: activeSheet.rowCount - 1, col: activeSheet.columnCount - 1 }
        });
        return;
      } else if (e.key === 'Home') {
        e.preventDefault();
        // Ctrl+Home: Go to A1
        setSelectedCell({ row: 0, col: 0 });
        setSelectionRange(null);
        return;
      } else if (e.key === 'End') {
        e.preventDefault();
        // Ctrl+End: Go to last used cell
        let lastRow = 0;
        let lastCol = 0;
        activeSheet.cells.forEach((_, key) => {
          const { row: r, col: c } = parseCellKey(key);
          lastRow = Math.max(lastRow, r);
          lastCol = Math.max(lastCol, c);
        });
        setSelectedCell({ row: lastRow, col: lastCol });
        setSelectionRange(null);
        return;
      } else if (e.key === ' ') {
        e.preventDefault();
        // Ctrl+Space: Select column
        setSelectionRange({
          start: { row: 0, col },
          end: { row: activeSheet.rowCount - 1, col }
        });
        return;
      }
    }

    // Shift+Space: Select row
    if (e.shiftKey && e.key === ' ') {
      e.preventDefault();
      setSelectionRange({
        start: { row, col: 0 },
        end: { row, col: activeSheet.columnCount - 1 }
      });
      return;
    }

    // Navigation with arrow keys
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (e.shiftKey && row > 0) {
        // Extend selection
        const range = selectionRange || { start: selectedCell, end: selectedCell };
        setSelectionRange({ ...range, end: { row: row - 1, col } });
        setSelectedCell({ row: row - 1, col });
      } else if (row > 0) {
        setSelectedCell({ row: row - 1, col });
        setSelectionRange(null);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (e.shiftKey && row < activeSheet.rowCount - 1) {
        // Extend selection
        const range = selectionRange || { start: selectedCell, end: selectedCell };
        setSelectionRange({ ...range, end: { row: row + 1, col } });
        setSelectedCell({ row: row + 1, col });
      } else if (row < activeSheet.rowCount - 1) {
        setSelectedCell({ row: row + 1, col });
        setSelectionRange(null);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (e.shiftKey && col > 0) {
        // Extend selection
        const range = selectionRange || { start: selectedCell, end: selectedCell };
        setSelectionRange({ ...range, end: { row, col: col - 1 } });
        setSelectedCell({ row, col: col - 1 });
      } else if (col > 0) {
        setSelectedCell({ row, col: col - 1 });
        setSelectionRange(null);
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (e.shiftKey && col < activeSheet.columnCount - 1) {
        // Extend selection
        const range = selectionRange || { start: selectedCell, end: selectedCell };
        setSelectionRange({ ...range, end: { row, col: col + 1 } });
        setSelectedCell({ row, col: col + 1 });
      } else if (col < activeSheet.columnCount - 1) {
        setSelectedCell({ row, col: col + 1 });
        setSelectionRange(null);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Tab: move right, Shift+Tab: move left
      if (e.shiftKey) {
        if (col > 0) setSelectedCell({ row, col: col - 1 });
      } else {
        if (col < activeSheet.columnCount - 1) setSelectedCell({ row, col: col + 1 });
      }
      setSelectionRange(null);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Enter in view mode: start editing (like F2)
      handleCellDoubleClick(row, col);
    } else if (e.key === 'F2') {
      e.preventDefault();
      // F2: Start editing
      handleCellDoubleClick(row, col);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      saveToHistory();
      // Delete/Backspace: Clear cell or range
      if (selectionRange) {
        // Clear range
        for (let r = Math.min(selectionRange.start.row, selectionRange.end.row); r <= Math.max(selectionRange.start.row, selectionRange.end.row); r++) {
          for (let c = Math.min(selectionRange.start.col, selectionRange.end.col); c <= Math.max(selectionRange.start.col, selectionRange.end.col); c++) {
            activeSheet.cells.delete(getCellKey(r, c));
          }
        }
        setWorkbook({ ...workbook });
      } else {
        setCell(row, col, { value: null, formula: undefined });
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      // Home: Go to column A
      setSelectedCell({ row, col: 0 });
      setSelectionRange(null);
    } else if (e.key === 'End') {
      e.preventDefault();
      // End: Go to last column with data in current row
      let lastCol = 0;
      for (let c = 0; c < activeSheet.columnCount; c++) {
        if (getCell(row, c)) lastCol = c;
      }
      setSelectedCell({ row, col: lastCol });
      setSelectionRange(null);
    } else if (e.key.length === 1 && !ctrlKey && !e.altKey) {
      // Start editing if typing alphanumeric
      e.preventDefault();
      handleCellDoubleClick(row, col);
      setEditValue(e.key);
    }
  };

  // ─── Formatting ──────────────────────────────────────────────────────────

  const applyFormat = (format: Partial<CellFormat>) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    const cell = getCell(row, col) || { value: null };
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

  const _renameSheet = (index: number, newName: string) => {
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
                  className="min-w-[100px] h-8 px-2 border border-white/10 bg-surface-2 text-xs font-mono font-bold text-white/60 text-center cursor-pointer hover:bg-surface-3"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setColumnContextMenu({ x: e.clientX, y: e.clientY, col });
                  }}
                >
                  {columnIndexToLetter(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: activeSheet.rowCount }).map((_, row) => (
              <tr key={row}>
                <td
                  className="w-12 min-w-12 h-8 border border-white/10 bg-surface-2 text-[10px] font-mono text-white/40 text-center sticky left-0 z-5 cursor-pointer hover:bg-surface-3"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setRowContextMenu({ x: e.clientX, y: e.clientY, row });
                  }}
                >
                  {row + 1}
                </td>
                {Array.from({ length: activeSheet.columnCount }).map((_, col) => {
                  const cell = getCell(row, col);
                  const isSelected =
                    selectedCell?.row === row && selectedCell?.col === col;
                  const isEditing =
                    editingCell?.row === row && editingCell?.col === col;
                  const isInRange = selectionRange &&
                    row >= Math.min(selectionRange.start.row, selectionRange.end.row) &&
                    row <= Math.max(selectionRange.start.row, selectionRange.end.row) &&
                    col >= Math.min(selectionRange.start.col, selectionRange.end.col) &&
                    col <= Math.max(selectionRange.start.col, selectionRange.end.col);

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
                      } ${isInRange ? 'bg-white/5' : ''} ${isEditing ? 'bg-surface-3' : 'bg-surface-1 hover:bg-surface-2'}`}
                      onClick={() => handleCellClick(row, col)}
                      onDoubleClick={() => handleCellDoubleClick(row, col)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setCellContextMenu({ x: e.clientX, y: e.clientY, row, col });
                      }}
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
            onContextMenu={(e) => {
              e.preventDefault();
              setSheetContextMenu({ x: e.clientX, y: e.clientY, sheetIndex: index });
            }}
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

      {/* Context Menus */}
      {cellContextMenu && (
        <ContextMenu
          position={{ x: cellContextMenu.x, y: cellContextMenu.y }}
          items={[
            {
              label: 'Cut',
              icon: <Scissors className="w-3 h-3" />,
              onClick: () => {
                const cell = getCell(cellContextMenu.row, cellContextMenu.col);
                if (cell) {
                  setClipboard(new Map([[getCellKey(cellContextMenu.row, cellContextMenu.col), cell]]));
                  setClipboardRange({ start: { row: cellContextMenu.row, col: cellContextMenu.col }, end: { row: cellContextMenu.row, col: cellContextMenu.col } });
                  setCell(cellContextMenu.row, cellContextMenu.col, { value: null, formula: undefined });
                }
              },
              shortcut: 'Ctrl+X',
            },
            {
              label: 'Copy',
              icon: <Copy className="w-3 h-3" />,
              onClick: () => {
                const cell = getCell(cellContextMenu.row, cellContextMenu.col);
                if (cell) {
                  setClipboard(new Map([[getCellKey(cellContextMenu.row, cellContextMenu.col), cell]]));
                  setClipboardRange({ start: { row: cellContextMenu.row, col: cellContextMenu.col }, end: { row: cellContextMenu.row, col: cellContextMenu.col } });
                }
              },
              shortcut: 'Ctrl+C',
            },
            {
              label: 'Paste',
              icon: <Clipboard className="w-3 h-3" />,
              onClick: () => {
                if (clipboard && clipboardRange) {
                  const sourceKey = getCellKey(clipboardRange.start.row, clipboardRange.start.col);
                  const cell = clipboard.get(sourceKey);
                  if (cell) {
                    setCell(cellContextMenu.row, cellContextMenu.col, cell);
                  }
                }
              },
              disabled: !clipboard,
              shortcut: 'Ctrl+V',
            },
            { label: '', separator: true, onClick: () => {} },
            {
              label: 'Insert Rows',
              icon: <ArrowDownToLine className="w-3 h-3" />,
              onClick: () => {
                const targetRow = cellContextMenu.row;
                const newCells = new Map<string, Cell>();
                activeSheet.cells.forEach((cell, key) => {
                  const pos = parseCellKey(key);
                  if (pos.row >= targetRow) {
                    newCells.set(getCellKey(pos.row + 1, pos.col), cell);
                  } else {
                    newCells.set(key, cell);
                  }
                });
                activeSheet.cells = newCells;
                setWorkbook({ ...workbook });
                setIsDirty(true);
              },
            },
            {
              label: 'Insert Columns',
              icon: <ArrowRightToLine className="w-3 h-3" />,
              onClick: () => {
                const targetCol = cellContextMenu.col;
                const newCells = new Map<string, Cell>();
                activeSheet.cells.forEach((cell, key) => {
                  const pos = parseCellKey(key);
                  if (pos.col >= targetCol) {
                    newCells.set(getCellKey(pos.row, pos.col + 1), cell);
                  } else {
                    newCells.set(key, cell);
                  }
                });
                activeSheet.cells = newCells;
                setWorkbook({ ...workbook });
                setIsDirty(true);
              },
            },
            {
              label: 'Delete Row',
              icon: <Trash2 className="w-3 h-3" />,
              onClick: () => {
                const row = cellContextMenu.row;
                const newCells = new Map<string, Cell>();
                activeSheet.cells.forEach((cell, key) => {
                  const pos = parseCellKey(key);
                  if (pos.row < row) {
                    newCells.set(key, cell);
                  } else if (pos.row > row) {
                    newCells.set(getCellKey(pos.row - 1, pos.col), cell);
                  }
                });
                activeSheet.cells = newCells;
                setWorkbook({ ...workbook });
                setIsDirty(true);
              },
              danger: true,
            },
            {
              label: 'Delete Column',
              icon: <Trash2 className="w-3 h-3" />,
              onClick: () => {
                const col = cellContextMenu.col;
                const newCells = new Map<string, Cell>();
                activeSheet.cells.forEach((cell, key) => {
                  const pos = parseCellKey(key);
                  if (pos.col < col) {
                    newCells.set(key, cell);
                  } else if (pos.col > col) {
                    newCells.set(getCellKey(pos.row, pos.col - 1), cell);
                  }
                });
                activeSheet.cells = newCells;
                setWorkbook({ ...workbook });
                setIsDirty(true);
              },
              danger: true,
            },
            { label: '', separator: true, onClick: () => {} },
            {
              label: 'Clear Contents',
              onClick: () => {
                setCell(cellContextMenu.row, cellContextMenu.col, { value: null, formula: undefined });
              },
              shortcut: 'Delete',
            },
            {
              label: 'Format Cells...',
              icon: <Settings className="w-3 h-3" />,
              onClick: () => {
                handleCellClick(cellContextMenu.row, cellContextMenu.col);
              },
              shortcut: 'Ctrl+1',
            },
            { label: '', separator: true, onClick: () => {} },
            {
              label: 'Insert Comment',
              icon: <MessageSquare className="w-3 h-3" />,
              onClick: () => {},
              disabled: true,
            },
            {
              label: 'Insert Link',
              icon: <Link className="w-3 h-3" />,
              onClick: () => {},
              disabled: true,
            },
          ]}
          onClose={() => setCellContextMenu(null)}
        />
      )}

      {rowContextMenu && (
        <ContextMenu
          position={{ x: rowContextMenu.x, y: rowContextMenu.y }}
          items={[
            {
              label: 'Insert Rows Above',
              onClick: () => {
                const targetRow = rowContextMenu.row;
                const newCells = new Map<string, Cell>();
                activeSheet.cells.forEach((cell, key) => {
                  const pos = parseCellKey(key);
                  if (pos.row >= targetRow) {
                    newCells.set(getCellKey(pos.row + 1, pos.col), cell);
                  } else {
                    newCells.set(key, cell);
                  }
                });
                activeSheet.cells = newCells;
                setWorkbook({ ...workbook });
                setIsDirty(true);
              },
            },
            {
              label: 'Insert Rows Below',
              onClick: () => {
                const targetRow = rowContextMenu.row + 1;
                const newCells = new Map<string, Cell>();
                activeSheet.cells.forEach((cell, key) => {
                  const pos = parseCellKey(key);
                  if (pos.row >= targetRow) {
                    newCells.set(getCellKey(pos.row + 1, pos.col), cell);
                  } else {
                    newCells.set(key, cell);
                  }
                });
                activeSheet.cells = newCells;
                setWorkbook({ ...workbook });
                setIsDirty(true);
              },
            },
            {
              label: 'Delete Row',
              icon: <Trash2 className="w-3 h-3" />,
              onClick: () => {
                const row = rowContextMenu.row;
                const newCells = new Map<string, Cell>();
                activeSheet.cells.forEach((cell, key) => {
                  const pos = parseCellKey(key);
                  if (pos.row < row) {
                    newCells.set(key, cell);
                  } else if (pos.row > row) {
                    newCells.set(getCellKey(pos.row - 1, pos.col), cell);
                  }
                });
                activeSheet.cells = newCells;
                setWorkbook({ ...workbook });
                setIsDirty(true);
              },
              danger: true,
            },
            { label: '', separator: true, onClick: () => {} },
            {
              label: 'Hide Row',
              icon: <EyeOff className="w-3 h-3" />,
              onClick: () => {},
              disabled: true,
            },
            {
              label: 'Unhide Rows',
              icon: <Eye className="w-3 h-3" />,
              onClick: () => {},
              disabled: true,
            },
            { label: '', separator: true, onClick: () => {} },
            {
              label: 'Row Height...',
              icon: <Maximize className="w-3 h-3" />,
              onClick: () => {},
              disabled: true,
            },
          ]}
          onClose={() => setRowContextMenu(null)}
        />
      )}

      {columnContextMenu && (
        <ContextMenu
          position={{ x: columnContextMenu.x, y: columnContextMenu.y }}
          items={[
            {
              label: 'Insert Columns Left',
              onClick: () => {
                const targetCol = columnContextMenu.col;
                const newCells = new Map<string, Cell>();
                activeSheet.cells.forEach((cell, key) => {
                  const pos = parseCellKey(key);
                  if (pos.col >= targetCol) {
                    newCells.set(getCellKey(pos.row, pos.col + 1), cell);
                  } else {
                    newCells.set(key, cell);
                  }
                });
                activeSheet.cells = newCells;
                setWorkbook({ ...workbook });
                setIsDirty(true);
              },
            },
            {
              label: 'Insert Columns Right',
              onClick: () => {
                const targetCol = columnContextMenu.col + 1;
                const newCells = new Map<string, Cell>();
                activeSheet.cells.forEach((cell, key) => {
                  const pos = parseCellKey(key);
                  if (pos.col >= targetCol) {
                    newCells.set(getCellKey(pos.row, pos.col + 1), cell);
                  } else {
                    newCells.set(key, cell);
                  }
                });
                activeSheet.cells = newCells;
                setWorkbook({ ...workbook });
                setIsDirty(true);
              },
            },
            {
              label: 'Delete Column',
              icon: <Trash2 className="w-3 h-3" />,
              onClick: () => {
                const col = columnContextMenu.col;
                const newCells = new Map<string, Cell>();
                activeSheet.cells.forEach((cell, key) => {
                  const pos = parseCellKey(key);
                  if (pos.col < col) {
                    newCells.set(key, cell);
                  } else if (pos.col > col) {
                    newCells.set(getCellKey(pos.row, pos.col - 1), cell);
                  }
                });
                activeSheet.cells = newCells;
                setWorkbook({ ...workbook });
                setIsDirty(true);
              },
              danger: true,
            },
            { label: '', separator: true, onClick: () => {} },
            {
              label: 'Hide Column',
              icon: <EyeOff className="w-3 h-3" />,
              onClick: () => {},
              disabled: true,
            },
            {
              label: 'Unhide Columns',
              icon: <Eye className="w-3 h-3" />,
              onClick: () => {},
              disabled: true,
            },
            { label: '', separator: true, onClick: () => {} },
            {
              label: 'Column Width...',
              icon: <Minimize className="w-3 h-3" />,
              onClick: () => {},
              disabled: true,
            },
            {
              label: 'Auto-fit Column Width',
              onClick: () => {},
              disabled: true,
            },
          ]}
          onClose={() => setColumnContextMenu(null)}
        />
      )}

      {sheetContextMenu && (
        <ContextMenu
          position={{ x: sheetContextMenu.x, y: sheetContextMenu.y }}
          items={[
            {
              label: 'Insert Sheet',
              icon: <Plus className="w-3 h-3" />,
              onClick: () => addSheet(),
            },
            {
              label: 'Delete Sheet',
              icon: <Trash2 className="w-3 h-3" />,
              onClick: () => deleteSheet(sheetContextMenu.sheetIndex),
              disabled: workbook.sheets.length === 1,
              danger: true,
            },
            {
              label: 'Rename Sheet',
              icon: <Edit2 className="w-3 h-3" />,
              onClick: () => {
                setRenamingSheetIndex(sheetContextMenu.sheetIndex);
                setRenameValue(workbook.sheets[sheetContextMenu.sheetIndex].name);
              },
            },
            { label: '', separator: true, onClick: () => {} },
            {
              label: 'Move/Copy Sheet...',
              onClick: () => {},
              disabled: true,
            },
            {
              label: 'Tab Color...',
              onClick: () => {},
              disabled: true,
            },
            { label: '', separator: true, onClick: () => {} },
            {
              label: 'Hide Sheet',
              icon: <EyeOff className="w-3 h-3" />,
              onClick: () => {},
              disabled: true,
            },
            {
              label: 'Unhide Sheets...',
              icon: <Eye className="w-3 h-3" />,
              onClick: () => {},
              disabled: true,
            },
          ]}
          onClose={() => setSheetContextMenu(null)}
        />
      )}
    </div>
  );
}
