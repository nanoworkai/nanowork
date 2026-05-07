import hashlib
import secrets

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth import get_current_user_phone
from app.deps import optional_supabase

router = APIRouter(prefix="/keys", tags=["keys"])


class CreateKeyRequest(BaseModel):
    name: str
    scopes: list[str] = []


def _hash(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()


@router.post("")
async def create_key(
    body: CreateKeyRequest,
    phone: str = Depends(get_current_user_phone),
    db=Depends(optional_supabase),
):
    if not db:
        raise HTTPException(503, "DB unavailable")
    raw = f"nw_live_{secrets.token_urlsafe(32)}"
    row = db.table("nano_api_keys").insert({
        "user_phone": phone,
        "name": body.name,
        "key_hash": _hash(raw),
        "key_prefix": raw[:12],
        "scopes": body.scopes,
    }).execute()
    data = row.data[0] if row.data else {}
    return {**data, "key": raw}  # full key returned once only


@router.get("")
async def list_keys(
    phone: str = Depends(get_current_user_phone),
    db=Depends(optional_supabase),
):
    if not db:
        raise HTTPException(503, "DB unavailable")
    row = (
        db.table("nano_api_keys")
        .select("id,name,key_prefix,scopes,last_used_at,expires_at,is_active,created_at")
        .eq("user_phone", phone)
        .eq("is_active", True)
        .order("created_at", desc=True)
        .execute()
    )
    return row.data


@router.delete("/{key_id}")
async def revoke_key(
    key_id: str,
    phone: str = Depends(get_current_user_phone),
    db=Depends(optional_supabase),
):
    if not db:
        raise HTTPException(503, "DB unavailable")
    row = (
        db.table("nano_api_keys")
        .update({"is_active": False})
        .eq("id", key_id)
        .eq("user_phone", phone)
        .execute()
    )
    if not row.data:
        raise HTTPException(404, "Key not found")
    return {"revoked": True}
