import { Router, Response } from 'express';
import { requireUserAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import {
  batchUpdateContacts,
  batchArchiveContacts,
  batchUpdateTasks,
  batchImportContacts,
  batchExportContacts,
} from '../services/batch';
import { strictRateLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * PATCH /batch/contacts
 * Batch update multiple contacts
 */
router.patch(
  '/contacts',
  requireUserAuth,
  strictRateLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { updates } = req.body;

      if (!Array.isArray(updates)) {
        res.status(400).json({ error: 'updates must be an array' });
        return;
      }

      if (updates.length > 100) {
        res.status(400).json({ error: 'Cannot update more than 100 contacts at once' });
        return;
      }

      const result = await batchUpdateContacts(req.agent!.id, updates);
      res.json(result);
    } catch (error) {
      console.error('Batch update contacts error:', error);
      res.status(500).json({
        error: 'Failed to batch update contacts',
        message: error instanceof Error ? error.message : 'unknown error',
      });
    }
  }
);

/**
 * POST /batch/contacts/archive
 * Batch archive multiple contacts
 */
router.post(
  '/contacts/archive',
  requireUserAuth,
  strictRateLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { contact_ids } = req.body;

      if (!Array.isArray(contact_ids)) {
        res.status(400).json({ error: 'contact_ids must be an array' });
        return;
      }

      if (contact_ids.length > 100) {
        res.status(400).json({ error: 'Cannot archive more than 100 contacts at once' });
        return;
      }

      const result = await batchArchiveContacts(req.agent!.id, contact_ids);
      res.json(result);
    } catch (error) {
      console.error('Batch archive contacts error:', error);
      res.status(500).json({
        error: 'Failed to batch archive contacts',
        message: error instanceof Error ? error.message : 'unknown error',
      });
    }
  }
);

/**
 * PATCH /batch/tasks
 * Batch update multiple tasks
 */
router.patch(
  '/tasks',
  requireUserAuth,
  strictRateLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { updates } = req.body;

      if (!Array.isArray(updates)) {
        res.status(400).json({ error: 'updates must be an array' });
        return;
      }

      if (updates.length > 100) {
        res.status(400).json({ error: 'Cannot update more than 100 tasks at once' });
        return;
      }

      const result = await batchUpdateTasks(req.agent!.id, updates);
      res.json(result);
    } catch (error) {
      console.error('Batch update tasks error:', error);
      res.status(500).json({
        error: 'Failed to batch update tasks',
        message: error instanceof Error ? error.message : 'unknown error',
      });
    }
  }
);

/**
 * POST /batch/contacts/import
 * Import contacts from CSV data
 */
router.post(
  '/contacts/import',
  requireUserAuth,
  strictRateLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { contacts, business_id } = req.body;

      if (!Array.isArray(contacts)) {
        res.status(400).json({ error: 'contacts must be an array' });
        return;
      }

      if (contacts.length > 1000) {
        res.status(400).json({ error: 'Cannot import more than 1000 contacts at once' });
        return;
      }

      const result = await batchImportContacts(
        req.agent!.id,
        business_id || null,
        contacts
      );
      res.json(result);
    } catch (error) {
      console.error('Batch import contacts error:', error);
      res.status(500).json({
        error: 'Failed to import contacts',
        message: error instanceof Error ? error.message : 'unknown error',
      });
    }
  }
);

/**
 * GET /batch/contacts/export
 * Export contacts to CSV
 */
router.get(
  '/contacts/export',
  requireUserAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { business_id } = req.query;

      const csv = await batchExportContacts(
        req.agent!.id,
        business_id as string | undefined
      );

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
      res.send(csv);
    } catch (error) {
      console.error('Export contacts error:', error);
      res.status(500).json({
        error: 'Failed to export contacts',
        message: error instanceof Error ? error.message : 'unknown error',
      });
    }
  }
);

export default router;
