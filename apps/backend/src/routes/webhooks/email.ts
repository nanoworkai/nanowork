import { Router, Request, Response } from 'express';
import { requireInternalToken } from '../../middleware/auth';
import { getAgentByLocalPart, storeEmail, createTask } from '../../services/supabase';

const router = Router();

/**
 * POST /webhooks/email/inbound
 * Handle inbound email webhook
 */
router.post('/inbound', requireInternalToken, async (req: Request, res: Response) => {
  try {
    const { localPart, from, to, subject, text, html, headers } = req.body;

    if (!localPart) {
      res.status(400).json({ error: 'localPart is required' });
      return;
    }

    // Look up agent by email local part
    const agent = await getAgentByLocalPart(localPart);

    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    // Store the email
    const email = await storeEmail({
      agent_id: agent.id,
      business_id: null, // TODO: Could be inferred from subject/content
      direction: 'inbound',
      from_address: from,
      to_addresses: Array.isArray(to) ? to : [to],
      subject: subject || '(no subject)',
      body_text: text || null,
      body_html: html || null,
      external_message_id: headers?.['message-id'] || null,
      reply_to_email_id: null,
      metadata: { headers: headers || {} },
    });

    // Create a task for the agent to process this email
    const task = await createTask(agent.id, null, 'email_received', {
      email_id: email.id,
      from: from,
      subject: subject,
    });

    res.json({ ok: true, email_id: email.id, task_id: task.id });
  } catch (error) {
    console.error('Inbound email webhook error:', error);
    res.status(500).json({
      error: 'Failed to process inbound email',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

export default router;
