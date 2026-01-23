import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClientInstance } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Check for Stripe secret key
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    });

    const body = await request.json();
    const { productSlug, email, fullName } = body;

    if (!productSlug || !email) {
      return NextResponse.json(
        { error: 'Product slug and email are required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClientInstance();

    // Get product with portal pricing
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, slug, name, price_cents, portal_price_cents')
      .eq('slug', productSlug)
      .eq('is_active', true)
      .single();

    if (productError) {
      console.error('Supabase product query error:', productError);
      return NextResponse.json(
        { error: `Product lookup failed: ${productError.message}` },
        { status: 500 }
      );
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Use portal price if available, otherwise fall back to regular price
    const priceCents = product.portal_price_cents ?? product.price_cents;

    if (priceCents <= 0) {
      return NextResponse.json(
        { error: 'Product price is not configured' },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer
    const emailLower = email.toLowerCase();
    let customer: Stripe.Customer;

    try {
      const customers = await stripe.customers.list({
        email: emailLower,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customer = customers.data[0];
        // Update name if provided and different
        if (fullName && customer.name !== fullName) {
          customer = await stripe.customers.update(customer.id, {
            name: fullName,
          });
        }
      } else {
        customer = await stripe.customers.create({
          email: emailLower,
          name: fullName || undefined,
        });
      }
    } catch (stripeCustomerError) {
      console.error('Stripe customer error:', stripeCustomerError);
      const message = stripeCustomerError instanceof Error ? stripeCustomerError.message : 'Unknown error';
      return NextResponse.json(
        { error: `Failed to create customer: ${message}` },
        { status: 500 }
      );
    }

    // Create PaymentIntent with portal-specific metadata
    let paymentIntent: Stripe.PaymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: priceCents,
        currency: 'usd',
        customer: customer.id,
        metadata: {
          source: 'portal',
          product_slug: product.slug,
          product_name: product.name,
          product_id: product.id,
          customer_email: emailLower,
        },
        // Save payment method for future purchases
        setup_future_usage: 'off_session',
        automatic_payment_methods: {
          enabled: true,
        },
      });
    } catch (stripePaymentError) {
      console.error('Stripe PaymentIntent error:', stripePaymentError);
      const message = stripePaymentError instanceof Error ? stripePaymentError.message : 'Unknown error';
      return NextResponse.json(
        { error: `Failed to create payment: ${message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
      amount: priceCents,
      productName: product.name,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Portal checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Checkout failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
