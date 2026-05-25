import { Hono } from 'hono'
import Anthropic from '@anthropic-ai/sdk'
import type { Env } from '../index'
import { requireAuth } from '../middleware/auth'

const app = new Hono<{ Bindings: Env }>()

// AI prompts for pitch deck generation
const SYSTEM_PROMPT = `You are an expert pitch deck consultant who has advised hundreds of successful startups. You craft compelling, investor-ready narratives that balance vision with data, storytelling with substance.

Your expertise includes:
- Understanding what resonates with VCs, angels, and strategic investors
- Balancing ambition with credibility
- Translating technical concepts into business value
- Highlighting traction and momentum
- Crafting memorable problem/solution narratives
- Sizing markets realistically but compellingly

You write in a confident, direct style. No fluff, no generic statements. Every sentence earns its place on the slide.`

interface GenerateDeckInput {
  businessDescription: string
  companyName?: string
  tagline?: string
  targetRaise?: string
  spreadsheetData?: Record<string, any>
}

interface SlideContent {
  type: 'cover' | 'problem' | 'solution' | 'market' | 'business-model' | 'traction' | 'competition' | 'team' | 'financials' | 'ask' | 'contact'
  title: string
  content: string
  bullets?: string[]
  data?: Record<string, any>
  notes?: string
}

interface PitchDeck {
  id: string
  companyName: string
  tagline: string
  slides: SlideContent[]
  template: string
  createdAt: string
  updatedAt: string
}

