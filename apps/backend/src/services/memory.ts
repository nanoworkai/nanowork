import { getEmbedding } from './anthropic';
import { getSupabase } from './supabase';
import { AgentMemory, NewAgentMemory } from '../types';

/**
 * Store a memory with embedding
 */
export async function storeMemory(data: {
  agentId: string;
  businessId?: string;
  content: string;
  memoryType: string;
  source: string;
  metadata?: Record<string, any>;
}): Promise<AgentMemory> {
  const embedding = await getEmbedding(data.content);

  const memoryData: NewAgentMemory = {
    agent_id: data.agentId,
    business_id: data.businessId || null,
    content: data.content,
    memory_type: data.memoryType,
    source: data.source,
    embedding: embedding.length > 0 ? embedding : null,
    metadata: data.metadata || {},
  };

  const { data: memory, error } = await getSupabase()
    .from('agent_memories')
    .insert(memoryData)
    .select()
    .single();

  if (error || !memory) {
    throw new Error(`Failed to store memory: ${error?.message || 'unknown error'}`);
  }

  return memory as AgentMemory;
}

/**
 * Search memories using vector similarity
 */
export async function searchMemories(params: {
  agentId: string;
  query: string;
  matchCount?: number;
  threshold?: number;
}): Promise<AgentMemory[]> {
  const { agentId, query, matchCount = 10, threshold = 0.7 } = params;

  // Get query embedding
  const queryEmbedding = await getEmbedding(query);

  if (queryEmbedding.length === 0) {
    console.warn('Embedding generation is stubbed - returning empty results');
    return [];
  }

  // Call the match_agent_memories RPC function
  // TODO: This assumes a Supabase function exists - may need to be created
  const { data, error } = await getSupabase().rpc('match_agent_memories', {
    query_embedding: queryEmbedding,
    agent_id: agentId,
    match_count: matchCount,
    match_threshold: threshold,
  });

  if (error) {
    console.error('Failed to search memories:', error);
    return [];
  }

  return (data || []) as AgentMemory[];
}
