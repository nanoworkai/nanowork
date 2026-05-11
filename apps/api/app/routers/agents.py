"""
Agent provisioning and management routes.
"""
from typing import Annotated
from uuid import UUID
import secrets

from fastapi import APIRouter, Depends, HTTPException, Header, status
from pydantic import BaseModel, EmailStr

from app.config import get_settings
from app.deps import get_supabase

router = APIRouter(prefix="/agents", tags=["agents"])


# ============================================================================
# Models
# ============================================================================

class ProvisionAgentRequest(BaseModel):
    user_id: str
    email: EmailStr


class Agent(BaseModel):
    id: str
    user_id: str
    company_id: str | None
    department: str
    email_address: str
    name: str
    status: str
    model: str
    system_prompt: str | None
    metadata: dict
    created_at: str
    updated_at: str


class ProvisionAgentResponse(BaseModel):
    agents: list[Agent]
    created: bool


class InboundEmailRequest(BaseModel):
    from_address: str
    to_address: str
    subject: str
    body_text: str | None = None
    body_html: str | None = None
    headers: dict = {}


class InboundEmailResponse(BaseModel):
    success: bool
    email_id: str | None = None
    agent_id: str | None = None


# ============================================================================
# Dependencies
# ============================================================================

async def verify_internal_token(
    x_internal_token: Annotated[str | None, Header()] = None
):
    """Verify internal API token for provisioning endpoints."""
    settings = get_settings()
    expected_token = settings.internal_token

    if not expected_token:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal token not configured"
        )

    if not x_internal_token or x_internal_token != expected_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid internal token"
        )


# ============================================================================
# Agent Provisioning Logic
# ============================================================================

DEPARTMENTS = [
    {"key": "sales", "name": "Sales Agent", "prompt": "You are the Sales department agent. Help identify leads, manage customer relationships, and close deals."},
    {"key": "marketing", "name": "Marketing Agent", "prompt": "You are the Marketing department agent. Help create campaigns, manage brand presence, and drive customer acquisition."},
    {"key": "operations", "name": "Operations Agent", "prompt": "You are the Operations department agent. Help manage workflows, optimize processes, and ensure smooth execution."},
    {"key": "finance", "name": "Finance Agent", "prompt": "You are the Finance department agent. Help manage budgets, track expenses, and provide financial insights."},
    {"key": "product", "name": "Product Agent", "prompt": "You are the Product department agent. Help define roadmaps, gather feedback, and prioritize features."},
    {"key": "hr", "name": "HR Agent", "prompt": "You are the HR department agent. Help manage team culture, hiring, and employee wellbeing."},
    {"key": "support", "name": "Support Agent", "prompt": "You are the Support department agent. Help answer customer questions, resolve issues, and ensure satisfaction."},
]


def generate_agent_email(user_email: str, department: str) -> str:
    """
    Generate unique email address for agent.
    Format: {dept}-{random}@agents.yourdomain.com
    """
    settings = get_settings()
    domain = settings.agent_email_domain or "agents.yourdomain.com"

    # Extract username from user email for uniqueness
    username = user_email.split("@")[0]
    random_suffix = secrets.token_hex(4)

    return f"{department}-{username}-{random_suffix}@{domain}"


async def provision_agents_for_user(user_id: str, email: str) -> list[dict]:
    """
    Create 7 agents (one per department) for a new user.
    Returns list of created agent records.
    """
    supabase = get_supabase()
    settings = get_settings()

    # Check if agents already exist
    existing = supabase.table("agents").select("*").eq("user_id", user_id).execute()
    if existing.data:
        return existing.data

    # Create agents for each department
    agents_to_create = []
    for dept in DEPARTMENTS:
        agent_email = generate_agent_email(email, dept["key"])

        agents_to_create.append({
            "user_id": user_id,
            "department": dept["key"],
            "email_address": agent_email,
            "name": dept["name"],
            "status": "active",
            "model": settings.anthropic_model or "claude-sonnet-4-6",
            "system_prompt": dept["prompt"],
            "metadata": {}
        })

    # Insert all agents
    result = supabase.table("agents").insert(agents_to_create).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create agents"
        )

    return result.data


# ============================================================================
# Routes
# ============================================================================

@router.post("/internal/provision-agent", response_model=ProvisionAgentResponse)
async def provision_agent(
    request: ProvisionAgentRequest,
    _: Annotated[None, Depends(verify_internal_token)]
):
    """
    Internal endpoint called by Supabase Edge Function on user signup.
    Creates 7 agents (one per department) for the new user.
    """
    agents = await provision_agents_for_user(request.user_id, request.email)

    return ProvisionAgentResponse(
        agents=[Agent(**agent) for agent in agents],
        created=len(agents) > 0
    )


@router.get("/", response_model=list[Agent])
async def list_agents(supabase=Depends(get_supabase)):
    """
    List all agents for the authenticated user.
    """
    # Get user from Supabase auth context
    user = supabase.auth.get_user()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    result = supabase.table("agents").select("*").eq("user_id", user.user.id).execute()

    return [Agent(**agent) for agent in result.data]


@router.get("/{agent_id}", response_model=Agent)
async def get_agent(agent_id: UUID, supabase=Depends(get_supabase)):
    """
    Get a specific agent by ID.
    """
    user = supabase.auth.get_user()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    result = (
        supabase.table("agents")
        .select("*")
        .eq("id", str(agent_id))
        .eq("user_id", user.user.id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")

    return Agent(**result.data[0])


@router.patch("/{agent_id}", response_model=Agent)
async def update_agent(
    agent_id: UUID,
    name: str | None = None,
    status: str | None = None,
    system_prompt: str | None = None,
    metadata: dict | None = None,
    supabase=Depends(get_supabase)
):
    """
    Update agent settings.
    """
    user = supabase.auth.get_user()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    # Build update payload
    updates = {}
    if name is not None:
        updates["name"] = name
    if status is not None:
        updates["status"] = status
    if system_prompt is not None:
        updates["system_prompt"] = system_prompt
    if metadata is not None:
        updates["metadata"] = metadata

    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No updates provided")

    # Update agent
    result = (
        supabase.table("agents")
        .update(updates)
        .eq("id", str(agent_id))
        .eq("user_id", user.user.id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")

    return Agent(**result.data[0])


@router.post("/internal/email/inbound", response_model=InboundEmailResponse)
async def receive_inbound_email(
    email: InboundEmailRequest,
    _: Annotated[None, Depends(verify_internal_token)],
    supabase=Depends(get_supabase)
):
    """
    Internal endpoint called by Cloudflare Email Worker.
    Stores inbound emails and associates them with the correct agent.
    """
    # Find agent by email address
    agent_result = (
        supabase.table("agents")
        .select("*")
        .eq("email_address", email.to_address)
        .execute()
    )

    if not agent_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No agent found with email {email.to_address}"
        )

    agent = agent_result.data[0]

    # Store email in database
    email_data = {
        "agent_id": agent["id"],
        "company_id": agent.get("company_id"),
        "direction": "inbound",
        "from_address": email.from_address,
        "to_addresses": [email.to_address],
        "subject": email.subject,
        "body_text": email.body_text,
        "body_html": email.body_html,
        "headers": email.headers,
        "status": "pending",
    }

    result = supabase.table("agent_emails").insert(email_data).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to store email"
        )

    stored_email = result.data[0]

    return InboundEmailResponse(
        success=True,
        email_id=stored_email["id"],
        agent_id=agent["id"]
    )
