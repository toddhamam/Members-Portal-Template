/**
 * Pre-Production Checklist Script
 * Part 9 of the Testing Plan
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'manual';
  details: string;
}

async function main() {
  console.log('🚀 Running Pre-Production Checklist\n');
  console.log('='.repeat(60));

  const results: CheckResult[] = [];

  // 9.1: Environment Verification
  console.log('\n📋 PART 9.1: ENVIRONMENT VERIFICATION\n');

  // Check Supabase connection
  const { data: healthCheck, error: healthError } = await supabase
    .from('products')
    .select('id')
    .limit(1);

  if (healthError) {
    results.push({ name: 'Supabase Connection', status: 'fail', details: healthError.message });
    console.log('  ❌ Supabase Connection: FAILED');
  } else {
    results.push({ name: 'Supabase Connection', status: 'pass', details: 'Connected successfully' });
    console.log('  ✓ Supabase Connection: OK');
  }

  // Check for required environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'BUNNY_LIBRARY_ID',
    'BUNNY_API_KEY',
    'BUNNY_CDN_HOSTNAME',
    'BUNNY_TOKEN_KEY',
  ];

  const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);

  if (missingEnvVars.length > 0) {
    results.push({ name: 'Environment Variables', status: 'warning', details: `Missing: ${missingEnvVars.join(', ')}` });
    console.log(`  ⚠ Environment Variables: Missing ${missingEnvVars.length}`);
    for (const v of missingEnvVars) {
      console.log(`      • ${v}`);
    }
  } else {
    results.push({ name: 'Environment Variables', status: 'pass', details: 'All required vars present' });
    console.log('  ✓ Environment Variables: All present');
  }

  // Check Stripe configuration
  const stripeConfigured = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET;
  if (stripeConfigured) {
    const isLive = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live');
    results.push({
      name: 'Stripe Configuration',
      status: isLive ? 'warning' : 'pass',
      details: isLive ? 'LIVE MODE DETECTED' : 'Test mode'
    });
    console.log(`  ${isLive ? '⚠' : '✓'} Stripe Configuration: ${isLive ? 'LIVE MODE' : 'Test mode'}`);
  } else {
    results.push({ name: 'Stripe Configuration', status: 'warning', details: 'Not configured in local env' });
    console.log('  ⚠ Stripe Configuration: Not in local .env.local');
  }

  // 9.2: Database Health
  console.log('\n📋 DATABASE HEALTH\n');

  // Check for orphaned records
  const { data: orphanCheck } = await supabase
    .from('user_purchases')
    .select('id, user_id, product_id');

  let orphanedRecords = 0;
  if (orphanCheck) {
    for (const purchase of orphanCheck) {
      const { data: profile } = await supabase.from('profiles').select('id').eq('id', purchase.user_id).single();
      const { data: product } = await supabase.from('products').select('id').eq('id', purchase.product_id).single();
      if (!profile || !product) orphanedRecords++;
    }
  }

  if (orphanedRecords > 0) {
    results.push({ name: 'Data Integrity', status: 'fail', details: `${orphanedRecords} orphaned records` });
    console.log(`  ❌ Data Integrity: ${orphanedRecords} orphaned records found`);
  } else {
    results.push({ name: 'Data Integrity', status: 'pass', details: 'No orphaned records' });
    console.log('  ✓ Data Integrity: No orphaned records');
  }

  // Check all products have required fields
  const { data: products } = await supabase
    .from('products')
    .select('name, slug, price_cents, thumbnail_url, is_active')
    .eq('is_active', true);

  const productsWithIssues = (products || []).filter(p =>
    !p.name || !p.slug || p.price_cents === null || p.price_cents === undefined
  );

  if (productsWithIssues.length > 0) {
    results.push({ name: 'Product Data', status: 'fail', details: `${productsWithIssues.length} products missing required fields` });
    console.log(`  ❌ Product Data: ${productsWithIssues.length} products missing fields`);
  } else {
    results.push({ name: 'Product Data', status: 'pass', details: `${products?.length} products configured` });
    console.log(`  ✓ Product Data: ${products?.length} products configured correctly`);
  }

  // 9.3: Security Checks
  console.log('\n📋 SECURITY CHECKS\n');

  // RLS is enabled (tested by comparing anon vs admin counts)
  const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { count: adminCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: anonCount } = await anonClient.from('profiles').select('*', { count: 'exact', head: true });

  if (adminCount !== null && anonCount !== null && anonCount < adminCount) {
    results.push({ name: 'RLS Protection', status: 'pass', details: 'Row Level Security active' });
    console.log('  ✓ RLS Protection: Active (profiles table protected)');
  } else if (adminCount === 0) {
    results.push({ name: 'RLS Protection', status: 'warning', details: 'Cannot verify (empty table)' });
    console.log('  ⚠ RLS Protection: Cannot verify (empty table)');
  } else {
    results.push({ name: 'RLS Protection', status: 'fail', details: 'RLS may not be configured' });
    console.log('  ❌ RLS Protection: May not be properly configured');
  }

  // 9.4: Content Checks
  console.log('\n📋 CONTENT CHECKS\n');

  const { count: lessonCount } = await supabase.from('lessons').select('*', { count: 'exact', head: true });
  const { count: moduleCount } = await supabase.from('modules').select('*', { count: 'exact', head: true });

  results.push({ name: 'Content Structure', status: 'pass', details: `${moduleCount} modules, ${lessonCount} lessons` });
  console.log(`  ✓ Content Structure: ${moduleCount} modules, ${lessonCount} lessons`);

  // Check for lessons without content
  const { data: lessonsNoContent } = await supabase
    .from('lessons')
    .select('title, content_type')
    .is('bunny_video_id', null)
    .is('bunny_download_id', null);

  if (lessonsNoContent && lessonsNoContent.length > 0) {
    results.push({
      name: 'Lesson Content',
      status: 'warning',
      details: `${lessonsNoContent.length} lessons without Bunny content IDs`
    });
    console.log(`  ⚠ Lesson Content: ${lessonsNoContent.length} lessons need content IDs`);
  } else {
    results.push({ name: 'Lesson Content', status: 'pass', details: 'All lessons have content' });
    console.log('  ✓ Lesson Content: All lessons have content IDs');
  }

  // 9.5: Manual Verification Items
  console.log('\n📋 MANUAL VERIFICATION REQUIRED\n');

  const manualChecks = [
    'Stripe webhook endpoint configured in Stripe Dashboard',
    'Stripe webhook signing secret matches environment variable',
    'DNS properly configured for portal subdomain',
    'SSL certificates valid for all domains',
    'Bunny CDN CORS configured for your domains',
    'Error tracking (Sentry or similar) configured',
    'Uptime monitoring configured',
  ];

  for (const check of manualChecks) {
    results.push({ name: check, status: 'manual', details: 'Requires manual verification' });
    console.log(`  ⏹ ${check}`);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 CHECKLIST SUMMARY\n');

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const manual = results.filter(r => r.status === 'manual').length;

  console.log(`  ✅ Passed:   ${passed}`);
  console.log(`  ❌ Failed:   ${failed}`);
  console.log(`  ⚠️  Warnings: ${warnings}`);
  console.log(`  ⏹  Manual:   ${manual}`);

  // Go-Live Gate
  console.log('\n📋 GO-LIVE GATE\n');

  const goLiveGate = [
    { name: 'All critical tests pass', status: failed === 0 },
    { name: 'Zero critical bugs', status: failed === 0 },
    { name: 'RLS protection verified', status: results.find(r => r.name === 'RLS Protection')?.status === 'pass' },
    { name: 'Products configured', status: results.find(r => r.name === 'Product Data')?.status === 'pass' },
    { name: 'Stripe configured', status: !!process.env.STRIPE_SECRET_KEY },
  ];

  let canGoLive = true;
  for (const gate of goLiveGate) {
    const status = gate.status ? '✓' : '❌';
    console.log(`  ${status} ${gate.name}`);
    if (!gate.status) canGoLive = false;
  }

  console.log('\n' + '-'.repeat(40));
  if (canGoLive) {
    console.log('  🚀 READY FOR PRODUCTION (pending manual checks)');
  } else {
    console.log('  ⛔ NOT READY - Address failed items above');
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Pre-production checklist complete\n');
}

main().catch(console.error);
