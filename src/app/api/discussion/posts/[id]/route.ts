import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClientInstance } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/discussion/posts/[id]
 *
 * Get a single post by ID with author info.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    // Fetch the post with author info
    const { data: post, error } = await supabase
      .from('discussion_posts')
      .select(`
        *,
        author:profiles!discussion_posts_author_id_fkey(id, full_name, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (error || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check visibility - hidden posts only visible to author or admin
    if (post.is_hidden && post.author_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Get user's reaction for this post
    const { data: reaction } = await supabase
      .from('discussion_reactions')
      .select('reaction_type')
      .eq('user_id', user.id)
      .eq('post_id', id)
      .single();

    return NextResponse.json({
      post: {
        ...post,
        user_reaction: reaction?.reaction_type || null,
      },
    });
  } catch (error) {
    console.error('[Discussion API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/discussion/posts/[id]
 *
 * Update a post. Users can only update their own posts.
 *
 * Body:
 * - body: Updated post content
 * - image_urls: Updated image URLs
 * - embedded_media: Updated embedded media
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

    // Get the existing post
    const { data: existingPost, error: fetchError } = await supabase
      .from('discussion_posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check ownership - only author can edit
    if (existingPost.author_id !== user.id) {
      return NextResponse.json({ error: 'You can only edit your own posts' }, { status: 403 });
    }

    const body = await request.json();
    const { body: postBody, image_urls, embedded_media } = body;

    // Build update object
    const updateData: Record<string, unknown> = {
      edited_at: new Date().toISOString(),
    };

    if (postBody !== undefined) {
      if (typeof postBody !== 'string' || postBody.trim().length === 0) {
        return NextResponse.json({ error: 'Post body cannot be empty' }, { status: 400 });
      }
      if (postBody.length > 10000) {
        return NextResponse.json({ error: 'Post body is too long (max 10000 characters)' }, { status: 400 });
      }
      updateData.body = postBody.trim();
    }

    if (image_urls !== undefined) {
      if (!Array.isArray(image_urls) || !image_urls.every((url: unknown) => typeof url === 'string')) {
        return NextResponse.json({ error: 'image_urls must be an array of strings' }, { status: 400 });
      }
      updateData.image_urls = image_urls;
    }

    if (embedded_media !== undefined) {
      if (!Array.isArray(embedded_media)) {
        return NextResponse.json({ error: 'embedded_media must be an array' }, { status: 400 });
      }
      updateData.embedded_media = embedded_media;
    }

    // Update the post
    const { data: post, error: updateError } = await supabase
      .from('discussion_posts')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        author:profiles!discussion_posts_author_id_fkey(id, full_name, avatar_url)
      `)
      .single();

    if (updateError) {
      console.error('[Discussion API] Error updating post:', updateError);
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('[Discussion API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/discussion/posts/[id]
 *
 * Delete a post. Users can delete their own posts, admins can delete any post.
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

    // Get the existing post
    const { data: existingPost, error: fetchError } = await supabase
      .from('discussion_posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check permission - author or admin can delete
    if (existingPost.author_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'You can only delete your own posts' }, { status: 403 });
    }

    // Delete the post (cascade will handle comments and reactions)
    const adminSupabase = createAdminClientInstance();
    const { error: deleteError } = await adminSupabase
      .from('discussion_posts')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[Discussion API] Error deleting post:', deleteError);
      return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Discussion API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
