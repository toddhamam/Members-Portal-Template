import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { grantProductAccess } from '@/lib/supabase/purchases';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

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
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

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
      const customer = await stripe.customers.retrieve(paymentIntent.customer as string);
      if (customer && !customer.deleted) {
        fullName = customer.name || undefined;
      }
    }

    // Grant product access
    const result = await grantProductAccess({
      email: customer_email,
      fullName,
      stripeCustomerId: paymentIntent.customer as string,
      productSlug: product_slug,
      stripePaymentIntentId: paymentIntentId,
    });

    if (!result.granted) {
      console.error(`Failed to grant access to ${product_slug} for ${customer_email}`);
      return NextResponse.json(
        { error: 'Failed to grant product access' },
        { status: 500 }
      );
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
