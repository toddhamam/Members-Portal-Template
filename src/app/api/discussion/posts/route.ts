import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClientInstance } from '@/lib/supabase/server';
import type { DiscussionPost, PostWithAuthor, ReactionType } from '@/lib/supabase/types';

const POSTS_PER_PAGE = 20;

/**
 * GET /api/discussion/posts
 *
 * Returns posts for the discussion feed.
 * Pinned posts come first, then ordered by created_at DESC.
 *
 * Query params:
 * - page: Page number (default 1)
 * - limit: Posts per page (default 20, max 50)
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
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || String(POSTS_PER_PAGE))));
    const offset = (page - 1) * limit;

    // Get user's profile to check admin status
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.is_admin || false;

    // Build query - fetch posts with author info
    // RLS will handle visibility filtering
    let query = supabase
      .from('discussion_posts')
      .select(`
        *,
        author:profiles!discussion_posts_author_id_fkey(id, full_name, avatar_url)
      `)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // If not admin, only show non-hidden posts (or own posts)
    if (!isAdmin) {
      query = query.or(`is_hidden.eq.false,author_id.eq.${user.id}`);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('[Discussion API] Error fetching posts:', error);
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    // Get user's reactions for these posts
    const postIds = posts?.map((p: DiscussionPost) => p.id) || [];
    let userReactions: Record<string, ReactionType> = {};

    if (postIds.length > 0) {
      const { data: reactions } = await supabase
        .from('discussion_reactions')
        .select('post_id, reaction_type')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      if (reactions) {
        userReactions = reactions.reduce((acc: Record<string, ReactionType>, r: { post_id: string; reaction_type: ReactionType }) => {
          if (r.post_id) acc[r.post_id] = r.reaction_type;
          return acc;
        }, {});
      }
    }

    // Add user_reaction to each post
    const postsWithReactions: PostWithAuthor[] = (posts || []).map((post: DiscussionPost & { author: { id: string; full_name: string | null; avatar_url: string | null } }) => ({
      ...post,
      user_reaction: userReactions[post.id] || null,
    }));

    // Get total count for pagination
    const { count } = await supabase
      .from('discussion_posts')
      .select('*', { count: 'exact', head: true })
      .or(`is_hidden.eq.false,author_id.eq.${user.id}`);

    return NextResponse.json({
      posts: postsWithReactions,
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: offset + limit < (count || 0),
      },
    });
  } catch (error) {
    console.error('[Discussion API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/discussion/posts
 *
 * Create a new post.
 *
 * Body:
 * - body: Post content (required)
 * - image_urls: Array of image URLs (optional)
 * - embedded_media: Array of embedded media objects (optional)
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
    const { body: postBody, image_urls = [], embedded_media = [] } = body;

    // Validate required fields
    if (!postBody || typeof postBody !== 'string' || postBody.trim().length === 0) {
      return NextResponse.json({ error: 'Post body is required' }, { status: 400 });
    }

    if (postBody.length > 10000) {
      return NextResponse.json({ error: 'Post body is too long (max 10000 characters)' }, { status: 400 });
    }

    // Validate image_urls is an array of strings
    if (!Array.isArray(image_urls) || !image_urls.every((url: unknown) => typeof url === 'string')) {
      return NextResponse.json({ error: 'image_urls must be an array of strings' }, { status: 400 });
    }

    // Validate embedded_media structure
    if (!Array.isArray(embedded_media)) {
      return NextResponse.json({ error: 'embedded_media must be an array' }, { status: 400 });
    }

    // Create the post using admin client to bypass RLS for insert
    const adminSupabase = createAdminClientInstance();

    const { data: post, error } = await adminSupabase
      .from('discussion_posts')
      .insert({
        author_id: user.id,
        body: postBody.trim(),
        image_urls,
        embedded_media,
      })
      .select(`
        *,
        author:profiles!discussion_posts_author_id_fkey(id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('[Discussion API] Error creating post:', error);
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('[Discussion API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
