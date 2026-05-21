import { Router, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { requireUserAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { getSupabase } from '../services/supabase';
import { spendCredits, InsufficientCreditsError } from '../services/creditService';
import {
  createBuildSchema,
  updateBuildSchema,
  generateNameSchema,
  streamQuerySchema
} from '../validation/schemas';

const router = Router();

// Track active SSE connections per user to prevent DoS
const activeConnections = new Map<string, Set<string>>();
const MAX_CONNECTIONS_PER_USER = 3;
const ANTHROPIC_TIMEOUT_MS = 30000; // 30 seconds

function addConnection(userId: string, buildId: string): boolean {
  if (!activeConnections.has(userId)) {
    activeConnections.set(userId, new Set());
  }

  const userConnections = activeConnections.get(userId)!;

  if (userConnections.size >= MAX_CONNECTIONS_PER_USER) {
    return false; // Too many connections
  }

  userConnections.add(buildId);
  return true;
}

function removeConnection(userId: string, buildId: string): void {
  const userConnections = activeConnections.get(userId);
  if (userConnections) {
    userConnections.delete(buildId);
    if (userConnections.size === 0) {
      activeConnections.delete(userId);
    }
  }
}

/**
 * POST /build/generate-name
 * Generate an AI build name from a prompt
 */
router.post('/generate-name', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Validate request body
    const validation = generateNameSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.error.issues
      });
      return;
    }

    const { prompt } = validation.data;

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
 * GET /build
 * Get all builds for the authenticated user
 */
