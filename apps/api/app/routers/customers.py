from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.auth import get_current_user
from app.deps import optional_supabase

router = APIRouter(prefix="/customers", tags=["customers"])


class CustomerBody(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    metadata: dict | None = None


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
async def list_customers(
    user: dict = Depends(get_current_user),
    db: Any = Depends(optional_supabase),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    if not db:
        raise HTTPException(503, "DB unavailable")
    tid = await _tenant_id(user, db)
    row = (
        db.table("nano_customers")
        .select("*")
        .eq("tenant_id", tid)
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return {"data": row.data, "limit": limit, "offset": offset}


@router.post("")
async def create_customer(
    body: CustomerBody,
    user: dict = Depends(get_current_user),
    db: Any = Depends(optional_supabase),
):
    if not db:
        raise HTTPException(503, "DB unavailable")
    tid = await _tenant_id(user, db)
    payload = {k: v for k, v in body.model_dump().items() if v is not None}
    payload["tenant_id"] = tid
    row = db.table("nano_customers").insert(payload).execute()
    return row.data[0]


@router.get("/{customer_id}")
async def get_customer(
    customer_id: str,
    user: dict = Depends(get_current_user),
    db: Any = Depends(optional_supabase),
):
    if not db:
        raise HTTPException(503, "DB unavailable")
    tid = await _tenant_id(user, db)
    row = (
        db.table("nano_customers")
        .select("*")
        .eq("id", customer_id)
        .eq("tenant_id", tid)
        .maybe_single()
        .execute()
    )
    if not row.data:
        raise HTTPException(404, "Customer not found")
    return row.data


@router.patch("/{customer_id}")
async def update_customer(
    customer_id: str,
    body: CustomerBody,
    user: dict = Depends(get_current_user),
    db: Any = Depends(optional_supabase),
):
    if not db:
        raise HTTPException(503, "DB unavailable")
    tid = await _tenant_id(user, db)
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(400, "No fields to update")
    row = (
        db.table("nano_customers")
        .update(updates)
        .eq("id", customer_id)
        .eq("tenant_id", tid)
        .execute()
    )
    if not row.data:
        raise HTTPException(404, "Customer not found")
    return row.data[0]


@router.delete("/{customer_id}")
async def delete_customer(
    customer_id: str,
    user: dict = Depends(get_current_user),
    db: Any = Depends(optional_supabase),
):
    if not db:
        raise HTTPException(503, "DB unavailable")
    tid = await _tenant_id(user, db)
    row = (
        db.table("nano_customers")
        .delete()
        .eq("id", customer_id)
        .eq("tenant_id", tid)
        .execute()
    )
    if not row.data:
        raise HTTPException(404, "Customer not found")
    return {"deleted": True}
