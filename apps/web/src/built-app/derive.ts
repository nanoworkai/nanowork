import type { BuiltAppState, WaitlistEntry } from "./types";

const STORAGE_KEY = "nanowork-built-app";

export function slugifyFromPrompt(text: string): string {
  const t = text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
  return t || "my-app";
}

export function nameFromPrompt(prompt: string): string {
  const line = prompt.split("\n").find((l) => l.trim().length) || prompt;
  const cleaned = line.replace(/^[\s#*-]+/, "").trim();
  if (cleaned.length <= 56) return cleaned || "Your application";
  return `${cleaned.slice(0, 53)}…`;
}

export function taglineFromPrompt(prompt: string): string {
  const s = prompt.trim();
  if (s.length <= 140) return s;
  return `${s.slice(0, 137)}…`;
}

function randomId(): string {
  return `wl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createBuiltAppState(prompt: string): BuiltAppState {
  const now = new Date().toISOString();
  return {
    version: 1,
    prompt,
    slug: slugifyFromPrompt(prompt),
    name: nameFromPrompt(prompt),
    tagline: taglineFromPrompt(prompt),
    createdAt: now,
    signups: [
      {
        id: randomId(),
        email: "preview@example.com",
        createdAt: now,
        source: "seed",
      },
    ],
  };
}

export function loadBuiltApp(): BuiltAppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as BuiltAppState;
    if (p?.version !== 1 || !p.slug || !Array.isArray(p.signups)) return null;
    return p;
  } catch {
    return null;
  }
}

export function saveBuiltApp(state: BuiltAppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function addSignup(state: BuiltAppState, email: string, source?: string): BuiltAppState {
  const e = email.trim().toLowerCase();
  if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return state;
  if (state.signups.some((s) => s.email === e)) return state;
  const next: WaitlistEntry = {
    id: randomId(),
    email: e,
    createdAt: new Date().toISOString(),
    source: source || "form",
  };
  return { ...state, signups: [next, ...state.signups] };
}

export function updateBuiltAppName(state: BuiltAppState, name: string, tagline: string): BuiltAppState {
  return {
    ...state,
    name: name.trim() || state.name,
    tagline: tagline.trim() || state.tagline,
  };
}

export function clearBuiltApp(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
