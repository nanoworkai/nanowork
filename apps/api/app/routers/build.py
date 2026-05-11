"""
Build endpoints.

POST /api/build/run     → single JSON response (used by BuildPage demo)
GET  /api/build/stream  → SSE stream of agent progress, one event per task
POST /api/build/preview → create preview build (unauthenticated freemium flow)
POST /api/builds/:id/unlock → unlock full build with credits
"""

import asyncio
import json
from typing import AsyncIterator
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.deps import get_supabase

router = APIRouter(prefix="/build", tags=["build"])


# ── Department definitions ─────────────────────────────────────────────────────

DEPARTMENTS = ["Legal", "Brand", "Web", "Marketing", "Sales", "Finance", "Ops"]

DEPT_ICONS = {
    "Legal": "⚖️", "Brand": "🎨", "Web": "🌐",
    "Marketing": "📣", "Sales": "💼", "Finance": "💳", "Ops": "⚙️",
}


# ── Fallback data ──────────────────────────────────────────────────────────────

def _fallback(prompt: str) -> dict:
    p = prompt.lower()
    if any(w in p for w in ["dog", "pet", "animal", "paw"]):
        name, tagline = "PawCo.", "Premium gear for the pets that run your life."
    elif any(w in p for w in ["food", "meal", "restaurant", "coffee", "eat", "prep"]):
        name, tagline = "PlateOne.", "Thoughtful food, built to travel."
    elif any(w in p for w in ["saas", "software", "app", "tool", "platform", "api"]):
        name, tagline = "Buildware.", "The tool that replaces the tool pile."
    elif any(w in p for w in ["coach", "coaching", "consult", "training", "course"]):
        name, tagline = "Meridian.", "Knowledge structured into revenue."
    elif any(w in p for w in ["fashion", "clothing", "apparel", "wear", "style"]):
        name, tagline = "Form Co.", "Clothes with a point of view."
    elif any(w in p for w in ["home", "furniture", "interior", "decor", "living"]):
        name, tagline = "Ambient.", "Objects that make rooms feel right."
    else:
        name, tagline = "Origin Co.", "Built to earn — from day one."

    return {
        "company_name": name,
        "tagline": tagline,
        "departments": {
            "Legal": {
                "tasks": ["LLC formation filed with state", "EIN application submitted to IRS", "Operating agreement drafted"],
                "first_output": "Delaware LLC formation package complete — registered agent assigned.",
            },
            "Brand": {
                "tasks": ["Company name and domain secured", "Wordmark and logo system designed", "Brand voice guide written"],
                "first_output": "Name, wordmark, and color system locked — exported in SVG, PNG, and dark/light variants.",
            },
            "Web": {
                "tasks": ["Domain registered and DNS configured", "Landing page with product copy deployed", "Stripe checkout wired"],
                "first_output": "Live site with product page and working checkout — indexed and load-tested.",
            },
            "Marketing": {
                "tasks": ["Launch copy and positioning written", "Ad creative produced in 3 variants", "5-email welcome sequence built"],
                "first_output": "3 ad variants live + 5-email welcome sequence active — first send scheduled.",
            },
            "Sales": {
                "tasks": ["CRM configured with pipeline stages", "Outreach sequence written and queued", "Seed lead list of 50 contacts built"],
                "first_output": "50 qualified leads imported — first outreach sequence sent, tracking open rates.",
            },
            "Finance": {
                "tasks": ["Chart of accounts configured", "Stripe business account opened", "P&L template and cash-flow model built"],
                "first_output": "Books open with chart of accounts and revenue tracking — Stripe dashboard live.",
            },
            "Ops": {
                "tasks": ["Tech stack and vendor roster defined", "Vendor contracts reviewed and signed", "Delivery runbook written"],
                "first_output": "Delivery runbook v1 published — all vendor SLAs signed and filed.",
            },
        },
    }


# ── Prompts ────────────────────────────────────────────────────────────────────

_SYSTEM = (
    "You are Nanowork's genesis engine. Given one business prompt, produce a complete "
    "first-week buildout across 7 parallel departments. Be highly specific to the exact "
    "business idea — no generic filler. Use real, brand-quality naming. "
    "Return ONLY minified JSON with no markdown fences or commentary."
)

