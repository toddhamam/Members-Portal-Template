import { NextRequest, NextResponse } from 'next/server';
import { stripe, processOneClickUpsell } from '@/lib/stripe';
import { trackEvent, FunnelEvents } from '@/lib/klaviyo';
import { grantProductAccess } from '@/lib/supabase/purchases';
import { trackServerPurchase } from '@/lib/meta-capi';
import {
  trackUpsellPurchase,
  trackUpsellDecline,
  trackDownsellPurchase,
  trackDownsellDecline,
} from '@/lib/funnel-tracking';
import { domains } from '@/config/brand';
import Stripe from 'stripe';

interface CustomerData {
  customerId: string;
  customerEmail: string;
  customerName: string;
  paymentMethodId: string;
}

/**
 * Get customer data from a PaymentIntent ID (Stripe Elements flow)
 */
async function getCustomerDataFromPaymentIntent(paymentIntentId: string): Promise<CustomerData | null> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['payment_method', 'customer'],
    });

    // Get payment method ID
    let paymentMethodId: string | undefined;
    if (typeof paymentIntent.payment_method === 'string') {
      paymentMethodId = paymentIntent.payment_method;
    } else if (paymentIntent.payment_method) {
      paymentMethodId = paymentIntent.payment_method.id;
    }

    if (!paymentMethodId) {
      console.error('[upsell] No payment method found on PaymentIntent');
      return null;
    }

    // Get customer ID
    let customerId: string | undefined;
    let customerEmail = '';
    let customerName = '';

    if (typeof paymentIntent.customer === 'string') {
      customerId = paymentIntent.customer;
      // Fetch customer details
      const customer = await stripe.customers.retrieve(customerId);
      if (customer && !customer.deleted) {
        customerEmail = customer.email || '';
        customerName = customer.name || '';
      }
    } else if (paymentIntent.customer && !paymentIntent.customer.deleted) {
      customerId = paymentIntent.customer.id;
      customerEmail = paymentIntent.customer.email || '';
      customerName = paymentIntent.customer.name || '';
    }

    // Fallback to metadata
    if (!customerEmail && paymentIntent.metadata?.customerEmail) {
      customerEmail = paymentIntent.metadata.customerEmail;
    }
    if (!customerName && paymentIntent.metadata?.customerName) {
      customerName = paymentIntent.metadata.customerName;
    }

    if (!customerId) {
      console.error('[upsell] No customer ID found on PaymentIntent');
      return null;
    }

    return {
      customerId,
      customerEmail,
      customerName,
      paymentMethodId,
    };
  } catch (error) {
    console.error('[upsell] Failed to get customer data from PaymentIntent:', error);
    return null;
  }
}

/**
 * Get customer data from a Checkout Session ID (legacy flow)
 */
