import { Resend } from 'resend';

let resend: Resend | null = null;

function getResend(): Resend {
  if (resend) return resend;

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('RESEND_API_KEY must be configured');
  }

  resend = new Resend(apiKey);
  return resend;
}

export interface SendEmailParams {
  from: string;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

/**
 * Send an email via Resend
 */
export async function sendEmail(params: SendEmailParams): Promise<string> {
  try {
    const client = getResend();

    const { data, error } = await client.emails.send({
      from: params.from,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      text: params.text || '',
      html: params.html,
      reply_to: params.replyTo,
    });

    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }

    return data?.id || 'unknown';
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error(`Email send failed: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
}

/**
 * Generate agent email address from slug
 */
export function agentEmailAddress(slug: string): string {
  const domain = process.env.AGENT_EMAIL_DOMAIN;

  if (!domain) {
    throw new Error('AGENT_EMAIL_DOMAIN must be configured');
  }

  return `a-${slug}@${domain}`;
}
