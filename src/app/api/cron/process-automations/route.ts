import { NextRequest, NextResponse } from 'next/server';
import { processPendingAutomations } from '@/lib/dm-automation';

/**
 * POST /api/cron/process-automations
 *
 * Cron job endpoint to process pending DM automations.
 * Called by Vercel Cron every minute.
 *
 * Security: Vercel Cron includes CRON_SECRET header automatically.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // In production, verify the cron secret
  if (process.env.NODE_ENV === 'production' && cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('[Cron] Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    console.log('[Cron] Processing pending automations...');
    const processed = await processPendingAutomations();
    console.log(`[Cron] Processed ${processed} pending automations`);

    return NextResponse.json({
      success: true,
      processed,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Cron] Error processing automations:', error);
    return NextResponse.json(
      { error: 'Failed to process automations' },
      { status: 500 }
    );
  }
}

// Also support POST for manual testing
export async function POST(request: NextRequest) {
  return GET(request);
}
