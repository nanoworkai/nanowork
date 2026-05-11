import { createClient, SupabaseClient } from '@supabase/supabase-js';
import ws from 'ws';
import {
  Agent,
  NewAgent,
  Business,
  NewBusiness,
  GeneratedApp,
  NewGeneratedApp,
  AppFile,
  NewAppFile,
  LandingPage,
  NewLandingPage,
  Deployment,
  NewDeployment,
  AgentConversation,
  NewAgentConversation,
  AgentEmail,
  NewAgentEmail,
  AgentMemory,
  NewAgentMemory,
  AgentTask,
  NewAgentTask,
  Contact,
  NewContact,
  ContactInteraction,
  NewContactInteraction,
  PaymentLink,
  NewPaymentLink,
  Transaction,
  NewTransaction,
  Document,
  NewDocument,
} from '../types';

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabase) return supabase;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be configured');
  }

  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: (...args) => fetch(...args),
    },
    realtime: {
      transport: ws as any,
    },
  });

  return supabase;
}

// ============================================================================
// AGENTS
// ============================================================================

export async function getAgentByUserId(userId: string): Promise<Agent | null> {
  const { data, error } = await getSupabase()
    .from('agents')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data as Agent;
}

export async function getAgentBySlug(slug: string): Promise<Agent | null> {
  const { data, error } = await getSupabase()
    .from('agents')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as Agent;
}

export async function getAgentByLocalPart(localPart: string): Promise<Agent | null> {
  // Strip 'a-' prefix if present
  const slug = localPart.startsWith('a-') ? localPart.substring(2) : localPart;
  return getAgentBySlug(slug);
}

export async function createAgent(data: NewAgent): Promise<Agent> {
  const { data: agent, error } = await getSupabase()
    .from('agents')
    .insert(data)
    .select()
    .single();

  if (error || !agent) {
    throw new Error(`Failed to create agent: ${error?.message || 'unknown error'}`);
  }

  return agent as Agent;
}

// ============================================================================
// BUSINESSES
// ============================================================================

export async function getBusinesses(agentId: string): Promise<Business[]> {
  const { data, error } = await getSupabase()
    .from('businesses')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch businesses: ${error.message}`);
  return (data || []) as Business[];
}

export async function getBusiness(id: string): Promise<Business | null> {
  const { data, error } = await getSupabase()
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as Business;
}

export async function createBusiness(data: NewBusiness): Promise<Business> {
  const { data: business, error } = await getSupabase()
    .from('businesses')
    .insert(data)
    .select()
    .single();

  if (error || !business) {
    throw new Error(`Failed to create business: ${error?.message || 'unknown error'}`);
  }

  return business as Business;
}

export async function updateBusiness(
  id: string,
  data: Partial<Omit<Business, 'id' | 'created_at' | 'updated_at'>>
): Promise<Business> {
  const { data: business, error } = await getSupabase()
    .from('businesses')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error || !business) {
    throw new Error(`Failed to update business: ${error?.message || 'unknown error'}`);
  }

  return business as Business;
}

// ============================================================================
// GENERATED APPS
// ============================================================================

export async function createGeneratedApp(data: NewGeneratedApp): Promise<GeneratedApp> {
  const { data: app, error } = await getSupabase()
    .from('generated_apps')
    .insert(data)
    .select()
    .single();

  if (error || !app) {
    throw new Error(`Failed to create app: ${error?.message || 'unknown error'}`);
  }

  return app as GeneratedApp;
}

export async function updateGeneratedApp(
  id: string,
  data: Partial<Omit<GeneratedApp, 'id' | 'created_at' | 'updated_at'>>
): Promise<GeneratedApp> {
  const { data: app, error } = await getSupabase()
    .from('generated_apps')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error || !app) {
    throw new Error(`Failed to update app: ${error?.message || 'unknown error'}`);
  }

  return app as GeneratedApp;
}

export async function getGeneratedApp(id: string): Promise<GeneratedApp | null> {
  const { data, error } = await getSupabase()
    .from('generated_apps')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as GeneratedApp;
}

// ============================================================================
// APP FILES
// ============================================================================

export async function upsertAppFile(
  appId: string,
  path: string,
  content: string,
  language: string
): Promise<AppFile> {
  const { data: file, error } = await getSupabase()
    .from('app_files')
    .upsert(
      { app_id: appId, path, content, language },
      { onConflict: 'app_id,path' }
    )
    .select()
    .single();

  if (error || !file) {
    throw new Error(`Failed to upsert app file: ${error?.message || 'unknown error'}`);
  }

  return file as AppFile;
}

export async function getAppFiles(appId: string): Promise<AppFile[]> {
  const { data, error } = await getSupabase()
    .from('app_files')
    .select('*')
    .eq('app_id', appId)
    .order('path', { ascending: true });

  if (error) throw new Error(`Failed to fetch app files: ${error.message}`);
  return (data || []) as AppFile[];
}

// ============================================================================
// LANDING PAGES
// ============================================================================

export async function createLandingPage(data: NewLandingPage): Promise<LandingPage> {
  const { data: page, error } = await getSupabase()
    .from('landing_pages')
    .insert(data)
    .select()
    .single();

  if (error || !page) {
    throw new Error(`Failed to create landing page: ${error?.message || 'unknown error'}`);
  }

  return page as LandingPage;
}

export async function updateLandingPage(
  id: string,
  data: Partial<Omit<LandingPage, 'id' | 'created_at' | 'updated_at'>>
): Promise<LandingPage> {
  const { data: page, error } = await getSupabase()
    .from('landing_pages')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error || !page) {
    throw new Error(`Failed to update landing page: ${error?.message || 'unknown error'}`);
  }

  return page as LandingPage;
}

export async function getLandingPage(id: string): Promise<LandingPage | null> {
  const { data, error } = await getSupabase()
    .from('landing_pages')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as LandingPage;
}

// ============================================================================
// DEPLOYMENTS
// ============================================================================

export async function createDeployment(data: NewDeployment): Promise<Deployment> {
  const { data: deployment, error } = await getSupabase()
    .from('deployments')
    .insert(data)
    .select()
    .single();

  if (error || !deployment) {
    throw new Error(`Failed to create deployment: ${error?.message || 'unknown error'}`);
  }

  return deployment as Deployment;
}

export async function updateDeployment(
  id: string,
  data: Partial<Omit<Deployment, 'id' | 'created_at'>>
): Promise<Deployment> {
  const { data: deployment, error } = await getSupabase()
    .from('deployments')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error || !deployment) {
    throw new Error(`Failed to update deployment: ${error?.message || 'unknown error'}`);
  }

  return deployment as Deployment;
}

export async function getDeployments(businessId: string): Promise<Deployment[]> {
  const { data, error } = await getSupabase()
    .from('deployments')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch deployments: ${error.message}`);
  return (data || []) as Deployment[];
}

