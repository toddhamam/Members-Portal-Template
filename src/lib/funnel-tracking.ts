/**
 * Server-side funnel tracking for reliable purchase event recording.
 *
 * This module provides server-side tracking to the funnel_events table,
 * ensuring purchases are recorded even when client-side tracking fails
 * due to page redirects, ad blockers, or JavaScript errors.
 */

import { createAdminClientInstance } from '@/lib/supabase/server';
import crypto from 'crypto';
import type { FunnelEventType, FunnelStep } from '@/lib/supabase/types';

interface TrackServerEventOptions {
  eventType: FunnelEventType;
  funnelStep: FunnelStep;
  revenueCents?: number;
  productSlug?: string;
  sessionId?: string; // Stripe session/payment intent ID
  visitorId?: string; // Optional: link to existing visitor
  funnelSessionId?: string; // Optional: link to existing funnel session
}

/**
 * Track a funnel event server-side.
 * Used by webhook and upsell API to ensure purchase events are reliably recorded.
 *
 * If visitorId or funnelSessionId are not provided, will attempt to find
 * an existing session based on the Stripe sessionId, or generate new IDs.
 */
export async function trackServerEvent(options: TrackServerEventOptions): Promise<boolean> {
  const {
    eventType,
    funnelStep,
    revenueCents = 0,
    productSlug = null,
    sessionId = null,
  } = options;

  let { visitorId, funnelSessionId } = options;

  const supabase = createAdminClientInstance();

  // Try to find existing session based on Stripe session/payment intent ID
  if (sessionId && (!visitorId || !funnelSessionId)) {
    const { data: existingEvents } = await supabase
      .from('funnel_events')
      .select('visitor_id, funnel_session_id')
      .eq('session_id', sessionId)
      .limit(1);

    if (existingEvents && existingEvents.length > 0) {
      visitorId = visitorId || existingEvents[0].visitor_id;
      funnelSessionId = funnelSessionId || existingEvents[0].funnel_session_id;
    }
  }

  // If we still don't have IDs, try to find by funnel session from checkout page_view
  // The checkout page tracks page_view before the purchase, so we can link back
  if (!visitorId || !funnelSessionId) {
    // Look for a recent checkout page_view (within last hour) that doesn't have a purchase yet
    // This is a fallback - ideally the client passes session info
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: recentCheckout } = await supabase
      .from('funnel_events')
      .select('visitor_id, funnel_session_id')
      .eq('funnel_step', 'checkout')
      .eq('event_type', 'page_view')
      .gte('created_at', oneHourAgo)
      .order('created_at', { ascending: false })
      .limit(1);

    if (recentCheckout && recentCheckout.length > 0) {
      visitorId = visitorId || recentCheckout[0].visitor_id;
      funnelSessionId = funnelSessionId || recentCheckout[0].funnel_session_id;
    }
  }

  // Generate new IDs if we still don't have them
  // This creates a new session for server-side only events
  if (!visitorId) {
    visitorId = `server-${crypto.randomUUID()}`;
  }
  if (!funnelSessionId) {
    funnelSessionId = `server-${crypto.randomUUID()}`;
  }

  try {
    const { error } = await supabase
      .from('funnel_events')
      .insert({
        visitor_id: visitorId,
        funnel_session_id: funnelSessionId,
        session_id: sessionId,
        event_type: eventType,
        funnel_step: funnelStep,
        variant: null,
        revenue_cents: revenueCents,
        product_slug: productSlug,
        ip_hash: 'server', // Mark as server-side event
        user_agent: 'server-side-tracking',
      });

    if (error) {
      console.error('[Server Tracking] Failed to insert event:', error);
      return false;
    }

    console.log(`[Server Tracking] Recorded ${eventType} for ${funnelStep}: $${revenueCents / 100}`);
    return true;
  } catch (error) {
    console.error('[Server Tracking] Error:', error);
    return false;
  }
}

/**
 * Track a checkout purchase (initial order).
 */
export async function trackCheckoutPurchase(
  sessionId: string,
  revenueCents: number,
  includeOrderBump: boolean
): Promise<boolean> {
  // Track main product purchase
  const mainTracked = await trackServerEvent({
    eventType: 'purchase',
    funnelStep: 'checkout',
    revenueCents: includeOrderBump ? 700 : revenueCents, // $7 for main product
    productSlug: 'resistance-mapping-guide',
    sessionId,
  });

  // If order bump included, track it separately
  if (includeOrderBump) {
    await trackServerEvent({
      eventType: 'purchase',
      funnelStep: 'checkout',
      revenueCents: 2700, // $27 for order bump
      productSlug: 'golden-thread-technique',
      sessionId,
    });
  }

  return mainTracked;
}

/**
 * Track an upsell acceptance.
 */
export async function trackUpsellPurchase(
  sessionId: string,
  upsellType: 'upsell-1' | 'upsell-2',
  revenueCents: number,
  productSlug: string
): Promise<boolean> {
  return trackServerEvent({
    eventType: 'upsell_accept',
    funnelStep: upsellType,
    revenueCents,
    productSlug,
    sessionId,
  });
}

/**
 * Track an upsell decline.
 */
export async function trackUpsellDecline(
  sessionId: string,
  upsellType: 'upsell-1' | 'upsell-2'
): Promise<boolean> {
  return trackServerEvent({
    eventType: 'upsell_decline',
    funnelStep: upsellType,
    revenueCents: 0,
    sessionId,
  });
}

/**
 * Track a downsell acceptance.
 */
export async function trackDownsellPurchase(
  sessionId: string,
  revenueCents: number,
  productSlug: string
): Promise<boolean> {
  return trackServerEvent({
    eventType: 'downsell_accept',
    funnelStep: 'downsell-1',
    revenueCents,
    productSlug,
    sessionId,
  });
}

/**
 * Track a downsell decline.
 */
export async function trackDownsellDecline(sessionId: string): Promise<boolean> {
  return trackServerEvent({
    eventType: 'downsell_decline',
    funnelStep: 'downsell-1',
    revenueCents: 0,
    sessionId,
  });
}
