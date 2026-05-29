# AI Agent Email System

## Overview
Every user gets a unique AI agent email address that can receive and respond to emails automatically. This allows users to give out a single email address that their AI handles 24/7.

## Email Format
```
a-{slug}@agent.nanowork.ai
```

**Example:**
```
a-x7k2m9n4@agent.nanowork.ai
```

- Prefix: `a-` (identifies it as an agent email)
- Slug: 8 character random alphanumeric string (lowercase)
- Domain: `agent.nanowork.ai` (configurable via `AGENT_EMAIL_DOMAIN`)

## How It Works

### 1. User Signs Up
- User creates account via Supabase Auth
- Profile record created in `profiles` table

### 2. Agent Provisioning
Two paths can trigger agent creation:

**Path A: Auth Middleware (Automatic)**
- First API request after signup hits `requireUserAuth` middleware
- Middleware checks if user has an agent
- If not, creates agent with unique email
- Updates `profiles.ai_email` with generated email

**Path B: Webhook (Preferred)**
- Supabase Edge Function: `on-signup`
- Calls `/internal/provision-agent` endpoint
- Creates agent and updates profile in one transaction

### 3. Email Storage
The generated email is stored in two places:

**agents table:**
```sql
{
  user_id: 'uuid',
  slug: 'x7k2m9n4',
  email: 'a-x7k2m9n4@agent.nanowork.ai',
  ...
}
```

**profiles table:**
```sql
{
  id: 'uuid',
  email: 'user@example.com',
  ai_email: 'a-x7k2m9n4@agent.nanowork.ai',
  ...
}
```

### 4. Frontend Display
The Inbox component shows the agent email in the header:

```tsx
<p className="text-sm text-white/60">
  Messages sent to and from your AI agent at{" "}
  <span className="font-mono text-white/80">
    {profile?.aiEmail || 'generating...'}
  </span>
</p>
```

## Database Schema

### Migration
```sql
-- Add ai_email column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS ai_email TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_profiles_ai_email ON profiles(ai_email);
```

### Indexes
- `profiles.ai_email` - UNIQUE index for fast lookups
- `agents.email` - Already indexed

## Use Cases

### 1. Customer Support
User shares agent email on their website contact page:
```
Contact: support@mycompany.com
AI Agent: a-x7k2m9n4@agent.nanowork.ai
```

### 2. Lead Generation
Agent email embedded in landing pages:
```html
<a href="mailto:a-x7k2m9n4@agent.nanowork.ai">
  Get in touch
</a>
```

### 3. Email Forwarding
User forwards emails from their main inbox to agent:
```
From: customer@company.com
To: a-x7k2m9n4@agent.nanowork.ai
```

## Security

### Rate Limiting
- Emails per agent: 100/hour (configurable)
- Prevents abuse and spam

### Authentication
- Emails verified via DKIM/SPF
- Suspicious emails flagged for review

### Privacy
- Agent emails are unique and non-guessable (8 char random)
- Users can regenerate email if compromised (future feature)

## Email Processing Flow

```
1. Email arrives at a-x7k2m9n4@agent.nanowork.ai
   ↓
2. Email webhook receives message
   ↓
3. Look up agent by email slug
   ↓
4. Store in email_messages table
   ↓
5. Create task: 'email_received'
   ↓
6. Worker processes email with Claude
   ↓
7. Generate AI response
   ↓
8. Send reply from agent email
   ↓
9. Update email_messages with ai_response
```

## Configuration

### Environment Variables

**Backend (.env):**
```bash
AGENT_EMAIL_DOMAIN=agent.nanowork.ai
```

**Email Service:**
- Configure MX records for `agent.nanowork.ai`
- Set up inbound email webhook
- Point to `/webhooks/email` endpoint

## Testing

### Manual Test
1. Sign up new user
2. Check `profiles.ai_email` is populated
3. Send test email to agent address
4. Verify email appears in Inbox
5. Check AI response is generated

### API Test
```bash
# Get agent info
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/agents/me

# Response includes email
{
  "id": "uuid",
  "email": "a-x7k2m9n4@agent.nanowork.ai",
  "slug": "x7k2m9n4",
  ...
}
```

## Troubleshooting

### Email not generating
- Check backend logs for agent creation
- Verify `AGENT_EMAIL_DOMAIN` is set
- Check database for agent record

### Email not showing in Inbox
- Verify `profiles.ai_email` is populated
- Check AuthContext is loading profile correctly
- Look for console errors in browser

### Emails not being received
- Check MX records for email domain
- Verify webhook endpoint is accessible
- Check `/webhooks/email` logs

## Future Enhancements

### Phase 2
- [ ] Custom email aliases (e.g., support@user-domain.com → agent)
- [ ] Email forwarding rules
- [ ] Multiple agent emails per user

### Phase 3
- [ ] Regenerate agent email (if compromised)
- [ ] Email domain customization
- [ ] Spam filtering and blocklist

### Phase 4
- [ ] Email templates for common responses
- [ ] Auto-responder rules
- [ ] Integration with external email providers (Gmail, Outlook)
