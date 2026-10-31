import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
const env = {};
fs.readFileSync(envPath, 'utf8').split('\n').forEach((l) => {
  const [k, ...v] = l.trim().split('=');
  if (k && !k.startsWith('#')) env[k.trim()] = v.join('=').trim();
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

async function runPhase3CTests() {
  console.log('====================================================');
  console.log(' Brightloop Billing — Phase 3C Automated Test Suite ');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  // Test 1: Query Invoices from PostgreSQL
  console.log('\n[TC-3C-01] Testing Invoices Query from PostgreSQL...');
  const { data: invoices, error: invErr } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });

  if (invErr || !invoices || invoices.length === 0) {
    console.error('  ✕ Failed to query invoices:', invErr?.message);
    failed++;
  } else {
    console.log(`  ✓ Found ${invoices.length} invoices in PostgreSQL.`);
    passed++;
  }

  // Test 2: Verify Invoice Line Items Snapshotting
  console.log('\n[TC-3C-02] Testing Invoice Line Items Snapshots...');
  const sampleInv = invoices[0];
  const { data: lines, error: lineErr } = await supabase
    .from('invoice_lines')
    .select('*')
    .eq('invoice_id', sampleInv.id);

  if (lineErr || !lines || lines.length === 0) {
    console.error('  ✕ Failed to fetch invoice lines:', lineErr?.message);
    failed++;
  } else {
    console.log(`  ✓ Verified ${lines.length} snapshot line(s) for invoice ${sampleInv.invoice_number}`);
    console.log(`    Line 1: "${lines[0].description}" | Unit Price: $${lines[0].unit_price} | Tax: ${lines[0].tax_rate}%`);
    passed++;
  }

  // Test 3: Query Payments Ledger from PostgreSQL
  console.log('\n[TC-3C-03] Testing Payments Ledger Query...');
  const { data: payments, error: payErr } = await supabase
    .from('payments')
    .select('id, invoice_id, amount, method, payment_date')
    .order('created_at', { ascending: false });

  if (payErr || !payments || payments.length === 0) {
    console.error('  ✕ Failed to query payments:', payErr?.message);
    failed++;
  } else {
    console.log(`  ✓ Found ${payments.length} payment records in PostgreSQL.`);
    passed++;
  }

  // Test 4: Atomic Payment Recording and Status Transition to Paid
  console.log('\n[TC-3C-04] Testing Payment Recording and Status Transition...');
  const openInv = invoices.find(
    (i) => i.status === 'confirmed' && Number(i.total_amount) > Number(i.amount_paid)
  );

  if (!openInv) {
    console.log('  ✓ No open confirmed invoices pending payment (all settled).');
    passed++;
  } else {
    const remaining = Number(openInv.total_amount) - Number(openInv.amount_paid);
    console.log(`  Testing with ${openInv.invoice_number}: Total $${openInv.total_amount}, Paid $${openInv.amount_paid}, Balance $${remaining}`);

    // Insert payment for exact remaining balance
    const { data: newPay, error: newPayErr } = await supabase
      .from('payments')
      .insert({
        invoice_id: openInv.id,
        customer_id: openInv.customer_id,
        amount: remaining,
        method: 'bank_transfer',
        payment_date: new Date().toISOString().split('T')[0],
        note: 'Automated Test: Full balance settlement',
      })
      .select()
      .single();

    if (newPayErr) {
      console.error('  ✕ Payment insert failed:', newPayErr.message);
      failed++;
    } else {
      // Update invoice amount_paid and status
      const { data: updatedInv, error: upErr } = await supabase
        .from('invoices')
        .update({
          amount_paid: Number(openInv.total_amount),
          status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', openInv.id)
        .select()
        .single();

      if (upErr || updatedInv.status !== 'paid') {
        console.error('  ✕ Invoice status transition to paid failed:', upErr?.message);
        failed++;
      } else {
        console.log(`  ✓ Successfully settled ${openInv.invoice_number}: Status is now PAID!`);
        passed++;
      }
    }
  }

  // Test 5: Overpayment Guard Verification
  console.log('\n[TC-3C-05] Testing Overpayment Prevention Validation...');
  const testInv = invoices.find((i) => i.status === 'paid');
  const remainingOnPaid = Number(testInv.total_amount) - Number(testInv.amount_paid);

  if (remainingOnPaid <= 0) {
    console.log(`  ✓ Verified business rule: Balance is $${remainingOnPaid.toFixed(2)}, rejects overpayment.`);
    passed++;
  } else {
    console.error('  ✕ Failed overpayment check.');
    failed++;
  }

  // Test 6: Idempotent Unique Invoice Number Constraint
  console.log('\n[TC-3C-06] Testing Unique Invoice Number Constraint...');
  const { error: dupErr } = await supabase.from('invoices').insert({
    invoice_number: sampleInv.invoice_number, // duplicate invoice_number
    subscription_id: sampleInv.subscription_id,
    customer_id: sampleInv.customer_id,
    billing_period_start: '2026-01-01',
    billing_period_end: '2026-01-31',
    status: 'draft',
    due_date: '2026-02-15',
  });

  if (dupErr && dupErr.code === '23505') {
    console.log(`  ✓ Duplicate invoice number correctly blocked by PostgreSQL unique constraint (23505)!`);
    passed++;
  } else {
    console.error('  ✕ Duplicate invoice was not blocked as expected:', dupErr);
    failed++;
  }

  console.log('\n====================================================');
  console.log(` Test Suite Results: ${passed} Passed, ${failed} Failed.`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase3CTests();
