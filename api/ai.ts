/**
 * Serverless AI helper used by the gallery demos.
 *
 * Accepts a { task, input } body and fans it out to a small set of
 * prompt templates so each demo gets something focused. The endpoint
 * deliberately hides which upstream model we use — if no API key is
 * configured, the handler falls back to a local deterministic stub
 * so the demos still feel alive in local dev.
 */

export const config = {
  runtime: "edge",
};

type Task =
  | "pressroom.pitch"
  | "lamina.suggest"
  | "fieldnote.summary"
  | "sharpener.sharpen";

type Payload = {
  task: Task;
  input: Record<string, unknown>;
};

const PROMPTS: Record<Task, (input: any) => { system: string; user: string }> = {
  "pressroom.pitch": ({ journalist, outlet, beat, company, wedge }) => ({
    system:
      "You are an expert PR assistant writing short, specific pitches for busy journalists. Never exceed 120 words. Never use em-dashes. Be concrete, name the wedge, and end with one clear ask.",
    user: `Draft a pitch email to ${journalist} at ${outlet}. Their beat is ${beat}. The company is ${company}. The wedge to lead with: ${wedge}. Output the email body only — no subject line, no signature.`,
  }),
  "lamina.suggest": ({ existing }) => ({
    system:
      "You are a calm, minimalist habit coach. Suggest ONE new habit the user is missing, in 4-6 words. No streaks language. Respond with just the habit text, nothing else.",
    user: `The user already tracks: ${(existing as string[]).join(", ") || "(nothing)"}. Suggest one more habit that complements these.`,
  }),
  "fieldnote.summary": ({ title, dek }) => ({
    system:
      "You are a terse editorial assistant. Summarize a paid newsletter issue in two tight sentences for the archive page. No hype.",
    user: `Issue title: ${title}. Dek: ${dek}. Write the summary.`,
  }),
  "sharpener.sharpen": ({ idea }) => ({
    system:
      "You are Sharpener, a Nanowork agent. Given a rough founder idea, return a single sentence pitch, a one-phrase ICP, and a one-phrase wedge. Separate with ' · '.",
    user: `Idea: ${idea}`,
  }),
};

function fallback(task: Task, input: any): string {
  switch (task) {
    case "pressroom.pitch":
      return `Hi ${input.journalist?.split(" ")[0] ?? "there"},\n\nQuick one — ${input.company ?? "we"} just crossed a milestone that fits your ${input.beat ?? "beat"} coverage at ${input.outlet ?? "your outlet"}. The wedge: ${input.wedge ?? "a specific angle you'd care about"}.\n\nHappy to share numbers, a founder call, or an exclusive. 15 min this week?`;
    case "lamina.suggest":
      return "10 minutes of quiet reading";
    case "fieldnote.summary":
      return `${input.title}. ${input.dek}`;
    case "sharpener.sharpen":
      return `${input.idea} · small teams doing real work · shipped over text, not decks`;
    default:
      return "";
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const { task, input } = body ?? ({} as Payload);
  if (!task || !(task in PROMPTS)) {
    return new Response(JSON.stringify({ error: "unknown_task" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const apiKey =
    (globalThis as any).process?.env?.OPENAI_API_KEY ||
    (globalThis as any).OPENAI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        text: fallback(task, input),
        source: "stub",
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      },
    );
  }

  const { system, user } = PROMPTS[task](input || {});

  try {
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({
          text: fallback(task, input),
          source: "stub_after_error",
          status: upstream.status,
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      );
    }

    const data = (await upstream.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim() || "";

    return new Response(
      JSON.stringify({
        text: text || fallback(task, input),
        source: text ? "live" : "stub_empty",
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      },
    );
  } catch {
    return new Response(
      JSON.stringify({
        text: fallback(task, input),
        source: "stub_after_throw",
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      },
    );
  }
}
