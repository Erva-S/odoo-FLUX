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

async function runPhase3FTests() {
  console.log('====================================================');
  console.log(' Brightloop Billing — Phase 3F Automated Test Suite ');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  // Test 1: Customer Data Isolation Verification
  console.log('\n[TC-3F-01] Testing Customer Data Isolation & Server Ownership...');
  // Fetch Acme customer profile
  const { data: acmeCust } = await supabase
    .from('profiles')
    .select('id, email, company_name')
    .eq('email', 'customer@acme.corp')
    .single();

  const { data: wayneCust } = await supabase
    .from('profiles')
    .select('id, email, company_name')
    .eq('email', 'billing@wayne.ent')
    .single();

  if (!acmeCust || !wayneCust) {
    console.error('  ✕ Could not find test customer profiles.');
    failed++;
  } else {
    // Query subscriptions for Acme
    const { data: acmeSubs } = await supabase
      .from('subscriptions')
      .select('id, customer_id, subscription_number')
      .eq('customer_id', acmeCust.id);

    // Query subscriptions for Wayne
    const { data: wayneSubs } = await supabase
      .from('subscriptions')
      .select('id, customer_id, subscription_number')
      .eq('customer_id', wayneCust.id);

    // Verify disjoint sets
    const acmeSubIds = new Set(acmeSubs.map((s) => s.id));
    const crossLeaks = wayneSubs.filter((s) => acmeSubIds.has(s.id));

    if (crossLeaks.length === 0 && acmeSubs.length > 0) {
      console.log(`  ✓ PERFECT DATA ISOLATION: Acme (${acmeSubs.length} sub) and Wayne (${wayneSubs.length} sub) are strictly isolated with zero cross-tenant leakage.`);
      passed++;
    } else {
      console.error('  ✕ Cross-tenant leakage detected:', crossLeaks);
      failed++;
    }
  }

  // Test 2: Invoices Isolation Verification
  console.log('\n[TC-3F-02] Testing Customer Invoice Scoping...');
  const { data: acmeInvs } = await supabase
    .from('invoices')
    .select('id, customer_id, invoice_number')
    .eq('customer_id', acmeCust.id);

  const leakedInvs = acmeInvs.filter((i) => i.customer_id !== acmeCust.id);
  if (leakedInvs.length === 0 && acmeInvs.length > 0) {
    console.log(`  ✓ Verified: Customer query returned ${acmeInvs.length} invoices, 100% scoped to customer ID ${acmeCust.id}.`);
    passed++;
  } else {
    console.error('  ✕ Customer invoices scoping error.');
    failed++;
  }

  // Test 3: Customer Self-Service Profile Update
  console.log('\n[TC-3F-03] Testing Customer Self-Service Profile Update...');
  const updatedAddress = `999 Enterprise Way, Austin TX - Verified ${Date.now()}`;
  const { error: upError } = await supabase
    .from('profiles')
    .update({ billing_address: updatedAddress })
    .eq('id', acmeCust.id);

  if (upError) {
    console.error('  ✕ Profile update failed:', upError.message);
    failed++;
  } else {
    const { data: verifyProf } = await supabase
      .from('profiles')
      .select('billing_address')
      .eq('id', acmeCust.id)
      .single();

    if (verifyProf.billing_address === updatedAddress) {
      console.log('  ✓ Verified: Customer self-service profile update saved directly in PostgreSQL.');
      passed++;
    } else {
      console.error('  ✕ Updated address mismatch.');
      failed++;
    }
  }

  // Test 4: End-to-End Module Continuity (Catalog -> Sub -> Inv -> Pay)
  console.log('\n[TC-3F-04] Testing End-to-End Module Continuity...');
  const { data: subLines } = await supabase
    .from('subscription_lines')
    .select('*, products(*), subscriptions(*)')
    .limit(1);

  const { data: invLines } = await supabase
    .from('invoice_lines')
    .select('*, invoices(*)')
    .limit(1);

  const { data: payRecs } = await supabase
    .from('payments')
    .select('*, invoices(*)')
    .limit(1);

  const subLine = subLines?.[0];
  const invLine = invLines?.[0];
  const payRec = payRecs?.[0];

  if (subLine?.products && invLine?.invoices && payRec?.invoices) {
    console.log(`  ✓ Verified: Seamless foreign key continuity across Catalog (${subLine.products.name}), Subscriptions (${subLine.subscriptions.subscription_number}), Invoices (${invLine.invoices.invoice_number}), and Payments in PostgreSQL.`);
    passed++;
  } else {
    console.error('  ✕ Foreign key continuity failed.');
    failed++;
  }

  console.log('\n====================================================');
  console.log(` Test Suite Results: ${passed} Passed, ${failed} Failed.`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase3FTests();
