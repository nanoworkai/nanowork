import { Router, Response } from 'express';
import { requireUserAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { getTasks } from '../services/supabase';

const router = Router();

/**
 * GET /tasks
 * List tasks for the agent
 */
router.get('/', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, business_id } = req.query;

    const tasks = await getTasks(
      req.agent!.id,
      status as string | undefined,
      business_id as string | undefined
    );

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      error: 'Failed to fetch tasks',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

export default router;