router.get('/', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(403).json({ error: 'No user found' });
      return;
    }

    const { data, error } = await getSupabase()
      .from('builds')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch builds: ${error.message}`);
    }

    // Map company_name to name for frontend compatibility
    const builds = (data || []).map((build: any) => ({
      ...build,
      name: build.company_name || 'Untitled Build',
    }));

    res.json({ builds });
  } catch (error) {
    console.error('Get builds error:', error);
    res.status(500).json({
      error: 'Failed to fetch builds',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * POST /build
 * Create a new build for the authenticated user
 */
router.post('/', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(403).json({ error: 'No user found' });
      return;
    }

    // Validate request body
    const validation = createBuildSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.error.issues
      });
      return;
    }

    const { company_name, prompt, tagline } = validation.data;
    const cost = 100;

    // Check and deduct credits before creating build
    let newBalance: number;
    try {
      newBalance = await spendCredits(
        req.user.id,
        cost,
        'Build generation'
      );
    } catch (creditError) {
      if (creditError instanceof InsufficientCreditsError) {
        res.status(402).json({
          error: 'Insufficient credits',
          required: cost,
          message: 'Your balance is too low. Please top up to continue.'
        });
        return;
      }
      throw creditError;
    }

    // Credits successfully deducted, now create the build
    const { data, error } = await getSupabase()
      .from('builds')
      .insert({
        user_id: req.user.id,
        company_name,
        prompt,
        tagline,
        status: 'generating',
        credits_cost: cost,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create build: ${error?.message || 'unknown error'}`);
    }

    // Map company_name to name for frontend compatibility
    const build = {
      ...data,
      name: data.company_name || 'Untitled Build',
    };

    res.json({ build, new_balance: newBalance });
  } catch (error) {
    console.error('Create build error:', error);
    res.status(500).json({
      error: 'Failed to create build',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * PATCH /build/:id
 * Update a build (update company name, tagline, status)
 */
router.patch('/:id', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(403).json({ error: 'No user found' });
      return;
    }

    // Validate request body
    const validation = updateBuildSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.error.issues
      });
      return;
    }

    const { id } = req.params;
    const { company_name, name, tagline, status, build_data, last_activity_at } = validation.data;

    const updateData: any = {};
    // Accept both 'name' (from frontend) and 'company_name' (database field)
    if (company_name !== undefined) updateData.company_name = company_name;
    if (name !== undefined) updateData.company_name = name;
    if (tagline !== undefined) updateData.tagline = tagline;
    if (status !== undefined) updateData.status = status;
    if (build_data !== undefined) updateData.build_data = build_data;
    if (last_activity_at !== undefined) updateData.last_activity_at = last_activity_at;

    const { data, error } = await getSupabase()
      .from('builds')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update build: ${error?.message || 'not found'}`);
    }

    // Map company_name to name for frontend compatibility
    const build = {
      ...data,
      name: data.company_name || 'Untitled Build',
    };

    res.json({ build });
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
  let keepAliveInterval: NodeJS.Timeout | null = null;
  let connectionAdded = false;

  try {
    // Validate query parameters
    const validation = streamQuerySchema.safeParse(req.query);
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.error.issues
      });
      return;
    }

    const { buildId, prompt } = validation.data;

    if (!req.user) {
      res.status(403).json({ error: 'No user found' });
      return;
    }

    // Check connection limit
    if (!addConnection(req.user.id, buildId)) {
      res.status(429).json({
        error: 'Too many active streams',
        message: `Maximum ${MAX_CONNECTIONS_PER_USER} concurrent build streams allowed`
      });
      return;
    }
    connectionAdded = true;

    // Verify the build belongs to the user
    const { data: build, error: buildError } = await getSupabase()
      .from('builds')
      .select('*')
      .eq('id', buildId)
      .eq('user_id', req.user.id)
      .single();

    if (buildError || !build) {
      res.status(404).json({ error: 'Build not found' });
      return;
    }

    // IDEMPOTENCY CHECK 1: If build is already complete with data, replay it
    if (build.status === 'unlocked' && build.build_data) {
      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      const sendEvent = (event: string, data: any) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      // Replay existing build data
      const buildPlan = build.build_data;

      // Send meta event
      sendEvent('meta', {
        company_name: buildPlan.company_name || 'New Company',
        tagline: buildPlan.tagline || 'Building something great',
      });

      // Replay departments and tasks
      for (const dept of buildPlan.departments || []) {
        sendEvent('dept_start', {
          dept: dept.name,
          icon: dept.icon || '📦',
          task_count: (dept.tasks || []).length,
        });

        await new Promise(resolve => setTimeout(resolve, 100));

        for (const task of dept.tasks || []) {
          sendEvent('task', {
            dept: dept.name,
            task: task,
          });
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        sendEvent('dept_done', {
          dept: dept.name,
          output: dept.output || `Completed ${dept.name} tasks`,
        });

        await new Promise(resolve => setTimeout(resolve, 50));
      }

      sendEvent('done', {});
      removeConnection(req.user.id, buildId);
      res.end();
      return;
    }

    // IDEMPOTENCY CHECK 2: If build is currently generating, reject concurrent request
    if (build.status === 'generating') {
      res.status(409).json({
        error: 'Build generation already in progress',
        message: 'Another stream is actively generating this build. Please wait for it to complete.'
      });
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

    // Cleanup function
    const cleanup = async (updateStatus?: 'failed' | 'unlocked') => {
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
      }
      if (connectionAdded) {
        removeConnection(req.user!.id, buildId);
        connectionAdded = false;
      }
      if (updateStatus) {
        await getSupabase()
          .from('builds')
          .update({ status: updateStatus })
          .eq('id', buildId)
          .eq('user_id', req.user!.id);
      }
    };

    // Clean up on client disconnect
    req.on('close', async () => {
      await cleanup('failed');
    });

    // Start keepalive interval AFTER validation passes
    keepAliveInterval = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 15000);

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

      // Create streaming API call with timeout
      let accumulatedText = '';
      let streamEnded = false;
      let timeoutId: NodeJS.Timeout | null = null;

      const streamPromise = new Promise<void>(async (resolve, reject) => {
        try {
          const stream = await anthropic.messages.stream({
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

          // Send initial connecting event
          sendEvent('ai_start', { message: 'AI generation started' });

          // Handle text chunks
          stream.on('text', (text: string) => {
            accumulatedText += text;
            // Optionally send chunks to frontend for real-time display
            sendEvent('ai_chunk', { text });
          });

          // Handle stream completion
          stream.on('message_stop', () => {
            streamEnded = true;
            if (timeoutId) clearTimeout(timeoutId);
            resolve();
          });

          // Handle stream errors
          stream.on('error', (error: Error) => {
            streamEnded = true;
            if (timeoutId) clearTimeout(timeoutId);
            reject(error);
          });
        } catch (error) {
          streamEnded = true;
          if (timeoutId) clearTimeout(timeoutId);
          reject(error);
        }
      });

      // Setup timeout
      const timeoutPromise = new Promise<void>((_, reject) => {
        timeoutId = setTimeout(() => {
          if (!streamEnded) {
            reject(new Error('AI request timed out'));
          }
        }, ANTHROPIC_TIMEOUT_MS);
      });

      // Wait for stream to complete or timeout
      await Promise.race([streamPromise, timeoutPromise]);

      // Send completion event
      sendEvent('ai_done', { message: 'AI generation completed' });

      // Parse the accumulated AI response
      if (!accumulatedText) {
        throw new Error('No text content in AI response');
      }

      let buildPlan;
      try {
        // Extract JSON from potential markdown code blocks
        let jsonText = accumulatedText.trim();
        const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1];
        }
        buildPlan = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Failed to parse AI response:', accumulatedText);
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
        .from('builds')
        .update({
          status: 'unlocked',
          build_data: buildPlan,
        })
        .eq('id', buildId)
        .eq('user_id', req.user!.id);

      // Close connection and cleanup
      await cleanup(); // Don't update status, already set to 'unlocked'
      res.end();
    } catch (aiError) {
      console.error('AI generation error:', aiError);
      sendEvent('error', {
        message: aiError instanceof Error ? aiError.message : 'Failed to generate build',
      });
      await cleanup('failed');
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
 * DELETE /build/:id
 * Delete a build
 */
router.delete('/:id', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(403).json({ error: 'No user found' });
      return;
    }

    const { id } = req.params;

    const { error } = await getSupabase()
      .from('builds')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

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
 * GET /build/:id
 * Get a specific build
 */
router.get('/:id', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(403).json({ error: 'No user found' });
      return;
    }

    const { id } = req.params;

    const { data, error } = await getSupabase()
      .from('builds')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Build not found' });
      return;
    }

    // Map company_name to name for frontend compatibility
    const build = {
      ...data,
      name: data.company_name || 'Untitled Build',
    };

    res.json({ build });
  } catch (error) {
    console.error('Get build error:', error);
    res.status(500).json({
      error: 'Failed to fetch build',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

export default router;
