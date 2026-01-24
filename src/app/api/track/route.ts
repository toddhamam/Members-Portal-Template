import { NextRequest, NextResponse } from 'next/server';
import { createAdminClientInstance } from '@/lib/supabase/server';
import crypto from 'crypto';
import type { FunnelEventType, FunnelStep } from '@/lib/supabase/types';

// Cookie names
const VISITOR_COOKIE = 'funnel_visitor_id';
const SESSION_COOKIE = 'funnel_session_id';
const AB_VARIANT_PREFIX = 'ab_variant_';

// Cookie durations
const VISITOR_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year
const SESSION_COOKIE_MAX_AGE = 30 * 60; // 30 minutes
const AB_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

// Active A/B tests configuration
// TODO: Move to database when needed
const ACTIVE_AB_TESTS: Record<FunnelStep, { variants: string[]; weights: number[] } | null> = {
  'landing': null,
  'checkout': null,
  'upsell-1': null, // Example: { variants: ['control', 'variant-b'], weights: [50, 50] }
  'downsell-1': null,
  'upsell-2': null,
  'thank-you': null,
};

interface TrackRequest {
  eventType: FunnelEventType;
  funnelStep: FunnelStep;
  revenueCents?: number;
  productSlug?: string;
  sessionId?: string;
}

/**
 * Assign a variant based on weights
 */
function assignVariant(variants: string[], weights: number[]): string {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < variants.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return variants[i];
    }
  }

  return variants[0]; // Fallback to first variant
}

/**
 * Hash IP address for privacy
 */
function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
}

/**
 * POST /api/track
 *
 * Server-side event tracking endpoint.
 * Manages visitor and session cookies, handles A/B variant assignment,
 * and inserts events into the funnel_events table.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as TrackRequest;
    const { eventType, funnelStep, revenueCents = 0, productSlug = null, sessionId = null } = body;

    // Validate required fields
    if (!eventType || !funnelStep) {
      return NextResponse.json(
        { error: 'Missing required fields: eventType, funnelStep' },
        { status: 400 }
      );
    }

    // Get or create visitor ID from cookie
    let visitorId = request.cookies.get(VISITOR_COOKIE)?.value;
    const isNewVisitor = !visitorId;
    if (!visitorId) {
      visitorId = crypto.randomUUID();
    }

    // Get or create funnel session ID from cookie
    let funnelSessionId = request.cookies.get(SESSION_COOKIE)?.value;
    const isNewSession = !funnelSessionId;
    if (!funnelSessionId) {
      funnelSessionId = crypto.randomUUID();
    }

    // Check for A/B test variant
    let variant: string | null = null;
    const abTest = ACTIVE_AB_TESTS[funnelStep];

    if (abTest) {
      const abCookieName = `${AB_VARIANT_PREFIX}${funnelStep}`;
      const existingVariant = request.cookies.get(abCookieName)?.value;

      if (existingVariant && abTest.variants.includes(existingVariant)) {
        // Use existing assignment
        variant = existingVariant;
      } else {
        // Assign new variant
        variant = assignVariant(abTest.variants, abTest.weights);
      }
    }

    // Get request context
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown';
    const ipHash = hashIp(ip);
    const userAgent = request.headers.get('user-agent') || null;

    // Insert event into database
    const supabase = createAdminClientInstance();

    const { error: insertError } = await supabase
      .from('funnel_events')
      .insert({
        visitor_id: visitorId,
        funnel_session_id: funnelSessionId,
        session_id: sessionId,
        event_type: eventType,
        funnel_step: funnelStep,
        variant,
        revenue_cents: revenueCents,
        product_slug: productSlug,
        ip_hash: ipHash,
        user_agent: userAgent,
      });

    if (insertError) {
      console.error('[Track API] Error inserting event:', insertError);
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      );
    }

    // Build response with cookies
    const response = NextResponse.json({
      success: true,
      visitorId,
      funnelSessionId,
      variant,
      isNewVisitor,
      isNewSession,
    });

    // Set visitor cookie (1 year)
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: VISITOR_COOKIE_MAX_AGE,
      path: '/',
    });

    // Set/refresh session cookie (30 min)
    response.cookies.set(SESSION_COOKIE, funnelSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_COOKIE_MAX_AGE,
      path: '/',
    });

    // Set A/B variant cookie if assigned
    if (variant && abTest) {
      const abCookieName = `${AB_VARIANT_PREFIX}${funnelStep}`;
      response.cookies.set(abCookieName, variant, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: AB_COOKIE_MAX_AGE,
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('[Track API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
