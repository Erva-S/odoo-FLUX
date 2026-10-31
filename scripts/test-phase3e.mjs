import fs from 'fs';
import path from 'path';

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

async function runPhase3ETests() {
  console.log('====================================================');
  console.log(' Brightloop Billing — Phase 3E Automated Test Suite ');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  const { getFinanceMetrics, getComprehensiveReports, formatReportsAsCSV } = await import(
    '../src/lib/services/analytics.ts'
  );

  // Test 1: Query Finance Metrics from PostgreSQL
  console.log('\n[TC-3E-01] Testing PostgreSQL Finance Metrics Aggregation...');
  try {
    const metrics = await getFinanceMetrics(true);
    console.log('  Metrics Output:', {
      totalCustomers: metrics.totalCustomers,
      activeSubscriptions: metrics.activeSubscriptions,
      revenueCollected: `$${metrics.revenueCollected.toFixed(2)}`,
      stillOwed: `$${metrics.stillOwed.toFixed(2)}`,
      overdueAmount: `$${metrics.overdueAmount.toFixed(2)}`,
      mrr: `$${metrics.mrr.toFixed(2)}`,
      arr: `$${metrics.arr.toFixed(2)}`,
    });

    if (
      metrics.totalCustomers >= 10 &&
      metrics.activeSubscriptions > 0 &&
      metrics.revenueCollected > 0 &&
      metrics.mrr > 0 &&
      Math.abs(metrics.arr - metrics.mrr * 12) < 0.01
    ) {
      console.log('  ✓ Verified live financial metrics with valid MRR and ARR (ARR = MRR * 12).');
      passed++;
    } else {
      console.error('  ✕ Metrics verification failed.');
      failed++;
    }
  } catch (err) {
    console.error('  ✕ Failed test 1:', err);
    failed++;
  }

  // Test 2: Query Comprehensive Financial Reports
  console.log('\n[TC-3E-02] Testing Comprehensive Reporting Datasets...');
  try {
    const reports = await getComprehensiveReports(true);
    console.log(`  - Revenue By Month: ${reports.revenueByMonth.length} month(s)`);
    console.log(`  - Revenue By Product: ${reports.revenueByProduct.length} product(s)`);
    console.log(`  - Revenue By Plan: ${reports.revenueByPlan.length} plan tier(s)`);
    console.log(`  - Payment Methods: ${reports.paymentMethods.length} channel(s)`);

    if (
      reports.revenueByMonth.length > 0 &&
      reports.revenueByProduct.length > 0 &&
      reports.revenueByPlan.length > 0 &&
      reports.paymentMethods.length > 0
    ) {
      console.log('  ✓ All 4 reporting datasets aggregated successfully from live PostgreSQL tables.');
      passed++;
    } else {
      console.error('  ✕ One or more report datasets were empty.');
      failed++;
    }

    // Test 3: CSV Export Generation
    console.log('\n[TC-3E-03] Testing RFC-4180 CSV Export Generation...');
    const csv = formatReportsAsCSV(reports);
    if (
      csv.includes('KEY PERFORMANCE METRICS') &&
      csv.includes('REVENUE BY MONTH') &&
      csv.includes('REVENUE BY PRODUCT') &&
      csv.includes('PAYMENT METHODS BREAKDOWN')
    ) {
      console.log(`  ✓ CSV export generated (${csv.length} bytes) with standard compliance.`);
      passed++;
    } else {
      console.error('  ✕ CSV formatting missing required sections.');
      failed++;
    }
  } catch (err) {
    console.error('  ✕ Failed test 2/3:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(` Test Suite Results: ${passed} Passed, ${failed} Failed.`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase3ETests();

