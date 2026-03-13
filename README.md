# Nanowork MVP

AI platform that turns a prompt into a fullstack business. Built with **React** (frontend) and **Python** (backend + AI).

## Monorepo Structure

```
nanowork-mvp/
├── frontend/       # React + Vite + TypeScript
├── backend/        # FastAPI
├── generator/      # Python package: prompt → spec/code
└── main.py         # Root script (legacy)
```

## Quick Start

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at [http://localhost:5173](http://localhost:5173).

### 2. Backend

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

Runs at [http://localhost:8000](http://localhost:8000). API docs: [http://localhost:8000/docs](http://localhost:8000/docs).

### 3. Generator (library)

```bash
cd generator
uv sync
```

Used by backend for prompt → spec generation. Add LLM deps: `uv add openai` or `uv add anthropic`.

## Development

- **Frontend**: Vite proxies `/api` and `/health` to the backend. Run both services for full-stack dev.
- **Backend**: CORS allows `http://localhost:5173`.
- **Generator**: Placeholder `parse_prompt()` in `nanowork_generator/core.py` — wire in LLM next.

## Tech Stack

| Layer      | Tech                    |
|-----------|-------------------------|
| Frontend  | React 19, Vite, TypeScript |
| Backend   | FastAPI, Uvicorn        |
| Generator | Python (LLM-ready)      |
