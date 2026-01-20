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
    const { paymentIntentId, includeOrderBump } = body;

    // Calculate total amount
    let amount = RESISTANCE_MAP_PRICE;
    if (includeOrderBump) {
      amount += ORDER_BUMP_PRICE;
    }

    // Update the PaymentIntent with the new amount
    const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
      amount,
      metadata: {
        product: 'resistance_map',
        includeOrderBump: includeOrderBump ? 'true' : 'false',
        priceIds: includeOrderBump
          ? `${process.env.STRIPE_RESISTANCE_MAP_PRICE_ID},${process.env.STRIPE_ORDER_BUMP_PRICE_ID}`
          : process.env.STRIPE_RESISTANCE_MAP_PRICE_ID!,
      },
    });

    return NextResponse.json({
      success: true,
      amount: paymentIntent.amount,
    });
  } catch (error) {
    console.error('Update payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to update payment intent' },
      { status: 500 }
    );
  }
}