// ============================================================================
// CONVERSATIONS
// ============================================================================

export async function getConversation(id: string): Promise<AgentConversation | null> {
  const { data, error } = await getSupabase()
    .from('agent_conversations')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as AgentConversation;
}

export async function createConversation(data: NewAgentConversation): Promise<AgentConversation> {
  const { data: conversation, error } = await getSupabase()
    .from('agent_conversations')
    .insert(data)
    .select()
    .single();

  if (error || !conversation) {
    throw new Error(`Failed to create conversation: ${error?.message || 'unknown error'}`);
  }

  return conversation as AgentConversation;
}

export async function updateConversationMessages(
  id: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<AgentConversation> {
  const { data: conversation, error } = await getSupabase()
    .from('agent_conversations')
    .update({ messages })
    .eq('id', id)
    .select()
    .single();

  if (error || !conversation) {
    throw new Error(`Failed to update conversation: ${error?.message || 'unknown error'}`);
  }

  return conversation as AgentConversation;
}

export async function getConversations(
  agentId: string,
  businessId?: string
): Promise<AgentConversation[]> {
  let query = getSupabase()
    .from('agent_conversations')
    .select('*')
    .eq('agent_id', agentId);

  if (businessId) {
    query = query.eq('business_id', businessId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch conversations: ${error.message}`);
  return (data || []) as AgentConversation[];
}

// ============================================================================
// EMAILS
// ============================================================================

export async function storeEmail(data: NewAgentEmail): Promise<AgentEmail> {
  const { data: email, error } = await getSupabase()
    .from('agent_emails')
    .insert(data)
    .select()
    .single();

  if (error || !email) {
    throw new Error(`Failed to store email: ${error?.message || 'unknown error'}`);
  }

  return email as AgentEmail;
}

export async function getEmailsByAgent(
  agentId: string,
  limit: number = 50,
  businessId?: string,
  direction?: 'inbound' | 'outbound'
): Promise<AgentEmail[]> {
  let query = getSupabase()
    .from('agent_emails')
    .select('*')
    .eq('agent_id', agentId);

  if (businessId) {
    query = query.eq('business_id', businessId);
  }

  if (direction) {
    query = query.eq('direction', direction);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch emails: ${error.message}`);
  return (data || []) as AgentEmail[];
}

// ============================================================================
// TASKS
// ============================================================================

export async function createTask(
  agentId: string,
  businessId: string | null,
  taskType: string,
  payload: Record<string, any>
): Promise<AgentTask> {
  const { data: task, error } = await getSupabase()
    .from('agent_tasks')
    .insert({
      agent_id: agentId,
      business_id: businessId,
      task_type: taskType,
      status: 'pending',
      payload,
    })
    .select()
    .single();

  if (error || !task) {
    throw new Error(`Failed to create task: ${error?.message || 'unknown error'}`);
  }

  return task as AgentTask;
}

export async function updateTask(
  id: string,
  status: string,
  result?: Record<string, any>,
  errorMessage?: string
): Promise<AgentTask> {
  const updateData: Partial<AgentTask> = { status: status as any };

  if (result) updateData.result = result;
  if (errorMessage) updateData.error_message = errorMessage;
  if (status === 'completed') updateData.completed_at = new Date().toISOString();

  const { data: task, error } = await getSupabase()
    .from('agent_tasks')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !task) {
    throw new Error(`Failed to update task: ${error?.message || 'unknown error'}`);
  }

  return task as AgentTask;
}

export async function getPendingTasks(agentId: string): Promise<AgentTask[]> {
  const { data, error } = await getSupabase()
    .from('agent_tasks')
    .select('*')
    .eq('agent_id', agentId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to fetch pending tasks: ${error.message}`);
  return (data || []) as AgentTask[];
}

export async function getTasks(
  agentId: string,
  status?: string,
  businessId?: string
): Promise<AgentTask[]> {
  let query = getSupabase()
    .from('agent_tasks')
    .select('*')
    .eq('agent_id', agentId);

  if (status) {
    query = query.eq('status', status);
  }

  if (businessId) {
    query = query.eq('business_id', businessId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch tasks: ${error.message}`);
  return (data || []) as AgentTask[];
}

// ============================================================================
// CONTACTS
// ============================================================================

export async function getContacts(
  agentId: string,
  businessId?: string,
  status?: string
): Promise<Contact[]> {
  let query = getSupabase()
    .from('contacts')
    .select('*')
    .eq('agent_id', agentId);

  if (businessId) {
    query = query.eq('business_id', businessId);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch contacts: ${error.message}`);
  return (data || []) as Contact[];
}

export async function upsertContact(data: NewContact): Promise<Contact> {
  const { data: contact, error } = await getSupabase()
    .from('contacts')
    .upsert(data, { onConflict: 'agent_id,email' })
    .select()
    .single();

  if (error || !contact) {
    throw new Error(`Failed to upsert contact: ${error?.message || 'unknown error'}`);
  }

  return contact as Contact;
}

export async function updateContact(
  id: string,
  data: Partial<Omit<Contact, 'id' | 'created_at' | 'updated_at'>>
): Promise<Contact> {
  const { data: contact, error } = await getSupabase()
    .from('contacts')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error || !contact) {
    throw new Error(`Failed to update contact: ${error?.message || 'unknown error'}`);
  }

  return contact as Contact;
}

export async function createInteraction(data: NewContactInteraction): Promise<ContactInteraction> {
  const { data: interaction, error } = await getSupabase()
    .from('contact_interactions')
    .insert(data)
    .select()
    .single();

  if (error || !interaction) {
    throw new Error(`Failed to create interaction: ${error?.message || 'unknown error'}`);
  }

  return interaction as ContactInteraction;
}

// ============================================================================
// PAYMENTS
// ============================================================================

export async function createPaymentLink(data: NewPaymentLink): Promise<PaymentLink> {
  const { data: link, error } = await getSupabase()
    .from('payment_links')
    .insert(data)
    .select()
    .single();

  if (error || !link) {
    throw new Error(`Failed to create payment link: ${error?.message || 'unknown error'}`);
  }

  return link as PaymentLink;
}

export async function createTransaction(data: NewTransaction): Promise<Transaction> {
  const { data: transaction, error } = await getSupabase()
    .from('transactions')
    .insert(data)
    .select()
    .single();

  if (error || !transaction) {
    throw new Error(`Failed to create transaction: ${error?.message || 'unknown error'}`);
  }

  return transaction as Transaction;
}

export async function getTransactions(
  agentId: string,
  businessId?: string
): Promise<Transaction[]> {
  let query = getSupabase()
    .from('transactions')
    .select('*')
    .eq('agent_id', agentId);

  if (businessId) {
    query = query.eq('business_id', businessId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch transactions: ${error.message}`);
  return (data || []) as Transaction[];
}

export async function updateBusinessRevenue(
  businessId: string,
  amountCents: number
): Promise<void> {
  const { error } = await getSupabase()
    .from('businesses')
    .update({
      revenue_cents: getSupabase().rpc('increment', { x: amountCents }),
    })
    .eq('id', businessId);

  if (error) {
    throw new Error(`Failed to update business revenue: ${error.message}`);
  }
}

// ============================================================================
// DOCUMENTS
// ============================================================================

export async function storeDocument(data: NewDocument): Promise<Document> {
  const { data: document, error } = await getSupabase()
    .from('documents')
    .insert(data)
    .select()
    .single();

  if (error || !document) {
    throw new Error(`Failed to store document: ${error?.message || 'unknown error'}`);
  }

  return document as Document;
}

export async function getDocuments(
  agentId: string,
  businessId?: string
): Promise<Document[]> {
  let query = getSupabase()
    .from('documents')
    .select('*')
    .eq('agent_id', agentId);

  if (businessId) {
    query = query.eq('business_id', businessId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch documents: ${error.message}`);
  return (data || []) as Document[];
}

export async function updateDocumentEmbedding(
  id: string,
  embedding: number[]
): Promise<void> {
  const { error } = await getSupabase()
    .from('documents')
    .update({ embedding })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update document embedding: ${error.message}`);
  }
}
