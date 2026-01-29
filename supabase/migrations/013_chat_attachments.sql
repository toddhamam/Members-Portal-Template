-- Chat Attachments Migration
-- Adds support for file attachments in direct messages

-- ============================================
-- ADD ATTACHMENT COLUMNS TO DIRECT_MESSAGES
-- ============================================
ALTER TABLE direct_messages
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT, -- 'image', 'video', 'document'
ADD COLUMN IF NOT EXISTS attachment_name TEXT,
ADD COLUMN IF NOT EXISTS attachment_size_bytes INTEGER;

-- Index for finding messages with attachments
CREATE INDEX IF NOT EXISTS idx_direct_messages_with_attachments
ON direct_messages(conversation_id, created_at DESC)
WHERE attachment_url IS NOT NULL;

-- ============================================
-- CREATE CHAT ATTACHMENTS STORAGE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-attachments',
  'chat-attachments',
  false, -- Not public - requires signed URLs
  26214400, -- 25MB max file size
  ARRAY[
    'image/png', 'image/jpeg', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/quicktime',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- STORAGE POLICIES FOR CHAT ATTACHMENTS
-- ============================================

-- Users can upload attachments to their own conversations
CREATE POLICY "Users can upload chat attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view attachments in their conversations
CREATE POLICY "Users can view chat attachments in their conversations"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-attachments'
  AND EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.user_id = auth.uid()
    AND cp.conversation_id::text = (storage.foldername(name))[2]
  )
);

-- Service role full access
CREATE POLICY "Service role full access chat attachments"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'chat-attachments')
WITH CHECK (bucket_id = 'chat-attachments');

-- ============================================
-- UPDATE TRIGGER TO HANDLE ATTACHMENTS
-- ============================================
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update conversation metadata
  UPDATE conversations
  SET
    last_message_at = NEW.created_at,
    last_message_preview = CASE
      WHEN NEW.attachment_url IS NOT NULL THEN
        CASE NEW.attachment_type
          WHEN 'image' THEN '📷 Image'
          WHEN 'video' THEN '🎥 Video'
          WHEN 'document' THEN '📄 ' || COALESCE(NEW.attachment_name, 'Document')
          ELSE '📎 Attachment'
        END
      ELSE LEFT(NEW.content, 100)
    END,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;

  -- Increment unread count for other participants
  UPDATE conversation_participants
  SET unread_count = unread_count + 1
  WHERE conversation_id = NEW.conversation_id AND user_id != NEW.sender_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
