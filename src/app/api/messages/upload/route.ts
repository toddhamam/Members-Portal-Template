import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClientInstance } from '@/lib/supabase/server';
import type { AttachmentType } from '@/lib/supabase/types';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

const ALLOWED_TYPES: Record<string, AttachmentType> = {
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/quicktime': 'video',
  'application/pdf': 'document',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'application/vnd.ms-excel': 'document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'document',
  'text/plain': 'document',
  'text/csv': 'document',
};

/**
 * POST /api/messages/upload
 *
 * Uploads a file attachment for a chat message.
 * Returns the storage path and signed URL.
 *
 * Body: FormData with:
 * - file: File
 * - conversationId: string
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const conversationId = formData.get('conversationId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }

    // Validate file type
    const attachmentType = ALLOWED_TYPES[file.type];
    if (!attachmentType) {
      return NextResponse.json({
        error: 'File type not allowed',
        allowedTypes: Object.keys(ALLOWED_TYPES),
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: 'File too large',
        maxSize: MAX_FILE_SIZE,
        maxSizeMB: MAX_FILE_SIZE / (1024 * 1024),
      }, { status: 400 });
    }

    const adminSupabase = createAdminClientInstance();

    // Verify user is a participant in the conversation
    const { data: participant, error: participantError } = await adminSupabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      return NextResponse.json({ error: 'Not a participant in this conversation' }, { status: 403 });
    }

    // Generate unique filename with original extension
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || 'bin';
    const filename = `${timestamp}-${randomId}.${extension}`;

    // Storage path: {userId}/{conversationId}/{filename}
    const storagePath = `${user.id}/${conversationId}/${filename}`;

    // Convert File to ArrayBuffer then to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Upload to storage
    const { error: uploadError } = await adminSupabase.storage
      .from('chat-attachments')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[Upload API] Storage upload failed:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Generate signed URL (valid for 1 year)
    const { data: signedUrlData, error: signedUrlError } = await adminSupabase.storage
      .from('chat-attachments')
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365); // 1 year

    if (signedUrlError) {
      console.error('[Upload API] Failed to create signed URL:', signedUrlError);
      return NextResponse.json({ error: 'Failed to create access URL' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      attachment: {
        url: signedUrlData.signedUrl,
        type: attachmentType,
        name: file.name,
        size: file.size,
        storagePath,
      },
    });
  } catch (error) {
    console.error('[Upload API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
