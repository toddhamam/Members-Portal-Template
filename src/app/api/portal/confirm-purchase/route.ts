import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { grantProductAccess } from '@/lib/supabase/purchases';
import { upsertProfile, trackEvent, addProfileToList, FunnelLists } from '@/lib/klaviyo';

// Lazy initialization to avoid build-time errors when env vars aren't available
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-12-15.clover',
    });
  }
  return stripeInstance;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the PaymentIntent to verify it succeeded
    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment has not succeeded', status: paymentIntent.status },
        { status: 400 }
      );
    }

    // Extract product info from metadata
    const { product_slug, customer_email, product_name } = paymentIntent.metadata;

    if (!product_slug || !customer_email) {
      return NextResponse.json(
        { error: 'Invalid payment metadata' },
        { status: 400 }
      );
    }

    // Get customer name from Stripe
    let fullName: string | undefined;
    if (paymentIntent.customer) {
      const customer = await getStripe().customers.retrieve(paymentIntent.customer as string);
      if (customer && !customer.deleted) {
        fullName = customer.name || undefined;
      }
    }

    // Grant product access (mark as portal purchase for analytics)
    const result = await grantProductAccess({
      email: customer_email,
      fullName,
      stripeCustomerId: paymentIntent.customer as string,
      productSlug: product_slug,
      stripePaymentIntentId: paymentIntentId,
      purchaseSource: 'portal',
    });

    if (!result.granted) {
      console.error(`Failed to grant access to ${product_slug} for ${customer_email}`);
      return NextResponse.json(
        { error: 'Failed to grant product access' },
        { status: 500 }
      );
    }

    // NON-CRITICAL: Sync to Klaviyo (wrapped to prevent errors)
    try {
      const [firstName, ...lastNameParts] = (fullName || '').split(' ');
      const lastName = lastNameParts.join(' ');

      await upsertProfile({
        email: customer_email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        properties: {
          [`purchased_${product_slug.replace(/-/g, '_')}`]: true,
          last_purchase_date: new Date().toISOString(),
          purchase_source: 'portal',
        },
      });

      // Add to customers list if configured
      if (FunnelLists.CUSTOMERS) {
        await addProfileToList(FunnelLists.CUSTOMERS, customer_email);
      }

      // Track portal purchase event
      await trackEvent({
        email: customer_email,
        eventName: 'Portal Purchase',
        properties: {
          product: product_name,
          product_slug: product_slug,
          order_id: paymentIntentId,
        },
        value: (paymentIntent.amount || 0) / 100,
      });

      console.log(`[Portal] Klaviyo sync completed for ${customer_email}`);
    } catch (klaviyoError) {
      console.error('[Portal] Klaviyo sync failed (non-critical):', klaviyoError);
    }

    return NextResponse.json({
      success: true,
      message: `Access granted to ${product_name}`,
      productSlug: product_slug,
    });
  } catch (error) {
    console.error('Portal confirm purchase error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm purchase' },
      { status: 500 }
    );
  }
}
