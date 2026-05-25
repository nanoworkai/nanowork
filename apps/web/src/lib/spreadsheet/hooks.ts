/**
 * Spreadsheet React Hooks
 * Auto-save, optimistic updates, error handling, and state management
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  spreadsheetApi,
  type WorkbookData,
  type CellUpdate,
  type BatchCellUpdateRequest,
} from './api';

// ───────────────────────────────────────────────────────────────────────────
// TYPES
// ───────────────────────────────────────────────────────────────────────────

export interface SaveStatus {
  state: 'saved' | 'saving' | 'unsaved' | 'error';
  lastSaved?: Date;
  error?: string;
}

interface DirtyCellsTracker {
  cells: Set<string>;
  add: (cellKey: string) => void;
  clear: () => void;
  has: (cellKey: string) => boolean;
  size: number;
}

// ───────────────────────────────────────────────────────────────────────────
// HOOKS
// ───────────────────────────────────────────────────────────────────────────

/**
 * Hook to load a workbook with lazy-loaded sheets
 */
export function useWorkbook(workbookId?: string) {
  return useQuery({
    queryKey: ['workbook', workbookId],
    queryFn: () => {
      if (!workbookId) {
        throw new Error('Workbook ID is required');
      }
      return spreadsheetApi.getWorkbook(workbookId);
    },
    enabled: !!workbookId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to lazy-load sheet cell data
 */
export function useSheetCells(workbookId?: string, sheetId?: string) {
  return useQuery({
    queryKey: ['sheet-cells', workbookId, sheetId],
    queryFn: () => {
      if (!workbookId || !sheetId) {
        throw new Error('Workbook ID and Sheet ID are required');
      }
      return spreadsheetApi.getSheetCells(workbookId, sheetId);
    },
    enabled: !!workbookId && !!sheetId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
}

/**
 * Hook for batch cell updates with optimistic updates
 */
export function useBatchCellUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BatchCellUpdateRequest) =>
      spreadsheetApi.batchUpdateCells(request),
    onMutate: async (request) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['sheet-cells', request.workbookId, request.sheetId],
      });

      // Snapshot previous value
      const previousData = queryClient.getQueryData([
        'sheet-cells',
        request.workbookId,
        request.sheetId,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ['sheet-cells', request.workbookId, request.sheetId],
        (old: any) => {
          if (!old) return old;

          const updatedCells = { ...old.cells };
          request.cells.forEach((cell) => {
            const key = `${cell.row},${cell.col}`;
            updatedCells[key] = cell;
          });

          return {
            ...old,
            cells: updatedCells,
          };
        }
      );

      return { previousData };
    },
    onError: (error, request, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          ['sheet-cells', request.workbookId, request.sheetId],
          context.previousData
        );
      }

      toast.error('Failed to save changes', {
        description: error instanceof Error ? error.message : 'Unknown error',
        action: {
          label: 'Retry',
          onClick: () => {
            // Retry logic handled by React Query
          },
        },
      });
    },
    onSuccess: (data, request) => {
      // Update version number
      queryClient.setQueryData(
        ['sheet-cells', request.workbookId, request.sheetId],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            version: data.version,
          };
        }
      );
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

/**
 * Hook for auto-save with debouncing
 */
export function useAutoSave(
  workbookId: string | undefined,
  sheetId: string | undefined,
  debounceMs: number = 3000
) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    state: 'saved',
  });
  const [dirtyCells, setDirtyCells] = useState<Set<string>>(new Set());
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingCellsRef = useRef<CellUpdate[]>([]);
  const batchUpdateMutation = useBatchCellUpdate();

  // Dirty cells tracker
  const dirtyCellsTracker: DirtyCellsTracker = {
    cells: dirtyCells,
    add: (cellKey: string) => {
      setDirtyCells((prev) => new Set(prev).add(cellKey));
      setSaveStatus({ state: 'unsaved' });
    },
    clear: () => {
      setDirtyCells(new Set());
    },
    has: (cellKey: string) => dirtyCells.has(cellKey),
    size: dirtyCells.size,
  };

  // Queue a cell for saving
  const queueCellUpdate = useCallback(
    (cell: CellUpdate) => {
      if (!workbookId || !sheetId) return;

      const cellKey = `${cell.row},${cell.col}`;
      dirtyCellsTracker.add(cellKey);

      // Add to pending cells (replace if already exists)
      const existingIndex = pendingCellsRef.current.findIndex(
        (c) => c.row === cell.row && c.col === cell.col
      );

      if (existingIndex >= 0) {
        pendingCellsRef.current[existingIndex] = cell;
      } else {
        pendingCellsRef.current.push(cell);
      }

      // Clear existing timer
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      // Set new timer
      saveTimerRef.current = setTimeout(() => {
        savePendingCells();
      }, debounceMs);
    },
    [workbookId, sheetId, debounceMs]
  );

  // Save all pending cells
  const savePendingCells = useCallback(async () => {
    if (!workbookId || !sheetId || pendingCellsRef.current.length === 0) {
      return;
    }

    setSaveStatus({ state: 'saving' });

    try {
      await batchUpdateMutation.mutateAsync({
        workbookId,
        sheetId,
        cells: pendingCellsRef.current,
      });

      setSaveStatus({
        state: 'saved',
        lastSaved: new Date(),
      });

      // Clear pending cells and dirty tracker
      pendingCellsRef.current = [];
      dirtyCellsTracker.clear();

      toast.success('Changes saved', {
        duration: 2000,
      });
    } catch (error) {
      setSaveStatus({
        state: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [workbookId, sheetId, batchUpdateMutation]);

  // Manual save (for Ctrl+S)
  const manualSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    savePendingCells();
  }, [savePendingCells]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  return {
    saveStatus,
    queueCellUpdate,
    manualSave,
    dirtyCells: dirtyCellsTracker,
    hasPendingChanges: pendingCellsRef.current.length > 0,
  };
}

/**
 * Hook for handling window beforeunload
 */
export function useUnsavedChangesWarning(hasUnsavedChanges: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);
}

/**
 * Hook for background refresh on window focus
 */
export function useBackgroundRefresh(workbookId?: string, sheetId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleFocus = () => {
      if (workbookId && sheetId) {
        queryClient.invalidateQueries({
          queryKey: ['sheet-cells', workbookId, sheetId],
        });
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [workbookId, sheetId, queryClient]);
}

/**
 * Create a configured QueryClient for spreadsheet operations
 */
export function createSpreadsheetQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3,
        retryDelay: (attemptIndex) =>
          Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 3,
        retryDelay: (attemptIndex) =>
          Math.min(1000 * 2 ** attemptIndex, 10000),
      },
    },
  });
}
