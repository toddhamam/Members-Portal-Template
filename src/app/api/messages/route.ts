import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClientInstance } from '@/lib/supabase/server';

/**
 * POST /api/messages
 *
 * Send a message in a conversation.
 *
 * Body:
 * - conversationId: UUID of the conversation (required)
 * - content: Message content (required)
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
    const { conversationId, content } = body;

    // Validate required fields
    if (!conversationId || typeof conversationId !== 'string') {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    if (content.length > 5000) {
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
    const { data: message, error: messageError } = await adminSupabase
      .from('direct_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
      })
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
