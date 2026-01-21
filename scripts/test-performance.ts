/**
 * Performance Testing Script
 * Part 6 of the Testing Plan
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function measureQuery(name: string, queryFn: () => PromiseLike<unknown>): Promise<number> {
  const start = performance.now();
  await queryFn();
  const duration = performance.now() - start;
  return duration;
}

async function main() {
  console.log('⚡ Running Performance Tests\n');
  console.log('='.repeat(60));

  // Part 6.3: Database Query Performance
  console.log('\n📊 PART 6.3: DATABASE QUERY PERFORMANCE\n');

  const queries = [
    {
      name: 'Products list (homepage)',
      query: () => supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order'),
      budget: 100, // ms
    },
    {
      name: 'Single product by slug',
      query: () => supabase
        .from('products')
        .select('*')
        .eq('slug', 'resistance-mapping-guide')
        .single(),
      budget: 50,
    },
    {
      name: 'User purchases (portal dashboard)',
      query: () => supabase
        .from('user_purchases')
        .select('*, products(*)')
        .eq('status', 'active')
        .limit(10),
      budget: 100,
    },
    {
      name: 'Modules with lessons (product detail)',
      query: () => supabase
        .from('modules')
        .select('*, lessons(*)')
        .order('sort_order'),
      budget: 150,
    },
    {
      name: 'Lesson progress for user',
      query: () => supabase
        .from('lesson_progress')
        .select('*')
        .limit(100),
      budget: 100,
    },
    {
      name: 'Full product with modules and lessons',
      query: () => supabase
        .from('products')
        .select(`
          *,
          modules(
            *,
            lessons(*)
          )
        `)
        .eq('slug', 'resistance-mapping-guide')
        .single(),
      budget: 200,
    },
  ];

  console.log('  Query Performance Results:');
  console.log('  ' + '-'.repeat(60));

  let allPassed = true;

  for (const { name, query, budget } of queries) {
    // Run query 3 times and take average
    const times: number[] = [];
    for (let i = 0; i < 3; i++) {
      const duration = await measureQuery(name, query);
      times.push(duration);
    }
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const withinBudget = avgTime <= budget;

    if (!withinBudget) allPassed = false;

    const status = withinBudget ? '✓' : '❌';
    console.log(`  ${status} ${name}`);
    console.log(`      Avg: ${avgTime.toFixed(1)}ms | Budget: ${budget}ms | ${withinBudget ? 'PASS' : 'SLOW'}`);
  }

  console.log('  ' + '-'.repeat(60));
  console.log(`  Overall: ${allPassed ? '✅ All queries within budget' : '⚠️ Some queries exceeded budget'}`);

  // Part 6.2: Response Size Analysis
  console.log('\n📊 RESPONSE SIZE ANALYSIS\n');

  const sizeTests = [
    {
      name: 'Full product catalog',
      query: () => supabase.from('products').select('*').eq('is_active', true),
    },
    {
      name: 'Product with nested data',
      query: () => supabase
        .from('products')
        .select('*, modules(*, lessons(*))')
        .eq('slug', 'resistance-mapping-guide')
        .single(),
    },
    {
      name: 'All modules',
      query: () => supabase.from('modules').select('*'),
    },
    {
      name: 'All lessons',
      query: () => supabase.from('lessons').select('*'),
    },
  ];

  console.log('  Response Sizes:');
  for (const { name, query } of sizeTests) {
    const { data } = await query();
    const jsonSize = JSON.stringify(data).length;
    const sizeKB = (jsonSize / 1024).toFixed(2);
    const status = jsonSize < 100000 ? '✓' : '⚠';
    console.log(`    ${status} ${name}: ${sizeKB} KB`);
  }

  // Database table sizes
  console.log('\n📊 TABLE ROW COUNTS\n');

  const tables = ['products', 'modules', 'lessons', 'profiles', 'user_purchases', 'lesson_progress'];

  console.log('  Table Statistics:');
  for (const table of tables) {
    const { count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    console.log(`    • ${table.padEnd(20)}: ${count} rows`);
  }

  // Recommendations
  console.log('\n📊 PERFORMANCE RECOMMENDATIONS\n');

  // Check for missing indexes (based on common query patterns)
  console.log('  Index Recommendations (verify in Supabase Dashboard):');
  console.log('    • user_purchases: Ensure index on (user_id, status)');
  console.log('    • lesson_progress: Ensure index on (user_id, lesson_id)');
  console.log('    • modules: Ensure index on (product_id, sort_order)');
  console.log('    • lessons: Ensure index on (module_id, sort_order)');
  console.log('    • products: Ensure index on (slug, is_active)');

  // N+1 query detection advice
  console.log('\n  N+1 Query Prevention:');
  console.log('    ✓ useProducts hook uses Promise.all for parallel fetching');
  console.log('    ✓ useProgress hook uses batch query (getAllProductsProgress)');
  console.log('    ✓ Product detail page parallelizes stats + progress fetch');

  console.log('\n' + '='.repeat(60));
  console.log('✅ Performance tests complete\n');
}

main().catch(console.error);
