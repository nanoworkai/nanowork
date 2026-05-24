/**
 * Supabase Edge Function: on-signup
 *
 * Triggered when a new user signs up.
 * Calls the backend to provision 7 agents for the user.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const BACKEND_URL = Deno.env.get("BACKEND_URL") || ""
const INTERNAL_TOKEN = Deno.env.get("INTERNAL_TOKEN") || ""

interface SignupPayload {
  user_id: string
  email: string
}

serve(async (req) => {
  try {
    // Parse incoming request
    const payload: SignupPayload = await req.json()

    if (!payload.user_id || !payload.email) {
      return new Response(
        JSON.stringify({ error: "Missing user_id or email" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Validate environment
    if (!BACKEND_URL || !INTERNAL_TOKEN) {
      console.error("Missing BACKEND_URL or INTERNAL_TOKEN environment variables")
      return new Response(
        JSON.stringify({ error: "Edge Function not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    // Call backend to provision agents
    const provisionUrl = `${BACKEND_URL}/api/agents/internal/provision-agent`

    console.log(`Provisioning agents for user ${payload.user_id}`)

    const response = await fetch(provisionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Token": INTERNAL_TOKEN,
      },
      body: JSON.stringify({
        user_id: payload.user_id,
        email: payload.email,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend provisioning failed: ${response.status} - ${errorText}`)
      return new Response(
        JSON.stringify({
          error: "Failed to provision agents",
          details: errorText
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      )
    }

    const result = await response.json()
    console.log(`Successfully provisioned ${result.agents?.length || 0} agents`)

    return new Response(
      JSON.stringify({ success: true, agents: result.agents }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )

  } catch (error) {
    console.error("Edge Function error:", error)
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
