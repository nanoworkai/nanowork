import time
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import cors_origin_list, get_settings
from app.deps import supabase_or_none
from app.routers import ai_route, build, phone
from app.routers import analytics, builds, customers, keys, payments, tenant, webhooks


@asynccontextmanager
async def lifespan(app: FastAPI):
    _ = supabase_or_none()
    yield


app = FastAPI(
    title="Nanowork API",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS middleware - only for development
# In production, we serve everything from the same origin
settings = get_settings()
if settings.environment == "development":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origin_list(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*", "stripe-signature"],
    )

# API routes - all prefixed with /api
app.include_router(ai_route.router, prefix="/api")
app.include_router(build.router, prefix="/api")
app.include_router(phone.router, prefix="/api")
app.include_router(builds.router, prefix="/api")
app.include_router(keys.router, prefix="/api")
app.include_router(tenant.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(webhooks.router, prefix="/api")


@app.middleware("http")
async def log_request(request: Request, call_next):
    """Log all API requests to database"""
    start = time.time()
    response = await call_next(request)

    # Only log API requests, not static files
    if request.url.path.startswith("/api"):
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
    """Health check endpoint"""
    s = get_settings()
    sb = supabase_or_none()
    return {
        "status": "ok",
        "environment": s.environment,
        "supabase_configured": sb is not None,
        "anthropic_configured": bool((s.anthropic_api_key or "").strip()),
        "stripe_configured": bool((s.linq_stripe_secret_key or "").strip()),
    }


# Static files - React app (must be last!)
STATIC_DIR = Path(__file__).parent.parent / "static"
if STATIC_DIR.exists():
    # Serve static assets (JS, CSS, images)
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """
        Serve React SPA for all non-API routes.
        This enables client-side routing.
        """
        # Try to serve the requested file
        file_path = STATIC_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)

        # Fall back to index.html for SPA routing
        return FileResponse(STATIC_DIR / "index.html")
else:
    @app.get("/")
    def root():
        """Root endpoint when frontend is not built"""
        return {
            "message": "Nanowork API",
            "docs": "/api/docs",
            "health": "/health",
            "note": "Frontend not built. Run: npm run build:web"
        }
