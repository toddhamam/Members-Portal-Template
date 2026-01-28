import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClientInstance } from '@/lib/supabase/server';
import type { MessageWithSender } from '@/lib/supabase/types';

const MESSAGES_PER_PAGE = 50;

/**
 * GET /api/messages/conversations/[id]
 *
 * Returns a conversation with its messages.
 *
 * Query params:
 * - limit: Messages per page (default 50, max 100)
 * - before: Cursor for pagination (message ID to load messages before)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || String(MESSAGES_PER_PAGE))));
    const before = searchParams.get('before'); // Message ID cursor

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

    // Get conversation details
    const { data: conversation, error: convError } = await adminSupabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get all participants with their profiles
    const { data: participants } = await adminSupabase
      .from('conversation_participants')
      .select(`
        user_id,
        is_admin,
        profiles!inner(
          id,
          full_name,
          avatar_url,
          is_admin
        )
      `)
      .eq('conversation_id', conversationId);

    interface ParticipantRecord {
      user_id: string;
      is_admin: boolean;
      profiles: {
        id: string;
        full_name: string | null;
        avatar_url: string | null;
        is_admin: boolean;
      };
    }

    const participantList = (participants || []).map((p: ParticipantRecord) => {
      const profile = p.profiles;
      return {
        id: profile.id,
        name: profile.full_name,
        avatarUrl: profile.avatar_url,
        isAdmin: profile.is_admin,
      };
    });

    // Build messages query
    let messagesQuery = adminSupabase
      .from('direct_messages')
      .select(`
        *,
        sender:profiles!direct_messages_sender_id_fkey(
          id,
          full_name,
          avatar_url,
          is_admin
        )
      `)
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit + 1); // Fetch one extra to check if there are more

    // Apply cursor if provided
    if (before) {
      // Get the timestamp of the cursor message
      const { data: cursorMessage } = await adminSupabase
        .from('direct_messages')
        .select('created_at')
        .eq('id', before)
        .single();

      if (cursorMessage) {
        messagesQuery = messagesQuery.lt('created_at', cursorMessage.created_at);
      }
    }

    const { data: messages, error: messagesError } = await messagesQuery;

    if (messagesError) {
      console.error('[Messages API] Error fetching messages:', messagesError);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    // Check if there are more messages
    const hasMore = messages && messages.length > limit;
    const messagesToReturn = messages?.slice(0, limit) || [];

    interface MessageRecord {
      id: string;
      conversation_id: string;
      sender_id: string;
      content: string;
      created_at: string;
      updated_at: string;
      is_edited: boolean;
      is_deleted: boolean;
      sender: {
        id: string;
        full_name: string | null;
        avatar_url: string | null;
        is_admin: boolean;
      };
    }

    // Transform messages to include sender info
    const formattedMessages: MessageWithSender[] = messagesToReturn.map((m: MessageRecord) => {
      const sender = m.sender;
      return {
        id: m.id,
        conversation_id: m.conversation_id,
        sender_id: m.sender_id,
        content: m.content,
        created_at: m.created_at,
        updated_at: m.updated_at,
        is_edited: m.is_edited,
        is_deleted: m.is_deleted,
        sender: {
          id: sender.id,
          name: sender.full_name,
          avatarUrl: sender.avatar_url,
          isAdmin: sender.is_admin,
        },
      };
    });

    // Reverse to show oldest first (for display)
    formattedMessages.reverse();

    // Get the cursor for the next page
    const nextCursor = hasMore && messagesToReturn.length > 0
      ? messagesToReturn[messagesToReturn.length - 1].id
      : null;

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        participants: participantList,
      },
      messages: formattedMessages,
      pagination: {
        hasMore,
        nextCursor,
      },
    });
  } catch (error) {
    console.error('[Messages API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
