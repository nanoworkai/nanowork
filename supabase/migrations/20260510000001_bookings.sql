-- ============================================================================
-- RENT BOOKINGS
-- Booking and payment system for physical resources
-- ============================================================================

-- ============================================================================
-- BOOKINGS TABLE
-- Track reservations of physical resources
-- ============================================================================

CREATE TABLE IF NOT EXISTS rent_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  item_id UUID NOT NULL REFERENCES rent_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Timing
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_hours NUMERIC NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',       -- Payment processing
    'confirmed',     -- Paid and confirmed
    'active',        -- Currently in use
    'completed',     -- Finished successfully
    'cancelled',     -- Cancelled by user
    'failed'         -- Failed/no-show
  )),

  -- Payment
  stripe_payment_intent_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending',
    'succeeded',
    'failed',
    'refunded'
  )),

  -- Access credentials (encrypted)
  access_credentials JSONB,
  access_url TEXT,

  -- Metadata
  notes TEXT,
  special_requests TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX idx_bookings_item_id ON rent_bookings(item_id);
CREATE INDEX idx_bookings_user_id ON rent_bookings(user_id);
CREATE INDEX idx_bookings_status ON rent_bookings(status);
CREATE INDEX idx_bookings_start_time ON rent_bookings(start_time);
CREATE INDEX idx_bookings_payment_intent ON rent_bookings(stripe_payment_intent_id);

-- RLS Policies
ALTER TABLE rent_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON rent_bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
  ON rent_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending bookings"
  ON rent_bookings FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Resource owners can view bookings for their items"
  ON rent_bookings FOR SELECT
  USING (
    item_id IN (
      SELECT id FROM rent_items WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- AVAILABILITY SLOTS
-- Pre-defined or dynamic availability windows
-- ============================================================================

CREATE TABLE IF NOT EXISTS rent_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference
  item_id UUID NOT NULL REFERENCES rent_items(id) ON DELETE CASCADE,

  -- Time window
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,

  -- Capacity (how many concurrent bookings allowed)
  max_concurrent INTEGER DEFAULT 1,
  current_bookings INTEGER DEFAULT 0,

  -- Pricing (can vary by time slot)
  price_cents INTEGER,
  price_formula TEXT, -- e.g., "base_price * duration_hours"

  -- Status
  available BOOLEAN DEFAULT true,
  unavailable_reason TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_availability_item_id ON rent_availability(item_id);
CREATE INDEX idx_availability_time_range ON rent_availability(start_time, end_time);
CREATE INDEX idx_availability_available ON rent_availability(available);

-- RLS
ALTER TABLE rent_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view availability"
  ON rent_availability FOR SELECT
  USING (true);

CREATE POLICY "Resource owners can manage availability"
  ON rent_availability FOR ALL
  USING (
    item_id IN (
      SELECT id FROM rent_items WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- BOOKING REVIEWS
-- User reviews after booking completion
-- ============================================================================

CREATE TABLE IF NOT EXISTS rent_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  booking_id UUID NOT NULL UNIQUE REFERENCES rent_bookings(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES rent_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Review
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,

  -- Response from owner
  owner_response TEXT,
  owner_response_at TIMESTAMPTZ,

  -- Metadata
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_item_id ON rent_reviews(item_id);
CREATE INDEX idx_reviews_user_id ON rent_reviews(user_id);
CREATE INDEX idx_reviews_rating ON rent_reviews(rating);

-- RLS
ALTER TABLE rent_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON rent_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for their bookings"
  ON rent_reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    booking_id IN (
      SELECT id FROM rent_bookings WHERE user_id = auth.uid() AND status = 'completed'
    )
  );

CREATE POLICY "Users can update own reviews"
  ON rent_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Resource owners can respond to reviews"
  ON rent_reviews FOR UPDATE
  USING (
    item_id IN (
      SELECT id FROM rent_items WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTIONS
-- Helper functions for booking management
-- ============================================================================

-- Check if a time slot is available
CREATE OR REPLACE FUNCTION check_availability(
  p_item_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO conflict_count
  FROM rent_bookings
  WHERE item_id = p_item_id
    AND status IN ('confirmed', 'active')
    AND (
      (start_time <= p_start_time AND end_time > p_start_time) OR
      (start_time < p_end_time AND end_time >= p_end_time) OR
      (start_time >= p_start_time AND end_time <= p_end_time)
    );

  RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Update booking status based on time
CREATE OR REPLACE FUNCTION update_booking_statuses()
RETURNS void AS $$
BEGIN
  -- Mark confirmed bookings as active when they start
  UPDATE rent_bookings
  SET status = 'active',
      started_at = NOW()
  WHERE status = 'confirmed'
    AND start_time <= NOW()
    AND end_time > NOW();

  -- Mark active bookings as completed when they end
  UPDATE rent_bookings
  SET status = 'completed',
      completed_at = NOW()
  WHERE status = 'active'
    AND end_time <= NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- Automatic status updates
-- ============================================================================

CREATE OR REPLACE FUNCTION update_rent_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rent_bookings_updated_at
  BEFORE UPDATE ON rent_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_rent_bookings_updated_at();

CREATE TRIGGER rent_availability_updated_at
  BEFORE UPDATE ON rent_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_rent_bookings_updated_at();

CREATE TRIGGER rent_reviews_updated_at
  BEFORE UPDATE ON rent_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_rent_bookings_updated_at();
