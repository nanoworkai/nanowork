import { getSupabase } from './supabase';

/**
 * Analytics service for generating dashboard statistics and insights
 */

export interface AgentStats {
  businesses: {
    total: number;
    planning: number;
    building: number;
    live: number;
    archived: number;
  };
  contacts: {
    total: number;
    leads: number;
    customers: number;
    partners: number;
  };
  conversations: {
    total: number;
  };
  tasks: {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    failed: number;
  };
  documents: {
    total: number;
  };
  emails: {
    total: number;
    inbound: number;
    outbound: number;
  };
}

/**
 * Get comprehensive statistics for an agent
 */
export async function getAgentStats(agentId: string): Promise<AgentStats> {
  const supabase = getSupabase();

  // Run all queries in parallel for performance
  const [
    businessesResult,
    contactsResult,
    conversationsResult,
    tasksResult,
    documentsResult,
    emailsResult,
  ] = await Promise.all([
    supabase
      .from('businesses')
      .select('id, status', { count: 'exact', head: false })
      .eq('agent_id', agentId),
    supabase
      .from('contacts')
      .select('id, status', { count: 'exact', head: false })
      .eq('agent_id', agentId),
    supabase
      .from('agent_conversations')
      .select('id', { count: 'exact', head: true })
      .eq('agent_id', agentId),
    supabase
      .from('agent_tasks')
      .select('id, status', { count: 'exact', head: false })
      .eq('agent_id', agentId),
    supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('agent_id', agentId),
    supabase
      .from('agent_emails')
      .select('id, direction', { count: 'exact', head: false })
      .eq('agent_id', agentId),
  ]);

  return {
    businesses: {
      total: businessesResult.count || 0,
      planning: businessesResult.data?.filter((b) => b.status === 'planning').length || 0,
      building: businessesResult.data?.filter((b) => b.status === 'building').length || 0,
      live: businessesResult.data?.filter((b) => b.status === 'live').length || 0,
      archived: businessesResult.data?.filter((b) => b.status === 'archived').length || 0,
    },
    contacts: {
      total: contactsResult.count || 0,
      leads: contactsResult.data?.filter((c) => c.status === 'lead').length || 0,
      customers: contactsResult.data?.filter((c) => c.status === 'customer').length || 0,
      partners: contactsResult.data?.filter((c) => c.status === 'partner').length || 0,
    },
    conversations: {
      total: conversationsResult.count || 0,
    },
    tasks: {
      total: tasksResult.count || 0,
      pending: tasksResult.data?.filter((t) => t.status === 'pending').length || 0,
      in_progress: tasksResult.data?.filter((t) => t.status === 'in_progress').length || 0,
      completed: tasksResult.data?.filter((t) => t.status === 'completed').length || 0,
      failed: tasksResult.data?.filter((t) => t.status === 'failed').length || 0,
    },
    documents: {
      total: documentsResult.count || 0,
    },
    emails: {
      total: emailsResult.count || 0,
      inbound: emailsResult.data?.filter((e) => e.direction === 'inbound').length || 0,
      outbound: emailsResult.data?.filter((e) => e.direction === 'outbound').length || 0,
    },
  };
}

/**
 * Get business-specific statistics
 */
export async function getBusinessStats(businessId: string) {
  const supabase = getSupabase();

  const [deploymentsResult, conversationsResult, contactsResult, transactionsResult] =
    await Promise.all([
      supabase
        .from('deployments')
        .select('id, status')
        .eq('business_id', businessId),
      supabase
        .from('agent_conversations')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', businessId),
      supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', businessId),
      supabase
        .from('transactions')
        .select('amount_cents, status')
        .eq('business_id', businessId),
    ]);

  // Calculate revenue
  const revenue = (transactionsResult.data || [])
    .filter((t) => t.status === 'succeeded')
    .reduce((sum, t) => sum + t.amount_cents, 0);

  return {
    deployments: {
      total: deploymentsResult.data?.length || 0,
      success: deploymentsResult.data?.filter((d) => d.status === 'success').length || 0,
      failed: deploymentsResult.data?.filter((d) => d.status === 'failed').length || 0,
      pending: deploymentsResult.data?.filter((d) => d.status === 'pending').length || 0,
    },
    conversations: {
      total: conversationsResult.count || 0,
    },
    contacts: {
      total: contactsResult.count || 0,
    },
    revenue: {
      totalCents: revenue,
      totalUsd: revenue / 100,
    },
  };
}

/**
 * Get activity timeline for an agent
 */
export async function getAgentActivity(agentId: string, limit: number = 20) {
  const supabase = getSupabase();

  // Get recent activities from multiple tables
  const [tasks, conversations, emails] = await Promise.all([
    supabase
      .from('agent_tasks')
      .select('id, task_type, status, created_at')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase
      .from('agent_conversations')
      .select('id, created_at')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase
      .from('agent_emails')
      .select('id, direction, subject, created_at')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(limit),
  ]);

  // Combine and sort all activities
  const activities = [
    ...(tasks.data || []).map((t) => ({
      type: 'task',
      id: t.id,
      description: `Task: ${t.task_type}`,
      status: t.status,
      timestamp: t.created_at,
    })),
    ...(conversations.data || []).map((c) => ({
      type: 'conversation',
      id: c.id,
      description: 'New conversation',
      timestamp: c.created_at,
    })),
    ...(emails.data || []).map((e) => ({
      type: 'email',
      id: e.id,
      description: `${e.direction === 'inbound' ? 'Received' : 'Sent'}: ${e.subject}`,
      timestamp: e.created_at,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return activities.slice(0, limit);
}
