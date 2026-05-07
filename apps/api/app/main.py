import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.config import cors_origin_list, get_settings
from app.deps import supabase_or_none
from app.routers import ai_route, build, phone
from app.routers import analytics, builds, customers, keys, payments, tenant, webhooks


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
    allow_headers=["*", "stripe-signature"],
)

# Legacy / demo routes
app.include_router(ai_route.router, prefix="/api")
app.include_router(build.router, prefix="/api")
app.include_router(phone.router, prefix="/api")

# Authenticated API routes
app.include_router(builds.router, prefix="/api")
app.include_router(keys.router, prefix="/api")
app.include_router(tenant.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(webhooks.router, prefix="/api")


@app.middleware("http")
async def log_request(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration_ms = int((time.time() - start) * 1000)
    db = supabase_or_none()
    if db:
        try:
            db.table("nano_api_requests").insert({
                "method": request.method,
                "endpoint": str(request.url.path),
                "status_code": response.status_code,
                "duration_ms": duration_ms,
                "ip_address": request.client.host if request.client else None,
                "user_agent": request.headers.get("user-agent"),
            }).execute()
        except Exception:
            pass
    return response


@app.get("/health")
def health() -> dict:
    s = get_settings()
    sb = supabase_or_none()
    return {
        "status": "ok",
        "environment": s.environment,
        "supabase_configured": sb is not None,
        "anthropic_configured": bool((s.anthropic_api_key or "").strip()),
        "stripe_configured": bool((s.linq_stripe_secret_key or "").strip()),
    }
