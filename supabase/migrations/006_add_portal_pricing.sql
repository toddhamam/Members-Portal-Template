-- Add portal-specific pricing columns to products table
-- Portal pricing can differ from funnel pricing

-- Add portal price column (separate from funnel pricing)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS portal_price_cents INTEGER;

-- Add portal-specific Stripe Price ID (separate from funnel Stripe price)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS portal_stripe_price_id TEXT;

-- Add comment explaining the pricing model
COMMENT ON COLUMN products.portal_price_cents IS 'Price in cents for portal purchases. If NULL, falls back to price_cents.';
COMMENT ON COLUMN products.portal_stripe_price_id IS 'Stripe Price ID for portal purchases. Different from funnel pricing.';

-- Update existing products with portal pricing (example values - adjust as needed)
-- These can be updated via admin or Supabase dashboard later
UPDATE products SET portal_price_cents = price_cents WHERE portal_price_cents IS NULL;
