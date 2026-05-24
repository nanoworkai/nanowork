import { Hono } from 'hono';
import type { Env } from '../index';
import { createClient } from '@supabase/supabase-js';

const app = new Hono<{ Bindings: Env & { INTERNAL_TOKEN: string } }>();

/**
 * Cloudflare Email Routing Webhook Handler
 * POST /api/email/inbound
 *
 * Receives inbound emails sent to AI agent addresses (e.g., nova@nanowork.ai)
 * Stores them in email_messages table and triggers AI processing
 *
 * Cloudflare Email Routing payload format:
 * {
 *   "from": "sender@example.com",
 *   "to": "nova@nanowork.ai",
 *   "subject": "Hello",
 *   "headers": {...},
 *   "content": "email body text",
 *   "raw": "raw MIME message"
 * }
 */
app.post('/', async (c) => {
  try {
    // 1. Verify internal token
    const authHeader = c.req.header('Authorization');
    const expectedToken = c.env.INTERNAL_TOKEN;

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      console.error('Unauthorized inbound email attempt');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // 2. Parse email payload from Cloudflare Email Routing
    const payload = await c.req.json();
    const {
      from,
      to,
      subject,
      headers,
      content,
      text,
      html,
      attachments,
      messageId,
    } = payload;

    console.log('[Email Inbound] Received email:', {
      from,
      to,
      subject,
      messageId,
    });

    // 3. Validate required fields
    if (!from || !to || !content) {
      return c.json({
        error: 'Missing required fields: from, to, content',
      }, 400);
    }

    // 4. Create Supabase admin client
    const supabase = createClient(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 5. Look up which user owns the AI email address
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, ai_email')
      .eq('ai_email', to)
      .single();

    if (profileError || !profile) {
      console.error('[Email Inbound] No user found for AI email:', to);
      return c.json({
        error: `No user found for AI email address: ${to}`,
        details: profileError?.message,
      }, 404);
    }

    const userId = profile.id;
    console.log('[Email Inbound] Found user:', userId, 'for email:', to);

    // 6. Extract sender info
    const fromParts = from.match(/^(?:"?([^"]*)"?\s)?<?([^>]+)>?$/);
    const fromName = fromParts?.[1]?.trim() || null;
    const fromAddress = fromParts?.[2]?.trim() || from;

    // 7. Store email in email_messages table
    const { data: emailMessage, error: insertError } = await supabase
      .from('email_messages')
      .insert({
        user_id: userId,
        from_address: fromAddress,
        from_name: fromName,
        to_address: to,
        subject: subject || '(No subject)',
        body_text: text || content,
        body_html: html || null,
        direction: 'inbound',
        status: 'received',
        message_id: messageId || null,
        headers: headers || null,
        attachments: attachments || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Email Inbound] Failed to store email:', insertError);
      return c.json({
        error: 'Failed to store email',
        details: insertError.message,
      }, 500);
    }

    console.log('[Email Inbound] Stored email message:', emailMessage.id);

    // 8. Trigger AI agent pipeline (async - don't block response)
    void triggerAIProcessing(
      {
        SUPABASE_URL: c.env.SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: c.env.SUPABASE_SERVICE_ROLE_KEY,
        ANTHROPIC_API_KEY: c.env.ANTHROPIC_API_KEY,
      },
      {
        emailMessageId: emailMessage.id,
        userId,
        fromAddress,
        fromName,
        subject: subject || '(No subject)',
        body: text || content,
      }
    ).catch((error) => {
      console.error('[Email Inbound] AI processing failed:', error);
    });

    // 9. Return success response immediately
    return c.json({
      success: true,
      messageId: emailMessage.id,
      message: 'Email received and queued for processing',
    });
  } catch (error) {
    console.error('[Email Inbound] Error:', error);
    return c.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

/**
 * Trigger AI processing for inbound email
 * This is called asynchronously after storing the email
 */
async function triggerAIProcessing(
  env: {
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    ANTHROPIC_API_KEY: string;
  },
  params: {
    emailMessageId: string;
    userId: string;
    fromAddress: string;
    fromName: string | null;
    subject: string;
    body: string;
  }
): Promise<void> {
  try {
    console.log('[AI Processing] Starting for email:', params.emailMessageId);

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Update status to processing
    await supabase
      .from('email_messages')
      .update({ status: 'processing' })
      .eq('id', params.emailMessageId);

    // TODO: Integrate with your existing AI agent system
    // This is where you would:
    // 1. Analyze the email content
    // 2. Determine appropriate action (create task, respond, etc.)
    // 3. Generate AI response if needed
    // 4. Send reply via the email service
    //
    // For now, we'll just mark it as processed
    // Example integration point:
    //
    // const aiResponse = await generateAIResponse(env, {
    //   userId: params.userId,
    //   prompt: `New email from ${params.fromName || params.fromAddress}\nSubject: ${params.subject}\n\n${params.body}`,
    // });
    //
    // if (aiResponse) {
    //   await sendAsAgent(env, {
    //     userId: params.userId,
    //     to: params.fromAddress,
    //     subject: `Re: ${params.subject}`,
    //     body: aiResponse,
    //   });
    // }

    // Mark as processed
    await supabase
      .from('email_messages')
      .update({
        status: 'processed',
        ai_processed: true,
        processed_at: new Date().toISOString(),
      })
      .eq('id', params.emailMessageId);

    console.log('[AI Processing] Completed for email:', params.emailMessageId);
  } catch (error) {
    console.error('[AI Processing] Error:', error);

    // Mark as failed
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    await supabase
      .from('email_messages')
      .update({ status: 'failed' })
      .eq('id', params.emailMessageId);
  }
}

/**
 * GET /api/email/inbound/test
 * Test endpoint to verify the handler is working
 */
app.get('/test', async (c) => {
  return c.json({
    status: 'ok',
    message: 'Inbound email handler is ready',
    endpoint: '/api/email/inbound',
  });
});

export default app;
