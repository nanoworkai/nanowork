-- Email Messages Table
-- Stores inbound and outbound email messages for AI agents

CREATE TABLE IF NOT EXISTS email_messages (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Email details
  from_address TEXT NOT NULL,
  from_name TEXT,
  to_address TEXT NOT NULL,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,

  -- Message metadata
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processing', 'processed', 'failed', 'sent')),

  -- Cloudflare Email Routing metadata
  message_id TEXT, -- External message ID from provider
  headers JSONB, -- Raw email headers
  attachments JSONB, -- Array of attachment metadata

  -- AI processing
  ai_processed BOOLEAN DEFAULT FALSE,
  ai_response TEXT,
  ai_response_sent_at TIMESTAMPTZ,

  -- Timestamps
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_messages_user_id ON email_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_to_address ON email_messages(to_address);
CREATE INDEX IF NOT EXISTS idx_email_messages_from_address ON email_messages(from_address);
CREATE INDEX IF NOT EXISTS idx_email_messages_direction ON email_messages(direction);
CREATE INDEX IF NOT EXISTS idx_email_messages_status ON email_messages(status);
CREATE INDEX IF NOT EXISTS idx_email_messages_received_at ON email_messages(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_messages_message_id ON email_messages(message_id);

-- Enable Row Level Security
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own emails
CREATE POLICY "Users can view their own emails"
  ON email_messages FOR SELECT
  USING (user_id = auth.uid());

-- RLS Policy: Users can insert their own emails
CREATE POLICY "Users can insert their own emails"
  ON email_messages FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policy: Users can update their own emails
CREATE POLICY "Users can update their own emails"
  ON email_messages FOR UPDATE
  USING (user_id = auth.uid());

-- Trigger: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_email_messages_updated_at ON email_messages;

CREATE TRIGGER set_email_messages_updated_at
  BEFORE UPDATE ON email_messages
  FOR EACH ROW EXECUTE FUNCTION update_email_messages_updated_at();

-- Comment for documentation
COMMENT ON TABLE email_messages IS 'Stores inbound and outbound email messages for AI agents';
COMMENT ON COLUMN email_messages.direction IS 'Direction of email: inbound (received) or outbound (sent)';
COMMENT ON COLUMN email_messages.status IS 'Processing status of the email message';
