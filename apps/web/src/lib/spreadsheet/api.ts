/**
 * Spreadsheet API Client
 * Handles all backend communication for spreadsheet operations
 */

import { apiClient } from '../api';

export interface CellUpdate {
  row: number;
  col: number;
  value: string | number | null;
  formula?: string;
  format?: any;
  dataType?: string;
}

export interface SheetData {
  id: string;
  name: string;
  cells: Record<string, CellUpdate>;
  rowCount: number;
  columnCount: number;
}

export interface WorkbookData {
  id: string;
  name: string;
  sheets: SheetData[];
  activeSheetIndex: number;
  updatedAt?: string;
  version?: number;
}

export interface BatchCellUpdateRequest {
  workbookId: string;
  sheetId: string;
  cells: CellUpdate[];
}

export interface BatchCellUpdateResponse {
  success: boolean;
  updatedCells: number;
  version: number;
}

class SpreadsheetApiClient {
  /**
   * Load a workbook with all sheets metadata (no cell data)
   */
  async getWorkbook(workbookId: string): Promise<WorkbookData> {
    return apiClient['request']<WorkbookData>(
      `/api/spreadsheets/workbooks/${workbookId}`,
      { method: 'GET' }
    );
  }

  /**
   * Create a new workbook
   */
  async createWorkbook(data: {
    name: string;
    buildId?: string;
  }): Promise<WorkbookData> {
    return apiClient['request']<WorkbookData>(
      '/api/spreadsheets/workbooks',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  /**
   * Update workbook metadata (name, active sheet, etc.)
   */
  async updateWorkbook(
    workbookId: string,
    data: Partial<WorkbookData>
  ): Promise<WorkbookData> {
    return apiClient['request']<WorkbookData>(
      `/api/spreadsheets/workbooks/${workbookId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  }

  /**
   * Load cell data for a specific sheet (lazy loading)
   */
  async getSheetCells(
    workbookId: string,
    sheetId: string
  ): Promise<SheetData> {
    return apiClient['request']<SheetData>(
      `/api/spreadsheets/workbooks/${workbookId}/sheets/${sheetId}`,
      { method: 'GET' }
    );
  }

  /**
   * Batch update cells for a sheet
   */
  async batchUpdateCells(
    request: BatchCellUpdateRequest
  ): Promise<BatchCellUpdateResponse> {
    return apiClient['request']<BatchCellUpdateResponse>(
      '/api/spreadsheets/cells/batch',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * Create a new sheet in a workbook
   */
  async createSheet(
    workbookId: string,
    data: { name: string; rowCount?: number; columnCount?: number }
  ): Promise<SheetData> {
    return apiClient['request']<SheetData>(
      `/api/spreadsheets/workbooks/${workbookId}/sheets`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  /**
   * Delete a sheet from a workbook
   */
  async deleteSheet(workbookId: string, sheetId: string): Promise<void> {
    return apiClient['request']<void>(
      `/api/spreadsheets/workbooks/${workbookId}/sheets/${sheetId}`,
      { method: 'DELETE' }
    );
  }

  /**
   * Rename a sheet
   */
  async renameSheet(
    workbookId: string,
    sheetId: string,
    name: string
  ): Promise<SheetData> {
    return apiClient['request']<SheetData>(
      `/api/spreadsheets/workbooks/${workbookId}/sheets/${sheetId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      }
    );
  }
}

export const spreadsheetApi = new SpreadsheetApiClient();
