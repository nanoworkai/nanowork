/**
 * Spreadsheets API Routes
 *
 * CRUD operations for workbooks, sheets, and cells
 */

import { Router, Response } from 'express';
import { requireUserAuth } from '../middleware/auth';
import { getSupabase } from '../services/supabase';
import type { AuthenticatedRequest } from '../types';

const router = Router();

// ───────────────────────────────────────────────────────────────────────────
// WORKBOOKS
// ───────────────────────────────────────────────────────────────────────────

/**
 * GET /api/spreadsheets/workbooks
 * List all workbooks for the authenticated user
 */
router.get('/workbooks', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const supabase = getSupabase();

    const { data: workbooks, error } = await supabase
      .from('workbooks')
      .select('*')
      .eq('owner_id', userId)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    res.json({ workbooks });
  } catch (error) {
    console.error('Error fetching workbooks:', error);
    res.status(500).json({ error: 'Failed to fetch workbooks' });
  }
});

/**
 * GET /api/spreadsheets/workbooks/:id
 * Get a specific workbook with all sheets and cells
 */
router.get('/workbooks/:id', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const supabase = getSupabase();
    const userId = req.user.id;
    const { id } = req.params;

    // Get workbook
    const { data: workbook, error: workbookError } = await supabase
      .from('workbooks')
      .select('*')
      .eq('id', id)
      .eq('owner_id', userId)
      .is('deleted_at', null)
      .single();

    if (workbookError || !workbook) {
      return res.status(404).json({ error: 'Workbook not found' });
    }

    // Get sheets
    const { data: sheets, error: sheetsError } = await supabase
      .from('sheets')
      .select('*')
      .eq('workbook_id', id)
      .is('deleted_at', null)
      .order('position', { ascending: true });

    if (sheetsError) throw sheetsError;

    // Get cells for all sheets
    const sheetIds = sheets?.map((s: any) => s.id) || [];
    const { data: cells, error: cellsError } = await supabase
      .from('cells')
      .select('*')
      .in('sheet_id', sheetIds);

    if (cellsError) throw cellsError;

    // Organize cells by sheet
    const sheetsWithCells = sheets?.map((sheet: any) => ({
      ...sheet,
      cells: cells?.filter((c: any) => c.sheet_id === sheet.id) || [],
    })) || [];

    // Update last accessed time
    await supabase
      .from('workbooks')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', id);

    res.json({
      workbook,
      sheets: sheetsWithCells,
    });
  } catch (error) {
    console.error('Error fetching workbook:', error);
    res.status(500).json({ error: 'Failed to fetch workbook' });
  }
});

/**
 * POST /api/spreadsheets/workbooks
 * Create a new workbook
 */
router.post('/workbooks', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const supabase = getSupabase();
    const userId = req.user.id;
    const {
      name = 'Untitled Workbook',
      description,
      build_id,
      template_id,
    } = req.body;

    // Create workbook
    const { data: workbook, error: workbookError } = await supabase
      .from('workbooks')
      .insert({
        owner_id: userId,
        name,
        description,
        build_id,
        template_id,
      })
      .select()
      .single();

    if (workbookError) throw workbookError;

    // Create default sheet
    const { data: sheet, error: sheetError } = await supabase
      .from('sheets')
      .insert({
        workbook_id: workbook.id,
        name: 'Sheet1',
        position: 0,
      })
      .select()
      .single();

    if (sheetError) throw sheetError;

    res.status(201).json({
      workbook,
      sheets: [sheet],
    });
  } catch (error) {
    console.error('Error creating workbook:', error);
    res.status(500).json({ error: 'Failed to create workbook' });
  }
});

/**
 * PATCH /api/spreadsheets/workbooks/:id
 * Update workbook metadata
 */
router.patch('/workbooks/:id', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const supabase = getSupabase();
    const userId = req.user.id;
    const { id } = req.params;
    const { name, description, settings, tags } = req.body;

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (settings !== undefined) updates.settings = settings;
    if (tags !== undefined) updates.tags = tags;

    const { data: workbook, error } = await supabase
      .from('workbooks')
      .update(updates)
      .eq('id', id)
      .eq('owner_id', userId)
      .select()
      .single();

    if (error || !workbook) {
      return res.status(404).json({ error: 'Workbook not found' });
    }

    res.json({ workbook });
  } catch (error) {
    console.error('Error updating workbook:', error);
    res.status(500).json({ error: 'Failed to update workbook' });
  }
});

