-- Discussion Feature Schema
-- Member community for posts, comments, reactions, and notifications

-- ============================================
-- ADD IS_ADMIN TO PROFILES
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- ============================================
-- DISCUSSION POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS discussion_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Content
  body TEXT NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  embedded_media JSONB DEFAULT '[]',

  -- Status
  is_pinned BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  hidden_reason TEXT,
  hidden_by UUID REFERENCES profiles(id),

  -- Denormalized counts
  comment_count INTEGER DEFAULT 0,
  reaction_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ
);

CREATE INDEX idx_discussion_posts_feed ON discussion_posts(is_hidden, is_pinned DESC, created_at DESC);
CREATE INDEX idx_discussion_posts_author ON discussion_posts(author_id);

-- ============================================
-- DISCUSSION COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS discussion_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES discussion_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES discussion_comments(id) ON DELETE CASCADE,

  -- Content
  body TEXT NOT NULL,
  image_urls TEXT[] DEFAULT '{}',

  -- Status
  is_hidden BOOLEAN DEFAULT FALSE,
  hidden_reason TEXT,
  hidden_by UUID REFERENCES profiles(id),

  -- Denormalized
  reply_count INTEGER DEFAULT 0,
  reaction_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ
);

CREATE INDEX idx_discussion_comments_post ON discussion_comments(post_id, created_at);
CREATE INDEX idx_discussion_comments_parent ON discussion_comments(parent_id);
CREATE INDEX idx_discussion_comments_author ON discussion_comments(author_id);

-- ============================================
-- DISCUSSION REACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS discussion_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES discussion_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES discussion_comments(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'like' CHECK (reaction_type IN ('like', 'heart', 'celebrate')),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Either post or comment, not both
  CONSTRAINT reaction_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Unique constraints (partial indexes for nullable columns)
CREATE UNIQUE INDEX idx_discussion_reactions_user_post
  ON discussion_reactions(user_id, post_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX idx_discussion_reactions_user_comment
  ON discussion_reactions(user_id, comment_id) WHERE comment_id IS NOT NULL;

CREATE INDEX idx_discussion_reactions_post ON discussion_reactions(post_id) WHERE post_id IS NOT NULL;
CREATE INDEX idx_discussion_reactions_comment ON discussion_reactions(comment_id) WHERE comment_id IS NOT NULL;

-- ============================================
-- DISCUSSION NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS discussion_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  type TEXT NOT NULL CHECK (type IN (
    'mention',
    'reply_to_post',
    'reply_to_comment',
    'reaction'
  )),

  actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES discussion_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES discussion_comments(id) ON DELETE CASCADE,

  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  preview_text TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_discussion_notifications_user ON discussion_notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_discussion_notifications_unread ON discussion_notifications(user_id, created_at DESC) WHERE is_read = FALSE;

-- ============================================
-- TRIGGERS FOR DENORMALIZED COUNTS
-- ============================================

-- Update post comment_count
CREATE OR REPLACE FUNCTION update_discussion_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE discussion_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE discussion_posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_discussion_post_comment_count
  AFTER INSERT OR DELETE ON discussion_comments
  FOR EACH ROW EXECUTE FUNCTION update_discussion_post_comment_count();

-- Update comment reply_count
CREATE OR REPLACE FUNCTION update_discussion_comment_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
    UPDATE discussion_comments SET reply_count = reply_count + 1 WHERE id = NEW.parent_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
    UPDATE discussion_comments SET reply_count = reply_count - 1 WHERE id = OLD.parent_id;
    RETURN OLD;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_discussion_comment_reply_count
  AFTER INSERT OR DELETE ON discussion_comments
  FOR EACH ROW EXECUTE FUNCTION update_discussion_comment_reply_count();

-- Update reaction counts
CREATE OR REPLACE FUNCTION update_discussion_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_id IS NOT NULL THEN
      UPDATE discussion_posts SET reaction_count = reaction_count + 1 WHERE id = NEW.post_id;
    ELSIF NEW.comment_id IS NOT NULL THEN
      UPDATE discussion_comments SET reaction_count = reaction_count + 1 WHERE id = NEW.comment_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      UPDATE discussion_posts SET reaction_count = reaction_count - 1 WHERE id = OLD.post_id;
    ELSIF OLD.comment_id IS NOT NULL THEN
      UPDATE discussion_comments SET reaction_count = reaction_count - 1 WHERE id = OLD.comment_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_discussion_reaction_count
  AFTER INSERT OR DELETE ON discussion_reactions
  FOR EACH ROW EXECUTE FUNCTION update_discussion_reaction_count();

-- Update updated_at timestamps
CREATE TRIGGER update_discussion_posts_updated_at
  BEFORE UPDATE ON discussion_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussion_comments_updated_at
  BEFORE UPDATE ON discussion_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE discussion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_notifications ENABLE ROW LEVEL SECURITY;

-- POSTS POLICIES
CREATE POLICY "View visible posts" ON discussion_posts FOR SELECT
  USING (
    is_hidden = FALSE
    OR author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Create own posts" ON discussion_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Update own posts or admin" ON discussion_posts FOR UPDATE
  USING (
    author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Delete own posts or admin" ON discussion_posts FOR DELETE
  USING (
    author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Service role full access posts" ON discussion_posts FOR ALL
  USING (auth.role() = 'service_role');

-- COMMENTS POLICIES
CREATE POLICY "View visible comments" ON discussion_comments FOR SELECT
  USING (
    is_hidden = FALSE
    OR author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Create own comments" ON discussion_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Update own comments or admin" ON discussion_comments FOR UPDATE
  USING (
    author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Delete own comments or admin" ON discussion_comments FOR DELETE
  USING (
    author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Service role full access comments" ON discussion_comments FOR ALL
  USING (auth.role() = 'service_role');

-- REACTIONS POLICIES
CREATE POLICY "View all reactions" ON discussion_reactions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Create own reactions" ON discussion_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Delete own reactions" ON discussion_reactions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access reactions" ON discussion_reactions FOR ALL
  USING (auth.role() = 'service_role');

-- NOTIFICATIONS POLICIES
CREATE POLICY "View own notifications" ON discussion_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Update own notifications" ON discussion_notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access notifications" ON discussion_notifications FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- STORAGE BUCKET FOR DISCUSSION UPLOADS
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'discussion-uploads',
  'discussion-uploads',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies
CREATE POLICY "Authenticated users can upload discussion images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'discussion-uploads');

CREATE POLICY "Public read access for discussion uploads"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'discussion-uploads');

CREATE POLICY "Users can delete own discussion uploads"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'discussion-uploads'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- STORAGE BUCKET FOR PROFILE AVATARS
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-avatars',
  'profile-avatars',
  true,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies for profile avatars
CREATE POLICY "Authenticated users can upload profile avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-avatars');

CREATE POLICY "Public read access for profile avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'profile-avatars');

CREATE POLICY "Users can update own profile avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'profile-avatars'
  AND (storage.foldername(name))[1] = 'avatars'
);

CREATE POLICY "Users can delete own profile avatar"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'profile-avatars'
  AND (storage.foldername(name))[1] = 'avatars'
);
