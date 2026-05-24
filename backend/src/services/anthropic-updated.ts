import Anthropic from '@anthropic-ai/sdk';
import { getEmbedding as getEmbeddingFromProvider } from './embeddings';

let anthropic: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (anthropic) return anthropic;

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY must be configured');
  }

  anthropic = new Anthropic({ apiKey });
  return anthropic;
}

/**
 * Chat with Claude using messages
 */
export async function chat(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt?: string,
  tools?: any[]
): Promise<string> {
  const client = getAnthropic();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages,
    tools,
  });

  const textContent = response.content.find((c) => c.type === 'text');
  if (textContent && 'text' in textContent) {
    return textContent.text;
  }

  return '';
}

/**
 * Generate a full app with multiple files
 */
export async function generateApp(
  prompt: string,
  techStack: string[]
): Promise<{ files: Array<{ path: string; content: string; language: string }> }> {
  const systemPrompt = `You are a code generation assistant. Generate a complete application based on the user's prompt.

Tech stack: ${techStack.join(', ')}

CRITICAL: You must respond with ONLY a valid JSON object in this exact format:
{
  "files": [
    {
      "path": "src/index.ts",
      "content": "// file content here",
      "language": "typescript"
    }
  ]
}

Do not include any markdown, explanations, or text outside the JSON object.
Generate all necessary files for a working application.`;

  try {
    const response = await chat([{ role: 'user', content: prompt }], systemPrompt);

    // Parse the JSON response
    const parsed = JSON.parse(response.trim());

    if (!parsed.files || !Array.isArray(parsed.files)) {
      throw new Error('Invalid response format: missing files array');
    }

    return parsed;
  } catch (error) {
    console.error('Failed to generate app:', error);
    throw new Error(`App generation failed: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
}

/**
 * Generate a landing page with HTML, CSS, and JS
 */
export async function generateLandingPage(
  businessName: string,
  tagline: string,
  description: string,
  ctaText: string
): Promise<{ html: string; css: string; js: string }> {
  const systemPrompt = `You are a landing page designer. Create a beautiful, modern landing page.

CRITICAL: You must respond with ONLY a valid JSON object in this exact format:
{
  "html": "<!DOCTYPE html>...",
  "css": "body { ... }",
  "js": "// JavaScript code"
}

Do not include any markdown, explanations, or text outside the JSON object.
Create a professional, conversion-focused landing page with modern design.`;

  const prompt = `Create a landing page for:
Business Name: ${businessName}
Tagline: ${tagline}
Description: ${description}
CTA Text: ${ctaText}`;

  try {
    const response = await chat([{ role: 'user', content: prompt }], systemPrompt);

    // Parse the JSON response
    const parsed = JSON.parse(response.trim());

    if (!parsed.html || !parsed.css || !parsed.js) {
      throw new Error('Invalid response format: missing html, css, or js');
    }

    return parsed;
  } catch (error) {
    console.error('Failed to generate landing page:', error);
    throw new Error(
      `Landing page generation failed: ${error instanceof Error ? error.message : 'unknown error'}`
    );
  }
}

/**
 * Get text embedding using the configured embedding provider
 * Now delegates to the embeddings service instead of being a stub
 */
export async function getEmbedding(text: string): Promise<number[]> {
  return getEmbeddingFromProvider(text);
}
