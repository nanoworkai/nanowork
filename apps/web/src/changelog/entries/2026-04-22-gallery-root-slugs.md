---
version: 0.14
date: 2026-04-22
title: Gallery demos move to the root domain, and some of them actually think now
summary: Every business in the gallery now lives at nanowork.ai/<slug> — one short URL, no subdomain, no "demo" folder in the path. A few of them got smarter too.
---

- new: Gallery listings open at nanowork.ai/<slug> directly. The /demo/:slug route still redirects, but the new, tighter URL is the canonical one.
- new: Added /api/ai — a small serverless endpoint that gallery demos can call for real generations. Powered by an OpenAI key configured on the server; falls back to deterministic stubs when the key isn't set.
- new: Pressroom now drafts real pitches. Select journalists, hit "Draft pitch with AI", and the pipeline fills with actual copy you can expand and review.
- new: Lamina has a "Suggest with AI" button that proposes a next habit based on what you already track.
- improved: Browser-chrome URL previews on each gallery card now show the canonical nanowork.ai/<slug> path, not a subdomain.
- fixed: Purged a couple of fake external domains inside the Stackview and Parcel demos — everything now points to the nanowork.ai handoff URL until the buyer transfers the domain.
