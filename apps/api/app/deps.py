from functools import lru_cache
from typing import Any

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
