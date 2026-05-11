import { Router, Response } from 'express';
import { requireUserAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { getDeployments } from '../services/supabase';

const router = Router();

/**
 * GET /deployments
 * List all deployments (optionally filter by business_id)
 */
router.get('/', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { business_id } = req.query;

    if (!business_id) {
      res.status(400).json({ error: 'business_id query parameter is required' });
      return;
    }

    const deployments = await getDeployments(business_id as string);
    res.json(deployments);
  } catch (error) {
    console.error('Get deployments error:', error);
    res.status(500).json({
      error: 'Failed to fetch deployments',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

export default router;
