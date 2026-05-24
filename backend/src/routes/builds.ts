import { Router, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { requireUserAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { getSupabase } from '../services/supabase';

const router = Router();

/**
 * POST /builds/generate-name
 * Generate an AI build name from a prompt
 */
router.post('/generate-name', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      res.status(500).json({ error: 'Anthropic API not configured' });
      return;
    }

    const anthropic = new Anthropic({
      apiKey: anthropicApiKey,
    });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 50,
      system: `Generate a concise 2-4 word name for a software build based on this prompt.
Return only the name, no punctuation, no quotes, title case.
Examples: "Dog Walking App", "Restaurant Booking System", "Fitness Tracker"`,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textContent = message.content.find((block) => block.type === 'text');
    const name = textContent && 'text' in textContent
      ? textContent.text.trim()
      : 'New Build';

    res.json({ name });
  } catch (error) {
    console.error('Generate name error:', error);
    res.status(500).json({
      error: 'Failed to generate name',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * GET /builds
 * Get all builds for the authenticated user's agent
 */
router.get('/', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.agent) {
      res.status(403).json({ error: 'No agent found for user' });
      return;
    }

    const { data, error } = await getSupabase()
      .from('generated_apps')
      .select('*')
      .eq('agent_id', req.agent.id)
      .order('last_activity_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch builds: ${error.message}`);
    }

    res.json({ builds: data || [] });
  } catch (error) {
    console.error('Get builds error:', error);
    res.status(500).json({
      error: 'Failed to fetch builds',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * POST /builds
 * Create a new build for the authenticated user's agent
 */
router.post('/', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.agent) {
      res.status(403).json({ error: 'No agent found for user' });
      return;
    }

    const { name = 'New Build', prompt = '' } = req.body;

    const { data, error } = await getSupabase()
      .from('generated_apps')
      .insert({
        agent_id: req.agent.id,
        name,
        prompt,
        status: 'generating',
        framework: 'react',
        tech_stack: [],
        last_activity_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create build: ${error?.message || 'unknown error'}`);
    }

    res.json({ build: data });
  } catch (error) {
    console.error('Create build error:', error);
    res.status(500).json({
      error: 'Failed to create build',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * PATCH /builds/:id
 * Update a build (rename, update activity)
 */
router.patch('/:id', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.agent) {
      res.status(403).json({ error: 'No agent found for user' });
      return;
    }

    const { id } = req.params;
    const { name, last_activity_at } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (last_activity_at !== undefined) updateData.last_activity_at = last_activity_at;

    const { data, error } = await getSupabase()
      .from('generated_apps')
      .update(updateData)
      .eq('id', id)
      .eq('agent_id', req.agent.id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update build: ${error?.message || 'not found'}`);
    }

    res.json({ build: data });
  } catch (error) {
    console.error('Update build error:', error);
    res.status(500).json({
      error: 'Failed to update build',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * DELETE /builds/:id
 * Delete a build
 */
router.delete('/:id', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.agent) {
      res.status(403).json({ error: 'No agent found for user' });
      return;
    }

    const { id } = req.params;

    const { error } = await getSupabase()
      .from('generated_apps')
      .delete()
      .eq('id', id)
      .eq('agent_id', req.agent.id);

    if (error) {
      throw new Error(`Failed to delete build: ${error.message}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete build error:', error);
    res.status(500).json({
      error: 'Failed to delete build',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * GET /builds/:id
 * Get a specific build
 */
router.get('/:id', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.agent) {
      res.status(403).json({ error: 'No agent found for user' });
      return;
    }

    const { id } = req.params;

    const { data, error } = await getSupabase()
      .from('generated_apps')
      .select('*')
      .eq('id', id)
      .eq('agent_id', req.agent.id)
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Build not found' });
      return;
    }

    res.json({ build: data });
  } catch (error) {
    console.error('Get build error:', error);
    res.status(500).json({
      error: 'Failed to fetch build',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

export default router;
