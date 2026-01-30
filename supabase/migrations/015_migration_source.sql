-- Migration: Add 'migration' as valid purchase_source
-- This allows tracking members imported from other platforms

-- Drop and recreate the constraint to add 'migration' as a valid option
ALTER TABLE user_purchases
DROP CONSTRAINT IF EXISTS user_purchases_purchase_source_check;

ALTER TABLE user_purchases
ADD CONSTRAINT user_purchases_purchase_source_check
CHECK (purchase_source IN ('funnel', 'portal', 'migration'));
