import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClientInstance } from '@/lib/supabase/server';
import type { DiscussionNotification, NotificationWithActor } from '@/lib/supabase/types';

/**
 * GET /api/discussion/notifications
 *
 * Get notifications for the current user.
 *
 * Query params:
 * - unread_only: boolean (default false)
 * - limit: number (default 20, max 50)
 * - page: number (default 1)
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
    const unreadOnly = searchParams.get('unread_only') === 'true';
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('discussion_notifications')
      .select(`
        *,
        actor:profiles!discussion_notifications_actor_id_fkey(id, full_name, avatar_url)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('[Discussion API] Error fetching notifications:', error);
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('discussion_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    // Get total count for pagination
    let countQuery = supabase
      .from('discussion_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (unreadOnly) {
      countQuery = countQuery.eq('is_read', false);
    }

    const { count: totalCount } = await countQuery;

    return NextResponse.json({
      notifications: notifications as NotificationWithActor[],
      unreadCount: unreadCount || 0,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        hasMore: offset + limit < (totalCount || 0),
      },
    });
  } catch (error) {
    console.error('[Discussion API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
