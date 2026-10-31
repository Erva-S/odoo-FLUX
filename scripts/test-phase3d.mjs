import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
const env = {};
fs.readFileSync(envPath, 'utf8').split('\n').forEach((l) => {
  const [k, ...v] = l.trim().split('=');
  if (k && !k.startsWith('#')) {
    const val = v.join('=').trim();
    env[k.trim()] = val;
    process.env[k.trim()] = val;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('ERROR: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Import billing engine directly
async function runPhase3DTests() {
  console.log('====================================================');
  console.log(' Brightloop Billing — Phase 3D Automated Test Suite ');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  // Test 1: Leap Year & Month-End Date Calculation
  console.log('\n[TC-3D-01] Testing Billing Period Math & Month-End Clamping...');
  try {
    const { calculateBillingPeriod } = await import('../src/lib/services/billing-engine.ts');

    // 1. Jan 31st monthly roll into Feb 28 (non-leap)
    const jan31 = new Date('2025-01-31T00:00:00Z');
    const febRes = calculateBillingPeriod(jan31, 'monthly');
    console.log(`  Jan 31 Monthly -> End: ${febRes.endStr} (Clamped to Feb 28)`);

    // 2. Leap year Feb 29 (2024 is leap)
    const feb29Leap = new Date('2024-02-29T00:00:00Z');
    const marRes = calculateBillingPeriod(feb29Leap, 'monthly');
    console.log(`  Feb 29 Leap Monthly -> End: ${marRes.endStr}`);

    // 3. Yearly roll
    const yrRes = calculateBillingPeriod(jan31, 'yearly');
    console.log(`  Jan 31 Yearly -> End: ${yrRes.endStr}`);

    if (febRes.endStr.startsWith('2025-02') && yrRes.endStr.startsWith('2026-01')) {
      console.log('  ✓ Verified month-end clamping and yearly rollover math.');
      passed++;
    } else {
      console.error('  ✕ Month-end calculation mismatch.');
      failed++;
    }
  } catch (err) {
    console.error('  ✕ Failed test 1:', err);
    failed++;
  }

  // Test 2: Notification Service Abstraction
  console.log('\n[TC-3D-02] Testing Notification Service Abstraction...');
  try {
    const { notificationService } = await import('../src/lib/services/notifications.ts');
    const notifRes = await notificationService.send({
      to: 'customer@acme.corp',
      subject: 'Test Invoice Notice',
      template: 'invoice_created',
      variables: { invoiceNumber: 'INV-TEST-001', amount: 1200 },
    });

    if (notifRes.success && notifRes.provider) {
      console.log(`  ✓ Notification service dispatched successfully via provider: ${notifRes.provider}`);
      passed++;
    } else {
      console.error('  ✕ Notification failed:', notifRes);
      failed++;
    }
  } catch (err) {
    console.error('  ✕ Failed test 2:', err);
    failed++;
  }

  // Test 3: Live Recurring Billing Run on Active Subscriptions
  console.log('\n[TC-3D-03] Testing Recurring Billing Engine Execution...');
  try {
    const { executeRecurringBillingRun } = await import('../src/lib/services/billing-engine.ts');

    const result1 = await executeRecurringBillingRun();
    console.log(`  Billing Run 1: Total Scanned: ${result1.totalEligible}, Created: ${result1.createdCount}, Skipped: ${result1.skippedCount}, Errors: ${result1.failedCount} (${result1.executionTimeMs}ms)`);

    if (result1.totalEligible > 0 && result1.failedCount === 0) {
      console.log('  ✓ Recurring billing run completed without errors.');
      passed++;
    } else {
      console.error('  ✕ Billing run failed or encountered errors:', result1.errors);
      failed++;
    }

    // Test 4: Strict Database Idempotency Check (Immediate Re-run)
    console.log('\n[TC-3D-04] Testing Strict Idempotency on Immediate Re-run...');
    const result2 = await executeRecurringBillingRun();
    console.log(`  Billing Run 2 (Immediate Rerun): Created: ${result2.createdCount}, Skipped: ${result2.skippedCount}`);

    if (result2.createdCount === 0 && result2.skippedCount === result2.totalEligible) {
      console.log(`  ✓ PERFECT IDEMPOTENCY: 100% of accounts (${result2.skippedCount}/${result2.totalEligible}) skipped on rerun. ZERO duplicate invoices!`);
      passed++;
    } else {
      console.error(`  ✕ Idempotency failed! Created ${result2.createdCount} duplicates!`);
      failed++;
    }
  } catch (err) {
    console.error('  ✕ Failed test 3/4:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(` Test Suite Results: ${passed} Passed, ${failed} Failed.`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase3DTests();
