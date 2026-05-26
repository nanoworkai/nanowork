/**
 * SpreadsheetFormatToolbar - Enhanced formatting toolbar for spreadsheet
 *
 * Features:
 * - Number formats (Currency, Percent, Comma)
 * - Date formats (multiple options)
 * - Font styles (Bold, Italic, Underline)
 * - Text alignment (Left, Center, Right)
 * - Text and background color pickers
 * - Borders
 */

import { useState } from 'react';
import {
  DollarSign,
  Percent,
  Type,
  Calendar,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Grid,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { FORMAT_PRESETS, type CellFormat } from '../lib/spreadsheet/formatting';

interface SpreadsheetFormatToolbarProps {
  onApplyFormat: (format: Partial<CellFormat>) => void;
  selectedCellFormat?: CellFormat;
}

export default function SpreadsheetFormatToolbar({
  onApplyFormat,
  selectedCellFormat,
}: SpreadsheetFormatToolbarProps) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isBgColorPickerOpen, setIsBgColorPickerOpen] = useState(false);
  const [isDateFormatOpen, setIsDateFormatOpen] = useState(false);

  const isBold = selectedCellFormat?.fontWeight === 'bold';
  const isItalic = selectedCellFormat?.fontStyle === 'italic';
  const isUnderline = selectedCellFormat?.textDecoration === 'underline';

  const textColors = [
    '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500',
    '#800080', '#008000', '#000080', '#808080'
  ];

  const backgroundColors = [
    '#1a1a1a', '#262626', '#404040', '#1e40af',
    '#166534', '#991b1b', '#92400e', '#4c1d95', '#831843'
  ];

  return (
    <div className="flex items-center gap-2 px-6 py-3 border-b border-white/10 bg-surface-1 overflow-x-auto">
      {/* Number Formats */}
      <button
        onClick={() => onApplyFormat(FORMAT_PRESETS.currency)}
        className="px-3 py-1.5 rounded-none bg-white/5 hover:bg-white/10 text-xs font-mono text-white border border-white/10 transition-colors"
        title="Currency ($)"
      >
        <DollarSign className="w-4 h-4" />
      </button>
      <button
        onClick={() => onApplyFormat(FORMAT_PRESETS.percent)}
        className="px-3 py-1.5 rounded-none bg-white/5 hover:bg-white/10 text-xs font-mono text-white border border-white/10 transition-colors"
        title="Percent (%)"
      >
        <Percent className="w-4 h-4" />
      </button>
      <button
        onClick={() => onApplyFormat(FORMAT_PRESETS.numberComma)}
        className="px-3 py-1.5 rounded-none bg-white/5 hover:bg-white/10 text-xs font-mono text-white border border-white/10 transition-colors"
        title="Number with Comma (1,000)"
      >
        <Type className="w-4 h-4" />
      </button>

      {/* Date Format Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsDateFormatOpen(!isDateFormatOpen)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-none bg-white/5 hover:bg-white/10 text-xs font-mono text-white border border-white/10 transition-colors"
          title="Date Format"
        >
          <Calendar className="w-4 h-4" />
          <ChevronDown className="w-3 h-3" />
        </button>
        {isDateFormatOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsDateFormatOpen(false)}
            />
            <div className="absolute top-full left-0 mt-1 bg-surface-2 border border-white/20 shadow-lg z-50 min-w-[180px]">
              <button
                onClick={() => {
                  onApplyFormat({ numberFormat: 'date', dateFormat: 'MM/DD/YYYY' });
                  setIsDateFormatOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs font-mono text-white hover:bg-white/10"
              >
                MM/DD/YYYY
              </button>
              <button
                onClick={() => {
                  onApplyFormat({ numberFormat: 'date', dateFormat: 'DD-MMM-YYYY' });
                  setIsDateFormatOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs font-mono text-white hover:bg-white/10"
              >
                DD-MMM-YYYY
              </button>
              <button
                onClick={() => {
                  onApplyFormat({ numberFormat: 'date', dateFormat: 'YYYY-MM-DD' });
                  setIsDateFormatOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs font-mono text-white hover:bg-white/10"
              >
                YYYY-MM-DD
              </button>
              <button
                onClick={() => {
                  onApplyFormat({ numberFormat: 'date', dateFormat: 'MMM D, YYYY' });
                  setIsDateFormatOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs font-mono text-white hover:bg-white/10"
              >
                MMM D, YYYY
              </button>
              <button
                onClick={() => {
                  onApplyFormat({ numberFormat: 'date', dateFormat: 'D MMM YYYY' });
                  setIsDateFormatOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs font-mono text-white hover:bg-white/10"
              >
                D MMM YYYY
              </button>
            </div>
          </>
        )}
      </div>

      <div className="w-px h-6 bg-white/10 mx-2" />

      {/* Font Styles */}
      <button
        onClick={() => onApplyFormat({ fontWeight: isBold ? 'normal' : 'bold' })}
        className={`px-3 py-1.5 rounded-none bg-white/5 hover:bg-white/10 text-xs font-mono text-white border transition-colors ${
          isBold ? 'border-white/40 bg-white/15' : 'border-white/10'
        }`}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => onApplyFormat({ fontStyle: isItalic ? 'normal' : 'italic' })}
        className={`px-3 py-1.5 rounded-none bg-white/5 hover:bg-white/10 text-xs font-mono text-white border transition-colors ${
          isItalic ? 'border-white/40 bg-white/15' : 'border-white/10'
        }`}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => onApplyFormat({ textDecoration: isUnderline ? 'none' : 'underline' })}
        className={`px-3 py-1.5 rounded-none bg-white/5 hover:bg-white/10 text-xs font-mono text-white border transition-colors ${
          isUnderline ? 'border-white/40 bg-white/15' : 'border-white/10'
        }`}
        title="Underline (Ctrl+U)"
      >
        <Underline className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-white/10 mx-2" />

      {/* Text Alignment */}
      <button
        onClick={() => onApplyFormat({ textAlign: 'left' })}
        className="px-3 py-1.5 rounded-none bg-white/5 hover:bg-white/10 text-xs font-mono text-white border border-white/10 transition-colors"
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => onApplyFormat({ textAlign: 'center' })}
        className="px-3 py-1.5 rounded-none bg-white/5 hover:bg-white/10 text-xs font-mono text-white border border-white/10 transition-colors"
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        onClick={() => onApplyFormat({ textAlign: 'right' })}
        className="px-3 py-1.5 rounded-none bg-white/5 hover:bg-white/10 text-xs font-mono text-white border border-white/10 transition-colors"
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-white/10 mx-2" />

      {/* Text Color Picker */}
      <div className="relative">
        <button
          onClick={() => {
            setIsColorPickerOpen(!isColorPickerOpen);
            setIsBgColorPickerOpen(false);
          }}
          className="px-3 py-1.5 rounded-none bg-white/5 hover:bg-white/10 text-xs font-mono text-white border border-white/10 transition-colors"
          title="Text Color"
        >
          <Palette className="w-4 h-4" />
        </button>
        {isColorPickerOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsColorPickerOpen(false)}
            />
            <div className="absolute top-full left-0 mt-1 bg-surface-2 border border-white/20 shadow-lg z-50 p-2 grid grid-cols-6 gap-1">
              {textColors.map(color => (
                <button
                  key={color}
                  onClick={() => {
                    onApplyFormat({ color });
                    setIsColorPickerOpen(false);
                  }}
                  className="w-6 h-6 border border-white/20 hover:border-white hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Background Color Picker */}
      <div className="relative">
        <button
          onClick={() => {
            setIsBgColorPickerOpen(!isBgColorPickerOpen);
            setIsColorPickerOpen(false);
          }}
          className="px-3 py-1.5 rounded-none bg-white/5 hover:bg-white/10 text-xs font-mono text-white border border-white/10 transition-colors"
          title="Background Color"
        >
          <div className="relative">
            <Palette className="w-4 h-4" />
            <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-white" />
          </div>
        </button>
        {isBgColorPickerOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsBgColorPickerOpen(false)}
            />
            <div className="absolute top-full left-0 mt-1 bg-surface-2 border border-white/20 shadow-lg z-50 p-2 grid grid-cols-5 gap-1">
              <button
                onClick={() => {
                  onApplyFormat({ backgroundColor: 'transparent' });
                  setIsBgColorPickerOpen(false);
                }}
                className="w-6 h-6 border border-white/20 hover:border-white flex items-center justify-center text-[8px] text-white/60 hover:scale-110 transition-transform"
                title="None"
              >
                /
              </button>
              {backgroundColors.map(color => (
                <button
                  key={color}
                  onClick={() => {
                    onApplyFormat({ backgroundColor: color });
                    setIsBgColorPickerOpen(false);
                  }}
                  className="w-6 h-6 border border-white/20 hover:border-white hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Borders */}
      <button
        onClick={() => onApplyFormat({ borderAll: '1px solid rgba(255, 255, 255, 0.2)' })}
        className="px-3 py-1.5 rounded-none bg-white/5 hover:bg-white/10 text-xs font-mono text-white border border-white/10 transition-colors"
        title="All Borders"
      >
        <Grid className="w-4 h-4" />
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
  );
}
