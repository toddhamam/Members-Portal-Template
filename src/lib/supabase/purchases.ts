import { createAdminClientInstance } from './server';

interface GrantProductAccessParams {
  email: string;
  fullName?: string;
  stripeCustomerId?: string;
  productSlug: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
}

// Helper to find or create a Supabase user and grant product access
export async function grantProductAccess({
  email,
  fullName,
  stripeCustomerId,
  productSlug,
  stripeSessionId,
  stripePaymentIntentId,
}: GrantProductAccessParams) {
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
