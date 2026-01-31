import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

// Prices in cents
const RESISTANCE_MAP_PRICE = 700; // $7.00
const ORDER_BUMP_PRICE = 2700; // $27.00

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { includeOrderBump } = body;

    // Calculate total amount
    let amount = RESISTANCE_MAP_PRICE;
    if (includeOrderBump) {
      amount += ORDER_BUMP_PRICE;
    }

    // Create PaymentIntent WITHOUT a customer attached
    // The customer will be attached later in update-payment-intent
    // when the user enters their real email address
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      // Don't attach customer here - will be attached during update
      metadata: {
        product: 'resistance_map',
        includeOrderBump: includeOrderBump ? 'true' : 'false',
        priceIds: includeOrderBump
          ? `${process.env.STRIPE_RESISTANCE_MAP_PRICE_ID},${process.env.STRIPE_ORDER_BUMP_PRICE_ID}`
          : process.env.STRIPE_RESISTANCE_MAP_PRICE_ID!,
      },
      // Save payment method for one-click upsells
      setup_future_usage: 'off_session',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
