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
 * GET /stream
 * Server-Sent Events endpoint for streaming build generation
 */
router.get('/stream', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { buildId, prompt } = req.query;

    if (!buildId || typeof buildId !== 'string') {
      res.status(400).json({ error: 'buildId is required' });
      return;
    }

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'prompt is required' });
      return;
    }

    if (!req.agent) {
      res.status(403).json({ error: 'No agent found for user' });
      return;
    }

    // Verify the build belongs to the user's agent
    const { data: build, error: buildError } = await getSupabase()
      .from('generated_apps')
      .select('*')
      .eq('id', buildId)
      .eq('agent_id', req.agent.id)
      .single();

    if (buildError || !build) {
      res.status(404).json({ error: 'Build not found' });
      return;
    }

    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      res.status(500).json({ error: 'Anthropic API not configured' });
      return;
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Helper to send SSE events
    const sendEvent = (event: string, data: any) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Keep connection alive with periodic comments
    const keepAliveInterval = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 15000);

    // Clean up on client disconnect
    req.on('close', () => {
      clearInterval(keepAliveInterval);
    });

    try {
      const anthropic = new Anthropic({
        apiKey: anthropicApiKey,
      });

      const systemPrompt = `You are an AI that generates a structured plan for building a software application.

Given a user's prompt, generate a realistic build plan with:
1. Company metadata (name and tagline)
2. 7 departments: Legal, Brand, Web, Marketing, Sales, Finance, Ops
3. For each department, generate 3-5 specific tasks
4. For each department, generate a brief output summary

Output format must be valid JSON with this structure:
{
  "company_name": "string",
  "tagline": "string",
  "departments": [
    {
      "name": "Legal|Brand|Web|Marketing|Sales|Finance|Ops",
      "icon": "emoji",
      "tasks": ["task1", "task2", "task3"],
      "output": "summary of what this department accomplished"
    }
  ]
}

Make tasks realistic and specific to the user's prompt. Keep task descriptions concise (under 10 words).`;

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Generate a build plan for: ${prompt}`,
          },
        ],
      });

      // Parse the AI response
      const textContent = message.content.find((block) => block.type === 'text');
      if (!textContent || !('text' in textContent)) {
        throw new Error('No text content in AI response');
      }

      let buildPlan;
      try {
        // Extract JSON from potential markdown code blocks
        let jsonText = textContent.text.trim();
        const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1];
        }
        buildPlan = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Failed to parse AI response:', textContent.text);
        throw new Error('Failed to parse AI response as JSON');
      }

      // Stream events to frontend

      // 1. Send meta event
      sendEvent('meta', {
        company_name: buildPlan.company_name || 'New Company',
        tagline: buildPlan.tagline || 'Building something great',
      });

      // Simulate streaming departments and tasks
      for (const dept of buildPlan.departments || []) {
        // 2. Send dept_start event
        sendEvent('dept_start', {
          dept: dept.name,
          icon: dept.icon || '📦',
          task_count: (dept.tasks || []).length,
        });

        // Small delay between departments for realistic streaming
        await new Promise(resolve => setTimeout(resolve, 300));

        // 3. Send task events
        for (const task of dept.tasks || []) {
          sendEvent('task', {
            dept: dept.name,
            task: task,
          });
          // Small delay between tasks
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        // 4. Send dept_done event
        sendEvent('dept_done', {
          dept: dept.name,
          output: dept.output || `Completed ${dept.name} tasks`,
        });

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // 5. Send done event
      sendEvent('done', {});

      // Update build status in database
      await getSupabase()
        .from('generated_apps')
        .update({
          status: 'complete',
          last_activity_at: new Date().toISOString(),
        })
        .eq('id', buildId);

      // Close connection
      clearInterval(keepAliveInterval);
      res.end();
    } catch (aiError) {
      console.error('AI generation error:', aiError);
      sendEvent('error', {
        message: aiError instanceof Error ? aiError.message : 'Failed to generate build',
      });
      clearInterval(keepAliveInterval);
      res.end();
    }
  } catch (error) {
    console.error('Stream error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to start build stream',
        message: error instanceof Error ? error.message : 'unknown error',
      });
    }
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
