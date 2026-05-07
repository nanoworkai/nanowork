from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.deps import optional_supabase

bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Any = Depends(optional_supabase),
) -> dict:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    if not db:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="DB unavailable")

    try:
        result = db.auth.get_user(credentials.credentials)
        user = result.user
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    # public.users PK is phone_number; JWT exposes it as user.phone
    phone = getattr(user, "phone", None)
    if not phone:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No phone on token")

    row = (
        db.table("users")
        .select("*")
        .eq("phone_number", phone)
        .single()
        .execute()
    )
    if not row.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return row.data


def get_current_user_phone(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Any = Depends(optional_supabase),
) -> str:
    """Lightweight variant — returns just the phone_number without a DB round-trip."""
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    if not db:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="DB unavailable")

    try:
        result = db.auth.get_user(credentials.credentials)
        user = result.user
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    phone = getattr(user, "phone", None)
    if not phone:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No phone on token")

    return phone
