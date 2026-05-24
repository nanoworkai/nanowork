# Email Service Documentation

The email service allows users to send emails from their assigned AI agent addresses (e.g., `nova@nanowork.ai`).

## Architecture

### Backend Service (`emailService.ts`)

Located at `apps/worker/src/services/emailService.ts`

**Functions:**

1. **`sendAsAgent(env, params)`**
   - Sends email from user's AI agent address
   - Looks up `ai_email` from user's profile in Supabase
   - Uses Resend API to send
   - From format: `"Nova from Nanowork <nova@nanowork.ai>"`

2. **`sendSystemEmail(env, params)`**
   - Sends system emails (not from AI agents)
   - For notifications, alerts, etc.

3. **`assignAIEmail(env, userId, agentName)`**
   - Assigns an AI email to a user
   - Format: `{agentName}@nanowork.ai`
   - Stored in `profiles.ai_email`

### API Routes (`routes/email.ts`)

**Endpoints:**

- **`POST /api/email/send`** - Send email as AI agent
  - Requires: `Authorization: Bearer {jwt}`
  - Body: `{ to, subject, message, html?, replyTo? }`
  - Returns: `{ success, messageId }`

- **`POST /api/email/assign`** - Assign AI email
  - Requires: `Authorization: Bearer {jwt}`
  - Body: `{ agentName }`
  - Returns: `{ success, email }`

- **`GET /api/email/status`** - Check AI email status
  - Requires: `Authorization: Bearer {jwt}`
  - Returns: `{ hasAIEmail, aiEmail }`

### Database Schema

**Migration:** `supabase/migrations/20260513000001_ai_email.sql`

```sql
ALTER TABLE profiles
ADD COLUMN ai_email TEXT;

-- Unique constraint
CREATE UNIQUE INDEX profiles_ai_email_unique
ON profiles(ai_email)
WHERE ai_email IS NOT NULL;

-- Format validation (must be @nanowork.ai)
ALTER TABLE profiles
ADD CONSTRAINT ai_email_format_check
CHECK (ai_email IS NULL OR ai_email ~ '^[a-z0-9]+@nanowork\.ai$');
```

### Frontend Component

**Component:** `apps/web/src/components/AIEmailManager.tsx`

Features:
- Check if user has AI email assigned
- Assign AI email with custom agent name
- Send emails from AI agent address
- Real-time status updates

## Setup

### 1. Install Resend (if not already installed)

```bash
cd apps/worker
npm install resend
```

### 2. Add Resend API Key to Environment

Add to Cloudflare Worker secrets:

```bash
wrangler secret put RESEND_API_KEY
# Enter your Resend API key when prompted
```

For local development, add to `.dev.vars`:

```
RESEND_API_KEY=re_123...
```

### 3. Run Database Migration

```bash
cd supabase
supabase db push
```

Or apply manually:

```bash
psql $DATABASE_URL < migrations/20260513000001_ai_email.sql
```

### 4. Configure Resend Domain

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add domain: `nanowork.ai`
3. Add DNS records provided by Resend
4. Verify domain

## Usage Examples

### Frontend - Assign AI Email

```tsx
import AIEmailManager from '../components/AIEmailManager';

function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <AIEmailManager />
    </div>
  );
}
```

### Backend - Send Email as Agent

```typescript
import { sendAsAgent } from '../services/emailService';

const result = await sendAsAgent(
  {
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: env.RESEND_API_KEY,
  },
  {
    userId: 'user-123',
    to: 'customer@example.com',
    subject: 'Welcome to Nanowork',
    body: 'Hello! This is Nova from Nanowork...',
    html: '<p>Hello! This is <strong>Nova</strong> from Nanowork...</p>',
    replyTo: 'support@nanowork.ai',
  }
);

if (result.success) {
  console.log('Email sent:', result.messageId);
} else {
  console.error('Failed to send:', result.error);
}
```

### Backend - Assign AI Email

```typescript
import { assignAIEmail } from '../services/emailService';

const result = await assignAIEmail(
  {
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
  },
  'user-123',
  'nova'
);

if (result.success) {
  console.log('Assigned email:', result.email); // nova@nanowork.ai
}
```

### API - Send Email via HTTP

```bash
curl -X POST https://api.nanowork.app/api/email/send \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "customer@example.com",
    "subject": "Hello from AI",
    "message": "This is a test email from your AI agent"
  }'
```

## Agent Name Suggestions

Popular AI agent names for different use cases:

- **General:** Nova, Atlas, Sage, Echo, Aria
- **Technical:** Cipher, Nexus, Quantum, Binary
- **Professional:** Sterling, Maxwell, Harper, Quinn
- **Creative:** Muse, Orion, Luna, Phoenix
- **Friendly:** Buddy, Scout, Riley, Jordan

## Security

- AI emails are validated to ensure format: `^[a-z0-9]+@nanowork\.ai$`
- Each AI email is unique (one per user)
- Authentication required for all email operations
- Resend API key stored securely in Worker secrets
- No client-side access to API keys

## Troubleshooting

### "User does not have an AI email assigned"

Solution: Call `/api/email/assign` first with an agent name

### "Resend API error: Domain not verified"

Solution: Verify `nanowork.ai` domain in Resend dashboard

### "Invalid token"

Solution: Ensure JWT is valid and not expired. Refresh session if needed.

### "Failed to fetch user profile"

Solution: Check that `profiles` table exists and user has a profile entry

## Future Enhancements

- [ ] Auto-assign AI email on user signup
- [ ] Email templates system
- [ ] Email analytics (open rates, clicks)
- [ ] Scheduled emails
- [ ] Email threads and replies
- [ ] Attachment support
- [ ] Bulk email sending
- [ ] Custom domain support for enterprise users
