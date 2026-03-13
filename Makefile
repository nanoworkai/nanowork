.PHONY: dev dev-frontend dev-backend install-all

install-all:
	cd frontend && npm install
	cd backend && uv sync
	cd generator && uv sync

dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && uv run uvicorn app.main:app --reload --port 8000
