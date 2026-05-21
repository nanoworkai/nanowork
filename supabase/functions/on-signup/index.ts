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

    // Call backend to provision agent
    const provisionUrl = `${BACKEND_URL}/internal/provision-agent`

    console.log(`Provisioning agent for user ${payload.user_id}`)

    const response = await fetch(provisionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${INTERNAL_TOKEN}`,
      },
      body: JSON.stringify({
        user_id: payload.user_id,
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
    console.log(`Successfully provisioned agent for user ${payload.user_id}`)

    return new Response(
      JSON.stringify({ success: true, agent: result.agent, created: result.created }),
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
