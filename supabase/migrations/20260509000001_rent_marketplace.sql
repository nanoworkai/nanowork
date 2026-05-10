-- ============================================================================
-- RENT MARKETPLACE
-- Physical resources marketplace for AI agent access via MCP
-- User-submitted, community-driven marketplace with admin moderation
-- ============================================================================

-- ============================================================================
-- RENT_ITEMS TABLE
-- Physical resources available for rent/access
-- ============================================================================

CREATE TABLE IF NOT EXISTS rent_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership (user-submitted marketplace)
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Item identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Categorization
  category TEXT NOT NULL CHECK (category IN (
    'lab_equipment',
    'compute',
    'stores',
    'human_services'
  )),

  -- Availability
  status TEXT NOT NULL DEFAULT 'coming_soon' CHECK (status IN (
    'coming_soon',
    'preview',
    'available',
    'waitlist_only',
    'unavailable'
  )),

  -- Visuals
  image_url TEXT,
  icon_emoji TEXT,

  -- MCP integration details
  mcp_config JSONB,

  -- Pricing
  price_preview TEXT,

  -- Location
  location TEXT,

  -- Contact
  contact_email TEXT,
  contact_url TEXT,

  -- Metadata
  featured BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rent_items_user_id ON rent_items(user_id);
CREATE INDEX idx_rent_items_category ON rent_items(category);
CREATE INDEX idx_rent_items_status ON rent_items(status);
CREATE INDEX idx_rent_items_approved ON rent_items(approved);
CREATE INDEX idx_rent_items_featured ON rent_items(featured);
CREATE INDEX idx_rent_items_slug ON rent_items(slug);

-- RLS Policies
ALTER TABLE rent_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved items"
  ON rent_items FOR SELECT
  USING (approved = true);

CREATE POLICY "Users can view own items"
  ON rent_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create items"
  ON rent_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items"
  ON rent_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own items"
  ON rent_items FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RENT_WAITLIST TABLE
-- Email signups for marketplace launch
-- ============================================================================

CREATE TABLE IF NOT EXISTS rent_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact
  email TEXT NOT NULL,

  -- Optional: Specific item interest
  item_id UUID REFERENCES rent_items(id) ON DELETE SET NULL,

  -- Optional: Authenticated user
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Attribution
  referrer TEXT,
  user_agent TEXT,

  -- Notification tracking
  notified BOOLEAN DEFAULT false,
  notified_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rent_waitlist_email ON rent_waitlist(email);
CREATE INDEX idx_rent_waitlist_item_id ON rent_waitlist(item_id);
CREATE INDEX idx_rent_waitlist_user_id ON rent_waitlist(user_id);
CREATE INDEX idx_rent_waitlist_created_at ON rent_waitlist(created_at DESC);

-- RLS
ALTER TABLE rent_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
  ON rent_waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own waitlist entries"
  ON rent_waitlist FOR SELECT
  USING (
    user_id = auth.uid() OR
    email IN (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Prevent duplicates
CREATE UNIQUE INDEX idx_rent_waitlist_unique_email_item
  ON rent_waitlist(email, item_id)
  WHERE item_id IS NOT NULL;

CREATE UNIQUE INDEX idx_rent_waitlist_unique_email_general
  ON rent_waitlist(email)
  WHERE item_id IS NULL;

-- ============================================================================
-- SEED DATA
-- Sample items for preview (initially platform-seeded)
-- ============================================================================

INSERT INTO rent_items (user_id, name, slug, tagline, description, category, status, icon_emoji, price_preview, location, approved, featured)
SELECT
  id,
  'NVIDIA A100 GPU',
  'nvidia-a100-gpu',
  'High-performance ML training',
  'On-demand access to NVIDIA A100 GPUs for deep learning training and large-scale inference. Pre-configured with CUDA, PyTorch, and TensorFlow.',
  'compute',
  'coming_soon',
  '⚡',
  '$2.50/hour',
  'Remote',
  true,
  true
FROM profiles LIMIT 1;

INSERT INTO rent_items (user_id, name, slug, tagline, description, category, status, icon_emoji, price_preview, location, approved, featured)
SELECT
  id,
  'Benchtop PCR Machine',
  'pcr-machine',
  'Remote biotech lab access',
  'Schedule time slots on a professional PCR thermal cycler. Upload protocols, receive results via API. For biotech research and synthetic biology projects.',
  'lab_equipment',
  'coming_soon',
  '🔬',
  '$200/session',
  'San Francisco, CA',
  true,
  true
FROM profiles LIMIT 1;

INSERT INTO rent_items (user_id, name, slug, tagline, description, category, status, icon_emoji, price_preview, location, approved, featured)
SELECT
  id,
  'Hardware Store Access',
  'hardware-store',
  'Same-day tool pickup',
  'Need a drill, saw, or specialty tool? Book same-day pickup from our hardware store. Perfect for one-off projects without buying equipment.',
  'stores',
  'coming_soon',
  '🔨',
  '$25/day',
  'Oakland, CA',
  true,
  false
FROM profiles LIMIT 1;

INSERT INTO rent_items (user_id, name, slug, tagline, description, category, status, icon_emoji, price_preview, location, approved, featured)
SELECT
  id,
  'Licensed Electrician',
  'electrician-services',
  'Certified electrical work',
  'Book a licensed electrician for commercial or residential projects. Available for consultations, installations, and emergency repairs.',
  'human_services',
  'coming_soon',
  '👷',
  '$85/hour',
  'Bay Area, CA',
  true,
  false
FROM profiles LIMIT 1;
