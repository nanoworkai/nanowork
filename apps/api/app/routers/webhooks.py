import hashlib
import hmac
import secrets
from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth import get_current_user
from app.deps import optional_supabase

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


class WebhookBody(BaseModel):
    url: str
    events: list[str]


def _sign(payload: str, secret: str) -> str:
    return hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()


async def _tenant_id(user: dict, db: Any) -> str:
    row = (
        db.table("nano_tenants")
        .select("id")
        .eq("owner_phone", user["phone_number"])
        .maybe_single()
        .execute()
    )
    if not row.data:
        raise HTTPException(404, "Tenant not found")
    return row.data["id"]


@router.get("")
async def list_webhooks(
    user: dict = Depends(get_current_user),
    db: Any = Depends(optional_supabase),
):
    if not db:
        raise HTTPException(503, "DB unavailable")
    tid = await _tenant_id(user, db)
    row = (
        db.table("nano_webhooks")
        .select("id,url,events,is_active,last_fired_at,created_at")
        .eq("tenant_id", tid)
        .execute()
    )
    return row.data


@router.post("")
async def create_webhook(
    body: WebhookBody,
    user: dict = Depends(get_current_user),
    db: Any = Depends(optional_supabase),
):
    if not db:
        raise HTTPException(503, "DB unavailable")
    tid = await _tenant_id(user, db)
    secret = secrets.token_urlsafe(32)
    row = db.table("nano_webhooks").insert({
        "tenant_id": tid,
        "url": body.url,
        "events": body.events,
        "secret": secret,
    }).execute()
    data = row.data[0] if row.data else {}
    return {**data, "secret": secret}  # secret returned once on creation


@router.delete("/{webhook_id}")
async def delete_webhook(
    webhook_id: str,
    user: dict = Depends(get_current_user),
    db: Any = Depends(optional_supabase),
):
    if not db:
        raise HTTPException(503, "DB unavailable")
    tid = await _tenant_id(user, db)
    row = (
        db.table("nano_webhooks")
        .delete()
        .eq("id", webhook_id)
        .eq("tenant_id", tid)
        .execute()
    )
    if not row.data:
        raise HTTPException(404, "Webhook not found")
    return {"deleted": True}


@router.post("/{webhook_id}/test")
async def test_webhook(
    webhook_id: str,
    user: dict = Depends(get_current_user),
    db: Any = Depends(optional_supabase),
):
    if not db:
        raise HTTPException(503, "DB unavailable")
    tid = await _tenant_id(user, db)
    row = (
        db.table("nano_webhooks")
        .select("*")
        .eq("id", webhook_id)
        .eq("tenant_id", tid)
        .maybe_single()
        .execute()
    )
    if not row.data:
        raise HTTPException(404, "Webhook not found")
    wh = row.data
    payload = '{"event":"test","data":{"message":"Test webhook from Nanowork"}}'
    sig = _sign(payload, wh["secret"])
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.post(
                wh["url"],
                content=payload,
                headers={
                    "Content-Type": "application/json",
                    "X-Nanowork-Signature": sig,
                },
            )
            db.table("nano_webhooks").update({"last_fired_at": "now()"}).eq("id", webhook_id).execute()
            return {"delivered": resp.status_code < 400, "status_code": resp.status_code}
        except Exception as exc:
            return {"delivered": False, "error": str(exc)}
