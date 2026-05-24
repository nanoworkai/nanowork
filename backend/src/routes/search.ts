import { Router, Response } from 'express';
import { requireUserAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { searchAll, getSearchSuggestions } from '../services/search';

const router = Router();

/**
 * GET /search
 * Search across all resources (businesses, contacts, conversations, documents)
 */
router.get('/', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { q, limit, business_id } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Query parameter "q" is required' });
      return;
    }

    const results = await searchAll({
      agentId: req.agent!.id,
      query: q,
      limit: limit ? parseInt(limit as string) : undefined,
      businessId: business_id as string | undefined,
    });

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * GET /search/suggestions
 * Get search suggestions for the agent
 */
router.get('/suggestions', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const suggestions = await getSearchSuggestions(req.agent!.id);
    res.json({ suggestions });
  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({
      error: 'Failed to fetch search suggestions',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

export default router;
