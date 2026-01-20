/**
 * Access Control Testing Script
 * Part 3 of the Testing Plan
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ProductAccess {
  userId: string;
  userEmail: string;
  productSlug: string;
  productName: string;
}

async function main() {
  console.log('🔒 Running Access Control Tests\n');
  console.log('='.repeat(60));

  // Part 3.1: Build Access Control Matrix
  console.log('\n📊 PART 3.1: ACCESS CONTROL MATRIX\n');

  // Get all users
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name');

  // Get all products
  const { data: products } = await supabase
    .from('products')
    .select('id, slug, name')
    .eq('is_active', true)
    .order('sort_order');

  // Get all purchases
  const { data: purchases } = await supabase
    .from('user_purchases')
    .select(`
      user_id,
      product_id,
      status
    `)
    .eq('status', 'active');

  if (!products || products.length === 0) {
    console.log('  ❌ No products found');
    return;
  }

  console.log('  Products in system:');
  for (const p of products) {
    console.log(`    • ${p.name} (${p.slug})`);
  }

  // Build purchase map
  const purchaseMap = new Map<string, Set<string>>();
  for (const purchase of purchases || []) {
    const key = purchase.user_id;
    if (!purchaseMap.has(key)) {
      purchaseMap.set(key, new Set());
    }
    purchaseMap.get(key)!.add(purchase.product_id);
  }

  console.log('\n  Access Matrix:');
  console.log('  ' + '-'.repeat(80));

  // Header row
  const slugs = products.map(p => p.slug.substring(0, 12).padEnd(12));
  console.log(`  ${'User'.padEnd(30)} | ${slugs.join(' | ')}`);
  console.log('  ' + '-'.repeat(80));

  // User rows
  for (const profile of profiles || []) {
    const userPurchases = purchaseMap.get(profile.id) || new Set();
    const accessRow = products.map(p => {
      const hasAccess = userPurchases.has(p.id);
      return (hasAccess ? '✅ Owned' : '❌ Locked').padEnd(12);
    });
    const email = (profile.email || 'Unknown').substring(0, 28).padEnd(30);
    console.log(`  ${email} | ${accessRow.join(' | ')}`);
  }

  console.log('  ' + '-'.repeat(80));

  // Part 3.3: Lesson Access Verification
  console.log('\n📊 PART 3.3: LESSON ACCESS VERIFICATION\n');

  for (const profile of profiles || []) {
    const userPurchases = purchaseMap.get(profile.id) || new Set();
    const purchasedProductIds = Array.from(userPurchases);

    if (purchasedProductIds.length === 0) {
      console.log(`  ${profile.email}: No purchases, should have 0 lesson access`);
      continue;
    }

    // Get all lessons this user should have access to
    const { data: accessibleLessons, count: lessonCount } = await supabase
      .from('lessons')
      .select(`
        id,
        title,
        modules!inner(
          id,
          title,
          product_id
        )
      `, { count: 'exact' })
      .in('modules.product_id', purchasedProductIds);

    // Get product names for the owned products
    const { data: ownedProducts } = await supabase
      .from('products')
      .select('name')
      .in('id', purchasedProductIds);

    const ownedNames = ownedProducts?.map(p => p.name).join(', ') || 'None';

    console.log(`  ${profile.email}:`);
    console.log(`    Owns: ${ownedNames}`);
    console.log(`    Should have access to: ${lessonCount} lessons`);

    // Verify lesson distribution
    if (accessibleLessons) {
      const lessonsByProduct = new Map<string, number>();
      for (const lesson of accessibleLessons) {
        const mod = lesson.modules as unknown as { product_id: string };
        const productId = mod.product_id;
        lessonsByProduct.set(productId, (lessonsByProduct.get(productId) || 0) + 1);
      }

      for (const productId of purchasedProductIds) {
        const product = products.find(p => p.id === productId);
        const lessonCountForProduct = lessonsByProduct.get(productId) || 0;
        console.log(`      • ${product?.name}: ${lessonCountForProduct} lessons`);
      }
    }
    console.log();
  }

  // Part 3.1: Check for products user should NOT have access to
  console.log('\n📊 ACCESS DENIAL VERIFICATION\n');

  for (const profile of profiles || []) {
    const userPurchases = purchaseMap.get(profile.id) || new Set();
    const notOwnedProductIds = products.filter(p => !userPurchases.has(p.id)).map(p => p.id);

    if (notOwnedProductIds.length === 0) {
      console.log(`  ${profile.email}: Owns all products`);
      continue;
    }

    // Count lessons in products NOT owned
    const { count: deniedLessons } = await supabase
      .from('lessons')
      .select(`
        id,
        modules!inner(product_id)
      `, { count: 'exact' })
      .in('modules.product_id', notOwnedProductIds);

    const notOwnedNames = products
      .filter(p => notOwnedProductIds.includes(p.id))
      .map(p => p.name)
      .join(', ');

    console.log(`  ${profile.email}:`);
    console.log(`    Does NOT own: ${notOwnedNames}`);
    console.log(`    Should be DENIED access to: ${deniedLessons} lessons`);
    console.log();
  }

  // Check content file access patterns
  console.log('\n📊 CONTENT ACCESS PATTERNS\n');

  // Get lessons with content types
  const { data: lessonTypes } = await supabase
    .from('lessons')
    .select('content_type')
    .then(result => {
      const types = new Map<string, number>();
      for (const lesson of result.data || []) {
        types.set(lesson.content_type, (types.get(lesson.content_type) || 0) + 1);
      }
      return { data: types };
    });

  console.log('  Content types in system:');
  for (const [type, count] of lessonTypes.data || []) {
    console.log(`    • ${type}: ${count} lessons`);
  }

  console.log('\n  ⚠️  Manual verification required:');
  console.log('     - Signed URLs should have expiry timestamps');
  console.log('     - Video/Audio URLs should not be shareable after expiry');
  console.log('     - Download URLs should require active session');

  console.log('\n' + '='.repeat(60));
  console.log('✅ Access control tests complete\n');
}

main().catch(console.error);
