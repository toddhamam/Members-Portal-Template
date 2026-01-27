import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/discussion/notifications/read
 *
 * Mark notifications as read.
 *
 * Body:
 * - notification_ids: string[] (optional - specific notifications to mark as read)
 * - mark_all: boolean (optional - mark all as read)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notification_ids, mark_all } = body;

    // Validate input
    if (!mark_all && (!notification_ids || !Array.isArray(notification_ids) || notification_ids.length === 0)) {
      return NextResponse.json({ error: 'Either notification_ids or mark_all must be provided' }, { status: 400 });
    }

    const now = new Date().toISOString();

    if (mark_all) {
      // Mark all unread notifications as read
      const { error } = await supabase
        .from('discussion_notifications')
        .update({ is_read: true, read_at: now })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('[Discussion API] Error marking all notifications as read:', error);
        return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
      }
    } else {
      // Mark specific notifications as read
      const { error } = await supabase
        .from('discussion_notifications')
        .update({ is_read: true, read_at: now })
        .eq('user_id', user.id)
        .in('id', notification_ids);

      if (error) {
        console.error('[Discussion API] Error marking notifications as read:', error);
        return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
      }
    }

    // Get updated unread count
    const { count: unreadCount } = await supabase
      .from('discussion_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    return NextResponse.json({ success: true, unreadCount: unreadCount || 0 });
  } catch (error) {
    console.error('[Discussion API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
