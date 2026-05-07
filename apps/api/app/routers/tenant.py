import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth import get_current_user, get_current_user_phone
from app.deps import optional_supabase

router = APIRouter(prefix="/tenant", tags=["tenant"])


class UpdateTenantRequest(BaseModel):
    name: str | None = None
    slug: str | None = None


@router.get("")
async def get_tenant(
    user: dict = Depends(get_current_user),
    db=Depends(optional_supabase),
):
    if not db:
        raise HTTPException(503, "DB unavailable")
    row = (
        db.table("nano_tenants")
        .select("*")
        .eq("owner_phone", user["phone_number"])
        .maybe_single()
        .execute()
    )
    if not row.data:
        raise HTTPException(404, "Tenant not found")
    return row.data


@router.patch("")
async def update_tenant(
    body: UpdateTenantRequest,
    user: dict = Depends(get_current_user),
    db=Depends(optional_supabase),
):
    if not db:
        raise HTTPException(503, "DB unavailable")
    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(400, "No fields to update")
    row = (
        db.table("nano_tenants")
        .update(updates)
        .eq("owner_phone", user["phone_number"])
        .execute()
    )
    if not row.data:
        raise HTTPException(404, "Tenant not found")
    return row.data[0]


@router.get("/usage")
async def get_usage(
    phone: str = Depends(get_current_user_phone),
    db=Depends(optional_supabase),
):
    if not db:
        raise HTTPException(503, "DB unavailable")
    now = datetime.datetime.utcnow()
    # Build last 3 billing period strings (YYYY-MM)
    periods = []
    for i in range(3):
        m = now.month - i
        y = now.year
        if m <= 0:
            m += 12
            y -= 1
        periods.append(f"{y}-{m:02d}")
    row = (
        db.table("linq_usage")
        .select("*")
        .eq("user_phone", phone)
        .in_("billing_period", periods)
        .order("billing_period", desc=True)
        .execute()
    )
    return row.data


@router.get("/plan")
async def get_plan(
    phone: str = Depends(get_current_user_phone),
    db=Depends(optional_supabase),
):
    if not db:
        raise HTTPException(503, "DB unavailable")
    tenant = (
        db.table("nano_tenants")
        .select("linq_plan")
        .eq("owner_phone", phone)
        .maybe_single()
        .execute()
    )
    if not tenant.data:
        raise HTTPException(404, "Tenant not found")
    plan_name = tenant.data.get("linq_plan", "free")
    limits = (
        db.table("linq_plan_limits")
        .select("*")
        .eq("plan", plan_name)
        .maybe_single()
        .execute()
    )
    return {"plan": plan_name, "limits": limits.data}
