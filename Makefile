.PHONY: dev dev-frontend dev-backend install-all

install-all:
	cd apps/frontend && npm install
	cd apps/backend && uv sync
	cd apps/generator && uv sync

dev-frontend:
	cd apps/frontend && npm run dev

dev-backend:
	cd apps/backend && uv run uvicorn app.main:app --reload --port 8000
