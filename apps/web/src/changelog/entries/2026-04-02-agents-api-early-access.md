---
version: 0.11
date: 2026-04-02
title: Agents API · early access
summary: Every agent that powers Nanowork is now exposed as a single HTTP endpoint.
---

- new: POST /v1/agents/{sharpener,namer,researcher,landing,launch,ads}.
- new: Bearer-key auth and typed JSON contracts per agent.
- improved: Median agent latency down to 412 ms across the six endpoints.
