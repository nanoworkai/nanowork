/** API origin for server routes. Empty = same origin (dev proxy or reverse proxy in front of both). */
export function apiUrl(path: string): string {
  const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}
