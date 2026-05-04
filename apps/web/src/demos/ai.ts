export type AiTask =
  | "pressroom.pitch"
  | "lamina.suggest"
  | "fieldnote.summary"
  | "sharpener.sharpen";

import { apiUrl } from "../lib/apiBase";

export type AiResult = {
  text: string;
  source: "live" | "stub" | "stub_after_error" | "stub_after_throw" | "stub_empty";
};

export async function callAi(
  task: AiTask,
  input: Record<string, unknown>,
): Promise<AiResult> {
  try {
    const res = await fetch(apiUrl("/api/ai"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ task, input }),
    });
    if (!res.ok) {
      return { text: "", source: "stub_after_error" };
    }
    return (await res.json()) as AiResult;
  } catch {
    return { text: "", source: "stub_after_throw" };
  }
}
