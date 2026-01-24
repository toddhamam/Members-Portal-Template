'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { FunnelEventType, FunnelStep } from '@/lib/supabase/types';

/**
 * Check if we're on the funnel subdomain (offer.*)
 * Only track events from the funnel, not the main marketing site
 */
function isFunnelSubdomain(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  // Production: offer.innerwealthinitiate.com
  // Local testing: offer.localhost or localhost:3000 with NEXT_PUBLIC_TRACK_LOCALHOST=true
  return hostname.startsWith('offer.') ||
         (hostname === 'localhost' && process.env.NEXT_PUBLIC_TRACK_LOCALHOST === 'true');
}

interface TrackOptions {
  revenueCents?: number;
  productSlug?: string;
  sessionId?: string;
}

interface TrackResponse {
  success: boolean;
  visitorId?: string;
  funnelSessionId?: string;
  variant?: string | null;
  isNewVisitor?: boolean;
  isNewSession?: boolean;
}

/**
 * Hook for tracking funnel events.
 *
 * Automatically tracks page_view on mount.
 * Returns a track function for other events (purchase, upsell_accept, etc.)
 *
 * @example
 * ```tsx
 * const { track } = useFunnelTracking('upsell-1');
 *
 * // Page view is tracked automatically
 *
 * // Track upsell acceptance
 * await track('upsell_accept', { revenueCents: 9700, productSlug: 'pathless-path' });
 *
 * // Track decline
 * await track('upsell_decline');
 * ```
 */
export function useFunnelTracking(funnelStep: FunnelStep) {
  const hasTrackedPageView = useRef(false);

  /**
   * Track an event (only on funnel subdomain)
   */
  const track = useCallback(
    async (
      eventType: FunnelEventType,
      options: TrackOptions = {}
    ): Promise<TrackResponse | null> => {
      // Only track on funnel subdomain
      if (!isFunnelSubdomain()) {
        return null;
      }

      try {
        const response = await fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType,
            funnelStep,
            ...options,
          }),
        });

        if (!response.ok) {
          console.error('[Funnel Tracking] Failed to track event:', response.statusText);
          return null;
        }

        return await response.json();
      } catch (error) {
        console.error('[Funnel Tracking] Error tracking event:', error);
        return null;
      }
    },
    [funnelStep]
  );

  // Track page view on mount (once per component instance)
  useEffect(() => {
    if (!hasTrackedPageView.current) {
      hasTrackedPageView.current = true;
      track('page_view');
    }
  }, [track]);

  return { track };
}

/**
 * Standalone function to track a purchase event.
 * Useful when you need to track a purchase outside of a component
 * or when you don't need the full hook.
 *
 * @example
 * ```tsx
 * await trackPurchase('checkout', 2400, 'resistance-mapping-guide', sessionId);
 * ```
 */
export async function trackPurchase(
  funnelStep: FunnelStep,
  revenueCents: number,
  productSlug: string,
  sessionId?: string
): Promise<boolean> {
  if (!isFunnelSubdomain()) return false;

  try {
    const response = await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'purchase',
        funnelStep,
        revenueCents,
        productSlug,
        sessionId,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('[Funnel Tracking] Error tracking purchase:', error);
    return false;
  }
}

/**
 * Standalone function to track upsell acceptance.
 *
 * @example
 * ```tsx
 * await trackUpsellAccept('upsell-1', 9700, 'pathless-path', sessionId);
 * ```
 */
export async function trackUpsellAccept(
  funnelStep: FunnelStep,
  revenueCents: number,
  productSlug: string,
  sessionId?: string
): Promise<boolean> {
  if (!isFunnelSubdomain()) return false;

  try {
    const response = await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'upsell_accept',
        funnelStep,
        revenueCents,
        productSlug,
        sessionId,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('[Funnel Tracking] Error tracking upsell accept:', error);
    return false;
  }
}

/**
 * Standalone function to track upsell decline.
 *
 * @example
 * ```tsx
 * await trackUpsellDecline('upsell-1');
 * ```
 */
export async function trackUpsellDecline(funnelStep: FunnelStep): Promise<boolean> {
  if (!isFunnelSubdomain()) return false;

  try {
    const response = await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'upsell_decline',
        funnelStep,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('[Funnel Tracking] Error tracking upsell decline:', error);
    return false;
  }
}

/**
 * Standalone function to track downsell acceptance.
 */
export async function trackDownsellAccept(
  funnelStep: FunnelStep,
  revenueCents: number,
  productSlug: string,
  sessionId?: string
): Promise<boolean> {
  if (!isFunnelSubdomain()) return false;

  try {
    const response = await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'downsell_accept',
        funnelStep,
        revenueCents,
        productSlug,
        sessionId,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('[Funnel Tracking] Error tracking downsell accept:', error);
    return false;
  }
}

/**
 * Standalone function to track downsell decline.
 */
export async function trackDownsellDecline(funnelStep: FunnelStep): Promise<boolean> {
  if (!isFunnelSubdomain()) return false;

  try {
    const response = await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'downsell_decline',
        funnelStep,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('[Funnel Tracking] Error tracking downsell decline:', error);
    return false;
  }
}
