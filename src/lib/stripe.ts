import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

export const stripe = {
  get checkout() {
    return getStripe().checkout;
  },
  get paymentIntents() {
    return getStripe().paymentIntents;
  },
  get paymentMethods() {
    return getStripe().paymentMethods;
  },
  get webhooks() {
    return getStripe().webhooks;
  },
};

// Create a checkout session for the main product
export async function createCheckoutSession({
  priceId,
  customerEmail,
  successUrl,
  cancelUrl,
  metadata,
}: {
  priceId: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  return getStripe().checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: customerEmail,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    // Save payment method for one-click upsells
    payment_intent_data: {
      setup_future_usage: 'off_session',
    },
  });
}

// Process one-click upsell using saved payment method
export async function processOneClickUpsell({
  customerId,
  paymentMethodId,
  amount,
  currency = 'aud',
  description,
  metadata,
}: {
  customerId: string;
  paymentMethodId: string;
  amount: number;
  currency?: string;
  description: string;
  metadata?: Record<string, string>;
}) {
  return getStripe().paymentIntents.create({
    amount,
    currency,
    customer: customerId,
    payment_method: paymentMethodId,
    off_session: true,
    confirm: true,
    description,
    metadata,
  });
}

// Retrieve customer's saved payment methods
export async function getCustomerPaymentMethods(customerId: string) {
  return getStripe().paymentMethods.list({
    customer: customerId,
    type: 'card',
  });
}
