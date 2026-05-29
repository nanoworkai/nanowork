import { Router, Response } from 'express';
import { requireUserAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = Router();

/**
 * GET /agents/me
 * Get the authenticated user's agent
 */
router.get('/me', requireUserAuth, (async (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json(req.agent);
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({
      error: 'Failed to get agent',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
}) as any);

export default router;