async function getCustomerDataFromSession(sessionId: string): Promise<CustomerData | null> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'payment_intent.payment_method'],
    });

    const customerId = session.customer as string;
    const customerEmail = session.customer_details?.email || '';
    const customerName = session.customer_details?.name || '';
    const paymentIntent = session.payment_intent as Stripe.PaymentIntent & { payment_method: string };

    if (!customerId || !paymentIntent?.payment_method) {
      console.error('[upsell] Missing customer or payment method in session');
      return null;
    }

    return {
      customerId,
      customerEmail,
      customerName,
      paymentMethodId: paymentIntent.payment_method,
    };
  } catch (error) {
    console.error('[upsell] Failed to get customer data from session:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, upsellType, action } = body;

    // Determine if this is a PaymentIntent ID or Checkout Session ID
    // PaymentIntent IDs start with 'pi_', Checkout Session IDs start with 'cs_'
    const isPaymentIntent = sessionId?.startsWith('pi_');

    // Get customer and payment data based on ID type
    const customerData = isPaymentIntent
      ? await getCustomerDataFromPaymentIntent(sessionId)
      : await getCustomerDataFromSession(sessionId);

    if (!customerData) {
      return NextResponse.json(
        { error: 'Could not retrieve customer data. Please contact support.' },
        { status: 400 }
      );
    }

    const { customerId, customerEmail, customerName, paymentMethodId } = customerData;

    // Determine which upsell product and event
    let priceAmount: number;
    let productName: string;
    let productSlug: string;
    let acceptedEvent: string;
    let declinedEvent: string;

    switch (upsellType) {
      case 'upsell-1':
        priceAmount = 9700; // $97 in cents
        productName = 'The Pathless Path™ Program';
        productSlug = 'pathless-path';
        acceptedEvent = FunnelEvents.UPSELL_1_ACCEPTED;
        declinedEvent = FunnelEvents.UPSELL_1_DECLINED;
        break;
      case 'downsell-1':
        priceAmount = 2900; // $29 in cents
        productName = 'Nervous System Reset Kit™';
        productSlug = 'nervous-system-reset';
        acceptedEvent = FunnelEvents.DOWNSELL_1_ACCEPTED;
        declinedEvent = FunnelEvents.DOWNSELL_1_DECLINED;
        break;
      case 'upsell-2':
        priceAmount = 0; // $0 - call booking only, $1,495 charged after call
        productName = 'Bridge to Mastery™';
        productSlug = 'bridge-to-mastery';
        acceptedEvent = FunnelEvents.UPSELL_2_ACCEPTED;
        declinedEvent = FunnelEvents.UPSELL_2_DECLINED;
        break;
      default:
        return NextResponse.json({ error: 'Invalid upsell type' }, { status: 400 });
    }

    if (action === 'accept') {
      // Process the one-click upsell payment
      const upsellPayment = await processOneClickUpsell({
        customerId,
        paymentMethodId,
        amount: priceAmount,
        description: productName,
        metadata: {
          upsellType,
          originalSessionId: sessionId,
        },
      });

      // Grant product access in Supabase
      try {
        await grantProductAccess({
          email: customerEmail,
          fullName: customerName,
          stripeCustomerId: customerId,
          productSlug,
          stripeSessionId: sessionId,
          stripePaymentIntentId: upsellPayment.id,
        });
      } catch (accessError) {
        // Log but don't fail - access can be granted manually
        console.error('Failed to grant upsell product access:', accessError);
      }

      // NON-CRITICAL: Track in Klaviyo (wrapped to prevent checkout errors)
      try {
        await trackEvent({
          email: customerEmail,
          eventName: acceptedEvent,
          properties: {
            product: productName,
            value: priceAmount / 100,
          },
          value: priceAmount / 100,
        });
      } catch (klaviyoError) {
        console.error('[Upsell] Klaviyo tracking failed (non-critical):', klaviyoError);
      }

      // NON-CRITICAL: Track in Meta Conversions API (wrapped to prevent checkout errors)
      try {
        const [firstName, ...lastNameParts] = customerName.split(' ');
        const lastName = lastNameParts.join(' ');

        await trackServerPurchase({
          email: customerEmail,
          value: priceAmount / 100,
          currency: 'USD',
          orderId: upsellPayment.id,
          contentIds: [productSlug],
          contentName: productName,
          contentCategory: upsellType.startsWith('downsell') ? 'downsell' : 'upsell',
          numItems: 1,
          firstName,
          lastName,
          eventSourceUrl: `https://${domains.funnel}/${upsellType}`,
        });
      } catch (metaError) {
        console.error('[Upsell] Meta CAPI tracking failed (non-critical):', metaError);
      }

      // Track in funnel dashboard
      if (upsellType.startsWith('downsell')) {
        await trackDownsellPurchase(sessionId, priceAmount, productSlug);
      } else {
        await trackUpsellPurchase(
          sessionId,
          upsellType as 'upsell-1' | 'upsell-2',
          priceAmount,
          productSlug
        );
      }

      return NextResponse.json({ success: true, accepted: true, paymentIntentId: upsellPayment.id });
    } else {
      // NON-CRITICAL: Track decline in Klaviyo (wrapped to prevent checkout errors)
      try {
        await trackEvent({
          email: customerEmail,
          eventName: declinedEvent,
          properties: {
            product: productName,
          },
        });
      } catch (klaviyoError) {
        console.error('[Upsell] Klaviyo decline tracking failed (non-critical):', klaviyoError);
      }

      // Track decline in funnel dashboard
      if (upsellType.startsWith('downsell')) {
        await trackDownsellDecline(sessionId);
      } else {
        await trackUpsellDecline(sessionId, upsellType as 'upsell-1' | 'upsell-2');
      }

      return NextResponse.json({ success: true, accepted: false });
    }
  } catch (error) {
    console.error('Upsell error:', error);
    return NextResponse.json(
      { error: 'Failed to process upsell' },
      { status: 500 }
    );
  }
}
