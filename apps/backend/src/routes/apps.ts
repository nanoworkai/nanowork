import { Router, Response } from 'express';
import { requireUserAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import {
  getBusiness,
  createGeneratedApp,
  updateGeneratedApp,
  getGeneratedApp,
  getAppFiles,
  upsertAppFile,
} from '../services/supabase';
import { generateApp } from '../services/anthropic';

const router = Router();

/**
 * POST /apps/generate
 * Generate a new app for a business
 */
router.post('/generate', requireUserAuth, (async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { business_id, prompt, framework, tech_stack } = req.body;

    if (!business_id || !prompt || !framework || !tech_stack) {
      res.status(400).json({
        error: 'business_id, prompt, framework, and tech_stack are required',
      });
      return;
    }

    // Verify business ownership
    const business = await getBusiness(business_id);
    if (!business || business.agent_id !== req.agent!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Create app record with generating status
    const app = await createGeneratedApp({
      business_id,
      framework,
      tech_stack,
      status: 'generating',
      prompt,
      error_message: null,
      metadata: {},
    });

    // Generate app files (async but wait for it)
    try {
      const result = await generateApp(prompt, tech_stack);

      // Store each file
      for (const file of result.files) {
        await upsertAppFile(app.id, file.path, file.content, file.language);
      }

      // Update app status to ready
      await updateGeneratedApp(app.id, { status: 'ready' });

      // Fetch the updated app with files
      const files = await getAppFiles(app.id);

      res.json({ ...app, status: 'ready', files });
    } catch (error) {
      // Update app status to failed
      await updateGeneratedApp(app.id, {
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'unknown error',
      });

      throw error;
    }
  } catch (error) {
    console.error('Generate app error:', error);
    res.status(500).json({
      error: 'Failed to generate app',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
}) as any);

/**
 * GET /apps/:id
 * Get an app with all its files
 */
router.get('/:id', requireUserAuth, (async (req: AuthenticatedRequest, res: Response) => {
  try {
    const app = await getGeneratedApp(req.params.id);

    if (!app) {
      res.status(404).json({ error: 'App not found' });
      return;
    }

    // Verify ownership via business
    const business = await getBusiness(app.business_id);
    if (!business || business.agent_id !== req.agent!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Fetch files
    const files = await getAppFiles(app.id);

    res.json({ ...app, files });
  } catch (error) {
    console.error('Get app error:', error);
    res.status(500).json({
      error: 'Failed to fetch app',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
}) as any);

export default router;
