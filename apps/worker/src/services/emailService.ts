import { createClient } from '@supabase/supabase-js';

/**
 * Email Service using Resend
 * Sends emails from AI agent addresses (e.g., nova@nanowork.ai)
 */

export interface SendAsAgentParams {
  userId: string;
  to: string | string[];
  subject: string;
  body: string;
  html?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email as the user's assigned AI agent
 * @param env - Cloudflare Worker environment variables
 * @param params - Email parameters
 * @returns Result with success status and message ID or error
 */
export async function sendAsAgent(
  env: {
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    RESEND_API_KEY: string;
  },
  params: SendAsAgentParams
): Promise<SendEmailResult> {
  try {
    // 1. Create Supabase client
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 2. Look up user's AI email from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('ai_email, name')
      .eq('id', params.userId)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        error: `Failed to fetch user profile: ${profileError?.message || 'Profile not found'}`,
      };
    }

    // 3. Validate AI email exists
    const aiEmail = profile.ai_email;
    if (!aiEmail) {
      return {
        success: false,
        error: 'User does not have an AI email assigned. Please assign one first.',
      };
    }

    // 4. Build from address with friendly name
    // Extract the agent name from email (e.g., "nova" from "nova@nanowork.ai")
    const agentName = aiEmail.split('@')[0];
    const displayName = agentName.charAt(0).toUpperCase() + agentName.slice(1);
    const fromAddress = `${displayName} from Nanowork <${aiEmail}>`;

    // 5. Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: Array.isArray(params.to) ? params.to : [params.to],
        subject: params.subject,
        text: params.body,
        html: params.html || params.body.replace(/\n/g, '<br>'),
        reply_to: params.replyTo,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json().catch(() => ({})) as { message?: string };
      return {
        success: false,
        error: `Resend API error: ${errorData.message || resendResponse.statusText}`,
      };
    }

    const resendData = await resendResponse.json() as { id?: string };

    return {
      success: true,
      messageId: resendData.id,
    };
  } catch (error) {
    console.error('Email service error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending email',
    };
  }
}

/**
 * Send a raw email (not from AI agent)
 * Useful for system emails, notifications, etc.
 */
export async function sendSystemEmail(
  env: { RESEND_API_KEY: string },
  params: {
    from: string;
    to: string | string[];
    subject: string;
    body: string;
    html?: string;
    replyTo?: string;
  }
): Promise<SendEmailResult> {
  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: params.from,
        to: Array.isArray(params.to) ? params.to : [params.to],
        subject: params.subject,
        text: params.body,
        html: params.html || params.body.replace(/\n/g, '<br>'),
        reply_to: params.replyTo,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json().catch(() => ({})) as { message?: string };
      return {
        success: false,
        error: `Resend API error: ${errorData.message || resendResponse.statusText}`,
      };
    }

    const resendData = await resendResponse.json() as { id?: string };

    return {
      success: true,
      messageId: resendData.id,
    };
  } catch (error) {
    console.error('System email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending email',
    };
  }
}

/**
 * Assign an AI email to a user (helper function)
 * Call this when a new user signs up or when they request an AI email
 */
export async function assignAIEmail(
  env: {
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
  },
  userId: string,
  agentName: string
): Promise<{ success: boolean; email?: string; error?: string }> {
  try {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Normalize agent name (lowercase, no special chars)
    const normalizedName = agentName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const aiEmail = `${normalizedName}@nanowork.ai`;

    // Update user profile with AI email
    const { error } = await supabase
      .from('profiles')
      .update({ ai_email: aiEmail })
      .eq('id', userId);

    if (error) {
      return {
        success: false,
        error: `Failed to assign AI email: ${error.message}`,
      };
    }

    return {
      success: true,
      email: aiEmail,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
