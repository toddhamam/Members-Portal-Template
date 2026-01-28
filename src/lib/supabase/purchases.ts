import { createAdminClientInstance } from './server';
import { triggerWelcome, triggerPurchase } from '@/lib/dm-automation';

interface GrantProductAccessParams {
  email: string;
  fullName?: string;
  stripeCustomerId?: string;
  productSlug: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  purchaseSource?: 'funnel' | 'portal';
}

// Helper to find or create a Supabase user and grant product access
export async function grantProductAccess({
  email,
  fullName,
  stripeCustomerId,
  productSlug,
  stripeSessionId,
  stripePaymentIntentId,
  purchaseSource = 'funnel',
}: GrantProductAccessParams) {
  console.log('[grantProductAccess] Starting for:', { email, productSlug, stripePaymentIntentId });

  // Check for required environment variable
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[grantProductAccess] CRITICAL: SUPABASE_SERVICE_ROLE_KEY is not set');
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }

  const supabase = createAdminClientInstance();

  // Normalize email to lowercase for consistent storage and lookup
  const emailLower = email.toLowerCase();
  console.log('[grantProductAccess] Normalized email:', emailLower);

  // Check if user already exists in profiles (case-insensitive)
  console.log('[grantProductAccess] Checking for existing profile...');
  const { data: existingProfile, error: profileLookupError } = await supabase
    .from('profiles')
    .select('id')
    .ilike('email', emailLower)
    .single();

  if (profileLookupError && profileLookupError.code !== 'PGRST116') {
    // PGRST116 is "no rows returned" which is expected for new users
    console.error('[grantProductAccess] Profile lookup error:', profileLookupError);
  }

  let userId: string;

  if (existingProfile) {
    // User exists, use their ID
    userId = existingProfile.id;
    console.log('[grantProductAccess] Found existing profile:', userId);

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
    console.log('[grantProductAccess] No existing profile, creating new auth user...');
    const [firstName, ...lastNameParts] = (fullName || '').split(' ');
    const lastName = lastNameParts.join(' ');

    const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
      email: emailLower,
      email_confirm: true, // Auto-confirm since they made a purchase
      user_metadata: {
        full_name: fullName || '',
      },
    });

    if (createUserError) {
      console.error('[grantProductAccess] Failed to create auth user:', createUserError);
      // User might already exist in auth but not in profiles (edge case)
      // Try to get user by email from auth
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const existingAuthUser = authUsers.users.find((u: { email?: string }) =>
        u.email?.toLowerCase() === emailLower
      );

      if (existingAuthUser) {
        userId = existingAuthUser.id;
        console.log('[grantProductAccess] Found existing auth user:', userId);

        // Create profile if it doesn't exist
        const { error: upsertError } = await supabase.from('profiles').upsert({
          id: userId,
          email: emailLower,
          full_name: fullName || '',
          first_name: firstName,
          last_name: lastName,
          stripe_customer_id: stripeCustomerId,
        }, { onConflict: 'id' });
        if (upsertError) {
          console.error('[grantProductAccess] Profile upsert error:', upsertError);
        }
      } else {
        console.error('[grantProductAccess] No existing auth user found, throwing error');
        throw createUserError;
      }
    } else {
      userId = newUser.user.id;
      console.log('[grantProductAccess] Created new auth user:', userId);

      // The trigger should create the profile, but let's update it with more info
      const { error: profileUpsertError } = await supabase.from('profiles').upsert({
        id: userId,
        email: emailLower,
        full_name: fullName || '',
        first_name: firstName,
        last_name: lastName,
        stripe_customer_id: stripeCustomerId,
      }, { onConflict: 'id' });
      if (profileUpsertError) {
        console.error('[grantProductAccess] Profile upsert error:', profileUpsertError);
      } else {
        console.log('[grantProductAccess] Profile upserted successfully');
      }
    }
  }

  // Get the product ID from the slug
  console.log('[grantProductAccess] Looking up product:', productSlug);
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id')
    .eq('slug', productSlug)
    .single();

  if (productError || !product) {
    console.error(`[grantProductAccess] Product not found: ${productSlug}`, productError);
    // Don't throw - product might not be seeded yet
    return { userId, granted: false };
  }
  console.log('[grantProductAccess] Found product:', product.id);

  // Grant access (upsert to handle duplicate purchases gracefully)
  console.log('[grantProductAccess] Granting product access...');
  const { error: purchaseError } = await supabase
    .from('user_purchases')
    .upsert({
      user_id: userId,
      product_id: product.id,
      stripe_checkout_session_id: stripeSessionId,
      stripe_payment_intent_id: stripePaymentIntentId,
      status: 'active',
      purchase_source: purchaseSource,
    }, { onConflict: 'user_id,product_id' });

  if (purchaseError) {
    console.error('[grantProductAccess] Failed to grant product access:', purchaseError);
    throw purchaseError;
  }

  console.log(`[grantProductAccess] SUCCESS: Granted access to ${productSlug} for user ${emailLower} (userId: ${userId})`);

  // Trigger DM automations (non-blocking)
  try {
    // Check if this is a new user (no existing profile before this call)
    if (!existingProfile) {
      // Trigger welcome message for new members
      triggerWelcome(userId).catch(err =>
        console.error('[grantProductAccess] Welcome automation failed (non-critical):', err)
      );
    }

    // Get product name for the purchase automation
    const { data: productData } = await supabase
      .from('products')
      .select('name')
      .eq('id', product.id)
      .single();

    // Trigger purchase automation
    triggerPurchase(userId, product.id, productData?.name || productSlug).catch(err =>
      console.error('[grantProductAccess] Purchase automation failed (non-critical):', err)
    );
  } catch (automationError) {
    console.error('[grantProductAccess] Automation trigger error (non-critical):', automationError);
  }

  return { userId, granted: true };
}
