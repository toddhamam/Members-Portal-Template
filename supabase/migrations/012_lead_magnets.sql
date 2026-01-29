-- Migration: Add lead magnet support for free membership tier
-- This allows certain products to be accessible to all authenticated users,
-- enabling a free tier that can access lead magnets but not paid products.

-- Add is_lead_magnet flag to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_lead_magnet BOOLEAN DEFAULT false;

-- Add comment explaining the column
COMMENT ON COLUMN products.is_lead_magnet IS 'If true, this product is accessible to all authenticated users (free tier)';

-- Create partial index for efficient filtering of lead magnet products
CREATE INDEX IF NOT EXISTS idx_products_is_lead_magnet ON products(is_lead_magnet) WHERE is_lead_magnet = true;