/**
 * DELETE /api/spreadsheets/workbooks/:id
 * Soft delete a workbook
 */
router.delete('/workbooks/:id', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const supabase = getSupabase();
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('workbooks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('owner_id', userId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting workbook:', error);
    res.status(500).json({ error: 'Failed to delete workbook' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// SHEETS
// ───────────────────────────────────────────────────────────────────────────

/**
 * POST /api/spreadsheets/sheets
 * Add a new sheet to a workbook
 */
router.post('/sheets', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const supabase = getSupabase();
    const userId = req.user.id;
    const { workbook_id, name, position } = req.body;

    // Verify workbook ownership
    const { data: workbook } = await supabase
      .from('workbooks')
      .select('id')
      .eq('id', workbook_id)
      .eq('owner_id', userId)
      .single();

    if (!workbook) {
      return res.status(404).json({ error: 'Workbook not found' });
    }

    // Create sheet
    const { data: sheet, error } = await supabase
      .from('sheets')
      .insert({
        workbook_id,
        name: name || 'New Sheet',
        position: position ?? 0,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ sheet });
  } catch (error) {
    console.error('Error creating sheet:', error);
    res.status(500).json({ error: 'Failed to create sheet' });
  }
});

/**
 * PATCH /api/spreadsheets/sheets/:id
 * Update sheet properties
 */
router.patch('/sheets/:id', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const supabase = getSupabase();
    const userId = req.user.id;
    const { id } = req.params;
    const { name, position, visible, settings } = req.body;

    // Verify ownership through workbook
    const { data: sheet } = await supabase
      .from('sheets')
      .select('workbook_id')
      .eq('id', id)
      .single();

    if (!sheet) {
      return res.status(404).json({ error: 'Sheet not found' });
    }

    const { data: workbook } = await supabase
      .from('workbooks')
      .select('id')
      .eq('id', sheet.workbook_id)
      .eq('owner_id', userId)
      .single();

    if (!workbook) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update sheet
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name;
    if (position !== undefined) updates.position = position;
    if (visible !== undefined) updates.visible = visible;
    if (settings !== undefined) updates.settings = settings;

    const { data: updatedSheet, error } = await supabase
      .from('sheets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ sheet: updatedSheet });
  } catch (error) {
    console.error('Error updating sheet:', error);
    res.status(500).json({ error: 'Failed to update sheet' });
  }
});

/**
 * DELETE /api/spreadsheets/sheets/:id
 * Delete a sheet
 */
router.delete('/sheets/:id', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const supabase = getSupabase();
    const userId = req.user.id;
    const { id } = req.params;

    // Verify ownership
    const { data: sheet } = await supabase
      .from('sheets')
      .select('workbook_id')
      .eq('id', id)
      .single();

    if (!sheet) {
      return res.status(404).json({ error: 'Sheet not found' });
    }

    const { data: workbook } = await supabase
      .from('workbooks')
      .select('id')
      .eq('id', sheet.workbook_id)
      .eq('owner_id', userId)
      .single();

    if (!workbook) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Soft delete
    const { error } = await supabase
      .from('sheets')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting sheet:', error);
    res.status(500).json({ error: 'Failed to delete sheet' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// CELLS
// ───────────────────────────────────────────────────────────────────────────

/**
 * POST /api/spreadsheets/cells/batch
 * Batch update/insert cells (for auto-save)
 */
router.post('/cells/batch', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const supabase = getSupabase();
    const userId = req.user.id;
    const { sheet_id, cells } = req.body;

    if (!Array.isArray(cells)) {
      return res.status(400).json({ error: 'cells must be an array' });
    }

    // Verify ownership
    const { data: sheet } = await supabase
      .from('sheets')
      .select('workbook_id')
      .eq('id', sheet_id)
      .single();

    if (!sheet) {
      return res.status(404).json({ error: 'Sheet not found' });
    }

    const { data: workbook } = await supabase
      .from('workbooks')
      .select('id')
      .eq('id', sheet.workbook_id)
      .eq('owner_id', userId)
      .single();

    if (!workbook) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Upsert cells
    const cellsToUpsert = cells.map((cell: any) => ({
      sheet_id,
      row_index: cell.row_index,
      column_index: cell.column_index,
      value: cell.value,
      computed_value: cell.computed_value,
      data_type: cell.data_type,
      format: cell.format,
      metadata: cell.metadata,
    }));

    const { error } = await supabase
      .from('cells')
      .upsert(cellsToUpsert, {
        onConflict: 'sheet_id,row_index,column_index',
      });

    if (error) throw error;

    // Update workbook timestamp
    await supabase
      .from('workbooks')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sheet.workbook_id);

    res.json({ success: true, count: cells.length });
  } catch (error) {
    console.error('Error batch updating cells:', error);
    res.status(500).json({ error: 'Failed to update cells' });
  }
});

