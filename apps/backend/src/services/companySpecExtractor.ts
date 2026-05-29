/**
 * Company Specification Extractor Service
 * Uses Claude AI to extract structured company specs from user prompts
 */

import Anthropic from '@anthropic-ai/sdk';
import { CompanySpec, CompanySpecExtractionResult } from '../types/companySpec.js';

export class CompanySpecExtractor {
  private anthropic: Anthropic;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey });
  }

  /**
   * Extract structured company specification from a user prompt
   */
  async extractSpec(prompt: string): Promise<CompanySpecExtractionResult> {
    const systemPrompt = `You are a business analyst AI that extracts structured company specifications from user descriptions.

Your task is to analyze the user's company idea and extract:
1. **Vertical**: Is this a SaaS product, a marketplace connecting buyers/sellers, or a content platform?
2. **Business Model**: How will it make money? (subscription, transaction fees, advertising, hybrid)
3. **Product Type**: What kind of product is this? (e.g., "social network", "project management tool", "fitness marketplace")
4. **Target Market**: Who is the target customer? (e.g., "busy professionals", "small businesses", "fitness enthusiasts")
5. **Key Features**: What are the main features mentioned or implied?
6. **Technical Requirements**: What tech capabilities are needed?
   - Authentication (user accounts)
   - Payments (processing money)
   - Real-time (live updates, chat, notifications)
   - AI (machine learning, recommendations, NLP)
7. **Complexity**: Simple (basic CRUD), Moderate (multiple integrations), or Complex (advanced algorithms, scaling challenges)
8. **Confidence**: How confident are you in this analysis? (0.0 to 1.0)

Respond with valid JSON matching this TypeScript interface:
{
  "vertical": "saas" | "marketplace" | "content",
  "businessModel": "subscription" | "transaction" | "advertising" | "hybrid",
  "productType": string,
  "targetMarket": string,
  "keyFeatures": string[],
  "needsAuth": boolean,
  "needsPayments": boolean,
  "needsRealtime": boolean,
  "needsAI": boolean,
  "complexity": "simple" | "moderate" | "complex",
  "confidence": number,
  "reasoning": string
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Analyze this company idea and extract a structured specification:\n\n"${prompt}"`,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Parse the JSON response
      const parsed = JSON.parse(content.text);

      const spec: CompanySpec = {
        vertical: parsed.vertical,
        businessModel: parsed.businessModel,
        productType: parsed.productType,
        targetMarket: parsed.targetMarket,
        keyFeatures: parsed.keyFeatures,
        needsAuth: parsed.needsAuth,
        needsPayments: parsed.needsPayments,
        needsRealtime: parsed.needsRealtime,
        needsAI: parsed.needsAI,
        complexity: parsed.complexity,
        rawPrompt: prompt,
        confidence: parsed.confidence,
      };

      return {
        spec,
        reasoning: parsed.reasoning,
      };
    } catch (error) {
      console.error('Error extracting company spec:', error);

      // Fallback to basic spec if AI extraction fails
      return {
        spec: {
          vertical: 'saas',
          businessModel: 'subscription',
          productType: 'web application',
          targetMarket: 'general users',
          keyFeatures: [],
          needsAuth: true,
          needsPayments: false,
          needsRealtime: false,
          needsAI: false,
          complexity: 'moderate',
          rawPrompt: prompt,
          confidence: 0.3,
        },
        reasoning: 'Failed to extract detailed specification, using defaults',
        warnings: [`Extraction error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      };
    }
  }
}
