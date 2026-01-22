// Meta Pixel client-side tracking utilities
// Works with fbq() function loaded by MetaPixel component

declare global {
  interface Window {
    fbq: (
      action: string,
      eventName: string,
      params?: Record<string, unknown>,
      options?: { eventID?: string }
    ) => void;
    _fbq: unknown;
  }
}

export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

// Generate a unique event ID for deduplication between client and server
export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Track PageView event
export function trackPageView() {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
}

// Track ViewContent event (for landing and product pages)
export function trackViewContent(params: {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
}) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      ...params,
      currency: params.currency || 'USD',
    });
  }
}

// Track InitiateCheckout event
export function trackInitiateCheckout(params: {
  content_ids?: string[];
  content_name?: string;
  content_category?: string;
  num_items?: number;
  value?: number;
  currency?: string;
}) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      ...params,
      currency: params.currency || 'USD',
    });
  }
}

// Track AddToCart event (for order bump)
export function trackAddToCart(params: {
  content_ids?: string[];
  content_name?: string;
  content_type?: string;
  value?: number;
  currency?: string;
}) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      ...params,
      currency: params.currency || 'USD',
    });
  }
}

// Track Purchase event with event_id for deduplication
export function trackPurchase(
  params: {
    content_ids?: string[];
    content_name?: string;
    content_type?: string;
    num_items?: number;
    value: number;
    currency?: string;
  },
  eventId?: string
) {
  if (typeof window !== 'undefined' && window.fbq) {
    const options = eventId ? { eventID: eventId } : undefined;
    window.fbq(
      'track',
      'Purchase',
      {
        ...params,
        currency: params.currency || 'USD',
      },
      options
    );
  }
}

// Track Lead event (for discovery call booking)
export function trackLead(params: {
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
}) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead', {
      ...params,
      currency: params.currency || 'USD',
    });
  }
}

// Track custom events
export function trackCustomEvent(
  eventName: string,
  params?: Record<string, unknown>,
  eventId?: string
) {
  if (typeof window !== 'undefined' && window.fbq) {
    const options = eventId ? { eventID: eventId } : undefined;
    window.fbq('trackCustom', eventName, params, options);
  }
}
