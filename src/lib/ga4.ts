/**
 * Google Analytics 4 (GA4) Tracking Library
 *
 * Usage:
 *   import { ga4 } from '@/lib/ga4';
 *
 *   // Track page view (automatic via GoogleAnalytics component)
 *   ga4.pageView('/checkout');
 *
 *   // Track custom events
 *   ga4.event('begin_checkout', { currency: 'USD', value: 7.00 });
 *
 *   // Track e-commerce events
 *   ga4.purchase({ transaction_id: '123', value: 34.00, items: [...] });
 */

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string,
      params?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

// GA4 Measurement ID from environment
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '';

/**
 * Check if gtag is available
 */
function isGtagAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * GA4 Event Parameters Types
 */
interface GA4Item {
  item_id: string;
  item_name: string;
  item_category?: string;
  price?: number;
  quantity?: number;
}

interface GA4PurchaseParams {
  transaction_id: string;
  value: number;
  currency?: string;
  items: GA4Item[];
}

interface GA4CheckoutParams {
  currency?: string;
  value: number;
  items: GA4Item[];
}

/**
 * GA4 Tracking Functions
 */
export const ga4 = {
  /**
   * Track a page view
   */
  pageView(pagePath: string, pageTitle?: string): void {
    if (!isGtagAvailable() || !GA_MEASUREMENT_ID) return;

    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: pagePath,
      page_title: pageTitle,
    });
  },

  /**
   * Track a custom event
   */
  event(eventName: string, params?: Record<string, unknown>): void {
    if (!isGtagAvailable()) return;

    window.gtag('event', eventName, params);
  },

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, unknown>): void {
    if (!isGtagAvailable() || !GA_MEASUREMENT_ID) return;

    window.gtag('set', 'user_properties', properties);
  },

  // ============================================
  // E-COMMERCE EVENTS (GA4 Enhanced E-commerce)
  // ============================================

  /**
   * Track view_item event (product page view)
   */
  viewItem(item: GA4Item, value: number, currency = 'USD'): void {
    this.event('view_item', {
      currency,
      value,
      items: [item],
    });
  },

  /**
   * Track add_to_cart event
   */
  addToCart(item: GA4Item, value: number, currency = 'USD'): void {
    this.event('add_to_cart', {
      currency,
      value,
      items: [item],
    });
  },

  /**
   * Track remove_from_cart event
   */
  removeFromCart(item: GA4Item, value: number, currency = 'USD'): void {
    this.event('remove_from_cart', {
      currency,
      value,
      items: [item],
    });
  },

  /**
   * Track begin_checkout event
   */
  beginCheckout(params: GA4CheckoutParams): void {
    this.event('begin_checkout', {
      currency: params.currency || 'USD',
      value: params.value,
      items: params.items,
    });
  },

  /**
   * Track add_payment_info event
   */
  addPaymentInfo(params: GA4CheckoutParams): void {
    this.event('add_payment_info', {
      currency: params.currency || 'USD',
      value: params.value,
      items: params.items,
    });
  },

  /**
   * Track purchase event (conversion)
   */
  purchase(params: GA4PurchaseParams): void {
    this.event('purchase', {
      transaction_id: params.transaction_id,
      currency: params.currency || 'USD',
      value: params.value,
      items: params.items,
    });
  },

  // ============================================
  // FUNNEL-SPECIFIC EVENTS
  // ============================================

  /**
   * Track landing page view
   */
  landingPageView(): void {
    this.event('funnel_landing_view', {
      funnel_step: 'landing',
    });
  },

  /**
   * Track CTA click on landing page
   */
  landingCtaClick(ctaName: string): void {
    this.event('funnel_cta_click', {
      funnel_step: 'landing',
      cta_name: ctaName,
    });
  },

  /**
   * Track checkout page view
   */
  checkoutView(value: number): void {
    this.event('funnel_checkout_view', {
      funnel_step: 'checkout',
      value,
      currency: 'USD',
    });
  },

  /**
   * Track checkout started (form interaction)
   */
  checkoutStarted(value: number): void {
    this.beginCheckout({
      value,
      items: [
        {
          item_id: 'resistance-mapping-guide',
          item_name: 'Resistance Mapping Guide',
          item_category: 'main_product',
          price: 7.0,
          quantity: 1,
        },
      ],
    });
  },

  /**
   * Track order bump added
   */
  orderBumpAdded(): void {
    this.addToCart(
      {
        item_id: 'golden-thread-technique',
        item_name: 'Golden Thread Technique',
        item_category: 'order_bump',
        price: 27.0,
        quantity: 1,
      },
      27.0
    );
    this.event('funnel_order_bump_added', {
      funnel_step: 'checkout',
      item_name: 'Golden Thread Technique',
      value: 27.0,
    });
  },

  /**
   * Track order bump removed
   */
  orderBumpRemoved(): void {
    this.removeFromCart(
      {
        item_id: 'golden-thread-technique',
        item_name: 'Golden Thread Technique',
        item_category: 'order_bump',
        price: 27.0,
        quantity: 1,
      },
      27.0
    );
    this.event('funnel_order_bump_removed', {
      funnel_step: 'checkout',
      item_name: 'Golden Thread Technique',
    });
  },

  /**
   * Track checkout completed (initial purchase)
   */
  checkoutCompleted(
    transactionId: string,
    value: number,
    includeOrderBump: boolean
  ): void {
    const items: GA4Item[] = [
      {
        item_id: 'resistance-mapping-guide',
        item_name: 'Resistance Mapping Guide',
        item_category: 'main_product',
        price: 7.0,
        quantity: 1,
      },
    ];

    if (includeOrderBump) {
      items.push({
        item_id: 'golden-thread-technique',
        item_name: 'Golden Thread Technique',
        item_category: 'order_bump',
        price: 27.0,
        quantity: 1,
      });
    }

    this.purchase({
      transaction_id: transactionId,
      value,
      items,
    });

    this.event('funnel_checkout_completed', {
      funnel_step: 'checkout',
      transaction_id: transactionId,
      value,
      include_order_bump: includeOrderBump,
    });
  },

  /**
   * Track upsell page view
   */
  upsellView(upsellNumber: number, productName: string, price: number): void {
    this.event('funnel_upsell_view', {
      funnel_step: `upsell_${upsellNumber}`,
      item_name: productName,
      value: price,
      currency: 'USD',
    });
  },

  /**
   * Track upsell accepted
   */
  upsellAccepted(
    upsellNumber: number,
    productName: string,
    price: number,
    transactionId?: string
  ): void {
    // Track as purchase
    if (transactionId) {
      this.purchase({
        transaction_id: transactionId,
        value: price,
        items: [
          {
            item_id: productName.toLowerCase().replace(/\s+/g, '-'),
            item_name: productName,
            item_category: 'upsell',
            price,
            quantity: 1,
          },
        ],
      });
    }

    this.event('funnel_upsell_accepted', {
      funnel_step: `upsell_${upsellNumber}`,
      item_name: productName,
      value: price,
      currency: 'USD',
    });
  },

  /**
   * Track upsell declined
   */
  upsellDeclined(upsellNumber: number, productName: string, price: number): void {
    this.event('funnel_upsell_declined', {
      funnel_step: `upsell_${upsellNumber}`,
      item_name: productName,
      value: price,
      currency: 'USD',
    });
  },

  /**
   * Track downsell page view
   */
  downsellView(downsellNumber: number, productName: string, price: number): void {
    this.event('funnel_downsell_view', {
      funnel_step: `downsell_${downsellNumber}`,
      item_name: productName,
      value: price,
      currency: 'USD',
    });
  },

  /**
   * Track downsell accepted
   */
  downsellAccepted(
    downsellNumber: number,
    productName: string,
    price: number,
    transactionId?: string
  ): void {
    // Track as purchase
    if (transactionId) {
      this.purchase({
        transaction_id: transactionId,
        value: price,
        items: [
          {
            item_id: productName.toLowerCase().replace(/\s+/g, '-'),
            item_name: productName,
            item_category: 'downsell',
            price,
            quantity: 1,
          },
        ],
      });
    }

    this.event('funnel_downsell_accepted', {
      funnel_step: `downsell_${downsellNumber}`,
      item_name: productName,
      value: price,
      currency: 'USD',
    });
  },

  /**
   * Track downsell declined
   */
  downsellDeclined(downsellNumber: number, productName: string, price: number): void {
    this.event('funnel_downsell_declined', {
      funnel_step: `downsell_${downsellNumber}`,
      item_name: productName,
      value: price,
      currency: 'USD',
    });
  },

  /**
   * Track funnel completed (reached thank you page)
   */
  funnelCompleted(totalValue: number): void {
    this.event('funnel_completed', {
      funnel_step: 'thank_you',
      total_value: totalValue,
      currency: 'USD',
    });
  },
};

export default ga4;
