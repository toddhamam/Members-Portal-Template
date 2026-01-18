import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { trackEvent, upsertProfile, addProfileToList, FunnelEvents, FunnelLists } from '@/lib/klaviyo';
import { createShopifyOrder, findOrCreateCustomer } from '@/lib/shopify';
import { createAdminClientInstance } from '@/lib/supabase/server';
import Stripe from 'stripe';

// Helper to find or create a Supabase user and grant product access
async function grantProductAccess({
  email,
  fullName,
  stripeCustomerId,
  productSlug,
  stripeSessionId,
  stripePaymentIntentId,
}: {
  email: string;
  fullName?: string;
  stripeCustomerId?: string;
  productSlug: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
}) {
  const supabase = createAdminClientInstance();

  // Check if user already exists in profiles
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  let userId: string;

  if (existingProfile) {
    // User exists, use their ID
    userId = existingProfile.id;

    // Update stripe_customer_id if we have it and it's not set
    if (stripeCustomerId) {
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId)
        .is('stripe_customer_id', null);
    }
  } else {
    // Create a new auth user (email-only, no password yet)
    // The user will set their password on the thank you page
    const [firstName, ...lastNameParts] = (fullName || '').split(' ');
    const lastName = lastNameParts.join(' ');

    const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true, // Auto-confirm since they made a purchase
      user_metadata: {
        full_name: fullName || '',
      },
    });

    if (createUserError) {
      // User might already exist in auth but not in profiles (edge case)
      // Try to get user by email from auth
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const existingAuthUser = authUsers.users.find((u: { email?: string }) => u.email === email);

      if (existingAuthUser) {
        userId = existingAuthUser.id;

        // Create profile if it doesn't exist
        await supabase.from('profiles').upsert({
          id: userId,
          email,
          full_name: fullName || '',
          first_name: firstName,
          last_name: lastName,
          stripe_customer_id: stripeCustomerId,
        }, { onConflict: 'id' });
      } else {
        console.error('Failed to create Supabase user:', createUserError);
        throw createUserError;
      }
    } else {
      userId = newUser.user.id;

      // The trigger should create the profile, but let's update it with more info
      await supabase.from('profiles').upsert({
        id: userId,
        email,
        full_name: fullName || '',
        first_name: firstName,
        last_name: lastName,
        stripe_customer_id: stripeCustomerId,
      }, { onConflict: 'id' });
    }
  }

  // Get the product ID from the slug
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id')
    .eq('slug', productSlug)
    .single();

  if (productError || !product) {
    console.error(`Product not found: ${productSlug}`, productError);
    // Don't throw - product might not be seeded yet
    return { userId, granted: false };
  }

  // Grant access (upsert to handle duplicate purchases gracefully)
  const { error: purchaseError } = await supabase
    .from('user_purchases')
    .upsert({
      user_id: userId,
      product_id: product.id,
      stripe_checkout_session_id: stripeSessionId,
      stripe_payment_intent_id: stripePaymentIntentId,
      status: 'active',
    }, { onConflict: 'user_id,product_id' });

  if (purchaseError) {
    console.error('Failed to grant product access:', purchaseError);
    throw purchaseError;
  }

  console.log(`Granted access to ${productSlug} for user ${email}`);
  return { userId, granted: true };
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerEmail = session.customer_details?.email || '';
        const customerName = session.customer_details?.name || '';
        const [firstName, ...lastNameParts] = customerName.split(' ');
        const lastName = lastNameParts.join(' ');

        // 1. Create/update profile in Klaviyo
        await upsertProfile({
          email: customerEmail,
          firstName,
          lastName,
          properties: {
            purchased_resistance_map: true,
            purchase_date: new Date().toISOString(),
          },
        });

        // 2. Add to Klaviyo lists
        if (FunnelLists.CUSTOMERS) {
          await addProfileToList(FunnelLists.CUSTOMERS, customerEmail);
        }
        if (FunnelLists.RESISTANCE_MAP_BUYERS) {
          await addProfileToList(FunnelLists.RESISTANCE_MAP_BUYERS, customerEmail);
        }

        // 3. Track purchase event in Klaviyo
        await trackEvent({
          email: customerEmail,
          eventName: FunnelEvents.ORDER_COMPLETED,
          properties: {
            product: 'Resistance Mapping Guide™',
            order_id: session.id,
            include_order_bump: session.metadata?.includeOrderBump === 'true',
          },
          value: (session.amount_total || 0) / 100,
        });

        // 4. Create order in Shopify
        await findOrCreateCustomer({
          email: customerEmail,
          firstName,
          lastName,
          tags: ['resistance-map-buyer', 'funnel-customer'],
        });

        await createShopifyOrder({
          email: customerEmail,
          firstName,
          lastName,
          lineItems: [
            {
              title: 'Resistance Mapping Guide™ - Expanded 2nd Edition',
              quantity: 1,
              price: '7.00',
            },
            ...(session.metadata?.includeOrderBump === 'true'
              ? [{ title: 'Golden Thread Technique (Advanced)', quantity: 1, price: '17.00' }]
              : []),
          ],
          totalPrice: ((session.amount_total || 0) / 100).toFixed(2),
          tags: ['resistance-map', 'funnel-order'],
        });

        // 5. Create Supabase user and grant product access
        try {
          await grantProductAccess({
            email: customerEmail,
            fullName: customerName,
            stripeCustomerId: session.customer as string | undefined,
            productSlug: 'resistance-mapping-guide',
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent as string | undefined,
          });

          // Grant order bump access if purchased
          if (session.metadata?.includeOrderBump === 'true') {
            await grantProductAccess({
              email: customerEmail,
              fullName: customerName,
              stripeCustomerId: session.customer as string | undefined,
              productSlug: 'golden-thread-technique',
              stripeSessionId: session.id,
              stripePaymentIntentId: session.payment_intent as string | undefined,
            });
          }
        } catch (supabaseError) {
          // Log but don't fail the webhook - Supabase access can be granted manually
          console.error('Failed to grant Supabase access:', supabaseError);
        }

        break;
      }

      case 'payment_intent.succeeded': {
        // Handle upsell payments if needed
        console.log('Payment succeeded:', event.data.object);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
