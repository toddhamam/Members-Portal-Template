-- Create storage bucket for premium content
-- Run this migration to set up secure content delivery

-- Create the premium-content bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'premium-content',
  'premium-content',
  false, -- Not public - requires signed URLs
  52428800, -- 50MB max file size
  ARRAY['application/pdf', 'audio/mpeg', 'audio/wav', 'audio/mp4', 'video/mp4', 'video/webm', 'image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage folder structure:
-- premium-content/
--   resistance-mapping-guide/
--     getting-started/
--       welcome.mp4
--       how-to-use.mp4
--       the-guide.pdf
--     the-five-phases/
--       phase-1-recognition.mp4
--       ...
--     guided-practices/
--       quick-run.mp3
--       deep-run.mp3
--     worksheets-trackers/
--       mapping-worksheet.pdf
--       progress-tracker.pdf
--       pattern-journal.pdf
--   pathless-path/
--     ...
--   nervous-system-reset/
--     ...
--   golden-thread-technique/
--     ...

-- RLS Policies for premium-content bucket
-- Users can only access content for products they've purchased

-- Policy: Allow authenticated users to read files for products they own
CREATE POLICY "Users can read content they've purchased"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'premium-content'
  AND EXISTS (
    SELECT 1
    FROM user_purchases up
    JOIN products p ON p.id = up.product_id
    WHERE up.user_id = auth.uid()
      AND up.status = 'active'
      AND storage.objects.name LIKE p.slug || '/%'
  )
);

-- Policy: Allow service role full access (for uploading content)
CREATE POLICY "Service role has full access to premium content"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'premium-content')
WITH CHECK (bucket_id = 'premium-content');

-- Note: To upload content, use Supabase Dashboard Storage UI or CLI:
-- supabase storage cp ./local-file.pdf premium-content/resistance-mapping-guide/getting-started/the-guide.pdf
