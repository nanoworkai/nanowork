"""
Build endpoints.

POST /api/build/run     → single JSON response (used by BuildPage demo)
GET  /api/build/stream  → SSE stream of agent progress, one event per task
"""

import asyncio
import json
from typing import AsyncIterator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

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
