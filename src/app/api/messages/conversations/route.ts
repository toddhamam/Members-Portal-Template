import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClientInstance } from '@/lib/supabase/server';
import type { ConversationWithParticipant } from '@/lib/supabase/types';

const CONVERSATIONS_PER_PAGE = 20;

/**
 * GET /api/messages/conversations
 *
 * Returns the user's conversations with the other participant's info.
 *
 * Query params:
 * - page: Page number (default 1)
 * - limit: Conversations per page (default 20, max 50)
 * - search: Search term for filtering by participant name
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || String(CONVERSATIONS_PER_PAGE))));
    const search = searchParams.get('search')?.trim() || '';
    const offset = (page - 1) * limit;

    const adminSupabase = createAdminClientInstance();

    // Get user's conversations with participant info
    // We need to join multiple tables to get the "other" participant
    const { data: participantRecords, error: participantError } = await adminSupabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        unread_count,
        conversations!inner(
          id,
          last_message_at,
          last_message_preview,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('conversations(last_message_at)', { ascending: false, nullsFirst: false });

    if (participantError) {
      console.error('[Messages API] Error fetching participant records:', participantError);
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }

    if (!participantRecords || participantRecords.length === 0) {
      return NextResponse.json({
        conversations: [],
        pagination: { page, limit, total: 0, hasMore: false },
      });
    }

    interface ParticipantRecord {
      conversation_id: string;
      unread_count: number;
      conversations: {
        id: string;
        last_message_at: string | null;
        last_message_preview: string | null;
        created_at: string;
      };
    }

    // Get conversation IDs
    const conversationIds = (participantRecords as ParticipantRecord[]).map((p) => p.conversation_id);

    // Get all other participants for these conversations
    const { data: otherParticipants, error: otherError } = await adminSupabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        is_admin,
        profiles!inner(
          id,
          full_name,
          avatar_url,
          is_admin
        )
      `)
      .in('conversation_id', conversationIds)
      .neq('user_id', user.id);

    if (otherError) {
      console.error('[Messages API] Error fetching other participants:', otherError);
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }

    // Create a map of conversation_id -> other participant
    const otherParticipantMap = new Map<string, {
      id: string;
      name: string | null;
      avatarUrl: string | null;
      isAdmin: boolean;
    }>();

    for (const op of otherParticipants || []) {
      const profile = op.profiles as { id: string; full_name: string | null; avatar_url: string | null; is_admin: boolean };
      otherParticipantMap.set(op.conversation_id, {
        id: profile.id,
        name: profile.full_name,
        avatarUrl: profile.avatar_url,
        isAdmin: profile.is_admin,
      });
    }

    // Build the conversation list
    let conversations: ConversationWithParticipant[] = (participantRecords as ParticipantRecord[]).map((pr) => {
      const conv = pr.conversations;
      const other = otherParticipantMap.get(pr.conversation_id);

      return {
        id: conv.id,
        created_at: conv.created_at,
        updated_at: conv.created_at,
        last_message_at: conv.last_message_at,
        last_message_preview: conv.last_message_preview,
        otherParticipant: other || {
          id: '',
          name: 'Unknown',
          avatarUrl: null,
          isAdmin: false,
        },
        unreadCount: pr.unread_count,
      };
    });

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      conversations = conversations.filter((c) =>
        c.otherParticipant.name?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by last_message_at (most recent first)
    conversations.sort((a, b) => {
      const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return bTime - aTime;
    });

    // Apply pagination
    const total = conversations.length;
    const paginatedConversations = conversations.slice(offset, offset + limit);

    return NextResponse.json({
      conversations: paginatedConversations,
      pagination: {
        page,
        limit,
        total,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('[Messages API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/messages/conversations
 *
 * Create a new conversation (admin only).
 * If a conversation already exists between admin and member, returns the existing one.
 *
 * Body:
 * - memberId: UUID of the member to start conversation with (required)
 * - initialMessage: Optional first message to send
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Only admins can start conversations' }, { status: 403 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { memberId, initialMessage } = body;

    if (!memberId || typeof memberId !== 'string') {
      return NextResponse.json({ error: 'memberId is required' }, { status: 400 });
    }

    const adminSupabase = createAdminClientInstance();

    // Check if member exists
    const { data: member } = await adminSupabase
      .from('profiles')
      .select('id, full_name, avatar_url, is_admin')
      .eq('id', memberId)
      .single();

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Check if conversation already exists between these two users
    const { data: existingConversations } = await adminSupabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);

    if (existingConversations && existingConversations.length > 0) {
      const conversationIds = existingConversations.map((c: { conversation_id: string }) => c.conversation_id);

      const { data: memberParticipation } = await adminSupabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', memberId)
        .in('conversation_id', conversationIds);

      if (memberParticipation && memberParticipation.length > 0) {
        // Conversation already exists, return it
        const existingConvId = memberParticipation[0].conversation_id;

        // Get full conversation data
        const { data: existingConv } = await adminSupabase
          .from('conversations')
          .select('*')
          .eq('id', existingConvId)
          .single();

        return NextResponse.json({
          conversation: {
            id: existingConv?.id,
            created_at: existingConv?.created_at,
            updated_at: existingConv?.updated_at,
            last_message_at: existingConv?.last_message_at,
            last_message_preview: existingConv?.last_message_preview,
            otherParticipant: {
              id: member.id,
              name: member.full_name,
              avatarUrl: member.avatar_url,
              isAdmin: member.is_admin,
            },
            unreadCount: 0,
          },
          isExisting: true,
        });
      }
    }

    // Create new conversation
    const { data: newConversation, error: convError } = await adminSupabase
      .from('conversations')
      .insert({})
      .select()
      .single();

    if (convError || !newConversation) {
      console.error('[Messages API] Error creating conversation:', convError);
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
    }

    // Add both participants
    const { error: participantsError } = await adminSupabase
      .from('conversation_participants')
      .insert([
        {
          conversation_id: newConversation.id,
          user_id: user.id,
          is_admin: true,
        },
        {
          conversation_id: newConversation.id,
          user_id: memberId,
          is_admin: member.is_admin,
        },
      ]);

    if (participantsError) {
      console.error('[Messages API] Error adding participants:', participantsError);
      // Clean up the conversation
      await adminSupabase.from('conversations').delete().eq('id', newConversation.id);
      return NextResponse.json({ error: 'Failed to add participants' }, { status: 500 });
    }

    // Send initial message if provided
    if (initialMessage && typeof initialMessage === 'string' && initialMessage.trim()) {
      await adminSupabase
        .from('direct_messages')
        .insert({
          conversation_id: newConversation.id,
          sender_id: user.id,
          content: initialMessage.trim(),
        });
    }

    return NextResponse.json({
      conversation: {
        id: newConversation.id,
        created_at: newConversation.created_at,
        updated_at: newConversation.updated_at,
        last_message_at: newConversation.last_message_at,
        last_message_preview: newConversation.last_message_preview,
        otherParticipant: {
          id: member.id,
          name: member.full_name,
          avatarUrl: member.avatar_url,
          isAdmin: member.is_admin,
        },
        unreadCount: 0,
      },
      isExisting: false,
    }, { status: 201 });
  } catch (error) {
    console.error('[Messages API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
