# Inbound Email Handler Documentation

Handles inbound emails sent to AI agent addresses via Cloudflare Email Routing webhook.

## Architecture

```
Sender → nova@nanowork.ai
  ↓
Cloudflare Email Routing
  ↓ (webhook)
POST /api/email/inbound
  ↓
1. Verify INTERNAL_TOKEN
2. Parse email payload
3. Look up user by ai_email
4. Store in email_messages table
5. Trigger AI processing (async)
  ↓
AI processes & responds
```

## Endpoint

**POST /api/email/inbound**

Receives webhook from Cloudflare Email Routing when an email is sent to an AI agent address.

### Authentication

Secured with `INTERNAL_TOKEN` in Authorization header:

```
Authorization: Bearer {INTERNAL_TOKEN}
```

This token is shared between Cloudflare Email Routing and your Worker.

### Request Body (from Cloudflare)

```json
{
  "from": "customer@example.com",
  "to": "nova@nanowork.ai",
  "subject": "Question about your service",
  "headers": {
    "message-id": "<abc123@mail.example.com>",
    "date": "Tue, 14 May 2026 01:00:00 +0000",
    ...
  },
  "content": "Plain text email body",
  "text": "Alternative plain text",
  "html": "<p>HTML email body</p>",
  "attachments": [
    {
      "filename": "document.pdf",
      "contentType": "application/pdf",
      "size": 12345
    }
  ],
  "messageId": "cf-message-123"
}
```

### Response

```json
{
  "success": true,
  "messageId": "uuid-of-stored-email",
  "message": "Email received and queued for processing"
}
```

## Database Schema

### email_messages Table

Stores inbound and outbound emails:

```sql
CREATE TABLE email_messages (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  from_address TEXT NOT NULL,
  from_name TEXT,
  to_address TEXT NOT NULL,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  status TEXT CHECK (status IN ('received', 'processing', 'processed', 'failed', 'sent')),
  message_id TEXT,
  headers JSONB,
  attachments JSONB,
  ai_processed BOOLEAN DEFAULT FALSE,
  ai_response TEXT,
  ai_response_sent_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Setup

### 1. Add INTERNAL_TOKEN Secret

Generate a secure random token:

```bash
# Generate token
openssl rand -base64 32

# Add to Cloudflare Worker secrets
wrangler secret put INTERNAL_TOKEN
```

For local development, add to `.dev.vars`:

```
INTERNAL_TOKEN=your-secure-token-here
```

### 2. Configure Cloudflare Email Routing

1. Go to Cloudflare Dashboard → Email Routing
2. Add domain: `nanowork.ai`
3. Verify domain ownership (add DNS records)
4. Create catch-all route:
   - Match: `*@nanowork.ai`
   - Action: Send to Worker
   - Worker: Your worker name
   - Webhook URL: `https://api.nanowork.app/api/email/inbound`
   - Authorization: `Bearer {INTERNAL_TOKEN}`

### 3. Run Database Migration

```bash
cd supabase
supabase db push
```

Or apply manually:

```bash
psql $DATABASE_URL < migrations/20260514000001_email_messages.sql
```

### 4. Test the Endpoint

```bash
curl -X POST https://api.nanowork.app/api/email/inbound \
  -H "Authorization: Bearer your-internal-token" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "test@example.com",
    "to": "nova@nanowork.ai",
    "subject": "Test Email",
    "content": "This is a test message"
  }'
```

## Flow Diagram

### Inbound Email Processing

1. **Email Received**
   - Customer sends email to `nova@nanowork.ai`
   - Cloudflare Email Routing receives it

2. **Webhook Triggered**
   - Cloudflare calls `/api/email/inbound`
   - Includes full email payload

3. **Authentication**
   - Verify `INTERNAL_TOKEN`
   - Reject if invalid

4. **User Lookup**
   - Query `profiles` table where `ai_email = 'nova@nanowork.ai'`
   - Get user ID

5. **Store Email**
   - Insert into `email_messages`
   - Direction: `inbound`
   - Status: `received`

6. **AI Processing (Async)**
   - Update status to `processing`
   - Analyze email content
   - Generate response
   - Send reply via `sendAsAgent()`
   - Update status to `processed`

7. **User Notification**
   - Email appears in Settings → AI Email inbox
   - Real-time updates via Supabase subscriptions

## AI Processing Integration

