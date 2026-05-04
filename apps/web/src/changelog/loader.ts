/**
 * Loads changelog entries from every `.md` file in `./entries/*.md`.
 *
 * File format (frontmatter + a list of tagged items):
 *
 *   ---
 *   version: 0.12
 *   date: 2026-04-18
 *   title: Gallery goes live
 *   summary: Optional one-liner under the title.
 *   ---
 *
 *   - new: Launched /gallery with eight listings ready to transfer.
 *   - improved: Escrow and domain transfer now happen in one thread.
 *   - fixed: Delivery receipts match iMessage cadence on iOS 18.
 *   - shipped: First 24 founders onboarded via text.
 *
 * Only `date` and `title` are required. `version` and `summary` are optional.
 * Items without a tag prefix default to "new".
 *
 * Entries are sorted newest-first by `date`.
 */

export type EntryTag = "new" | "improved" | "fixed" | "shipped";

export type ChangelogEntry = {
  version?: string;
  date: string;
  dateISO: string;
  title: string;
  summary?: string;
  items: { tag: EntryTag; text: string }[];
};

const KNOWN_TAGS: EntryTag[] = ["new", "improved", "fixed", "shipped"];

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return DATE_FORMATTER.format(d);
}

function parseFrontmatter(raw: string): {
  meta: Record<string, string>;
  body: string;
} {
  const match = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };

  const meta: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    meta[m[1].toLowerCase()] = value;
  }
  return { meta, body: match[2] };
}

function parseItems(body: string): ChangelogEntry["items"] {
  const items: ChangelogEntry["items"] = [];
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const bullet = line.match(/^[-*+]\s+(.*)$/);
    if (!bullet) continue;

    const content = bullet[1];
    const tagged = content.match(/^([A-Za-z]+)\s*:\s*(.*)$/);
    if (tagged) {
      const tag = tagged[1].toLowerCase() as EntryTag;
      if (KNOWN_TAGS.includes(tag)) {
        items.push({ tag, text: tagged[2].trim() });
        continue;
      }
    }
    items.push({ tag: "new", text: content.trim() });
  }
  return items;
}

function parseEntry(raw: string, path: string): ChangelogEntry | null {
  const { meta, body } = parseFrontmatter(raw);

  if (!meta.date || !meta.title) {
    if (import.meta.env.DEV) {
      console.warn(
        `[changelog] Skipping ${path}: missing required "date" or "title" frontmatter.`,
      );
    }
    return null;
  }

  return {
    version: meta.version || undefined,
    date: formatDate(meta.date),
    dateISO: meta.date,
    title: meta.title,
    summary: meta.summary || undefined,
    items: parseItems(body),
  };
}

const MODULES = import.meta.glob("./entries/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const CHANGELOG_ENTRIES: ChangelogEntry[] = Object.entries(MODULES)
  .map(([path, raw]) => parseEntry(raw, path))
  .filter((entry): entry is ChangelogEntry => entry !== null)
  .sort((a, b) => (a.dateISO < b.dateISO ? 1 : a.dateISO > b.dateISO ? -1 : 0));
