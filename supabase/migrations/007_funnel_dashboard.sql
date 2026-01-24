-- ============================================
-- FUNNEL DASHBOARD: Event Tracking Table
-- ============================================
--
-- Tracks all funnel events (page views, purchases, upsell decisions)
-- for the metrics dashboard. Uses cookie-based visitor/session IDs
-- for accurate attribution.
--

CREATE TABLE IF NOT EXISTS funnel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity (cookie-based for accuracy)
  visitor_id text NOT NULL,           -- 1-year cookie, unique visitors across sessions
  funnel_session_id text NOT NULL,    -- 30-min cookie, single funnel journey
  session_id text,                    -- Stripe checkout session ID (when available)

  -- Event data
  event_type text NOT NULL,           -- page_view, purchase, upsell_accept, etc.
  funnel_step text NOT NULL,          -- landing, checkout, upsell-1, downsell-1, etc.

  -- A/B tracking (stored in cookie, recorded here for attribution)
  variant text,                       -- 'control', 'variant-b', null if no test

  -- Revenue (for purchase events)
  revenue_cents integer DEFAULT 0,
  product_slug text,

  -- Request context
  ip_hash text,                       -- Hashed for privacy
  user_agent text,

  -- Timestamp
  created_at timestamptz DEFAULT now(),

  -- Validate event types
  CONSTRAINT valid_event_type CHECK (event_type IN (
    'page_view',
    'purchase',
    'upsell_accept',
    'upsell_decline',
    'downsell_accept',
    'downsell_decline'
  )),

  -- Validate funnel steps
  CONSTRAINT valid_funnel_step CHECK (funnel_step IN (
    'landing',
    'checkout',
    'upsell-1',
    'downsell-1',
    'upsell-2',
    'thank-you'
  ))
);

-- ============================================
-- INDEXES
-- ============================================
-- Optimized for dashboard queries (date ranges, step filtering, aggregations)

-- Primary query pattern: filter by date range
CREATE INDEX idx_funnel_events_created_at ON funnel_events(created_at);

-- Group by step for funnel breakdown
CREATE INDEX idx_funnel_events_step ON funnel_events(funnel_step);

-- Filter by event type (page_view vs purchase)
CREATE INDEX idx_funnel_events_type ON funnel_events(event_type);

-- Unique visitor counting
CREATE INDEX idx_funnel_events_visitor ON funnel_events(visitor_id);

-- Session-level analysis
CREATE INDEX idx_funnel_events_session ON funnel_events(funnel_session_id);

-- A/B test analysis (partial index - only events with variants)
CREATE INDEX idx_funnel_events_variant ON funnel_events(variant)
  WHERE variant IS NOT NULL;

-- Composite index for common dashboard query pattern
CREATE INDEX idx_funnel_events_dashboard ON funnel_events(created_at, funnel_step, event_type);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;

-- Service role (API routes) can insert events
-- Note: Service role bypasses RLS, but we define this for clarity
CREATE POLICY "Service role can insert events" ON funnel_events
  FOR INSERT
  WITH CHECK (true);

-- Authenticated users (dashboard) can read all events
CREATE POLICY "Authenticated users can read events" ON funnel_events
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE funnel_events IS 'Tracks all funnel page views, purchases, and upsell decisions for the metrics dashboard';
COMMENT ON COLUMN funnel_events.visitor_id IS 'Persistent visitor ID from 1-year cookie for unique visitor tracking';
COMMENT ON COLUMN funnel_events.funnel_session_id IS 'Session ID from 30-min cookie for journey tracking';
COMMENT ON COLUMN funnel_events.session_id IS 'Stripe checkout session ID, available after checkout starts';
COMMENT ON COLUMN funnel_events.variant IS 'A/B test variant assigned to this visitor for this step';
COMMENT ON COLUMN funnel_events.revenue_cents IS 'Revenue in cents, only set for purchase events';
