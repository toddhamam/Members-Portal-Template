import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClientInstance } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  try {
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

    if (productError || !product) {
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
    const customers = await stripe.customers.list({
      email: emailLower,
      limit: 1,
    });

    let customer: Stripe.Customer;
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

    // Create PaymentIntent with portal-specific metadata
    const paymentIntent = await stripe.paymentIntents.create({
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

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
      amount: priceCents,
      productName: product.name,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Portal checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
