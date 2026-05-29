import { Router, Response } from 'express';
import { requireUserAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import {
  getBusinesses,
  getBusiness,
  createBusiness,
  updateBusiness,
  createTask,
  getDeployments,
} from '../services/supabase';

const router = Router();

/**
 * GET /businesses
 * List all businesses for the authenticated agent
 */
router.get('/', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const businesses = await getBusinesses(req.agent!.id);
    res.json(businesses);
  } catch (error) {
    console.error('Get businesses error:', error);
    res.status(500).json({
      error: 'Failed to fetch businesses',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * POST /businesses
 * Create a new business
 */
router.post('/', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { idea_prompt, name, tagline } = req.body;

    if (!idea_prompt) {
      res.status(400).json({ error: 'idea_prompt is required' });
      return;
    }

    const business = await createBusiness({
      agent_id: req.agent!.id,
      name: name || 'Untitled Business',
      tagline: tagline || null,
      description: null,
      idea_prompt,
      status: 'planning',
      revenue_cents: 0,
      metadata: {},
    });

    // Create a task for the agent to start planning
    await createTask(req.agent!.id, business.id, 'business_created', {
      business_id: business.id,
      idea_prompt,
    });

    res.json(business);
  } catch (error) {
    console.error('Create business error:', error);
    res.status(500).json({
      error: 'Failed to create business',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * GET /businesses/:id
 * Get a single business with its deployments and stats
 */
router.get('/:id', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const business = await getBusiness(req.params.id);

    if (!business) {
      res.status(404).json({ error: 'Business not found' });
      return;
    }

    // Verify ownership
    if (business.agent_id !== req.agent!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Fetch deployments
    const deployments = await getDeployments(business.id);

    res.json({ ...business, deployments });
  } catch (error) {
    console.error('Get business error:', error);
    res.status(500).json({
      error: 'Failed to fetch business',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * PATCH /businesses/:id
 * Update a business
 */
router.patch('/:id', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const business = await getBusiness(req.params.id);

    if (!business) {
      res.status(404).json({ error: 'Business not found' });
      return;
    }

    // Verify ownership
    if (business.agent_id !== req.agent!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const { name, tagline, description, status } = req.body;

    const updated = await updateBusiness(req.params.id, {
      ...(name && { name }),
      ...(tagline && { tagline }),
      ...(description && { description }),
      ...(status && { status }),
    });

    res.json(updated);
  } catch (error) {
    console.error('Update business error:', error);
    res.status(500).json({
      error: 'Failed to update business',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * DELETE /businesses/:id
 * Soft delete a business by archiving it
 */
router.delete('/:id', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const business = await getBusiness(req.params.id);

    if (!business) {
      res.status(404).json({ error: 'Business not found' });
      return;
    }

    // Verify ownership
    if (business.agent_id !== req.agent!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const updated = await updateBusiness(req.params.id, { status: 'archived' });

    res.json(updated);
  } catch (error) {
    console.error('Delete business error:', error);
    res.status(500).json({
      error: 'Failed to delete business',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

export default router;
