-- Lesson Resources Table
-- Stores downloadable resources/attachments for each lesson

CREATE TABLE IF NOT EXISTS lesson_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('pdf', 'worksheet', 'checklist', 'audio', 'video', 'link', 'other')),
  file_url TEXT, -- For uploaded files (Supabase Storage or Bunny)
  external_url TEXT, -- For external links
  file_size_bytes INTEGER,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_resources_lesson ON lesson_resources(lesson_id);

ALTER TABLE lesson_resources ENABLE ROW LEVEL SECURITY;

-- Anyone can view published resources (content access is controlled at lesson level)
CREATE POLICY "Anyone can view published resources"
  ON lesson_resources FOR SELECT
  USING (is_published = true);

CREATE POLICY "Service role full access to lesson_resources"
  ON lesson_resources FOR ALL
  USING (auth.role() = 'service_role');
