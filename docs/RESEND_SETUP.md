# Resend Setup (5 minutes)

Resend provides email sending for agent outbound emails.

## Steps

### 1. Sign up for Resend
- Go to https://resend.com
- Sign up (free plan, no credit card required)
- Confirm your email

### 2. Add your domain
- Navigate to **Domains** → **Add Domain**
- Enter your subdomain: `agents.yourdomain.com`
  - Replace `yourdomain.com` with your actual domain
  - Example: `agents.nanowork.ai`
- Click **Add Domain**

### 3. Configure DNS records
Resend will show you DNS records to add. Add these to your DNS provider (Cloudflare recommended):

**Typical records:**
```
Type: TXT
Name: agents
Value: resend_verify=xxxxxxxxxxxxx

Type: MX
Name: agents
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10

Type: TXT
Name: _dmarc.agents
Value: v=DMARC1; p=none

Type: TXT  
Name: resend._domainkey.agents
Value: p=MIGfMA0GCS...
```

### 4. Verify domain
- After adding DNS records, click **Verify Domain** in Resend dashboard
- Verification usually takes < 2 minutes with Cloudflare
- Status will change from "Pending" to "Verified"

### 5. Create API key
- Navigate to **API Keys** → **Create API Key**
- Name it: `Nanowork Agent Platform`
- Copy the API key (starts with `re_`)
- **Important**: Save this key - it won't be shown again

### 6. Add to Render environment variables
In your Render dashboard:
- Go to your service → **Environment** → **Environment Variables**
- Add the following:

```
RESEND_API_KEY = re_xxxxxxxxxxxxxxxxxxxxx
AGENT_EMAIL_DOMAIN = agents.yourdomain.com
```

- Click **Save Changes**
- Render will automatically redeploy

## Testing

Once configured, agents can send emails via Resend:

```python
from resend import Resend

resend = Resend(api_key="re_xxxxx")

resend.emails.send({
    "from": "sales-user-abc@agents.yourdomain.com",
    "to": "customer@example.com",
    "subject": "Following up on your inquiry",
    "html": "<p>Hi, this is your Sales Agent...</p>"
})
```

## Troubleshooting

**Domain not verifying:**
- DNS propagation can take up to 24 hours (usually much faster)
- Check DNS with: `dig TXT agents.yourdomain.com`
- Verify you added records to the correct domain

**Emails not sending:**
- Check API key is correct in Render env vars
- Check `AGENT_EMAIL_DOMAIN` matches your verified domain
- View logs in Resend dashboard → **Logs**

## Next steps

After Resend is configured, proceed to setting up Cloudflare Email Routing for **inbound** emails (agents receiving emails).
