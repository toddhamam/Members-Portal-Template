import { NextRequest, NextResponse } from 'next/server';
import { stripe, processOneClickUpsell } from '@/lib/stripe';
import { trackEvent, FunnelEvents } from '@/lib/klaviyo';
import { createShopifyOrder } from '@/lib/shopify';
import { grantProductAccess } from '@/lib/supabase/purchases';
import { trackServerPurchase } from '@/lib/meta-capi';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, upsellType, action } = body;

    // Get the original checkout session to find customer and payment method
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'payment_intent.payment_method'],
    });

    const customerId = session.customer as string;
    const customerEmail = session.customer_details?.email || '';
    const paymentIntent = session.payment_intent as { payment_method: string };

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
        priceAmount = 2700; // $27 in cents (discounted from $47)
        productName = 'Nervous System Reset Kit™';
        productSlug = 'nervous-system-reset';
        acceptedEvent = FunnelEvents.DOWNSELL_1_ACCEPTED;
        declinedEvent = FunnelEvents.DOWNSELL_1_DECLINED;
        break;
      case 'upsell-2':
        priceAmount = 1495; // $14.95 in cents
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
        paymentMethodId: paymentIntent.payment_method,
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
          fullName: session.customer_details?.name || '',
          stripeCustomerId: customerId,
          productSlug,
          stripeSessionId: sessionId,
          stripePaymentIntentId: upsellPayment.id,
        });
      } catch (accessError) {
        // Log but don't fail - access can be granted manually
        console.error('Failed to grant upsell product access:', accessError);
      }

      // Track in Klaviyo
      await trackEvent({
        email: customerEmail,
        eventName: acceptedEvent,
        properties: {
          product: productName,
          value: priceAmount / 100,
        },
        value: priceAmount / 100,
      });

      // Track in Meta Conversions API (server-side)
      const [firstName, ...lastNameParts] = (session.customer_details?.name || '').split(' ');
      const lastName = lastNameParts.join(' ');

      await trackServerPurchase({
        email: customerEmail,
        value: priceAmount / 100,
        currency: 'USD',
        orderId: upsellPayment.id,
        contentIds: [productSlug],
        contentName: productName,
        numItems: 1,
        firstName,
        lastName,
        eventSourceUrl: `https://offer.innerwealthinitiate.com/${upsellType}`,
      });

      // Create order in Shopify
      await createShopifyOrder({
        email: customerEmail,
        firstName: session.customer_details?.name?.split(' ')[0] || '',
        lastName: session.customer_details?.name?.split(' ').slice(1).join(' ') || '',
        lineItems: [{ title: productName, quantity: 1, price: (priceAmount / 100).toFixed(2) }],
        totalPrice: (priceAmount / 100).toFixed(2),
        tags: [upsellType, 'funnel-upsell'],
      });

      return NextResponse.json({ success: true, accepted: true });
    } else {
      // Track decline in Klaviyo
      await trackEvent({
        email: customerEmail,
        eventName: declinedEvent,
        properties: {
          product: productName,
        },
      });

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
