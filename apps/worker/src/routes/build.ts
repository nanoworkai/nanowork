import { Hono } from 'hono'
import Anthropic from '@anthropic-ai/sdk'
import type { Env } from '../index'

const DEPARTMENTS = ['Legal', 'Brand', 'Web', 'Marketing', 'Sales', 'Finance', 'Ops'] as const
type Dept = typeof DEPARTMENTS[number]

const DEPT_ICONS: Record<Dept, string> = {
  Legal: '⚖️', Brand: '🎨', Web: '🌐',
  Marketing: '📣', Sales: '💼', Finance: '💳', Ops: '⚙️',
}

interface DeptInfo { tasks: string[]; first_output: string }
interface BuildData { company_name: string; tagline: string; departments: Record<Dept, DeptInfo> }

const SYSTEM = 'You are Nanowork\'s genesis engine. Given one business prompt, produce a complete first-week buildout across 7 parallel departments. Be highly specific to the exact business idea — no generic filler. Use real, brand-quality naming. Return ONLY minified JSON with no markdown fences or commentary.'

function userPrompt(prompt: string): string {
  return `Prompt: "${prompt.replace(/"/g, "'").slice(0, 600)}"\n\nReturn exactly this JSON structure (make every field specific to this business):\n{"company_name":"<crisp brand name>","tagline":"<one sharp sentence why it wins>","departments":{"Legal":{"tasks":["<specific>","<specific>","<specific>"],"first_output":"<one sentence concrete deliverable>"},"Brand":{"tasks":["<specific>","<specific>","<specific>"],"first_output":"<one sentence concrete deliverable>"},"Web":{"tasks":["<specific>","<specific>","<specific>"],"first_output":"<one sentence concrete deliverable>"},"Marketing":{"tasks":["<specific>","<specific>","<specific>"],"first_output":"<one sentence concrete deliverable>"},"Sales":{"tasks":["<specific>","<specific>","<specific>"],"first_output":"<one sentence concrete deliverable>"},"Finance":{"tasks":["<specific>","<specific>","<specific>"],"first_output":"<one sentence concrete deliverable>"},"Ops":{"tasks":["<specific>","<specific>","<specific>"],"first_output":"<one sentence concrete deliverable>"}}}`
}

function fallback(prompt: string): BuildData {
  const p = prompt.toLowerCase()
  let name: string, tagline: string
  if (/dog|pet|animal|paw/.test(p)) { name = 'PawCo.'; tagline = 'Premium gear for the pets that run your life.' }
  else if (/food|meal|restaurant|coffee|eat|prep/.test(p)) { name = 'PlateOne.'; tagline = 'Thoughtful food, built to travel.' }
  else if (/saas|software|app|tool|platform|api/.test(p)) { name = 'Buildware.'; tagline = 'The tool that replaces the tool pile.' }
  else if (/coach|consult|training|course/.test(p)) { name = 'Meridian.'; tagline = 'Knowledge structured into revenue.' }
  else if (/fashion|clothing|apparel|wear|style/.test(p)) { name = 'Form Co.'; tagline = 'Clothes with a point of view.' }
  else if (/home|furniture|interior|decor|living/.test(p)) { name = 'Ambient.'; tagline = 'Objects that make rooms feel right.' }
  else { name = 'Origin Co.'; tagline = 'Built to earn — from day one.' }
  return {
    company_name: name, tagline,
    departments: {
      Legal: { tasks: ['LLC formation filed with state', 'EIN application submitted to IRS', 'Operating agreement drafted'], first_output: 'Delaware LLC formation package complete — registered agent assigned.' },
      Brand: { tasks: ['Company name and domain secured', 'Wordmark and logo system designed', 'Brand voice guide written'], first_output: 'Name, wordmark, and color system locked — exported in SVG, PNG, and dark/light variants.' },
      Web: { tasks: ['Domain registered and DNS configured', 'Landing page with product copy deployed', 'Stripe checkout wired'], first_output: 'Live site with product page and working checkout — indexed and load-tested.' },
      Marketing: { tasks: ['Launch copy and positioning written', 'Ad creative produced in 3 variants', '5-email welcome sequence built'], first_output: '3 ad variants live + 5-email welcome sequence active — first send scheduled.' },
      Sales: { tasks: ['CRM configured with pipeline stages', 'Outreach sequence written and queued', 'Seed lead list of 50 contacts built'], first_output: '50 qualified leads imported — first outreach sequence sent, tracking open rates.' },
      Finance: { tasks: ['Chart of accounts configured', 'Stripe business account opened', 'P&L template and cash-flow model built'], first_output: 'Books open with chart of accounts and revenue tracking — Stripe dashboard live.' },
      Ops: { tasks: ['Tech stack and vendor roster defined', 'Vendor contracts reviewed and signed', 'Delivery runbook written'], first_output: 'Delivery runbook v1 published — all vendor SLAs signed and filed.' },
    },
  }
}

async function callClaude(prompt: string, apiKey: string): Promise<BuildData | null> {
  if (!apiKey.trim()) return null
  try {
    const client = new Anthropic({ apiKey })
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1400,
      system: SYSTEM,
      messages: [{ role: 'user', content: userPrompt(prompt) }],
    })
    let raw = ((msg.content[0] as { text?: string }).text ?? '').trim()
    if (raw.startsWith('```')) raw = raw.split('\n').slice(1).join('\n').split('```')[0].trim()
    return JSON.parse(raw) as BuildData
  } catch {
    return null
  }
}

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

const app = new Hono<{ Bindings: Env }>()

app.post('/run', async (c) => {
  const { prompt } = await c.req.json<{ prompt: string }>()
  const data = await callClaude(prompt, c.env.ANTHROPIC_API_KEY ?? '')
  if (!data) return c.json({ result: fallback(prompt), source: 'stub' })
  return c.json({ result: data, source: 'live' })
})

app.get('/stream', async (c) => {
  const prompt = c.req.query('prompt') ?? ''
  const apiKey = c.env.ANTHROPIC_API_KEY ?? ''

  const stream = new ReadableStream({
    async start(ctrl) {
      const enc = new TextEncoder()
      const sse = (event: string, data: unknown) =>
        ctrl.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))

      try {
        const data = (await callClaude(prompt, apiKey)) ?? fallback(prompt)
        const depts = data.departments

        sse('meta', { company_name: data.company_name, tagline: data.tagline })

        for (const name of DEPARTMENTS) {
          sse('dept_start', { dept: name, icon: DEPT_ICONS[name], task_count: depts[name].tasks.length })
        }

        // Interleave tasks across all departments
        const queues = DEPARTMENTS.map(name => ({ name, tasks: depts[name].tasks, i: 0 }))
        let anyLeft = true
        while (anyLeft) {
          anyLeft = false
          for (const q of queues) {
            if (q.i < q.tasks.length) {
              anyLeft = true
              await sleep(250 + q.i * 80)
              sse('task', { dept: q.name, task: q.tasks[q.i++] })
            }
          }
        }

        for (const name of DEPARTMENTS) {
          await sleep(150)
          sse('dept_done', { dept: name, output: depts[name].first_output })
        }

        sse('done', { company_name: data.company_name })
      } finally {
        ctrl.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
})

export default app
