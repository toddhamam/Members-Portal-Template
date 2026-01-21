/**
 * Stripe Configuration Verification (READ-ONLY - SAFE)
 * Part 1 of the Testing Plan - Environment Check Only
 */

import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;

if (!stripeSecretKey) {
  console.error('Missing STRIPE_SECRET_KEY');
  process.exit(1);
}

async function main() {
  console.log('💳 Stripe Configuration Check (READ-ONLY)\n');
  console.log('='.repeat(60));

  // Check if using live or test mode
  const isLiveMode = stripeSecretKey.startsWith('sk_live');

  console.log('\n📋 STRIPE MODE DETECTION\n');

  if (isLiveMode) {
    console.log('  ⚠️  WARNING: LIVE MODE DETECTED');
    console.log('  ⚠️  Key starts with: sk_live_...');
    console.log('  ⚠️  DO NOT run payment tests - real charges will occur!');
    console.log('  ⚠️  Test cards (4242...) will NOT work in live mode');
    console.log('\n  To test safely, switch to TEST mode in Stripe Dashboard');
    console.log('  and use keys starting with sk_test_...');
  } else {
    console.log('  ✓ Test Mode: Safe for testing');
    console.log('  ✓ Key starts with: sk_test_...');
    console.log('  ✓ Test cards will work');
  }

  // Initialize Stripe client
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-12-15.clover',
  });

  // Safe read-only check: Get account balance
  console.log('\n📋 STRIPE CONNECTION TEST\n');

  try {
    const balance = await stripe.balance.retrieve();
    console.log(`  ✓ Connected to Stripe successfully`);
    console.log(`  ✓ Mode: ${balance.livemode ? 'LIVE' : 'TEST'}`);
    console.log(`  ✓ Available balance: ${balance.available.map(b => `${b.amount / 100} ${b.currency.toUpperCase()}`).join(', ') || 'None'}`);
  } catch (error: unknown) {
    const err = error as Error;
    console.log(`  ❌ Connection failed: ${err.message}`);
  }

  // Check webhook secret format
  console.log('\n📋 WEBHOOK SECRET CHECK\n');

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (webhookSecret) {
    if (webhookSecret.startsWith('whsec_')) {
      console.log('  ✓ Webhook secret format is valid');
    } else {
      console.log('  ❌ Webhook secret should start with whsec_');
    }
  } else {
    console.log('  ❌ STRIPE_WEBHOOK_SECRET not configured');
  }

  // List products (safe read-only)
  console.log('\n📋 STRIPE PRODUCTS CHECK\n');

  try {
    const products = await stripe.products.list({ limit: 10, active: true });
    console.log(`  ✓ Found ${products.data.length} active products in Stripe:`);
    for (const product of products.data) {
      console.log(`      • ${product.name} (${product.id})`);
    }

    if (products.data.length === 0) {
      console.log('  ⚠️  No products found - you may need to create products in Stripe');
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.log(`  ❌ Failed to list products: ${err.message}`);
  }

  // List prices (safe read-only)
  console.log('\n📋 STRIPE PRICES CHECK\n');

  try {
    const prices = await stripe.prices.list({ limit: 10, active: true });
    console.log(`  ✓ Found ${prices.data.length} active prices in Stripe:`);
    for (const price of prices.data) {
      const amount = price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : 'Custom';
      const productId = typeof price.product === 'string' ? price.product : price.product?.id;
      console.log(`      • ${amount} ${price.currency.toUpperCase()} (${price.id}) - Product: ${productId}`);
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.log(`  ❌ Failed to list prices: ${err.message}`);
  }

  // Summary
  console.log('\n' + '='.repeat(60));

  if (isLiveMode) {
    console.log('\n⛔ LIVE MODE - Payment testing blocked for safety');
    console.log('   Switch to TEST mode keys to run full payment tests\n');
  } else {
    console.log('\n✅ TEST MODE - Safe to run full payment tests\n');
  }
}

main().catch(console.error);