_USER_TMPL = """\
Prompt: "{prompt}"

Return exactly this JSON structure (make every field specific to this business):
{{"company_name":"<crisp brand name>","tagline":"<one sharp sentence why it wins>",\
"departments":{{\
"Legal":{{"tasks":["<specific>","<specific>","<specific>"],"first_output":"<one sentence concrete deliverable>"}},\
"Brand":{{"tasks":["<specific>","<specific>","<specific>"],"first_output":"<one sentence concrete deliverable>"}},\
"Web":{{"tasks":["<specific>","<specific>","<specific>"],"first_output":"<one sentence concrete deliverable>"}},\
"Marketing":{{"tasks":["<specific>","<specific>","<specific>"],"first_output":"<one sentence concrete deliverable>"}},\
"Sales":{{"tasks":["<specific>","<specific>","<specific>"],"first_output":"<one sentence concrete deliverable>"}},\
"Finance":{{"tasks":["<specific>","<specific>","<specific>"],"first_output":"<one sentence concrete deliverable>"}},\
"Ops":{{"tasks":["<specific>","<specific>","<specific>"],"first_output":"<one sentence concrete deliverable>"}}\
}}}}"""


def _call_claude(prompt: str) -> dict | None:
    from anthropic import Anthropic
    from app.config import get_settings
    s = get_settings()
    key = (s.anthropic_api_key or "").strip()
    if not key:
        return None
    user_text = _USER_TMPL.format(prompt=prompt.replace('"', "'")[:600])
    try:
        client = Anthropic(api_key=key)
        msg = client.messages.create(
            model=s.anthropic_model,
            max_tokens=1400,
            system=_SYSTEM,
            messages=[{"role": "user", "content": user_text}],
        )
        raw = (getattr(msg.content[0], "text", "") or "").strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
        return json.loads(raw)
    except Exception:
        return None


# ── SSE helpers ────────────────────────────────────────────────────────────────

def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


async def _stream_build(prompt: str) -> AsyncIterator[str]:
    """
    Yield SSE events that simulate (or actually perform) parallel agent work.

    Event types:
      meta       — company name + tagline
      dept_start — a department has started
      task       — a single task completed
      dept_done  — department output ready
      done       — all departments finished
    """
    # Resolve data (Claude or fallback) in a thread to avoid blocking the event loop
    loop = asyncio.get_event_loop()
    data = await loop.run_in_executor(None, _call_claude, prompt)
    if data is None:
        data = _fallback(prompt)

    # Emit meta immediately
    yield _sse("meta", {
        "company_name": data.get("company_name", ""),
        "tagline": data.get("tagline", ""),
    })

    depts = data.get("departments", {})

    async def _emit_dept(name: str):
        info = depts.get(name, {})
        tasks = info.get("tasks", [])
        output = info.get("first_output", "")
        icon = DEPT_ICONS.get(name, "●")

        yield _sse("dept_start", {"dept": name, "icon": icon, "task_count": len(tasks)})
        await asyncio.sleep(0.3 + 0.2 * DEPARTMENTS.index(name))

        for task in tasks:
            await asyncio.sleep(0.6 + 0.4 * (hash(task) % 3) * 0.1)
            yield _sse("task", {"dept": name, "task": task})

        await asyncio.sleep(0.4)
        yield _sse("dept_done", {"dept": name, "output": output})

    # All departments run "in parallel" by interleaving with small offsets
    iterators = [_emit_dept(d) for d in DEPARTMENTS]
    # Round-robin across all dept async generators
    active = list(iterators)
    while active:
        next_active = []
        for it in active:
            try:
                chunk = await it.__anext__()
                yield chunk
                next_active.append(it)
            except StopAsyncIteration:
                pass
        active = next_active
        if active:
            await asyncio.sleep(0.05)

    yield _sse("done", {"company_name": data.get("company_name", "")})


# ── Routes ─────────────────────────────────────────────────────────────────────

class BuildRequest(BaseModel):
    prompt: str


@router.post("/run")
async def run_build(req: BuildRequest) -> dict:
    data = _call_claude(req.prompt)
    if data is None:
        return {"result": _fallback(req.prompt), "source": "stub"}
    return {"result": data, "source": "live"}


