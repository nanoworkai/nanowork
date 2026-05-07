from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.auth import get_current_user_phone
from app.deps import optional_supabase

router = APIRouter(prefix="/builds", tags=["builds"])


class BuildRequest(BaseModel):
    prompt: str
    phone_number: str | None = None


@router.post("")
async def trigger_build(
    body: BuildRequest,
    phone: str = Depends(get_current_user_phone),
    db=Depends(optional_supabase),
):
    if not db:
        raise HTTPException(503, "DB unavailable")
    row = db.table("linq_jobs").insert({
        "user_phone": phone,
        "prompt": body.prompt,
        "status": "queued",
    }).execute()
    data = row.data[0] if row.data else {}
    return {"build_id": data.get("id"), "status": data.get("status")}


@router.get("/{build_id}")
async def get_build(
    build_id: str,
    phone: str = Depends(get_current_user_phone),
    db=Depends(optional_supabase),
):
    if not db:
        raise HTTPException(503, "DB unavailable")
    row = (
        db.table("linq_jobs")
        .select("*")
        .eq("id", build_id)
        .eq("user_phone", phone)
        .maybe_single()
        .execute()
    )
    if not row.data:
        raise HTTPException(404, "Build not found")
    return row.data


@router.get("")
async def list_builds(
    phone: str = Depends(get_current_user_phone),
    db=Depends(optional_supabase),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    if not db:
        raise HTTPException(503, "DB unavailable")
    row = (
        db.table("linq_jobs")
        .select("*")
        .eq("user_phone", phone)
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return {"data": row.data, "limit": limit, "offset": offset}
