-- ============================================
-- FIX PROFILE VISIBILITY FOR COMMUNITY
-- ============================================
-- Issue: Regular members can't see other users' profile info (name, avatar)
-- when viewing discussion posts, comments, or messages.
--
-- Current policies only allow:
-- 1. Users to view their own profile
-- 2. Admins to view all profiles
--
-- Solution: Allow all authenticated users to view any profile's
-- public display info (needed for community features).
-- ============================================

-- Add policy allowing authenticated users to view all profiles
-- This enables seeing author names/avatars on posts, comments, messages
CREATE POLICY "Authenticated users can view all profiles"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Note: This is safe because:
-- 1. Users must be authenticated (logged in) to see profiles
-- 2. The profiles table only contains display info (name, avatar, etc.)
-- 3. Sensitive data like passwords is handled by Supabase Auth, not this table
-- 4. Users still can only UPDATE their own profile (existing policy)