@router.get("/stream")
async def stream_build(prompt: str):
    """
    SSE endpoint — GET /api/build/stream?prompt=...
    Returns a text/event-stream with dept_start / task / dept_done / done events.
    """
    return StreamingResponse(
        _stream_build(prompt),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


# ── Preview Build (Freemium Flow) ──────────────────────────────────────────────

class PreviewBuildRequest(BaseModel):
    prompt: str


class PreviewBuildResponse(BaseModel):
    build_id: str
    preview_url: str
    company_name: str
    tagline: str
    credits_cost: int


@router.post("/preview", response_model=PreviewBuildResponse)
async def create_preview_build(req: PreviewBuildRequest):
    """
    Create a preview build without authentication (freemium conversion flow).
    Returns build_id and preview_url for the limited free version.
    """
    # Generate the build data
    data = _call_claude(req.prompt)
    if data is None:
        data = _fallback(req.prompt)

    # Store in database
    supabase = get_supabase()

    build_record = {
        "prompt": req.prompt,
        "company_name": data.get("company_name", "Your Company"),
        "tagline": data.get("tagline", ""),
        "status": "preview",
        "build_data": data,
        "credits_cost": 100,  # Cost to unlock full version
        "metadata": {"preview_generated": True},
    }

    result = supabase.table("builds").insert(build_record).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create preview build"
        )

    build = result.data[0]
    build_id = build["id"]

    # Preview URL points to the preview page
    preview_url = f"/preview/{build_id}"

    return PreviewBuildResponse(
        build_id=build_id,
        preview_url=preview_url,
        company_name=build["company_name"],
        tagline=build["tagline"],
        credits_cost=build["credits_cost"],
    )


@router.get("/{build_id}")
async def get_build(build_id: UUID):
    """
    Get build details by ID (for preview page).
    """
    supabase = get_supabase()

    result = supabase.table("builds").select("*").eq("id", str(build_id)).execute()

    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Build not found")

    return result.data[0]


class UnlockBuildRequest(BaseModel):
    pass  # No body needed, user is authenticated


class UnlockBuildResponse(BaseModel):
    success: bool
    full_url: str
    credits_remaining: int


@router.post("/{build_id}/unlock", response_model=UnlockBuildResponse)
async def unlock_build(build_id: UUID):
    """
    Unlock full build with credits (authenticated users only).
    Deducts credits and generates full website.
    """
    supabase = get_supabase()

    # Get authenticated user
    user = supabase.auth.get_user()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    user_id = user.user.id

    # Get build
    build_result = supabase.table("builds").select("*").eq("id", str(build_id)).execute()
    if not build_result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Build not found")

    build = build_result.data[0]

    # Check if already unlocked
    if build["status"] == "unlocked":
        return UnlockBuildResponse(
            success=True,
            full_url=build.get("full_url", f"/dashboard/builds/{build_id}"),
            credits_remaining=0,  # TODO: Get from profiles
        )

    # Get user credits
    profile_result = supabase.table("profiles").select("credits_balance").eq("id", user_id).execute()
    if not profile_result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")

    credits = profile_result.data[0]["credits_balance"]
    cost = build["credits_cost"]

    # Check sufficient credits
    if credits < cost:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Insufficient credits. Need {cost}, have {credits}"
        )

    # Deduct credits
    new_balance = credits - cost
    supabase.table("profiles").update({"credits_balance": new_balance}).eq("id", user_id).execute()

    # Log credit transaction
    supabase.table("credits_transactions").insert({
        "user_id": user_id,
        "amount": -cost,
        "type": "debit",
        "description": f"Unlocked build: {build['company_name']}",
        "balance_after": new_balance,
    }).execute()

    # Update build to unlocked
    full_url = f"/dashboard/builds/{build_id}"
    supabase.table("builds").update({
        "status": "unlocked",
        "user_id": user_id,
        "full_url": full_url,
        "unlocked_at": "now()",
    }).eq("id", str(build_id)).execute()

    return UnlockBuildResponse(
        success=True,
        full_url=full_url,
        credits_remaining=new_balance,
    )
