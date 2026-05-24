import { Router, Response } from 'express';
import { requireUserAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { getAgentStats, getBusinessStats, getAgentActivity } from '../services/analytics';
import { getBusiness } from '../services/supabase';

const router = Router();

/**
 * GET /analytics/agent
 * Get comprehensive statistics for the authenticated agent
 */
router.get('/agent', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await getAgentStats(req.agent!.id);
    res.json(stats);
  } catch (error) {
    console.error('Get agent stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch agent statistics',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * GET /analytics/business/:businessId
 * Get statistics for a specific business
 */
router.get(
  '/business/:businessId',
  requireUserAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { businessId } = req.params;

      // Verify business ownership
      const business = await getBusiness(businessId);
      if (!business || business.agent_id !== req.agent!.id) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const stats = await getBusinessStats(businessId);
      res.json(stats);
    } catch (error) {
      console.error('Get business stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch business statistics',
        message: error instanceof Error ? error.message : 'unknown error',
      });
    }
  }
);

/**
 * GET /analytics/activity
 * Get recent activity timeline for the agent
 */
router.get('/activity', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const activities = await getAgentActivity(req.agent!.id, limit);
    res.json({ activities });
  } catch (error) {
    console.error('Get agent activity error:', error);
    res.status(500).json({
      error: 'Failed to fetch agent activity',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

export default router;
