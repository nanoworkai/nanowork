import { Router, Response } from 'express';
import { requireUserAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { getEmailsByAgent, storeEmail } from '../services/supabase';
import { sendEmail } from '../services/email';

const router = Router();

/**
 * GET /emails
 * List emails for the agent
 */
router.get('/', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { business_id, direction, limit } = req.query;

    const emails = await getEmailsByAgent(
      req.agent!.id,
      limit ? parseInt(limit as string) : 50,
      business_id as string | undefined,
      direction as 'inbound' | 'outbound' | undefined
    );

    res.json(emails);
  } catch (error) {
    console.error('Get emails error:', error);
    res.status(500).json({
      error: 'Failed to fetch emails',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * POST /emails/send
 * Send an email from the agent
 */
router.post('/send', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { to, subject, text, html, business_id } = req.body;

    if (!to || !subject) {
      res.status(400).json({ error: 'to and subject are required' });
      return;
    }

    // Send email via Resend
    const externalMessageId = await sendEmail({
      from: req.agent!.email,
      to,
      subject,
      text,
      html,
    });

    // Store in database
    const email = await storeEmail({
      agent_id: req.agent!.id,
      business_id: business_id || null,
      direction: 'outbound',
      from_address: req.agent!.email,
      to_addresses: Array.isArray(to) ? to : [to],
      subject,
      body_text: text || null,
      body_html: html || null,
      external_message_id: externalMessageId,
      reply_to_email_id: null,
      metadata: {},
    });

    res.json({ ok: true, email_id: email.id });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({
      error: 'Failed to send email',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

export default router;
