import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

// Prices in cents
const RESISTANCE_MAP_PRICE = 700; // $7.00
const ORDER_BUMP_PRICE = 2700; // $27.00

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, fullName, includeOrderBump } = body;

    // Calculate total amount
    let amount = RESISTANCE_MAP_PRICE;
    if (includeOrderBump) {
      amount += ORDER_BUMP_PRICE;
    }

    // Create or retrieve customer
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });

    let customer: Stripe.Customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
      // Update name if provided
      if (fullName) {
        customer = await stripe.customers.update(customer.id, {
          name: fullName,
        });
      }
    } else {
      customer = await stripe.customers.create({
        email,
        name: fullName,
      });
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customer.id,
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
      customerId: customer.id,
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
