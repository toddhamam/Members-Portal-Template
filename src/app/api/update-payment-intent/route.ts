import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';

// Prices in cents
const RESISTANCE_MAP_PRICE = 700; // $7.00
const ORDER_BUMP_PRICE = 2700; // $27.00

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, includeOrderBump, email, fullName } = body;

    // Calculate total amount
    let amount = RESISTANCE_MAP_PRICE;
    if (includeOrderBump) {
      amount += ORDER_BUMP_PRICE;
    }

    // If email is provided, update/create the customer and attach to PaymentIntent
    let customerId: string | undefined;
    if (email && email !== 'customer@example.com') {
      // Look for existing customer or create new one
      const customers = await stripe.customers.list({
        email: email.toLowerCase(),
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
          email: email.toLowerCase(),
          name: fullName || undefined,
        });
      }
      customerId = customer.id;
    }

    // Build update params
    const updateParams: Stripe.PaymentIntentUpdateParams = {
      amount,
      metadata: {
        product: 'resistance_map',
        includeOrderBump: includeOrderBump ? 'true' : 'false',
        priceIds: includeOrderBump
          ? `${process.env.STRIPE_RESISTANCE_MAP_PRICE_ID},${process.env.STRIPE_ORDER_BUMP_PRICE_ID}`
          : process.env.STRIPE_RESISTANCE_MAP_PRICE_ID!,
        // Store customer email/name in metadata for webhook to use
        customerEmail: email || '',
        customerName: fullName || '',
      },
    };

    // Attach customer if we have one
    if (customerId) {
      updateParams.customer = customerId;
    }

    // Update the PaymentIntent
    const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, updateParams);

    return NextResponse.json({
      success: true,
      amount: paymentIntent.amount,
      customerId,
    });
  } catch (error) {
    console.error('Update payment intent error:', error);

    // Extract meaningful error message for the user
    let errorMessage = 'Failed to process your information';
    if (error instanceof Stripe.errors.StripeError) {
      if (error.code === 'resource_missing') {
        errorMessage = 'Payment session expired. Please refresh the page and try again.';
      } else if (error.code === 'email_invalid') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message) {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
