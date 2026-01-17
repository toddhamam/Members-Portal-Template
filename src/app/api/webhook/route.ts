import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { trackEvent, upsertProfile, addProfileToList, FunnelEvents, FunnelLists } from '@/lib/klaviyo';
import { createShopifyOrder, findOrCreateCustomer } from '@/lib/shopify';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerEmail = session.customer_details?.email || '';
        const customerName = session.customer_details?.name || '';
        const [firstName, ...lastNameParts] = customerName.split(' ');
        const lastName = lastNameParts.join(' ');

        // 1. Create/update profile in Klaviyo
        await upsertProfile({
          email: customerEmail,
          firstName,
          lastName,
          properties: {
            purchased_resistance_map: true,
            purchase_date: new Date().toISOString(),
          },
        });

        // 2. Add to Klaviyo lists
        if (FunnelLists.CUSTOMERS) {
          await addProfileToList(FunnelLists.CUSTOMERS, customerEmail);
        }
        if (FunnelLists.RESISTANCE_MAP_BUYERS) {
          await addProfileToList(FunnelLists.RESISTANCE_MAP_BUYERS, customerEmail);
        }

        // 3. Track purchase event in Klaviyo
        await trackEvent({
          email: customerEmail,
          eventName: FunnelEvents.ORDER_COMPLETED,
          properties: {
            product: 'Resistance Mapping Guide™',
            order_id: session.id,
            include_order_bump: session.metadata?.includeOrderBump === 'true',
          },
          value: (session.amount_total || 0) / 100,
        });

        // 4. Create order in Shopify
        await findOrCreateCustomer({
          email: customerEmail,
          firstName,
          lastName,
          tags: ['resistance-map-buyer', 'funnel-customer'],
        });

        await createShopifyOrder({
          email: customerEmail,
          firstName,
          lastName,
          lineItems: [
            {
              title: 'Resistance Mapping Guide™ - Expanded 2nd Edition',
              quantity: 1,
              price: '7.00',
            },
            ...(session.metadata?.includeOrderBump === 'true'
              ? [{ title: 'Golden Thread Technique (Advanced)', quantity: 1, price: '17.00' }]
              : []),
          ],
          totalPrice: ((session.amount_total || 0) / 100).toFixed(2),
          tags: ['resistance-map', 'funnel-order'],
        });

        break;
      }

      case 'payment_intent.succeeded': {
        // Handle upsell payments if needed
        console.log('Payment succeeded:', event.data.object);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
