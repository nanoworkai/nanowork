from functools import lru_cache
from typing import Any

from fastapi import HTTPException, status
from supabase import Client, create_client

from app.config import get_settings


@lru_cache
def supabase_or_none() -> Client | None:
    s = get_settings()
    url = (s.supabase_url or "").strip()
    key = (s.supabase_service_role_key or "").strip()
    if not url or not key:
        return None
    try:
        return create_client(url, key)
    except Exception:
        return None


def optional_supabase() -> Any | None:
    """Use in routers that call Supabase; None if env not configured."""
    return supabase_or_none()


def get_supabase() -> Client:
    """Required Supabase client for routes that need the database."""
    client = supabase_or_none()
    if client is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Supabase is not configured. Set SUPABASE_URL and "
                "SUPABASE_SERVICE_ROLE_KEY in the API environment."
            ),
        )
    return client
