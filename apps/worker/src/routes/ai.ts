import { Hono } from 'hono'
import Anthropic from '@anthropic-ai/sdk'
import type { Env } from '../index'

type Task = 'pressroom.pitch' | 'lamina.suggest' | 'fieldnote.summary' | 'sharpener.sharpen'

interface AiPayload {
  task: Task
  input?: Record<string, unknown>
}

function promptsFor(task: Task, inp: Record<string, unknown>): [string, string] {
  if (task === 'pressroom.pitch') {
    return [
      'You are an expert PR assistant writing short, specific pitches for busy journalists. Never exceed 120 words. Never use em-dashes. Be concrete, name the wedge, and end with one clear ask.',
      `Draft a pitch email to ${inp.journalist} at ${inp.outlet}. Their beat is ${inp.beat}. The company is ${inp.company}. The wedge to lead with: ${inp.wedge}. Output the email body only — no subject line, no signature.`,
    ]
  }
  if (task === 'lamina.suggest') {
    const ex = Array.isArray(inp.existing) ? inp.existing.join(', ') || '(nothing)' : String(inp.existing ?? '(nothing)')
    return [
      'You are a calm, minimalist habit coach. Suggest ONE new habit the user is missing, in 4-6 words. No streaks language. Respond with just the habit text, nothing else.',
      `The user already tracks: ${ex}. Suggest one more habit that complements these.`,
    ]
  }
  if (task === 'fieldnote.summary') {
    return [
      'You are a terse editorial assistant. Summarize a paid newsletter issue in two tight sentences for the archive page. No hype.',
      `Issue title: ${inp.title}. Dek: ${inp.dek}. Write the summary.`,
    ]
  }
  return [
    "You are Sharpener, a Nanowork agent. Given a rough founder idea, return a single sentence pitch, a one-phrase ICP, and a one-phrase wedge. Separate with ' · '.",
    `Idea: ${inp.idea}`,
  ]
}

function fallback(task: Task, inp: Record<string, unknown>): string {
  if (task === 'pressroom.pitch') {
    const j = String(inp.journalist ?? 'there').split(' ')[0]
    return `Hi ${j},\n\nQuick one — ${inp.company ?? 'we'} just crossed a milestone that fits your ${inp.beat ?? 'beat'} coverage at ${inp.outlet ?? 'your outlet'}. The wedge: ${inp.wedge ?? 'a specific angle you\'d care about'}.\n\nHappy to share numbers, a founder call, or an exclusive. 15 min this week?`
  }
  if (task === 'lamina.suggest') return '10 minutes of quiet reading'
  if (task === 'fieldnote.summary') return `${inp.title}. ${inp.dek}`
  return `${inp.idea} · small teams doing real work · shipped over text, not decks`
}

const app = new Hono<{ Bindings: Env }>()

app.post('/', async (c) => {
  const body = await c.req.json<AiPayload>()
  const inp = body.input ?? {}
  const task = body.task
  const apiKey = c.env.ANTHROPIC_API_KEY?.trim()

  if (!apiKey) return c.json({ text: fallback(task, inp), source: 'stub' })

  const [system, user] = promptsFor(task, inp)

  try {
    const client = new Anthropic({ apiKey })
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system,
      messages: [{ role: 'user', content: user }],
    })
    const text = (msg.content[0] as { text?: string }).text?.trim() ?? ''
    return c.json({ text: text || fallback(task, inp), source: text ? 'live' : 'stub_empty' })
  } catch (e: unknown) {
    const status = (e as { status?: number }).status
    return c.json({
      text: fallback(task, inp),
      source: status ? 'stub_after_error' : 'stub_after_throw',
      ...(status != null ? { status } : {}),
    })
  }
})

export default app
