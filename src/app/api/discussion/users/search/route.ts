import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/discussion/users/search
 *
 * Search for users by name for @mention autocomplete.
 *
 * Query params:
 * - q: Search query (required)
 * - limit: Max results (default 10, max 20)
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
    const query = searchParams.get('q');
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '10')));

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const searchTerm = query.trim().toLowerCase();

    // Search users by name using ilike for case-insensitive matching
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, full_name, first_name, avatar_url')
      .or(`full_name.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .neq('id', user.id) // Exclude current user
      .limit(limit);

    if (error) {
      console.error('[Discussion API] Error searching users:', error);
      return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
    }

    return NextResponse.json({ users: users || [] });
  } catch (error) {
    console.error('[Discussion API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
