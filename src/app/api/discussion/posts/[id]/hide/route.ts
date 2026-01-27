import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClientInstance } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/discussion/posts/[id]/hide
 *
 * Toggle hide status on a post. Admin only.
 *
 * Body:
 * - hidden: boolean (true to hide, false to unhide)
 * - reason: string (optional reason for hiding)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { hidden, reason } = body;

    if (typeof hidden !== 'boolean') {
      return NextResponse.json({ error: 'hidden must be a boolean' }, { status: 400 });
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      is_hidden: hidden,
    };

    if (hidden) {
      updateData.hidden_reason = reason || null;
      updateData.hidden_by = user.id;
    } else {
      updateData.hidden_reason = null;
      updateData.hidden_by = null;
    }

    // Update the post hide status
    const adminSupabase = createAdminClientInstance();
    const { data: post, error } = await adminSupabase
      .from('discussion_posts')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        author:profiles!discussion_posts_author_id_fkey(id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('[Discussion API] Error updating hide status:', error);
      return NextResponse.json({ error: 'Failed to update hide status' }, { status: 500 });
    }

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('[Discussion API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