// Generate initial deck from business description
app.post('/generate', requireAuth, async (c) => {
  const { businessDescription, companyName, tagline, targetRaise, spreadsheetData } = await c.req.json<GenerateDeckInput>()

  if (!businessDescription?.trim()) {
    return c.json({ error: 'Business description is required' }, 400)
  }

  const apiKey = c.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) {
    return c.json({ error: 'AI service not configured' }, 500)
  }

  try {
    const client = new Anthropic({ apiKey })

    // Generate all slide content in one comprehensive prompt
    const userPrompt = `Generate a complete investor pitch deck for the following business:

${businessDescription}

${companyName ? `Company Name: ${companyName}` : ''}
${tagline ? `Tagline: ${tagline}` : ''}
${targetRaise ? `Target Raise: ${targetRaise}` : ''}
${spreadsheetData ? `\n\nFinancial Data:\n${JSON.stringify(spreadsheetData, null, 2)}` : ''}

Create content for these 10 slides. Return a JSON object with this exact structure:

{
  "companyName": "extracted or suggested company name",
  "tagline": "compelling one-line tagline (10-12 words max)",
  "slides": [
    {
      "type": "cover",
      "title": "Company Name",
      "content": "Tagline goes here"
    },
    {
      "type": "problem",
      "title": "The Problem",
      "content": "2-3 sentence problem statement that investors will immediately relate to",
      "bullets": ["Key pain point 1", "Key pain point 2", "Key pain point 3"]
    },
    {
      "type": "solution",
      "title": "Our Solution",
      "content": "2-3 sentences on what you've built and why it's different",
      "bullets": ["Key feature/benefit 1", "Key feature/benefit 2", "Key feature/benefit 3"]
    },
    {
      "type": "market",
      "title": "Market Opportunity",
      "content": "Brief market overview with credible sizing",
      "bullets": ["TAM: Total addressable market with $ and source", "SAM: Serviceable addressable market", "SOM: Serviceable obtainable market (3-year target)"],
      "data": {"tam": "estimate", "sam": "estimate", "som": "estimate"}
    },
    {
      "type": "business-model",
      "title": "Business Model",
      "content": "How the business makes money",
      "bullets": ["Revenue stream 1", "Revenue stream 2", "Unit economics summary"]
    },
    {
      "type": "traction",
      "title": "Traction",
      "content": "What you've accomplished so far",
      "bullets": ["Key metric 1 (with number)", "Key metric 2 (with number)", "Key milestone achieved"],
      "data": {"metric1": "value", "metric2": "value", "metric3": "value"}
    },
    {
      "type": "competition",
      "title": "Competitive Landscape",
      "content": "Who else is in this space and why you win",
      "bullets": ["Competitor 1 / your advantage", "Competitor 2 / your advantage", "Your unfair advantage"]
    },
    {
      "type": "team",
      "title": "Team",
      "content": "Why this team can execute",
      "bullets": ["Founder 1: relevant background", "Founder 2: relevant background", "Key advisors/investors if any"]
    },
    {
      "type": "financials",
      "title": "Financial Projections",
      "content": "3-year outlook",
      "bullets": ["Year 1: Revenue target", "Year 2: Revenue target", "Year 3: Revenue target"],
      "data": {"year1": "revenue", "year2": "revenue", "year3": "revenue"}
    },
    {
      "type": "ask",
      "title": "The Ask",
      "content": "What you're raising and why",
      "bullets": ["Amount raising", "Use of funds category 1 (% and $)", "Use of funds category 2 (% and $)", "Key milestones this funding unlocks"]
    }
  ]
}

Guidelines:
- Be specific, concrete, and data-driven where possible
- Use actual numbers for traction/financials if available in the input
- Make market sizing credible (cite "industry reports" or "bottom-up analysis")
- Problem statement should be visceral and relatable
- Solution should emphasize unique insight or approach
- Every bullet point should add new information
- Avoid buzzwords and generic statements
- If company name not provided, suggest one based on the business
- Make the tagline memorable and specific

Return ONLY the JSON object, no other text.`

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const responseText = (msg.content[0] as { text?: string }).text?.trim() ?? ''

    // Parse JSON from response
    let deckData: any
    try {
      // Try to extract JSON if wrapped in markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || responseText.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText
      deckData = JSON.parse(jsonStr)
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText)
      return c.json({ error: 'Failed to generate deck content', details: responseText }, 500)
    }

    // Create deck record
    const deck: PitchDeck = {
      id: crypto.randomUUID(),
      companyName: deckData.companyName || companyName || 'Your Company',
      tagline: deckData.tagline || tagline || 'Building the future',
      slides: deckData.slides || [],
      template: 'yc', // Default template
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return c.json({ deck })
  } catch (error) {
    console.error('Deck generation error:', error)
    return c.json({
      error: 'Failed to generate pitch deck',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Improve/rewrite a specific slide
app.post('/improve-slide', requireAuth, async (c) => {
  const { slideContent, instruction, deckContext } = await c.req.json<{
    slideContent: SlideContent
    instruction: string
    deckContext?: Partial<PitchDeck>
  }>()

  if (!slideContent || !instruction?.trim()) {
    return c.json({ error: 'Slide content and instruction are required' }, 400)
  }

  const apiKey = c.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) {
    return c.json({ error: 'AI service not configured' }, 500)
  }

  try {
    const client = new Anthropic({ apiKey })

    const contextStr = deckContext ? `\n\nDeck context:\nCompany: ${deckContext.companyName}\nTagline: ${deckContext.tagline}` : ''

    const userPrompt = `Improve this pitch deck slide based on the instruction.

Current slide:
Type: ${slideContent.type}
Title: ${slideContent.title}
Content: ${slideContent.content}
${slideContent.bullets ? `Bullets:\n${slideContent.bullets.map(b => `- ${b}`).join('\n')}` : ''}
${slideContent.data ? `Data: ${JSON.stringify(slideContent.data)}` : ''}
${contextStr}

Instruction: ${instruction}

Return an improved version of the slide in the same JSON structure:
{
  "type": "${slideContent.type}",
  "title": "improved title",
  "content": "improved content",
  "bullets": ["improved bullets if applicable"],
  "data": {any data fields}
}

Make it investor-ready: specific, compelling, and credible. Return ONLY the JSON object.`

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const responseText = (msg.content[0] as { text?: string }).text?.trim() ?? ''

    let improvedSlide: SlideContent
    try {
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || responseText.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText
      improvedSlide = JSON.parse(jsonStr)
    } catch (parseError) {
      return c.json({ error: 'Failed to parse improved slide', details: responseText }, 500)
    }

    return c.json({ slide: improvedSlide })
  } catch (error) {
    console.error('Slide improvement error:', error)
    return c.json({
      error: 'Failed to improve slide',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Generate market size estimates
app.post('/estimate-market', requireAuth, async (c) => {
  const { businessDescription, industry } = await c.req.json<{
    businessDescription: string
    industry?: string
  }>()

  if (!businessDescription?.trim()) {
    return c.json({ error: 'Business description is required' }, 400)
  }

  const apiKey = c.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) {
    return c.json({ error: 'AI service not configured' }, 500)
  }

  try {
    const client = new Anthropic({ apiKey })

    const userPrompt = `Generate realistic market size estimates for this business:

${businessDescription}
${industry ? `\nIndustry: ${industry}` : ''}

Provide TAM, SAM, and SOM estimates with methodology. Return JSON:
{
  "tam": {"value": "$XX.XB", "description": "Total addressable market", "methodology": "How calculated"},
  "sam": {"value": "$X.XB", "description": "Serviceable addressable market", "methodology": "How calculated"},
  "som": {"value": "$XXM", "description": "Serviceable obtainable market (3 years)", "methodology": "How calculated"},
  "sources": ["Key assumptions or data sources cited"]
}

Be credible and defensible. Show your work. Return ONLY the JSON object.`

    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const responseText = (msg.content[0] as { text?: string }).text?.trim() ?? ''

    let marketData: any
    try {
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || responseText.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText
      marketData = JSON.parse(jsonStr)
    } catch (parseError) {
      return c.json({ error: 'Failed to parse market estimates', details: responseText }, 500)
    }

    return c.json({ market: marketData })
  } catch (error) {
    console.error('Market estimation error:', error)
    return c.json({
      error: 'Failed to estimate market size',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export default app