/**
 * DELETE /api/spreadsheets/cells/batch
 * Batch delete cells
 */
router.delete('/cells/batch', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const supabase = getSupabase();
    const userId = req.user.id;
    const { sheet_id, cells } = req.body;

    if (!Array.isArray(cells)) {
      return res.status(400).json({ error: 'cells must be an array' });
    }

    // Verify ownership
    const { data: sheet } = await supabase
      .from('sheets')
      .select('workbook_id')
      .eq('id', sheet_id)
      .single();

    if (!sheet) {
      return res.status(404).json({ error: 'Sheet not found' });
    }

    const { data: workbook } = await supabase
      .from('workbooks')
      .select('id')
      .eq('id', sheet.workbook_id)
      .eq('owner_id', userId)
      .single();

    if (!workbook) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete cells
    for (const cell of cells as any[]) {
      await supabase
        .from('cells')
        .delete()
        .eq('sheet_id', sheet_id)
        .eq('row_index', cell.row_index)
        .eq('column_index', cell.column_index);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting cells:', error);
    res.status(500).json({ error: 'Failed to delete cells' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// TEMPLATES
// ───────────────────────────────────────────────────────────────────────────

/**
 * POST /api/spreadsheets/workbooks/from-template
 * Create workbook from template
 */
router.post('/workbooks/from-template', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const supabase = getSupabase();
    const userId = req.user.id;
    const { template_id, name, build_id } = req.body;

    if (!template_id) {
      return res.status(400).json({ error: 'template_id is required' });
    }

    // Note: Template data should be fetched from frontend templates.ts
    // and passed in the request body as template_data
    const { template_data } = req.body;

    if (!template_data) {
      return res.status(400).json({ error: 'template_data is required' });
    }

    // Create workbook
    const { data: workbook, error: workbookError } = await supabase
      .from('workbooks')
      .insert({
        owner_id: userId,
        name: name || template_data.name,
        template_id,
        build_id,
        category: template_data.category,
      })
      .select()
      .single();

    if (workbookError) throw workbookError;

    // Create sheets with cells
    const createdSheets: any[] = [];

    for (const sheetData of template_data.sheets as any[]) {
      const { data: sheet, error: sheetError } = await supabase
        .from('sheets')
        .insert({
          workbook_id: workbook.id,
          name: sheetData.name,
          position: template_data.sheets.indexOf(sheetData),
        })
        .select()
        .single();

      if (sheetError) throw sheetError;

      // Insert cells
      if (sheetData.cells && sheetData.cells.length > 0) {
        const cellsToInsert = sheetData.cells.map((cell: any) => ({
          sheet_id: sheet.id,
          row_index: cell.row,
          column_index: cell.col,
          value: cell.value,
          formula: cell.formula,
          data_type: cell.formula ? 'formula' : (typeof cell.value === 'number' ? 'number' : 'string'),
          format: cell.format,
        }));

        const { error: cellsError } = await supabase
          .from('cells')
          .insert(cellsToInsert);

        if (cellsError) throw cellsError;
      }

      createdSheets.push(sheet);
    }

    res.status(201).json({
      workbook,
      sheets: createdSheets,
    });
  } catch (error) {
    console.error('Error creating workbook from template:', error);
    res.status(500).json({ error: 'Failed to create workbook from template' });
  }
});

export default router;
