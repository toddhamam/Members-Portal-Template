import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, includeOrderBump } = body;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Build line items based on what's being purchased
    const lineItems: string[] = [process.env.STRIPE_RESISTANCE_MAP_PRICE_ID!];

    if (includeOrderBump) {
      lineItems.push(process.env.STRIPE_ORDER_BUMP_PRICE_ID!);
    }

    const session = await createCheckoutSession({
      priceId: lineItems[0], // Main product
      customerEmail: email,
      successUrl: `${baseUrl}/upsell-1?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/checkout`,
      metadata: {
        product: 'resistance_map',
        includeOrderBump: includeOrderBump ? 'true' : 'false',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
