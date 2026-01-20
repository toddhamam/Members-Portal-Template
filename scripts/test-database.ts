/**
 * Database Testing Script
 * Runs verification queries from the testing plan
 */

import { createClient } from '@supabase/supabase-js';

// Read env vars directly (when run with proper env loading)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('Run with: npx env-cmd -f .env.local npx ts-node scripts/test-database.ts');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('🔍 Running Database Verification Tests\n');
  console.log('='.repeat(60));

  // Part 0.2: Database State Verification
  console.log('\n📊 PART 0.2: DATABASE STATE VERIFICATION\n');

  const tables = ['profiles', 'products', 'user_purchases', 'lesson_progress', 'modules', 'lessons'];

  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`  ❌ ${table}: Error - ${error.message}`);
    } else {
      console.log(`  ✓ ${table}: ${count} records`);
    }
  }

  // Part 1.2: Product-Price Mapping Verification
  console.log('\n📊 PART 1.2: PRODUCT-PRICE MAPPING\n');

  const { data: products, error: productError } = await supabase
    .from('products')
    .select('slug, name, price_cents, product_type, is_active')
    .eq('is_active', true)
    .order('sort_order');

  if (productError) {
    console.log(`  ❌ Error fetching products: ${productError.message}`);
  } else if (products) {
    console.log('  Active Products:');
    for (const p of products) {
      console.log(`    • ${p.name}`);
      console.log(`      Slug: ${p.slug}`);
      console.log(`      Price: $${(p.price_cents / 100).toFixed(2)} (${p.price_cents} cents)`);
      console.log(`      Type: ${p.product_type}`);
    }
  }

  // Part 4.1: Foreign Key Verification (Orphan Detection)
  console.log('\n📊 PART 4.1: FOREIGN KEY VERIFICATION\n');

  // Check for orphaned purchases (users that don't exist)
  const { data: orphanedPurchaseUsers } = await supabase
    .from('user_purchases')
    .select('id, user_id, product_id');

  if (orphanedPurchaseUsers && orphanedPurchaseUsers.length > 0) {
    const userIds = [...new Set(orphanedPurchaseUsers.map(p => p.user_id))];
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('id')
      .in('id', userIds);

    const existingIds = new Set(existingProfiles?.map(p => p.id) || []);
    const orphaned = orphanedPurchaseUsers.filter(p => !existingIds.has(p.user_id));

    if (orphaned.length > 0) {
      console.log(`  ❌ Found ${orphaned.length} purchases with non-existent users`);
    } else {
      console.log(`  ✓ All user_purchases have valid user_id references`);
    }
  } else {
    console.log(`  ✓ No user_purchases to check (or table empty)`);
  }

  // Check for orphaned purchases (products that don't exist)
  if (orphanedPurchaseUsers && orphanedPurchaseUsers.length > 0) {
    const productIds = [...new Set(orphanedPurchaseUsers.map(p => p.product_id))];
    const { data: existingProducts } = await supabase
      .from('products')
      .select('id')
      .in('id', productIds);

    const existingIds = new Set(existingProducts?.map(p => p.id) || []);
    const orphaned = orphanedPurchaseUsers.filter(p => !existingIds.has(p.product_id));

    if (orphaned.length > 0) {
      console.log(`  ❌ Found ${orphaned.length} purchases with non-existent products`);
    } else {
      console.log(`  ✓ All user_purchases have valid product_id references`);
    }
  }

  // Check lesson_progress for orphaned records
  const { data: progressRecords } = await supabase
    .from('lesson_progress')
    .select('id, user_id, lesson_id');

  if (progressRecords && progressRecords.length > 0) {
    // Check user references
    const userIds = [...new Set(progressRecords.map(p => p.user_id))];
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('id')
      .in('id', userIds);

    const existingUserIds = new Set(existingProfiles?.map(p => p.id) || []);
    const orphanedUsers = progressRecords.filter(p => !existingUserIds.has(p.user_id));

    if (orphanedUsers.length > 0) {
      console.log(`  ❌ Found ${orphanedUsers.length} lesson_progress records with non-existent users`);
    } else {
      console.log(`  ✓ All lesson_progress have valid user_id references`);
    }

    // Check lesson references
    const lessonIds = [...new Set(progressRecords.map(p => p.lesson_id))];
    const { data: existingLessons } = await supabase
      .from('lessons')
      .select('id')
      .in('id', lessonIds);

    const existingLessonIds = new Set(existingLessons?.map(p => p.id) || []);
    const orphanedLessons = progressRecords.filter(p => !existingLessonIds.has(p.lesson_id));

    if (orphanedLessons.length > 0) {
      console.log(`  ❌ Found ${orphanedLessons.length} lesson_progress records with non-existent lessons`);
    } else {
      console.log(`  ✓ All lesson_progress have valid lesson_id references`);
    }
  } else {
    console.log(`  ✓ No lesson_progress records to check`);
  }

  // Part 4.3: Audit Trail Verification
  console.log('\n📊 PART 4.3: AUDIT TRAIL VERIFICATION\n');

  const auditTables = ['profiles', 'user_purchases', 'lesson_progress', 'products', 'modules', 'lessons'];

  for (const table of auditTables) {
    const { data: sample } = await supabase.from(table).select('*').limit(1);
    if (sample && sample.length > 0) {
      const record = sample[0];
      const hasCreatedAt = 'created_at' in record;
      const hasUpdatedAt = 'updated_at' in record;

      if (hasCreatedAt && hasUpdatedAt) {
        console.log(`  ✓ ${table}: has created_at and updated_at`);
      } else if (hasCreatedAt) {
        console.log(`  ⚠ ${table}: has created_at but missing updated_at`);
      } else {
        console.log(`  ❌ ${table}: missing timestamp columns`);
      }
    }
  }

  // Part 3.3: Access Control Data Check
  console.log('\n📊 PART 3: ACCESS CONTROL DATA CHECK\n');

  const { data: purchases } = await supabase
    .from('user_purchases')
    .select(`
      id,
      status,
      profiles!inner(email),
      products!inner(slug, name)
    `)
    .eq('status', 'active')
    .limit(10);

  if (purchases && purchases.length > 0) {
    console.log('  Active Purchases (first 10):');
    for (const p of purchases) {
      const profile = p.profiles as unknown as { email: string };
      const product = p.products as unknown as { slug: string; name: string };
      console.log(`    • ${profile.email} owns "${product.name}"`);
    }
  } else {
    console.log('  ⚠ No active purchases found');
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Database verification complete\n');
}

main().catch(console.error);
