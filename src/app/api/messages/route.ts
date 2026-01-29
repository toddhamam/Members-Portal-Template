import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClientInstance } from '@/lib/supabase/server';
import type { AttachmentType } from '@/lib/supabase/types';

interface AttachmentInput {
  url: string;
  type: AttachmentType;
  name: string;
  size: number;
}

/**
 * POST /api/messages
 *
 * Send a message in a conversation.
 *
 * Body:
 * - conversationId: UUID of the conversation (required)
 * - content: Message content (required, or can be empty if attachment provided)
 * - attachment: Optional attachment object { url, type, name, size }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { conversationId, content, attachment } = body as {
      conversationId: string;
      content: string;
      attachment?: AttachmentInput;
    };

    // Validate required fields
    if (!conversationId || typeof conversationId !== 'string') {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }

    // Content is required unless there's an attachment
    const hasContent = content && typeof content === 'string' && content.trim().length > 0;
    const hasAttachment = attachment && attachment.url && attachment.type;

    if (!hasContent && !hasAttachment) {
      return NextResponse.json({ error: 'content or attachment is required' }, { status: 400 });
    }

    if (hasContent && content.length > 5000) {
      return NextResponse.json({ error: 'Message is too long (max 5000 characters)' }, { status: 400 });
    }

    const adminSupabase = createAdminClientInstance();

    // Verify user is a participant in this conversation
    const { data: participation } = await adminSupabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (!participation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get user's profile for sender info
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('id, full_name, avatar_url, is_admin')
      .eq('id', user.id)
      .single();

    // Create the message
    const messageData: {
      conversation_id: string;
      sender_id: string;
      content: string;
      attachment_url?: string;
      attachment_type?: string;
      attachment_name?: string;
      attachment_size_bytes?: number;
    } = {
      conversation_id: conversationId,
      sender_id: user.id,
      content: hasContent ? content.trim() : '',
    };

    // Add attachment fields if present
    if (hasAttachment && attachment) {
      messageData.attachment_url = attachment.url;
      messageData.attachment_type = attachment.type;
      messageData.attachment_name = attachment.name;
      messageData.attachment_size_bytes = attachment.size;
    }

    const { data: message, error: messageError } = await adminSupabase
      .from('direct_messages')
      .insert(messageData)
      .select()
      .single();

    if (messageError || !message) {
      console.error('[Messages API] Error creating message:', messageError);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    // Return the message with sender info
    return NextResponse.json({
      message: {
        id: message.id,
        conversation_id: message.conversation_id,
        sender_id: message.sender_id,
        content: message.content,
        created_at: message.created_at,
        updated_at: message.updated_at,
        is_edited: message.is_edited,
        is_deleted: message.is_deleted,
        attachment_url: message.attachment_url || null,
        attachment_type: message.attachment_type || null,
        attachment_name: message.attachment_name || null,
        attachment_size_bytes: message.attachment_size_bytes || null,
        sender: {
          id: profile?.id || user.id,
          name: profile?.full_name || null,
          avatarUrl: profile?.avatar_url || null,
          isAdmin: profile?.is_admin || false,
        },
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[Messages API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
