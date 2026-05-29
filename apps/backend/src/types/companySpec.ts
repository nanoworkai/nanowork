/**
 * Company Specification Types
 * Structured data extracted from user prompts for company generation
 */

export type Vertical = 'saas' | 'marketplace' | 'content';
export type BusinessModel = 'subscription' | 'transaction' | 'advertising' | 'hybrid';
export type Complexity = 'simple' | 'moderate' | 'complex';

export interface CompanySpec {
  // Core identity
  vertical: Vertical;
  businessModel: BusinessModel;

  // Scope detection
  productType: string;
  targetMarket: string;
  keyFeatures: string[];

  // Tech requirements (inferred)
  needsAuth: boolean;
  needsPayments: boolean;
  needsRealtime: boolean;
  needsAI: boolean;

  // Complexity score
  complexity: Complexity;

  // Original prompt
  rawPrompt: string;

  // Confidence score (0-1)
  confidence: number;
}

export interface CompanySpecExtractionResult {
  spec: CompanySpec;
  reasoning: string;
  warnings?: string[];
}
