import datetime

from fastapi import APIRouter, Depends, HTTPException

from app.auth import get_current_user, get_current_user_phone
from app.deps import optional_supabase

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/builds")
async def build_analytics(
    phone: str = Depends(get_current_user_phone),
    db=Depends(optional_supabase),
):
    if not db:
        raise HTTPException(503, "DB unavailable")
    since = (datetime.datetime.utcnow() - datetime.timedelta(days=30)).isoformat()
    row = (
        db.table("linq_jobs")
        .select("status,duration_ms")
        .eq("user_phone", phone)
        .gte("created_at", since)
        .execute()
    )
    jobs = row.data or []
    total = len(jobs)
    complete = sum(1 for j in jobs if j.get("status") == "complete")
    failed = sum(1 for j in jobs if j.get("status") == "failed")
    durations = [j["duration_ms"] for j in jobs if j.get("duration_ms")]
    avg_ms = int(sum(durations) / len(durations)) if durations else None
    return {"total": total, "complete": complete, "failed": failed, "avg_duration_ms": avg_ms}


@router.get("/usage")
async def usage_analytics(
    phone: str = Depends(get_current_user_phone),
    db=Depends(optional_supabase),
):
    if not db:
        raise HTTPException(503, "DB unavailable")
    now = datetime.datetime.utcnow()
    periods = []
    for i in range(3):
        m, y = now.month - i, now.year
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


@router.get("/revenue")
async def revenue_analytics(
    user: dict = Depends(get_current_user),
    db=Depends(optional_supabase),
):
    if not db:
        raise HTTPException(503, "DB unavailable")
    tenant = (
        db.table("nano_tenants")
        .select("id,current_balance_cents")
        .eq("owner_phone", user["phone_number"])
        .maybe_single()
        .execute()
    )
    if not tenant.data:
        raise HTTPException(404, "Tenant not found")
    tid = tenant.data["id"]
    ledger = (
        db.table("nano_ledger")
        .select("type,amount_cents")
        .eq("tenant_id", tid)
        .execute()
    )
    rows = ledger.data or []
    earned = sum(r["amount_cents"] for r in rows if r.get("type") == "credit")
    paid_out = sum(r["amount_cents"] for r in rows if r.get("type") == "debit")
    return {
        "total_earned": earned,
        "total_paid_out": paid_out,
        "current_balance": tenant.data.get("current_balance_cents", 0),
    }
