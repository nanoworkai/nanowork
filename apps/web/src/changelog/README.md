# Changelog entries

Every `.md` file in this folder becomes an entry on `/changelog`. Drop in a new
file, commit, deploy — that's the whole flow.

## File naming

Name files `YYYY-MM-DD-short-slug.md`. The slug is only for human sorting in the
filesystem; the site sorts entries by the `date:` field in the frontmatter.

## Format

```md
---
version: 0.12              # optional, shown as a small "v0.12" pill
date: 2026-04-18           # required, ISO yyyy-mm-dd
title: Gallery goes live   # required, entry headline
summary: Optional one-liner shown under the title.
---

- new: Launched /gallery with eight listings ready to transfer.
- improved: Escrow and domain transfer now happen in one thread.
- fixed: Delivery receipts match iMessage cadence on iOS 18.
- shipped: First 24 founders onboarded via text.
```

### Frontmatter

| Field     | Required | Notes                                           |
| --------- | -------- | ----------------------------------------------- |
| `date`    | yes      | ISO date (`YYYY-MM-DD`). Used for sorting.      |
| `title`   | yes      | Shown as the entry's `<h2>`.                    |
| `version` | no       | Shown as a small pill next to the date.         |
| `summary` | no       | Optional one-line lede under the title.         |

### Items

One bullet per change. Prefix with a tag and a colon to color the pill:

- `new:` — gold
- `improved:` — blue
- `fixed:` — purple
- `shipped:` — green

Unprefixed bullets default to `new`.

## Rendering

Entries are imported at build time via `import.meta.glob` in
`src/changelog/loader.ts` and rendered by `src/pages/Changelog.tsx`. You never
need to edit those two files just to publish a new entry — only this folder.
