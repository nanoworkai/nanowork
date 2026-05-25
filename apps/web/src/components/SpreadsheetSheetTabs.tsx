/**
 * SpreadsheetSheetTabs - Enhanced Excel-like sheet tab bar
 *
 * Features:
 * - Scrollable tab list with navigation arrows
 * - Double-click to rename
 * - Right-click context menu
 * - Drag-and-drop reordering
 * - Add new sheet button
 */

import { useRef, useState, useEffect } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Copy,
  Trash2,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import ContextMenu, { type ContextMenuItem } from './office-ui/ContextMenu';

interface Sheet {
  id: string;
  name: string;
}

interface SpreadsheetSheetTabsProps {
  sheets: Sheet[];
  activeSheetIndex: number;
  onSheetSelect: (index: number) => void;
  onSheetAdd: () => void;
  onSheetRename: (index: number, newName: string) => void;
  onSheetDelete: (index: number) => void;
  onSheetDuplicate: (index: number) => void;
  onSheetMove: (fromIndex: number, toIndex: number) => void;
}

export default function SpreadsheetSheetTabs({
  sheets,
  activeSheetIndex,
  onSheetSelect,
  onSheetAdd,
  onSheetRename,
  onSheetDelete,
  onSheetDuplicate,
  onSheetMove,
}: SpreadsheetSheetTabsProps) {
  const [renamingIndex, setRenamingIndex] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    sheetIndex: number;
  } | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Focus rename input when starting rename
  useEffect(() => {
    if (renamingIndex !== null) {
      setTimeout(() => renameInputRef.current?.select(), 0);
    }
  }, [renamingIndex]);

  const handleDoubleClick = (index: number) => {
    setRenamingIndex(index);
    setRenameValue(sheets[index].name);
  };

  const handleRenameSubmit = () => {
    if (renamingIndex !== null && renameValue.trim()) {
      onSheetRename(renamingIndex, renameValue.trim());
    }
    setRenamingIndex(null);
    setRenameValue('');
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setRenamingIndex(null);
      setRenameValue('');
    }
  };

  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      sheetIndex: index,
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      onSheetMove(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (!tabsContainerRef.current) return;
    const scrollAmount = 200;
    tabsContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleDeleteClick = (index: number) => {
    if (sheets.length === 1) {
      alert('Cannot delete the last sheet');
      return;
    }
    setShowDeleteConfirm(index);
    setContextMenu(null);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm !== null) {
      onSheetDelete(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  const contextMenuItems: ContextMenuItem[] = contextMenu
    ? [
        {
          label: 'Rename',
          icon: <Edit2 className="w-3 h-3" />,
          onClick: () => {
            handleDoubleClick(contextMenu.sheetIndex);
            setContextMenu(null);
          },
        },
        {
          label: 'Duplicate',
          icon: <Copy className="w-3 h-3" />,
          onClick: () => {
            onSheetDuplicate(contextMenu.sheetIndex);
            setContextMenu(null);
          },
        },
        { separator: true, label: '', onClick: () => {} },
        {
          label: 'Move Left',
          icon: <ArrowLeft className="w-3 h-3" />,
          onClick: () => {
            if (contextMenu.sheetIndex > 0) {
              onSheetMove(contextMenu.sheetIndex, contextMenu.sheetIndex - 1);
            }
            setContextMenu(null);
          },
          disabled: contextMenu.sheetIndex === 0,
        },
        {
          label: 'Move Right',
          icon: <ArrowRight className="w-3 h-3" />,
          onClick: () => {
            if (contextMenu.sheetIndex < sheets.length - 1) {
              onSheetMove(contextMenu.sheetIndex, contextMenu.sheetIndex + 1);
            }
            setContextMenu(null);
          },
          disabled: contextMenu.sheetIndex === sheets.length - 1,
        },
        { separator: true, label: '', onClick: () => {} },
        {
          label: 'Delete',
          icon: <Trash2 className="w-3 h-3" />,
          onClick: () => handleDeleteClick(contextMenu.sheetIndex),
          danger: true,
          disabled: sheets.length === 1,
        },
      ]
    : [];

  return (
    <>
      <div className="flex items-center gap-2 px-2 py-2 border-t border-white/10 bg-surface-1">
        {/* Scroll Left Button */}
        <button
          onClick={() => scrollTabs('left')}
          className="p-1.5 rounded-none bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors border border-white/10"
          title="Scroll Left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Tabs Container */}
        <div
          ref={tabsContainerRef}
          className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {sheets.map((sheet, index) => {
            const isActive = index === activeSheetIndex;
            const isRenaming = index === renamingIndex;
            const isDragging = index === draggedIndex;
            const isDragOver = index === dragOverIndex;

            return (
              <div
                key={sheet.id}
                draggable={!isRenaming}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                onContextMenu={(e) => handleContextMenu(e, index)}
                className={`relative flex items-center min-w-[120px] max-w-[200px] transition-all ${
                  isDragging ? 'opacity-50' : ''
                } ${isDragOver ? 'ml-2' : ''}`}
              >
                {isRenaming ? (
                  <input
                    ref={renameInputRef}
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={handleRenameSubmit}
                    onKeyDown={handleRenameKeyDown}
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-white text-black border-2 border-white/40 outline-none"
                  />
                ) : (
                  <button
                    onClick={() => onSheetSelect(index)}
                    onDoubleClick={() => handleDoubleClick(index)}
                    className={`flex-1 px-4 py-2 rounded-none text-xs font-mono font-bold uppercase transition-colors border border-white/10 ${
                      isActive
                        ? 'bg-white text-black'
                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="truncate">{sheet.name}</div>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={() => scrollTabs('right')}
          className="p-1.5 rounded-none bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors border border-white/10"
          title="Scroll Right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Add Sheet Button */}
        <button
          onClick={onSheetAdd}
          className="p-1.5 rounded-none bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors border border-white/10"
          title="Add Sheet"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          items={contextMenuItems}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setShowDeleteConfirm(null)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-surface-1 border-2 border-white/20 shadow-2xl max-w-md w-full">
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/10">
                <h3 className="text-lg font-mono font-bold text-white">DELETE SHEET</h3>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <p className="text-sm font-mono text-white/80">
                  Are you sure you want to delete "{sheets[showDeleteConfirm]?.name}"?
                </p>
                <p className="text-xs font-mono text-white/60 mt-2">
                  This action cannot be undone. All data in this sheet will be permanently lost.
                </p>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 rounded-none bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-white border border-white/10 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-none bg-red-500 hover:bg-red-600 text-xs font-mono font-bold text-white border border-red-600 transition-colors"
                >
                  DELETE
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
