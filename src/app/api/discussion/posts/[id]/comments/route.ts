import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClientInstance } from '@/lib/supabase/server';
import type { DiscussionComment, CommentWithAuthor, ReactionType } from '@/lib/supabase/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/discussion/posts/[id]/comments
 *
 * Get all comments for a post, organized in a nested tree structure.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: postId } = await params;
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

    // Fetch all comments for the post with author info
    let query = supabase
      .from('discussion_comments')
      .select(`
        *,
        author:profiles!discussion_comments_author_id_fkey(id, full_name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    // If not admin, only show non-hidden comments (or own comments)
    if (!isAdmin) {
      query = query.or(`is_hidden.eq.false,author_id.eq.${user.id}`);
    }

    const { data: comments, error } = await query;

    if (error) {
      console.error('[Discussion API] Error fetching comments:', error);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    // Get user's reactions for these comments
    const commentIds = comments?.map((c: DiscussionComment) => c.id) || [];
    let userReactions: Record<string, ReactionType> = {};

    if (commentIds.length > 0) {
      const { data: reactions } = await supabase
        .from('discussion_reactions')
        .select('comment_id, reaction_type')
        .eq('user_id', user.id)
        .in('comment_id', commentIds);

      if (reactions) {
        userReactions = reactions.reduce((acc: Record<string, ReactionType>, r: { comment_id: string; reaction_type: ReactionType }) => {
          if (r.comment_id) acc[r.comment_id] = r.reaction_type;
          return acc;
        }, {});
      }
    }

    // Build nested tree structure
    const commentsWithReactions: CommentWithAuthor[] = (comments || []).map(
      (comment: DiscussionComment & { author: { id: string; full_name: string | null; avatar_url: string | null } }) => ({
        ...comment,
        user_reaction: userReactions[comment.id] || null,
        replies: [],
      })
    );

    // Organize into tree - top-level comments and their replies
    const commentMap = new Map<string, CommentWithAuthor>();
    const topLevelComments: CommentWithAuthor[] = [];

    // First pass: create a map of all comments
    commentsWithReactions.forEach((comment) => {
      commentMap.set(comment.id, comment);
    });

    // Second pass: organize into tree
    commentsWithReactions.forEach((comment) => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          if (!parent.replies) parent.replies = [];
          parent.replies.push(comment);
        } else {
          // Parent was deleted or hidden, treat as top-level
          topLevelComments.push(comment);
        }
      } else {
        topLevelComments.push(comment);
      }
    });

    return NextResponse.json({ comments: topLevelComments });
  } catch (error) {
    console.error('[Discussion API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/discussion/posts/[id]/comments
 *
 * Create a new comment on a post.
 *
 * Body:
 * - body: Comment content (required)
 * - parent_id: Parent comment ID for replies (optional)
 * - image_urls: Array of image URLs (optional)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: postId } = await params;
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check that the post exists
    const { data: post, error: postError } = await supabase
      .from('discussion_posts')
      .select('id, author_id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const body = await request.json();
    const { body: commentBody, parent_id, image_urls = [] } = body;

    // Validate required fields
    if (!commentBody || typeof commentBody !== 'string' || commentBody.trim().length === 0) {
      return NextResponse.json({ error: 'Comment body is required' }, { status: 400 });
    }

    if (commentBody.length > 5000) {
      return NextResponse.json({ error: 'Comment is too long (max 5000 characters)' }, { status: 400 });
    }

    // If parent_id is provided, verify it exists and belongs to the same post
    if (parent_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from('discussion_comments')
        .select('id, post_id')
        .eq('id', parent_id)
        .single();

      if (parentError || !parentComment) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
      }

      if (parentComment.post_id !== postId) {
        return NextResponse.json({ error: 'Parent comment does not belong to this post' }, { status: 400 });
      }
    }

    // Validate image_urls
    if (!Array.isArray(image_urls) || !image_urls.every((url: unknown) => typeof url === 'string')) {
      return NextResponse.json({ error: 'image_urls must be an array of strings' }, { status: 400 });
    }

    // Create the comment
    const adminSupabase = createAdminClientInstance();

    const { data: comment, error: createError } = await adminSupabase
      .from('discussion_comments')
      .insert({
        post_id: postId,
        author_id: user.id,
        parent_id: parent_id || null,
        body: commentBody.trim(),
        image_urls,
      })
      .select(`
        *,
        author:profiles!discussion_comments_author_id_fkey(id, full_name, avatar_url)
      `)
      .single();

    if (createError) {
      console.error('[Discussion API] Error creating comment:', createError);
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    // TODO: Create notifications for:
    // 1. Post author (if different from commenter) - reply_to_post
    // 2. Parent comment author (if different from commenter) - reply_to_comment
    // 3. Any @mentioned users - mention

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('[Discussion API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
