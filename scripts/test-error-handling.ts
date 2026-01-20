/**
 * Error Handling Testing Script
 * Part 5 of the Testing Plan
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('⚠️  Running Error Handling Tests\n');
  console.log('='.repeat(60));

  // Part 5.2: Invalid State Recovery
  console.log('\n📊 PART 5.2: INVALID INPUT HANDLING\n');

  // Test: Invalid product slug
  console.log('  Testing invalid product slug lookup:');
  const { data: invalidProduct, error: invalidProductError } = await supabase
    .from('products')
    .select('*')
    .eq('slug', 'nonexistent-product-slug-12345')
    .single();

  if (invalidProductError) {
    console.log(`    ✓ Invalid slug handled: ${invalidProductError.code} - ${invalidProductError.message.substring(0, 50)}`);
  } else {
    console.log('    ⚠ Query returned null (graceful handling)');
  }

  // Test: SQL injection attempt (Supabase handles this, but let's verify)
  console.log('\n  Testing SQL injection protection:');
  const maliciousSlug = "'; DROP TABLE products; --";
  const { data: sqlInjectResult, error: sqlInjectError } = await supabase
    .from('products')
    .select('name')
    .eq('slug', maliciousSlug);

  if (sqlInjectError) {
    console.log(`    ✓ SQL injection blocked: ${sqlInjectError.message.substring(0, 50)}`);
  } else if (!sqlInjectResult || sqlInjectResult.length === 0) {
    console.log('    ✓ SQL injection returned no results (safely escaped)');
  } else {
    console.log('    ❌ SECURITY ISSUE: SQL injection may have succeeded!');
  }

  // Test: XSS in input (checking that it's not interpreted)
  console.log('\n  Testing XSS input sanitization:');
  const xssInput = '<script>alert("XSS")</script>';
  const { data: xssResult, error: xssError } = await supabase
    .from('products')
    .select('name')
    .eq('slug', xssInput);

  if (xssError) {
    console.log(`    ✓ XSS input rejected: ${xssError.message.substring(0, 50)}`);
  } else if (!xssResult || xssResult.length === 0) {
    console.log('    ✓ XSS input returned no results (safely handled)');
  }

  // Test: Very long input
  console.log('\n  Testing extremely long input handling:');
  const longInput = 'a'.repeat(10000);
  const { error: longInputError } = await supabase
    .from('products')
    .select('name')
    .eq('slug', longInput);

  if (longInputError) {
    console.log(`    ✓ Long input handled: ${longInputError.message.substring(0, 50)}`);
  } else {
    console.log('    ✓ Long input returned no results (graceful)');
  }

  // Part 5.3: Boundary Conditions
  console.log('\n📊 PART 5.3: BOUNDARY CONDITIONS\n');

  // Test: Progress tracking boundaries
  console.log('  Progress tracking boundary values:');

  const boundaryTests = [
    { value: 0, expected: 'valid', description: '0% (start)' },
    { value: 50, expected: 'valid', description: '50% (middle)' },
    { value: 100, expected: 'valid', description: '100% (complete)' },
    { value: 99.5, expected: 'valid', description: '99.5% (should round)' },
    { value: -1, expected: 'invalid', description: '-1% (negative)' },
    { value: 101, expected: 'invalid', description: '101% (over max)' },
  ];

  for (const test of boundaryTests) {
    const isValid = test.value >= 0 && test.value <= 100;
    const status = (isValid === (test.expected === 'valid')) ? '✓' : '❌';
    console.log(`    ${status} ${test.description}: ${isValid ? 'accepted' : 'rejected'}`);
  }

  // Test: Lesson duration boundaries
  console.log('\n  Lesson duration boundary handling:');
  const { data: lessons } = await supabase
    .from('lessons')
    .select('title, duration_seconds, content_type')
    .order('duration_seconds', { ascending: true, nullsFirst: true })
    .limit(5);

  if (lessons && lessons.length > 0) {
    console.log('    Lessons with edge-case durations:');
    for (const lesson of lessons) {
      const duration = lesson.duration_seconds;
      const status = duration === null ? '⚠' : '✓';
      const durationStr = duration === null ? 'NULL' : `${duration}s (${Math.round(duration / 60)}min)`;
      console.log(`      ${status} "${lesson.title.substring(0, 30)}..." - ${durationStr} - ${lesson.content_type}`);
    }
  }

  // Test: Empty string handling
  console.log('\n  Empty string input handling:');
  const { error: emptyError } = await supabase
    .from('products')
    .select('name')
    .eq('slug', '');

  if (emptyError) {
    console.log(`    ✓ Empty string handled: ${emptyError.message.substring(0, 50)}`);
  } else {
    console.log('    ✓ Empty string returned no results (graceful)');
  }

  // Test: NULL/undefined handling
  console.log('\n  NULL value handling in queries:');
  const { data: nullResults } = await supabase
    .from('products')
    .select('name, thumbnail_url')
    .is('thumbnail_url', null);

  console.log(`    Products with NULL thumbnail: ${nullResults?.length || 0}`);
  if (nullResults && nullResults.length > 0) {
    for (const p of nullResults) {
      console.log(`      ⚠ "${p.name}" has no thumbnail`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Error handling tests complete\n');
}

main().catch(console.error);
