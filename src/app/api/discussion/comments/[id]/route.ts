import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClientInstance } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/discussion/comments/[id]
 *
 * Update a comment. Users can only update their own comments.
 *
 * Body:
 * - body: Updated comment content
 * - image_urls: Updated image URLs
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the existing comment
    const { data: existingComment, error: fetchError } = await supabase
      .from('discussion_comments')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check ownership - only author can edit
    if (existingComment.author_id !== user.id) {
      return NextResponse.json({ error: 'You can only edit your own comments' }, { status: 403 });
    }

    const body = await request.json();
    const { body: commentBody, image_urls } = body;

    // Build update object
    const updateData: Record<string, unknown> = {
      edited_at: new Date().toISOString(),
    };

    if (commentBody !== undefined) {
      if (typeof commentBody !== 'string' || commentBody.trim().length === 0) {
        return NextResponse.json({ error: 'Comment body cannot be empty' }, { status: 400 });
      }
      if (commentBody.length > 5000) {
        return NextResponse.json({ error: 'Comment is too long (max 5000 characters)' }, { status: 400 });
      }
      updateData.body = commentBody.trim();
    }

    if (image_urls !== undefined) {
      if (!Array.isArray(image_urls) || !image_urls.every((url: unknown) => typeof url === 'string')) {
        return NextResponse.json({ error: 'image_urls must be an array of strings' }, { status: 400 });
      }
      updateData.image_urls = image_urls;
    }

    // Update the comment
    const { data: comment, error: updateError } = await supabase
      .from('discussion_comments')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        author:profiles!discussion_comments_author_id_fkey(id, full_name, avatar_url)
      `)
      .single();

    if (updateError) {
      console.error('[Discussion API] Error updating comment:', updateError);
      return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
    }

    return NextResponse.json({ comment });
  } catch (error) {
    console.error('[Discussion API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/discussion/comments/[id]
 *
 * Delete a comment. Users can delete their own comments, admins can delete any comment.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile to check admin status
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.is_admin || false;

    // Get the existing comment
    const { data: existingComment, error: fetchError } = await supabase
      .from('discussion_comments')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check permission - author or admin can delete
    if (existingComment.author_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'You can only delete your own comments' }, { status: 403 });
    }

    // Delete the comment (cascade will handle replies)
    const adminSupabase = createAdminClientInstance();
    const { error: deleteError } = await adminSupabase
      .from('discussion_comments')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[Discussion API] Error deleting comment:', deleteError);
      return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Discussion API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
