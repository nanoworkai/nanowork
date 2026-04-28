from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import cors_origin_list, get_settings
from app.deps import supabase_or_none
from app.routers import ai_route, phone


@asynccontextmanager
async def lifespan(app: FastAPI):
    _ = supabase_or_none()
    yield


app = FastAPI(title="Nanowork API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origin_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_route.router, prefix="/api")
app.include_router(phone.router, prefix="/api")


@app.get("/health")
def health() -> dict:
    s = get_settings()
    sb = supabase_or_none()
    return {
        "status": "ok",
        "environment": s.environment,
        "supabase_configured": sb is not None,
        "anthropic_configured": bool((s.anthropic_api_key or "").strip()),
    }
