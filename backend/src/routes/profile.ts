import { Router, Response } from 'express';
import { requireUserAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { getSupabase } from '../services/supabase';

const router = Router();

/**
 * GET /profile
 * Get the authenticated user's profile
 */
router.get('/', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data: profile, error } = await getSupabase()
      .from('profiles')
      .select('*')
      .eq('id', req.user!.id)
      .single();

    if (error || !profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    // Don't send sensitive fields to client
    const { stripe_customer_id, ...safeProfile } = profile;

    res.json(safeProfile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * PATCH /profile
 * Update the authenticated user's profile
 */
router.patch('/', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, avatar_url, phone } = req.body;

    // Build update object with only allowed fields
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (phone !== undefined) updates.phone = phone;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    const { data: profile, error } = await getSupabase()
      .from('profiles')
      .update(updates)
      .eq('id', req.user!.id)
      .select()
      .single();

    if (error || !profile) {
      throw new Error(`Failed to update profile: ${error?.message || 'unknown error'}`);
    }

    // Don't send sensitive fields to client
    const { stripe_customer_id, ...safeProfile } = profile;

    res.json(safeProfile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * GET /profile/agent
 * Get the agent associated with this user's profile
 */
router.get('/agent', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json(req.agent);
  } catch (error) {
    console.error('Get profile agent error:', error);
    res.status(500).json({
      error: 'Failed to get agent',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * PATCH /profile/agent
 * Update the agent associated with this user's profile
 */
router.patch('/agent', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, system_prompt, status, metadata } = req.body;

    // Build update object with only provided fields
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (system_prompt !== undefined) updates.system_prompt = system_prompt;
    if (status !== undefined) {
      if (!['active', 'paused', 'archived'].includes(status)) {
        res.status(400).json({ error: 'Invalid status. Must be: active, paused, or archived' });
        return;
      }
      updates.status = status;
    }
    if (metadata !== undefined) updates.metadata = metadata;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    // Update agent
    const { data: agent, error } = await getSupabase()
      .from('agents')
      .update(updates)
      .eq('id', req.agent!.id)
      .select()
      .single();

    if (error || !agent) {
      throw new Error(`Failed to update agent: ${error?.message || 'unknown error'}`);
    }

    res.json(agent);
  } catch (error) {
    console.error('Update profile agent error:', error);
    res.status(500).json({
      error: 'Failed to update agent',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

export default router;
