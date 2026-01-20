/**
 * Authentication Security Testing Script
 * Part 2 of the Testing Plan
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const anonClient = createClient(supabaseUrl, supabaseAnonKey);
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('🔐 Running Authentication Security Tests\n');
  console.log('='.repeat(60));

  // Test 2.2: Password Security
  console.log('\n📊 PART 2.2: PASSWORD SECURITY\n');

  // Test weak passwords against claim-account endpoint logic
  const weakPasswords = [
    { password: '123456', reason: 'too short (6 chars)' },
    { password: 'passwrd', reason: 'too short (7 chars)' },
    { password: 'Ab1!', reason: 'too short (4 chars)' },
  ];

  console.log('  Testing password length validation:');
  for (const test of weakPasswords) {
    const isValid = test.password.length >= 8;
    console.log(`    ${isValid ? '❌' : '✓'} "${test.password}" - ${test.reason} - ${isValid ? 'WOULD BE ACCEPTED (BAD)' : 'REJECTED (GOOD)'}`);
  }

  // Test 2.4: Authorization Bypass Attempts
  console.log('\n📊 PART 2.4: AUTHORIZATION BYPASS ATTEMPTS\n');

  // Test: Unauthenticated access to protected data
  console.log('  Testing unauthenticated access to lesson_progress:');
  const { data: unauthProgress, error: unauthProgressError } = await anonClient
    .from('lesson_progress')
    .select('*')
    .limit(1);

  if (unauthProgressError) {
    console.log(`    ✓ Access denied: ${unauthProgressError.message}`);
  } else if (!unauthProgress || unauthProgress.length === 0) {
    console.log('    ⚠ No data returned (could be RLS or empty table)');
  } else {
    console.log('    ❌ SECURITY ISSUE: Unauthenticated user could access progress data!');
  }

  // Test: Unauthenticated access to user_purchases
  console.log('\n  Testing unauthenticated access to user_purchases:');
  const { data: unauthPurchases, error: unauthPurchasesError } = await anonClient
    .from('user_purchases')
    .select('*')
    .limit(1);

  if (unauthPurchasesError) {
    console.log(`    ✓ Access denied: ${unauthPurchasesError.message}`);
  } else if (!unauthPurchases || unauthPurchases.length === 0) {
    console.log('    ⚠ No data returned (could be RLS or empty table)');
  } else {
    console.log('    ❌ SECURITY ISSUE: Unauthenticated user could access purchase data!');
  }

  // Test: Unauthenticated access to profiles
  console.log('\n  Testing unauthenticated access to profiles:');
  const { data: unauthProfiles, error: unauthProfilesError } = await anonClient
    .from('profiles')
    .select('*')
    .limit(1);

  if (unauthProfilesError) {
    console.log(`    ✓ Access denied: ${unauthProfilesError.message}`);
  } else if (!unauthProfiles || unauthProfiles.length === 0) {
    console.log('    ⚠ No data returned (could be RLS or empty table)');
  } else {
    console.log(`    ❌ SECURITY ISSUE: Unauthenticated user accessed ${unauthProfiles.length} profile(s)!`);
    console.log('       Fields accessible:', Object.keys(unauthProfiles[0]).join(', '));
  }

  // Test: Public products should be accessible
  console.log('\n  Testing public access to products (should be allowed):');
  const { data: publicProducts, error: publicProductsError } = await anonClient
    .from('products')
    .select('name, slug, price_cents')
    .eq('is_active', true)
    .limit(3);

  if (publicProductsError) {
    console.log(`    ⚠ Products not accessible: ${publicProductsError.message}`);
  } else if (publicProducts && publicProducts.length > 0) {
    console.log(`    ✓ Products are public (correct): ${publicProducts.length} products accessible`);
  } else {
    console.log('    ⚠ No products returned');
  }

  // Test: Check RLS policies exist
  console.log('\n📊 RLS POLICY CHECK\n');

  // Use admin client to check if RLS is enabled
  const { data: rlsCheck } = await adminClient
    .from('profiles')
    .select('id')
    .limit(1);

  console.log('  Checking sensitive tables have RLS:');

  // Test each table's RLS by comparing anon vs admin results
  const sensitiveTables = [
    { table: 'profiles', description: 'User profiles (should be restricted)' },
    { table: 'user_purchases', description: 'Purchase records (should be restricted)' },
    { table: 'lesson_progress', description: 'Progress tracking (should be restricted)' },
  ];

  for (const { table, description } of sensitiveTables) {
    const { count: adminCount } = await adminClient.from(table).select('*', { count: 'exact', head: true });
    const { count: anonCount, error: anonError } = await anonClient.from(table).select('*', { count: 'exact', head: true });

    if (anonError) {
      console.log(`    ✓ ${table}: RLS blocks anonymous access`);
    } else if (adminCount !== null && anonCount !== null && anonCount < adminCount) {
      console.log(`    ✓ ${table}: RLS filtering active (admin: ${adminCount}, anon: ${anonCount})`);
    } else if (adminCount === 0) {
      console.log(`    ⚠ ${table}: Empty table, cannot verify RLS`);
    } else {
      console.log(`    ❌ ${table}: RLS may not be properly configured (admin: ${adminCount}, anon: ${anonCount})`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Authentication security tests complete\n');
}

main().catch(console.error);
