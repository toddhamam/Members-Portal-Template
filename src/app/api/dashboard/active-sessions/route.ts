import { NextResponse } from 'next/server';
import { createAdminClientInstance } from '@/lib/supabase/server';

/**
 * GET /api/dashboard/active-sessions
 *
 * Returns the count of active sessions in the last 5 minutes.
 * Used for the real-time "live visitors" counter on the dashboard.
 */
export async function GET() {
  try {
    const supabase = createAdminClientInstance();

    // Get sessions active in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('funnel_events')
      .select('funnel_session_id')
      .gte('created_at', fiveMinutesAgo);

    if (error) {
      console.error('[Active Sessions API] Error:', error);
      return NextResponse.json({ count: 0 });
    }

    // Count unique session IDs
    const uniqueSessions = new Set(data?.map((e: { funnel_session_id: string }) => e.funnel_session_id) || []);

    return NextResponse.json({
      count: uniqueSessions.size,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Active Sessions API] Error:', error);
    return NextResponse.json({ count: 0 });
  }
}