The `triggerAIProcessing()` function is where you integrate with your existing AI agent system:

```typescript
async function triggerAIProcessing(env, params) {
  // 1. Update status to processing
  await supabase
    .from('email_messages')
    .update({ status: 'processing' })
    .eq('id', params.emailMessageId);

  // 2. TODO: Integrate with your AI system
  // Example:
  const aiResponse = await generateAIResponse(env, {
    userId: params.userId,
    prompt: `New email from ${params.fromName || params.fromAddress}
Subject: ${params.subject}

${params.body}

Please draft a professional response.`,
  });

  // 3. Send AI response
  if (aiResponse) {
    await sendAsAgent(env, {
      userId: params.userId,
      to: params.fromAddress,
      subject: `Re: ${params.subject}`,
      body: aiResponse,
    });

    // Store response
    await supabase
      .from('email_messages')
      .update({
        ai_response: aiResponse,
        ai_response_sent_at: new Date().toISOString(),
      })
      .eq('id', params.emailMessageId);
  }

  // 4. Mark as processed
  await supabase
    .from('email_messages')
    .update({
      status: 'processed',
      ai_processed: true,
      processed_at: new Date().toISOString(),
    })
    .eq('id', params.emailMessageId);
}
```

## Security Considerations

1. **Token Security**
   - `INTERNAL_TOKEN` must be kept secret
   - Only shared between Cloudflare Email Routing and Worker
   - Rotate periodically

2. **Email Validation**
   - Validate sender addresses to prevent spam
   - Implement rate limiting per sender
   - Check for malicious content

3. **User Privacy**
   - Emails are stored with user-specific RLS policies
   - Only accessible by the owning user
   - Consider encryption for sensitive content

4. **Attachment Handling**
   - Currently metadata only (size, type, filename)
   - Consider virus scanning before storage
   - Implement size limits

## Monitoring

### Logging

All operations are logged with context:

```
[Email Inbound] Received email: { from, to, subject, messageId }
[Email Inbound] Found user: userId for email: aiEmail
[Email Inbound] Stored email message: messageId
[AI Processing] Starting for email: messageId
[AI Processing] Completed for email: messageId
```

### Error Handling

Errors are logged and returned with appropriate status codes:

- `401 Unauthorized` - Invalid/missing INTERNAL_TOKEN
- `400 Bad Request` - Missing required fields
- `404 Not Found` - No user found for AI email address
- `500 Internal Server Error` - Database or processing errors

### Metrics to Track

- Emails received per hour
- Processing time per email
- AI response success rate
- Bounce/failure rate
- User response time

## Troubleshooting

### "Unauthorized" Error

**Cause:** INTERNAL_TOKEN mismatch

**Solution:** Ensure token in Cloudflare Email Routing matches Worker secret

### "No user found for AI email address"

**Cause:** Email sent to unassigned AI email

**Solution:** User must assign AI email via `/api/email/assign` first

### "Failed to store email"

**Cause:** Database connection or permission issue

**Solution:** Check SUPABASE_SERVICE_ROLE_KEY and RLS policies

### Emails Not Being Received

**Cause:** Cloudflare Email Routing not configured

**Solution:**
1. Verify domain in Cloudflare Email Routing
2. Check DNS records are correct
3. Verify catch-all route is enabled
4. Test with Cloudflare's email testing tool

### AI Processing Not Working

**Cause:** `triggerAIProcessing()` not integrated

**Solution:** Implement AI integration in `triggerAIProcessing()` function

## Frontend Integration

The Settings page already has an inbox view that automatically loads emails:

```tsx
// In Settings.tsx - AI Email Section
function AIEmailSection() {
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    loadEmails();
  }, []);

  async function loadEmails() {
    const { data } = await supabase
      .from('email_messages')
      .select('*')
      .eq('user_id', user.id)
      .eq('direction', 'inbound')
      .order('received_at', { ascending: false })
      .limit(50);

    setEmails(data || []);
  }
}
```

## Future Enhancements

- [ ] Auto-reply templates
- [ ] Email threading (replies to same conversation)
- [ ] Attachment storage and retrieval
- [ ] Spam filtering
- [ ] Email forwarding rules
- [ ] Custom AI prompts per user
- [ ] Email categorization/tagging
- [ ] Search functionality
- [ ] Bulk operations
- [ ] Email analytics dashboard
