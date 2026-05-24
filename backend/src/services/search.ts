import { getSupabase } from './supabase';
import { Business, Contact, AgentConversation, Document } from '../types';

/**
 * Search service for full-text search across resources
 */

export interface SearchOptions {
  agentId: string;
  query: string;
  limit?: number;
  businessId?: string;
}

export interface SearchResults {
  businesses: Business[];
  contacts: Contact[];
  conversations: AgentConversation[];
  documents: Document[];
}

/**
 * Perform a full-text search across multiple resource types
 */
export async function searchAll(options: SearchOptions): Promise<SearchResults> {
  const { agentId, query, limit = 10, businessId } = options;
  const supabase = getSupabase();

  // Use PostgreSQL's text search capabilities
  // Note: This requires proper indexes in production (e.g., GIN indexes on tsvector columns)

  const searchPattern = `%${query.toLowerCase()}%`;

  const [businessesResult, contactsResult, conversationsResult, documentsResult] =
    await Promise.all([
      searchBusinesses(agentId, searchPattern, limit, businessId),
      searchContacts(agentId, searchPattern, limit, businessId),
      searchConversations(agentId, searchPattern, limit, businessId),
      searchDocuments(agentId, searchPattern, limit, businessId),
    ]);

  return {
    businesses: businessesResult,
    contacts: contactsResult,
    conversations: conversationsResult,
    documents: documentsResult,
  };
}

/**
 * Search businesses by name, tagline, or description
 */
async function searchBusinesses(
  agentId: string,
  searchPattern: string,
  limit: number,
  businessId?: string
): Promise<Business[]> {
  const supabase = getSupabase();

  let query = supabase
    .from('businesses')
    .select('*')
    .eq('agent_id', agentId);

  if (businessId) {
    query = query.eq('id', businessId);
  }

  const { data, error } = await query
    .or(`name.ilike.${searchPattern},tagline.ilike.${searchPattern},description.ilike.${searchPattern}`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Search businesses error:', error);
    return [];
  }

  return (data || []) as Business[];
}

/**
 * Search contacts by name, email, or company
 */
async function searchContacts(
  agentId: string,
  searchPattern: string,
  limit: number,
  businessId?: string
): Promise<Contact[]> {
  const supabase = getSupabase();

  let query = supabase
    .from('contacts')
    .select('*')
    .eq('agent_id', agentId);

  if (businessId) {
    query = query.eq('business_id', businessId);
  }

  const { data, error } = await query
    .or(`name.ilike.${searchPattern},email.ilike.${searchPattern},company.ilike.${searchPattern}`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Search contacts error:', error);
    return [];
  }

  return (data || []) as Contact[];
}

/**
 * Search conversations by message content
 * Note: This is a simplified search - in production, consider using full-text search on JSONB
 */
async function searchConversations(
  agentId: string,
  searchPattern: string,
  limit: number,
  businessId?: string
): Promise<AgentConversation[]> {
  const supabase = getSupabase();

  let query = supabase
    .from('agent_conversations')
    .select('*')
    .eq('agent_id', agentId);

  if (businessId) {
    query = query.eq('business_id', businessId);
  }

  // Fetch all conversations and filter in memory
  // For production, use PostgreSQL's JSONB search operators
  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(100); // Fetch more to filter

  if (error) {
    console.error('Search conversations error:', error);
    return [];
  }

  // Filter by message content
  const queryLower = searchPattern.replace(/%/g, '').toLowerCase();
  const filtered = (data || []).filter((conv: AgentConversation) => {
    return conv.messages.some((msg) =>
      msg.content.toLowerCase().includes(queryLower)
    );
  });

  return filtered.slice(0, limit) as AgentConversation[];
}

/**
 * Search documents by title or content
 */
async function searchDocuments(
  agentId: string,
  searchPattern: string,
  limit: number,
  businessId?: string
): Promise<Document[]> {
  const supabase = getSupabase();

  let query = supabase
    .from('documents')
    .select('*')
    .eq('agent_id', agentId);

  if (businessId) {
    query = query.eq('business_id', businessId);
  }

  const { data, error } = await query
    .or(`title.ilike.${searchPattern},content.ilike.${searchPattern}`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Search documents error:', error);
    return [];
  }

  return (data || []) as Document[];
}

/**
 * Get search suggestions based on recent queries
 * This is a placeholder for future implementation with query tracking
 */
export async function getSearchSuggestions(agentId: string): Promise<string[]> {
  // TODO: Track search queries and return popular/recent ones
  return [
    'business ideas',
    'contact emails',
    'recent conversations',
    'pending tasks',
  ];
}
