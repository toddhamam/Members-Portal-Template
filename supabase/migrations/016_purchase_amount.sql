-- Migration: Add price_paid_cents to user_purchases
-- Tracks the actual amount paid for migrated purchases and LTV calculations

ALTER TABLE user_purchases
ADD COLUMN IF NOT EXISTS price_paid_cents INTEGER;

COMMENT ON COLUMN user_purchases.price_paid_cents IS 'Actual amount paid in cents. Used for LTV calculations on migrated purchases.';

-- Index for LTV aggregation queries
CREATE INDEX IF NOT EXISTS idx_user_purchases_price_paid
ON user_purchases(user_id, price_paid_cents)
WHERE price_paid_cents IS NOT NULL;
