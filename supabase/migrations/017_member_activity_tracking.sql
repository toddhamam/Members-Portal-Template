-- Member Activity Tracking
-- Adds last_active_at column to profiles for tracking member engagement

-- Add last_active_at column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- Create index for efficient activity queries (filtering by active/at-risk/dormant)
CREATE INDEX IF NOT EXISTS idx_profiles_last_active_at
ON profiles(last_active_at)
WHERE last_active_at IS NOT NULL;

-- Backfill existing users with activity data from their most recent actions
-- Priority: lesson_progress > discussion_posts > discussion_comments > created_at
UPDATE profiles p
SET last_active_at = COALESCE(
  (SELECT MAX(updated_at) FROM lesson_progress WHERE user_id = p.id),
  (SELECT MAX(created_at) FROM discussion_posts WHERE author_id = p.id),
  (SELECT MAX(created_at) FROM discussion_comments WHERE author_id = p.id),
  p.created_at
)
WHERE last_active_at IS NULL;
