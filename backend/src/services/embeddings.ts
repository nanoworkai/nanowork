/**
 * Embeddings service for vector search and semantic similarity
 *
 * This service provides text embeddings for RAG (Retrieval Augmented Generation).
 * Currently uses a stub implementation. In production, integrate with:
 * - Voyage AI (recommended for quality)
 * - OpenAI embeddings (text-embedding-3-small/large)
 * - Cohere embeddings
 * - Local models via Ollama
 */

export interface EmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>;
  dimensions: number;
}

/**
 * Stub embedding provider - returns empty array
 * Replace with real implementation before production
 */
class StubEmbeddingProvider implements EmbeddingProvider {
  dimensions = 1536; // OpenAI-compatible dimension

  async generateEmbedding(text: string): Promise<number[]> {
    console.warn('[Embeddings] Using stub provider - embeddings disabled');
    // Return empty array to signal embeddings are not available
    return [];
  }
}

/**
 * OpenAI-compatible embedding provider
 * Can be used with OpenAI or any OpenAI-compatible API (Together, Fireworks, etc.)
 */
class OpenAIEmbeddingProvider implements EmbeddingProvider {
  dimensions = 1536;
  private apiKey: string;
  private model: string;
  private baseURL: string;

  constructor(apiKey: string, model: string = 'text-embedding-3-small', baseURL?: string) {
    this.apiKey = apiKey;
    this.model = model;
    this.baseURL = baseURL || 'https://api.openai.com/v1';
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseURL}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          input: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('[Embeddings] Failed to generate embedding:', error);
      throw error;
    }
  }
}

/**
 * Voyage AI embedding provider (recommended for quality)
 * Requires VOYAGE_API_KEY environment variable
 */
class VoyageEmbeddingProvider implements EmbeddingProvider {
  dimensions = 1024; // voyage-3-lite
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'voyage-3-lite') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch('https://api.voyageai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          input: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Voyage API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('[Embeddings] Failed to generate embedding:', error);
      throw error;
    }
  }
}

/**
 * Get the configured embedding provider based on environment variables
 */
function getEmbeddingProvider(): EmbeddingProvider {
  // Priority 1: Voyage AI (best quality)
  if (process.env.VOYAGE_API_KEY) {
    console.log('[Embeddings] Using Voyage AI provider');
    return new VoyageEmbeddingProvider(process.env.VOYAGE_API_KEY);
  }

  // Priority 2: OpenAI
  if (process.env.OPENAI_API_KEY) {
    console.log('[Embeddings] Using OpenAI provider');
    return new OpenAIEmbeddingProvider(process.env.OPENAI_API_KEY);
  }

  // Priority 3: Generic OpenAI-compatible endpoint
  if (process.env.EMBEDDING_API_KEY && process.env.EMBEDDING_BASE_URL) {
    console.log('[Embeddings] Using custom OpenAI-compatible provider');
    return new OpenAIEmbeddingProvider(
      process.env.EMBEDDING_API_KEY,
      process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
      process.env.EMBEDDING_BASE_URL
    );
  }

  // Fallback: Stub (embeddings disabled)
  console.warn('[Embeddings] No embedding provider configured - using stub');
  return new StubEmbeddingProvider();
}

// Singleton instance
let provider: EmbeddingProvider | null = null;

/**
 * Get text embedding for semantic search
 */
export async function getEmbedding(text: string): Promise<number[]> {
  if (!provider) {
    provider = getEmbeddingProvider();
  }

  // Truncate text to reasonable length (most embedding models have limits)
  const truncated = text.substring(0, 8000);

  return provider.generateEmbedding(truncated);
}

/**
 * Get embeddings for multiple texts in batch
 */
export async function getBatchEmbeddings(texts: string[]): Promise<number[][]> {
  // Simple implementation - call getEmbedding for each text
  // In production, use batch API endpoints when available
  const embeddings = await Promise.all(texts.map((text) => getEmbedding(text)));
  return embeddings;
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have the same dimension');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Check if embeddings are enabled
 */
export function embeddingsEnabled(): boolean {
  return !!(
    process.env.VOYAGE_API_KEY ||
    process.env.OPENAI_API_KEY ||
    (process.env.EMBEDDING_API_KEY && process.env.EMBEDDING_BASE_URL)
  );
}
