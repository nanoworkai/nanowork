# Cloudflare Email Routing + Worker Setup

This setup allows agents to **receive** inbound emails via Cloudflare Email Routing.

## Prerequisites

- Your domain must be on Cloudflare (free plan works)
- Wrangler CLI installed: `npm install -g wrangler`
- Agents must already be provisioned in the database

## Architecture

```
Inbound Email → Cloudflare Email Routing → Email Worker → Backend API → Database
```

When someone sends an email to `sales-user-abc@agents.yourdomain.com`:
1. Cloudflare Email Routing catches it
2. Routes to the Email Worker
3. Worker parses the email and calls backend
4. Backend stores email in `agent_emails` table
5. Agent can process it in next conversation turn

## Steps

### 1. Enable Email Routing in Cloudflare

- Go to Cloudflare Dashboard → your domain
- Navigate to **Email** → **Email Routing**
- Click **Enable Email Routing**
- Cloudflare will add required MX records automatically

### 2. Verify email routing is active

- Cloudflare will send a verification email to your domain's contact email
- Click the verification link
- Status should change to "Active"

### 3. Install Wrangler (if not installed)

```bash
npm install -g wrangler
```

### 4. Login to Wrangler

```bash
wrangler login
```

This will open a browser for authentication.

### 5. Deploy the Email Worker

From the project root:

```bash
cd apps/worker
wrangler deploy
```

### 6. Set Worker secrets

Still in `apps/worker/` directory:

```bash
wrangler secret put BACKEND_URL
# When prompted, enter: https://your-app.onrender.com

wrangler secret put INTERNAL_TOKEN
# Enter the same token you set in backend .env

wrangler secret put AGENT_DOMAIN
# Enter: agents.yourdomain.com
```

### 7. Configure catch-all routing

- Back in Cloudflare Dashboard → Email Routing → **Routing Rules**
- Click **Create address** → **Catch-all address**
- For **Action**, select **Send to a Worker**
- Choose the worker: `nanowork-api` (or your worker name from wrangler.toml)
- Click **Save**

## Testing

### Test 1: Send an email to a test agent

```bash
# Replace with your agent's email from database
echo "Test message" | mail -s "Test Subject" sales-test-abc@agents.yourdomain.com
```

### Test 2: Check backend logs

In Render dashboard, check logs for:
```
POST /api/agents/email/inbound
```

### Test 3: Query database

In Supabase SQL Editor:
```sql
SELECT * FROM agent_emails ORDER BY created_at DESC LIMIT 5;
```

You should see the test email stored.

## Worker Code Reference

The worker is located at `apps/worker/src/index.ts` and includes email handling.

**Key email worker handler:**

```typescript
export default {
  async email(message, env, ctx) {
    const email = {
      from: message.from,
      to: message.to,
      subject: message.headers.get("subject"),
      body: await streamToText(message.raw),
    }

    // Forward to backend
    await fetch(`${env.BACKEND_URL}/api/agents/email/inbound`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Token": env.INTERNAL_TOKEN,
      },
      body: JSON.stringify(email),
    })
  }
}
```

## Troubleshooting

**Emails not arriving:**
- Check Email Routing is enabled and verified in Cloudflare
- Verify catch-all rule points to correct worker
- Check worker logs: `wrangler tail`

**Worker errors:**
- Verify secrets are set: `wrangler secret list`
- Check BACKEND_URL is correct (no trailing slash)
- Ensure INTERNAL_TOKEN matches backend

**Backend not receiving emails:**
- Check Render logs for errors
- Verify `/api/agents/email/inbound` route exists
- Test with curl:
  ```bash
  curl -X POST https://your-app.onrender.com/api/agents/email/inbound \
    -H "Content-Type: application/json" \
    -H "X-Internal-Token: YOUR_TOKEN" \
    -d '{"from":"test@example.com","to":"agent@agents.yourdomain.com","subject":"Test","body":"Hi"}'
  ```

## Next Steps

Once email routing is working:
1. Implement agent email processing logic
2. Add conversation threading
3. Build agent response generation
4. Set up email sending via Resend (for outbound)

## Security Notes

- The `X-Internal-Token` header prevents unauthorized email injection
- Only emails routed through Cloudflare can trigger the worker
- RLS policies ensure users only see their own agents' emails
