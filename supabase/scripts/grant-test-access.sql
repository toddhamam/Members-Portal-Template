-- Grant product access to test user: todd.hamam@gmail.com
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/dlwlenettjrarpewwgsn/sql

-- First, check if user exists in auth.users and profiles
DO $$
DECLARE
    v_user_id uuid;
    v_email text := 'todd.hamam@gmail.com';
BEGIN
    -- Try to get existing user from profiles
    SELECT id INTO v_user_id FROM profiles WHERE email = v_email;

    IF v_user_id IS NULL THEN
        -- Check auth.users directly
        SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
    END IF;

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'User % not found. Creating user via admin auth...', v_email;
        -- Note: For auth user creation, you need to use the Supabase dashboard or SDK
        -- This script will fail if user doesn't exist - create account first via portal
        RAISE EXCEPTION 'User not found. Please create account via /portal/signup first, then re-run this script.';
    END IF;

    RAISE NOTICE 'Found user: %', v_user_id;

    -- Grant access to all products
    INSERT INTO user_purchases (user_id, product_id, status, purchased_at)
    SELECT
        v_user_id,
        p.id,
        'active',
        now()
    FROM products p
    WHERE NOT EXISTS (
        SELECT 1 FROM user_purchases up
        WHERE up.user_id = v_user_id AND up.product_id = p.id
    )
    ON CONFLICT (user_id, product_id) DO UPDATE SET status = 'active';

    RAISE NOTICE 'Granted access to all products for user %', v_email;
END $$;

-- Verify the grants
SELECT
    p.name as product_name,
    p.product_type,
    up.status,
    up.purchased_at
FROM user_purchases up
JOIN products p ON p.id = up.product_id
JOIN profiles pr ON pr.id = up.user_id
WHERE pr.email = 'todd.hamam@gmail.com'
ORDER BY p.sort_order;
