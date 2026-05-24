import { Hono } from 'hono';
import type { Env } from '../index';
import { createClient } from '@supabase/supabase-js';
import { sendAsAgent, assignAIEmail } from '../services/emailService';

const app = new Hono<{ Bindings: Env & { RESEND_API_KEY: string } }>();

/**
 * POST /api/email/send
 * Send an email as the authenticated user's AI agent
 * Requires Authorization header with user's JWT
 */
app.post('/send', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the user's token
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // Parse request body
    const body = await c.req.json();
    const { to, subject, message, html, replyTo } = body;

    // Validate required fields
    if (!to || !subject || !message) {
      return c.json({
        error: 'Missing required fields: to, subject, message',
      }, 400);
    }

    // Send email using the email service
    const result = await sendAsAgent(
      {
        SUPABASE_URL: c.env.SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: c.env.SUPABASE_SERVICE_ROLE_KEY,
        RESEND_API_KEY: c.env.RESEND_API_KEY,
      },
      {
        userId: user.id,
        to,
        subject,
        body: message,
        html,
        replyTo,
      }
    );

    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }

    return c.json({
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Email send error:', error);
    return c.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

/**
 * POST /api/email/assign
 * Assign an AI email address to the authenticated user
 * Body: { agentName: "nova" }
 */
app.post('/assign', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the user's token
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // Parse request body
    const body = await c.req.json();
    const { agentName } = body;

    if (!agentName) {
      return c.json({ error: 'Missing required field: agentName' }, 400);
    }

    // Assign AI email
    const result = await assignAIEmail(
      {
        SUPABASE_URL: c.env.SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: c.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      user.id,
      agentName
    );

    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }

    return c.json({
      success: true,
      email: result.email,
      message: `AI email ${result.email} assigned successfully`,
    });
  } catch (error) {
    console.error('Email assign error:', error);
    return c.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

/**
 * GET /api/email/status
 * Check if the authenticated user has an AI email assigned
 */
app.get('/status', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the user's token
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('ai_email')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return c.json({ error: 'Failed to fetch profile' }, 500);
    }

    return c.json({
      hasAIEmail: !!profile?.ai_email,
      aiEmail: profile?.ai_email || null,
    });
  } catch (error) {
    console.error('Email status error:', error);
    return c.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

export default app;
