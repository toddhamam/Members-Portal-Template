import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { trackEvent, upsertProfile, addProfileToList, FunnelEvents, FunnelLists } from '@/lib/klaviyo';
import { createShopifyOrder, findOrCreateCustomer } from '@/lib/shopify';
import { grantProductAccess } from '@/lib/supabase/purchases';
import { trackServerPurchase } from '@/lib/meta-capi';
import { trackCheckoutPurchase } from '@/lib/funnel-tracking';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  console.log('[Webhook] Received webhook request');

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('[Webhook] No signature provided');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log('[Webhook] Event verified:', event.type, event.id);
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err);
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
        const includeOrderBump = session.metadata?.includeOrderBump === 'true';

        console.log('[Webhook] Processing checkout.session.completed for:', customerEmail);

        // CRITICAL SECTION: Track purchase to funnel dashboard FIRST
        console.log('[Webhook] Starting funnel dashboard tracking for Session:', session.id);
        const trackingSuccess = await trackCheckoutPurchase(
          session.id,
          session.amount_total || 0,
          includeOrderBump
        );
        console.log('[Webhook] Funnel dashboard tracking result:', trackingSuccess ? 'SUCCESS' : 'FAILED');

        // NON-CRITICAL SECTION: External integrations wrapped in try-catch

        // 1. Klaviyo: Create/update profile and track events
        try {
          await upsertProfile({
            email: customerEmail,
            firstName,
            lastName,
            properties: {
              purchased_resistance_map: true,
              purchase_date: new Date().toISOString(),
            },
          });

          if (FunnelLists.CUSTOMERS) {
            await addProfileToList(FunnelLists.CUSTOMERS, customerEmail);
          }
          if (FunnelLists.RESISTANCE_MAP_BUYERS) {
            await addProfileToList(FunnelLists.RESISTANCE_MAP_BUYERS, customerEmail);
          }

          await trackEvent({
            email: customerEmail,
            eventName: FunnelEvents.ORDER_COMPLETED,
            properties: {
              product: 'Resistance Mapping Guide™',
              order_id: session.id,
              include_order_bump: includeOrderBump,
            },
            value: (session.amount_total || 0) / 100,
          });
        } catch (klaviyoError) {
          console.error('[Webhook] Klaviyo integration failed (non-critical):', klaviyoError);
        }

        // 2. Meta Conversions API
        try {
          const orderValue = (session.amount_total || 0) / 100;
          const contentIds = ['resistance-mapping-guide'];
          if (includeOrderBump) {
            contentIds.push('golden-thread-technique');
          }

          await trackServerPurchase({
            email: customerEmail,
            value: orderValue,
            currency: 'USD',
            orderId: session.id,
            contentIds,
            contentName: 'Resistance Mapping Guide' + (includeOrderBump ? ' + Golden Thread' : ''),
            contentCategory: 'checkout',
            numItems: contentIds.length,
            firstName,
            lastName,
            eventSourceUrl: 'https://offer.innerwealthinitiate.com/thank-you',
          });
        } catch (metaError) {
          console.error('[Webhook] Meta CAPI integration failed (non-critical):', metaError);
        }

        // 3. Shopify: Create customer and order
        try {
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
              ...(includeOrderBump
                ? [{ title: 'Golden Thread Technique (Advanced)', quantity: 1, price: '17.00' }]
                : []),
            ],
            totalPrice: ((session.amount_total || 0) / 100).toFixed(2),
            tags: ['resistance-map', 'funnel-order'],
          });
        } catch (shopifyError) {
          console.error('[Webhook] Shopify integration failed (non-critical):', shopifyError);
        }

        // 4. Create Supabase user and grant product access
        try {
          await grantProductAccess({
            email: customerEmail,
            fullName: customerName,
            stripeCustomerId: session.customer as string | undefined,
            productSlug: 'resistance-mapping-guide',
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent as string | undefined,
          });

          // Grant order bump access if purchased
          if (includeOrderBump) {
            await grantProductAccess({
              email: customerEmail,
              fullName: customerName,
              stripeCustomerId: session.customer as string | undefined,
              productSlug: 'golden-thread-technique',
              stripeSessionId: session.id,
              stripePaymentIntentId: session.payment_intent as string | undefined,
            });
          }
        } catch (supabaseError) {
          // Log but don't fail the webhook - Supabase access can be granted manually
          console.error('Failed to grant Supabase access:', supabaseError);
        }

        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('[Webhook] Processing payment_intent.succeeded:', {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          metadata: paymentIntent.metadata,
        });

        // Only process front-end checkout payments (resistance_map product)
        // Skip upsell payments which are handled separately
        if (paymentIntent.metadata?.product !== 'resistance_map') {
          console.log('[Webhook] Skipping non-checkout payment_intent:', paymentIntent.id);
          break;
        }
        console.log('[Webhook] Processing checkout payment for customer');

        // Get customer details from metadata (set during checkout) or from customer object
        let customerEmail = paymentIntent.metadata?.customerEmail || '';
        let customerName = paymentIntent.metadata?.customerName || '';

        // If no email in metadata, try to get from customer
        if (!customerEmail && paymentIntent.customer) {
          const customer = await stripe.customers.retrieve(paymentIntent.customer as string);
          if (customer && !customer.deleted) {
            customerEmail = customer.email || '';
            customerName = customer.name || customerName;
          }
        }

        // If still no email, try to get from charges
        if (!customerEmail && paymentIntent.latest_charge) {
          const charge = await stripe.charges.retrieve(paymentIntent.latest_charge as string);
          if (charge.billing_details?.email) {
            customerEmail = charge.billing_details.email;
            customerName = charge.billing_details.name || customerName;
          }
        }

        // Skip if we still don't have an email (shouldn't happen with the fix)
        if (!customerEmail || customerEmail === 'customer@example.com') {
          console.error('[Webhook] CRITICAL: PaymentIntent missing valid customer email:', {
            paymentIntentId: paymentIntent.id,
            metadataEmail: paymentIntent.metadata?.customerEmail,
            hasCustomer: !!paymentIntent.customer,
            hasCharge: !!paymentIntent.latest_charge,
          });
          break;
        }
        console.log('[Webhook] Customer email found:', customerEmail);

        const [firstName, ...lastNameParts] = customerName.split(' ');
        const lastName = lastNameParts.join(' ');
        const includeOrderBump = paymentIntent.metadata?.includeOrderBump === 'true';

        console.log('[Webhook] Processing payment_intent.succeeded for:', customerEmail);

        // CRITICAL SECTION: These operations must succeed for the purchase to be properly recorded
        // Track purchase to funnel dashboard FIRST - this is critical for metrics
        console.log('[Webhook] Starting funnel dashboard tracking for PaymentIntent:', paymentIntent.id);
        const trackingSuccess = await trackCheckoutPurchase(
          paymentIntent.id,
          paymentIntent.amount,
          includeOrderBump
        );
        console.log('[Webhook] Funnel dashboard tracking result:', trackingSuccess ? 'SUCCESS' : 'FAILED');

        // NON-CRITICAL SECTION: External integrations that should not block the webhook
        // Wrap each in try-catch so failures don't cascade

        // 1. Klaviyo: Create/update profile and track events
        try {
          await upsertProfile({
            email: customerEmail,
            firstName,
            lastName,
            properties: {
              purchased_resistance_map: true,
              purchase_date: new Date().toISOString(),
            },
          });

          // Add to Klaviyo lists
          if (FunnelLists.CUSTOMERS) {
            await addProfileToList(FunnelLists.CUSTOMERS, customerEmail);
          }
          if (FunnelLists.RESISTANCE_MAP_BUYERS) {
            await addProfileToList(FunnelLists.RESISTANCE_MAP_BUYERS, customerEmail);
          }

          // Track purchase event in Klaviyo
          await trackEvent({
            email: customerEmail,
            eventName: FunnelEvents.ORDER_COMPLETED,
            properties: {
              product: 'Resistance Mapping Guide™',
              order_id: paymentIntent.id,
              include_order_bump: includeOrderBump,
            },
            value: paymentIntent.amount / 100,
          });
        } catch (klaviyoError) {
          console.error('[Webhook] Klaviyo integration failed (non-critical):', klaviyoError);
        }

        // 2. Meta Conversions API (server-side tracking)
        try {
          const orderValue = paymentIntent.amount / 100;
          const contentIds = ['resistance-mapping-guide'];
          if (includeOrderBump) {
            contentIds.push('golden-thread-technique');
          }

          await trackServerPurchase({
            email: customerEmail,
            value: orderValue,
            currency: 'USD',
            orderId: paymentIntent.id,
            contentIds,
            contentName: 'Resistance Mapping Guide' + (includeOrderBump ? ' + Golden Thread' : ''),
            contentCategory: 'checkout',
            numItems: contentIds.length,
            firstName,
            lastName,
            eventSourceUrl: 'https://offer.innerwealthinitiate.com/thank-you',
          });
        } catch (metaError) {
          console.error('[Webhook] Meta CAPI integration failed (non-critical):', metaError);
        }

        // 3. Shopify: Create customer and order
        try {
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
              ...(includeOrderBump
                ? [{ title: 'Golden Thread Technique (Advanced)', quantity: 1, price: '27.00' }]
                : []),
            ],
            totalPrice: (paymentIntent.amount / 100).toFixed(2),
            tags: ['resistance-map', 'funnel-order'],
          });
        } catch (shopifyError) {
          console.error('[Webhook] Shopify integration failed (non-critical):', shopifyError);
        }

        // CRITICAL: Create Supabase user and grant product access
        console.log('[Webhook] Starting Supabase product access grant for:', customerEmail);
        try {
          const mainResult = await grantProductAccess({
            email: customerEmail,
            fullName: customerName,
            stripeCustomerId: paymentIntent.customer as string | undefined,
            productSlug: 'resistance-mapping-guide',
            stripeSessionId: paymentIntent.id,
            stripePaymentIntentId: paymentIntent.id,
          });
          console.log('[Webhook] Main product access result:', mainResult);

          // Grant order bump access if purchased
          if (includeOrderBump) {
            console.log('[Webhook] Granting order bump access...');
            const bumpResult = await grantProductAccess({
              email: customerEmail,
              fullName: customerName,
              stripeCustomerId: paymentIntent.customer as string | undefined,
              productSlug: 'golden-thread-technique',
              stripeSessionId: paymentIntent.id,
              stripePaymentIntentId: paymentIntent.id,
            });
            console.log('[Webhook] Order bump access result:', bumpResult);
          }
          console.log('[Webhook] Supabase product access grant completed successfully');
        } catch (supabaseError) {
          console.error('[Webhook] FAILED to grant Supabase access:', supabaseError);
        }

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
