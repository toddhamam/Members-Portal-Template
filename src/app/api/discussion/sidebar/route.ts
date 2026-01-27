import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { PostWithAuthor, ReactionType, DiscussionPost } from '@/lib/supabase/types';

/**
 * GET /api/discussion/sidebar
 *
 * Returns data for the community sidebar:
 * - Pinned posts (up to 5)
 * - Trending posts (top 3 by engagement in last 7 days)
 * - Hot topics (hashtags extracted from recent posts)
 */
export async function GET() {
  try {
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

    // Calculate date 7 days ago for trending
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch pinned posts
    let pinnedQuery = supabase
      .from('discussion_posts')
      .select(`
        *,
        author:profiles!discussion_posts_author_id_fkey(id, full_name, avatar_url)
      `)
      .eq('is_pinned', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!isAdmin) {
      pinnedQuery = pinnedQuery.eq('is_hidden', false);
    }

    const { data: pinnedPosts, error: pinnedError } = await pinnedQuery;

    if (pinnedError) {
      console.error('[Sidebar API] Error fetching pinned posts:', pinnedError);
    }

    // Fetch trending posts (highest engagement in last 7 days, excluding pinned)
    // Engagement = reaction_count + comment_count
    let trendingQuery = supabase
      .from('discussion_posts')
      .select(`
        *,
        author:profiles!discussion_posts_author_id_fkey(id, full_name, avatar_url)
      `)
      .eq('is_pinned', false)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('reaction_count', { ascending: false })
      .limit(10); // Fetch more to filter and sort by engagement

    if (!isAdmin) {
      trendingQuery = trendingQuery.eq('is_hidden', false);
    }

    const { data: recentPosts, error: trendingError } = await trendingQuery;

    if (trendingError) {
      console.error('[Sidebar API] Error fetching trending posts:', trendingError);
    }

    // Sort by total engagement (reactions + comments) and take top 3
    const trendingPosts = (recentPosts || [])
      .map((post) => ({
        ...post,
        engagement: (post.reaction_count || 0) + (post.comment_count || 0),
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 3);

    // Get post IDs for fetching user reactions
    const allPostIds = [
      ...(pinnedPosts || []).map((p: DiscussionPost) => p.id),
      ...trendingPosts.map((p) => p.id),
    ];

    // Get user's reactions for these posts
    let userReactions: Record<string, ReactionType> = {};

    if (allPostIds.length > 0) {
      const { data: reactions } = await supabase
        .from('discussion_reactions')
        .select('post_id, reaction_type')
        .eq('user_id', user.id)
        .in('post_id', allPostIds);

      if (reactions) {
        userReactions = reactions.reduce((acc: Record<string, ReactionType>, r: { post_id: string; reaction_type: ReactionType }) => {
          if (r.post_id) acc[r.post_id] = r.reaction_type;
          return acc;
        }, {});
      }
    }

    // Add user_reaction to posts
    const pinnedWithReactions: PostWithAuthor[] = (pinnedPosts || []).map((post: DiscussionPost & { author: { id: string; full_name: string | null; avatar_url: string | null } }) => ({
      ...post,
      user_reaction: userReactions[post.id] || null,
    }));

    const trendingWithReactions: PostWithAuthor[] = trendingPosts.map((post) => ({
      ...post,
      user_reaction: userReactions[post.id] || null,
    }));

    // Extract hot topics (hashtags) from recent posts
    // Get posts from last 30 days to have a larger sample
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let topicsQuery = supabase
      .from('discussion_posts')
      .select('body')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .limit(100);

    if (!isAdmin) {
      topicsQuery = topicsQuery.eq('is_hidden', false);
    }

    const { data: topicPosts } = await topicsQuery;

    // Extract hashtags and count occurrences
    const hashtagCounts: Record<string, number> = {};
    const hashtagRegex = /#(\w+)/g;

    (topicPosts || []).forEach((post: { body: string }) => {
      const matches = post.body.matchAll(hashtagRegex);
      for (const match of matches) {
        const tag = match[1].toLowerCase();
        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
      }
    });

    // Sort by count and take top 8
    const hotTopics = Object.entries(hashtagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));

    return NextResponse.json({
      pinned: pinnedWithReactions,
      trending: trendingWithReactions,
      hotTopics,
    });
  } catch (error) {
    console.error('[Sidebar API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
