-- Admin Analytics Migration
-- Adds purchase source tracking and performance indexes for admin dashboard

-- ============================================
-- PURCHASE SOURCE TRACKING
-- Track where purchases originated (funnel vs portal)
-- ============================================

-- Add purchase_source column to track origin
ALTER TABLE user_purchases
ADD COLUMN IF NOT EXISTS purchase_source TEXT
DEFAULT 'funnel'
CHECK (purchase_source IN ('funnel', 'portal'));

-- Create index for filtering by source
CREATE INDEX IF NOT EXISTS idx_user_purchases_source
ON user_purchases(purchase_source);

-- Backfill existing data:
-- Portal purchases typically have only payment_intent_id (no checkout_session_id)
-- because portal uses Stripe Elements directly
UPDATE user_purchases
SET purchase_source = 'portal'
WHERE stripe_checkout_session_id IS NULL
  AND stripe_payment_intent_id IS NOT NULL
  AND purchase_source = 'funnel';

-- ============================================
-- PERFORMANCE INDEXES FOR ADMIN QUERIES
-- ============================================

-- Index for sorting/filtering members by join date
CREATE INDEX IF NOT EXISTS idx_profiles_created_at
ON profiles(created_at DESC);

-- Index for aggregating community posts by author
CREATE INDEX IF NOT EXISTS idx_discussion_posts_author_created
ON discussion_posts(author_id, created_at);

-- Index for aggregating community comments by author
CREATE INDEX IF NOT EXISTS idx_discussion_comments_author_created
ON discussion_comments(author_id, created_at);

-- Composite index for member LTV calculations (user + status for active purchases)
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_status
ON user_purchases(user_id, status);

-- ============================================
-- RLS POLICIES FOR ADMIN ACCESS
-- Allow admins to read all user_purchases for analytics
-- ============================================

-- Policy for admins to view all purchases (for analytics)
CREATE POLICY "Admins can view all purchases"
  ON user_purchases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

-- Policy for admins to view all profiles (for member list)
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS admin_check
      WHERE admin_check.id = auth.uid()
      AND admin_check.is_admin = TRUE
    )
  );

-- Policy for admins to view all lesson progress (for member analytics)
CREATE POLICY "Admins can view all lesson progress"
  ON lesson_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );
