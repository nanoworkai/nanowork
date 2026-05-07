"""
Stripe billing endpoints.

POST /api/payments/portal        → creates a Stripe Billing Portal session
POST /api/payments/checkout      → creates a Stripe Checkout session (new subscriptions)
POST /api/payments/webhook       → handles Stripe webhook events
GET  /api/payments/invoices      → lists invoices for the current user
GET  /api/payments/balance       → returns current balance (legacy)
"""

from typing import Any

import stripe
from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request
from pydantic import BaseModel

from app.auth import get_current_user_phone
from app.config import get_settings
from app.deps import optional_supabase

router = APIRouter(prefix="/payments", tags=["payments"])


def _stripe():
    key = get_settings().effective_stripe_key
    if not key:
        raise HTTPException(503, "Stripe not configured")
    stripe.api_key = key
    return stripe


# ── Billing Portal ─────────────────────────────────────────────────────────────

class PortalRequest(BaseModel):
    return_url: str = "https://nanowork.app/dashboard/settings"


@router.post("/portal")
async def billing_portal(
    body: PortalRequest,
    phone: str = Depends(get_current_user_phone),
    db: Any = Depends(optional_supabase),
):
    """Redirect the user to a Stripe-hosted Billing Portal to manage their subscription."""
    s = _stripe()
    if not db:
        raise HTTPException(503, "DB unavailable")

    row = db.table("profiles").select("stripe_customer_id").eq("phone", phone).maybe_single().execute()
    if not row.data or not row.data.get("stripe_customer_id"):
        raise HTTPException(404, "No Stripe customer found — subscribe first")

    session = s.billing_portal.Session.create(
        customer=row.data["stripe_customer_id"],
        return_url=body.return_url,
    )
    return {"url": session.url}


# ── Checkout (new subscription) ────────────────────────────────────────────────

class CheckoutRequest(BaseModel):
    price_id: str
    success_url: str = "https://nanowork.app/dashboard?subscribed=1"
    cancel_url: str = "https://nanowork.app/dashboard/plan"


@router.post("/checkout")
async def create_checkout(
    body: CheckoutRequest,
    phone: str = Depends(get_current_user_phone),
    db: Any = Depends(optional_supabase),
):
    s = _stripe()
    if not db:
        raise HTTPException(503, "DB unavailable")

    row = db.table("profiles").select("stripe_customer_id, email").eq("phone", phone).maybe_single().execute()
    customer_id: str | None = row.data.get("stripe_customer_id") if row.data else None

    kwargs: dict = {
        "mode": "subscription",
        "line_items": [{"price": body.price_id, "quantity": 1}],
        "success_url": body.success_url,
        "cancel_url": body.cancel_url,
        "metadata": {"user_phone": phone},
    }
    if customer_id:
        kwargs["customer"] = customer_id
    elif row.data and row.data.get("email"):
        kwargs["customer_email"] = row.data["email"]

    session = s.checkout.Session.create(**kwargs)
    return {"checkout_url": session.url}


# ── Stripe Webhook ─────────────────────────────────────────────────────────────

PLAN_MAP = {
    # Map your Stripe Price IDs to plan tiers
    # e.g. "price_starter": "starter", "price_growth": "growth"
    # These are populated from your Stripe dashboard
}

SUBSCRIPTION_PLAN_MAP: dict[str, str] = {
    "nanowork_starter": "starter",
    "nanowork_growth": "growth",
    "nanowork_scale": "scale",
}


def _resolve_plan(subscription: dict) -> str:
    """Derive plan tier from the first subscription item's product metadata or price nickname."""
    items = subscription.get("items", {}).get("data", [])
    if not items:
        return "free"
    price = items[0].get("price", {})
    # Check price metadata first, then nickname
    meta_plan = (price.get("metadata") or {}).get("plan_tier")
    if meta_plan:
        return meta_plan
    nickname = (price.get("nickname") or "").lower()
    for key, tier in SUBSCRIPTION_PLAN_MAP.items():
        if key in nickname:
            return tier
    return "starter"


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="stripe-signature"),
    db: Any = Depends(optional_supabase),
):
    settings = get_settings()
    webhook_secret = (settings.stripe_webhook_secret or "").strip()
    payload = await request.body()

    if webhook_secret:
        try:
            event = stripe.Webhook.construct_event(payload, stripe_signature, webhook_secret)
        except stripe.error.SignatureVerificationError:
            raise HTTPException(400, "Invalid signature")
    else:
        import json
        event = json.loads(payload)

    etype = event.get("type", "")
    data = event.get("data", {}).get("object", {})

    if not db:
        return {"received": True}

    if etype == "checkout.session.completed":
        customer_id = data.get("customer")
        phone = (data.get("metadata") or {}).get("user_phone")
        if customer_id and phone:
            db.table("profiles").update({"stripe_customer_id": customer_id}).eq("phone", phone).execute()

    elif etype in ("customer.subscription.updated", "customer.subscription.created"):
        customer_id = data.get("customer")
        status = data.get("status")
        plan = _resolve_plan(data) if status == "active" else "free"
        if customer_id:
            db.table("profiles").update({"plan": plan}).eq("stripe_customer_id", customer_id).execute()

    elif etype == "customer.subscription.deleted":
        customer_id = data.get("customer")
        if customer_id:
            db.table("profiles").update({"plan": "free"}).eq("stripe_customer_id", customer_id).execute()

    return {"received": True}


# ── Invoices (legacy) ──────────────────────────────────────────────────────────

@router.get("/invoices")
async def list_invoices(
    phone: str = Depends(get_current_user_phone),
    db: Any = Depends(optional_supabase),
    limit: int = Query(20, ge=1, le=100),
):
    if not db:
        raise HTTPException(503, "DB unavailable")
    row = db.table("profiles").select("stripe_customer_id").eq("phone", phone).maybe_single().execute()
    if not row.data or not row.data.get("stripe_customer_id"):
        return {"data": []}

    s = _stripe()
    invoices = s.Invoice.list(customer=row.data["stripe_customer_id"], limit=limit)
    return {
        "data": [
            {
                "id": inv.id,
                "amount_paid": inv.amount_paid,
                "currency": inv.currency,
                "status": inv.status,
                "created": inv.created,
                "invoice_pdf": inv.invoice_pdf,
            }
            for inv in invoices.auto_paging_iter()
        ]
    }


@router.get("/balance")
async def get_balance(
    phone: str = Depends(get_current_user_phone),
    db: Any = Depends(optional_supabase),
):
    if not db:
        raise HTTPException(503, "DB unavailable")
    row = db.table("profiles").select("plan").eq("phone", phone).maybe_single().execute()
    if not row.data:
        raise HTTPException(404, "Profile not found")
    return {"plan": row.data.get("plan", "free")}
