"""
Gallery demo AI tasks — Anthropic Claude on the server when ANTHROPIC_API_KEY is set;
deterministic stubs otherwise (matches previous OpenAI-edge behavior shape).
"""

from typing import Any, Literal

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["ai"])

Task = Literal[
    "pressroom.pitch",
    "lamina.suggest",
    "fieldnote.summary",
    "sharpener.sharpen",
]


class AiPayload(BaseModel):
    task: Task
    input: dict[str, Any] | None = None


def prompts_for(task: Task, inp: dict[str, Any]) -> tuple[str, str]:
    if task == "pressroom.pitch":
        return (
            "You are an expert PR assistant writing short, specific pitches for busy "
            "journalists. Never exceed 120 words. Never use em-dashes. Be concrete, name "
            "the wedge, and end with one clear ask.",
            (
                f"Draft a pitch email to {inp.get('journalist')} at {inp.get('outlet')}. "
                f"Their beat is {inp.get('beat')}. The company is {inp.get('company')}. "
                f"The wedge to lead with: {inp.get('wedge')}. Output the email body only "
                "— no subject line, no signature."
            ),
        )
    if task == "lamina.suggest":
        existing = inp.get("existing") or []
        if isinstance(existing, list):
            ex_str = ", ".join(str(x) for x in existing) or "(nothing)"
        else:
            ex_str = str(existing)
        return (
            "You are a calm, minimalist habit coach. Suggest ONE new habit the user is "
            "missing, in 4-6 words. No streaks language. Respond with just the habit text, "
            "nothing else.",
            f"The user already tracks: {ex_str}. Suggest one more habit that complements these.",
        )
    if task == "fieldnote.summary":
        return (
            "You are a terse editorial assistant. Summarize a paid newsletter issue in two "
            "tight sentences for the archive page. No hype.",
            f"Issue title: {inp.get('title')}. Dek: {inp.get('dek')}. Write the summary.",
        )
    return (
        "You are Sharpener, a Nanowork agent. Given a rough founder idea, return a single "
        "sentence pitch, a one-phrase ICP, and a one-phrase wedge. Separate with ' · '.",
        f"Idea: {inp.get('idea')}",
    )


def fallback(task: Task, inp: dict[str, Any]) -> str:
    if task == "pressroom.pitch":
        j = str(inp.get("journalist") or "there").split(" ")[0]
        company = inp.get("company") or "we"
        beat = inp.get("beat") or "beat"
        outlet = inp.get("outlet") or "your outlet"
        wedge = inp.get("wedge") or "a specific angle you'd care about"
        return (
            f"Hi {j},\n\nQuick one — {company} just crossed a milestone that fits your "
            f"{beat} coverage at {outlet}. The wedge: {wedge}.\n\nHappy to share numbers, "
            "a founder call, or an exclusive. 15 min this week?"
        )
    if task == "lamina.suggest":
        return "10 minutes of quiet reading"
    if task == "fieldnote.summary":
        return f"{inp.get('title')}. {inp.get('dek')}"
    return (
        f"{inp.get('idea')} · small teams doing real work · shipped over text, not decks"
    )


@router.post("")
async def run_ai(payload: AiPayload) -> dict:
    from anthropic import Anthropic

    from app.config import get_settings

    s = get_settings()
    inp = payload.input or {}
    task = payload.task

    key = (s.anthropic_api_key or "").strip()
    if not key:
        return {"text": fallback(task, inp), "source": "stub"}

    system_text, user_text = prompts_for(task, inp)

    try:
        client = Anthropic(api_key=key)
        msg = client.messages.create(
            model=s.anthropic_model,
            max_tokens=300,
            system=system_text,
            messages=[{"role": "user", "content": user_text}],
            temperature=0.7,
        )
        block = msg.content[0]
        text = getattr(block, "text", "") or ""
        text = text.strip()
        return {
            "text": text or fallback(task, inp),
            "source": "live" if text else "stub_empty",
        }
    except Exception as e:
        code = getattr(e, "status_code", None)
        return {
            "text": fallback(task, inp),
            "source": "stub_after_error" if code else "stub_after_throw",
            **({"status": code} if code is not None else {}),
        }
