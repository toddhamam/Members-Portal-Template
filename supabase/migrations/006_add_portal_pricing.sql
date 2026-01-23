-- Add portal-specific pricing column to products table
-- Portal pricing can differ from funnel pricing

-- Add portal price column (separate from funnel pricing)
-- Note: This column may already exist if previously added via Supabase dashboard
ALTER TABLE products
ADD COLUMN IF NOT EXISTS portal_price_cents INTEGER;

-- Add comment explaining the pricing model
COMMENT ON COLUMN products.portal_price_cents IS 'Price in cents for portal purchases. If NULL, falls back to price_cents.';
