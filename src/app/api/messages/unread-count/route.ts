import { NextResponse } from 'next/server';
import { createClient, createAdminClientInstance } from '@/lib/supabase/server';

/**
 * GET /api/messages/unread-count
 *
 * Returns the total unread message count for the current user.
 * Used for the badge on the chat icon.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminClientInstance();

    // Sum up unread counts across all conversations
    const { data: participants, error } = await adminSupabase
      .from('conversation_participants')
      .select('unread_count')
      .eq('user_id', user.id);

    if (error) {
      console.error('[Messages API] Error fetching unread count:', error);
      return NextResponse.json({ error: 'Failed to fetch unread count' }, { status: 500 });
    }

    const totalUnread = (participants || []).reduce((sum: number, p: { unread_count: number }) => sum + (p.unread_count || 0), 0);

    return NextResponse.json({ unreadCount: totalUnread });
  } catch (error) {
    console.error('[Messages API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
