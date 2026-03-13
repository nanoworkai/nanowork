"""API route definitions."""

from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["api"])


@router.get("/hello")
def hello() -> dict:
    """Example API endpoint."""
    return {"message": "Hello from Nanowork API"}
