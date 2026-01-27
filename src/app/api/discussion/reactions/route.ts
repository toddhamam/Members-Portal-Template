import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClientInstance } from '@/lib/supabase/server';
import type { ReactionType } from '@/lib/supabase/types';

/**
 * POST /api/discussion/reactions
 *
 * Add or change a reaction on a post or comment.
 * If the user already has a reaction, it will be updated.
 *
 * Body:
 * - reaction_type: 'like' | 'heart' | 'celebrate'
 * - post_id: string (optional, either post_id or comment_id required)
 * - comment_id: string (optional, either post_id or comment_id required)
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
    const { reaction_type, post_id, comment_id } = body;

    // Validate reaction_type
    const validReactions: ReactionType[] = ['like', 'heart', 'celebrate'];
    if (!reaction_type || !validReactions.includes(reaction_type)) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
    }

    // Validate that exactly one of post_id or comment_id is provided
    if ((!post_id && !comment_id) || (post_id && comment_id)) {
      return NextResponse.json({ error: 'Either post_id or comment_id must be provided, not both' }, { status: 400 });
    }

    const adminSupabase = createAdminClientInstance();

    // Check if reaction already exists
    let existingReaction = null;
    if (post_id) {
      const { data } = await supabase
        .from('discussion_reactions')
        .select('id, reaction_type')
        .eq('user_id', user.id)
        .eq('post_id', post_id)
        .single();
      existingReaction = data;
    } else if (comment_id) {
      const { data } = await supabase
        .from('discussion_reactions')
        .select('id, reaction_type')
        .eq('user_id', user.id)
        .eq('comment_id', comment_id)
        .single();
      existingReaction = data;
    }

    if (existingReaction) {
      // If same reaction type, remove it (toggle off)
      if (existingReaction.reaction_type === reaction_type) {
        const { error: deleteError } = await adminSupabase
          .from('discussion_reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (deleteError) {
          console.error('[Discussion API] Error removing reaction:', deleteError);
          return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 });
        }

        return NextResponse.json({ reaction: null, action: 'removed' });
      }

      // Different reaction type - update it
      const { data: reaction, error: updateError } = await adminSupabase
        .from('discussion_reactions')
        .update({ reaction_type })
        .eq('id', existingReaction.id)
        .select()
        .single();

      if (updateError) {
        console.error('[Discussion API] Error updating reaction:', updateError);
        return NextResponse.json({ error: 'Failed to update reaction' }, { status: 500 });
      }

      return NextResponse.json({ reaction, action: 'updated' });
    }

    // Create new reaction
    const insertData: {
      user_id: string;
      reaction_type: ReactionType;
      post_id?: string;
      comment_id?: string;
    } = {
      user_id: user.id,
      reaction_type,
    };

    if (post_id) {
      insertData.post_id = post_id;
    } else {
      insertData.comment_id = comment_id;
    }

    const { data: reaction, error: insertError } = await adminSupabase
      .from('discussion_reactions')
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error('[Discussion API] Error creating reaction:', insertError);
      return NextResponse.json({ error: 'Failed to create reaction' }, { status: 500 });
    }

    return NextResponse.json({ reaction, action: 'created' }, { status: 201 });
  } catch (error) {
    console.error('[Discussion API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/discussion/reactions
 *
 * Remove a reaction from a post or comment.
 *
 * Query params:
 * - post_id: string (optional, either post_id or comment_id required)
 * - comment_id: string (optional, either post_id or comment_id required)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const post_id = searchParams.get('post_id');
    const comment_id = searchParams.get('comment_id');

    // Validate that exactly one of post_id or comment_id is provided
    if ((!post_id && !comment_id) || (post_id && comment_id)) {
      return NextResponse.json({ error: 'Either post_id or comment_id must be provided, not both' }, { status: 400 });
    }

    const adminSupabase = createAdminClientInstance();

    let query = adminSupabase
      .from('discussion_reactions')
      .delete()
      .eq('user_id', user.id);

    if (post_id) {
      query = query.eq('post_id', post_id);
    } else {
      query = query.eq('comment_id', comment_id);
    }

    const { error: deleteError } = await query;

    if (deleteError) {
      console.error('[Discussion API] Error removing reaction:', deleteError);
      return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Discussion API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
