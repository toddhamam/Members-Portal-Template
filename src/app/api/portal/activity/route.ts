import { NextResponse } from 'next/server';
import { createClient, createAdminClientInstance } from '@/lib/supabase/server';

/**
 * POST /api/portal/activity
 *
 * Updates the authenticated user's last_active_at timestamp.
 * Called from AuthProvider when session is established/refreshed.
 * This is a lightweight endpoint - just updates a single timestamp.
 */
export async function POST() {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use admin client to bypass RLS for the update
    const adminSupabase = createAdminClientInstance();

    const { error } = await adminSupabase
      .from('profiles')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      console.error('[Activity] Failed to update last_active_at:', error);
      // Non-critical - return success anyway so it doesn't break the client
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Activity] Unexpected error:', error);
    // Non-critical endpoint - always return success to not break client
    return NextResponse.json({ success: true });
  }
}
