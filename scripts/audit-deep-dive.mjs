import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.substring(0, idx).trim();
        const v = trimmed.substring(idx + 1).trim();
        env[k] = v;
      }
    }
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('--- ENV CHECK ---');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'PRESENT' : 'MISSING');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', anonKey ? 'PRESENT' : 'MISSING');
console.log('SUPABASE_SERVICE_ROLE_KEY:', serviceKey ? 'PRESENT' : 'MISSING');
console.log('CRON_SECRET:', env.CRON_SECRET ? 'PRESENT' : 'MISSING');

const adminSupabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const anonSupabase = createClient(supabaseUrl, anonKey);

async function runAudit() {
  console.log('\n=== AUDIT ITEM 1: CUSTOMERS & PROFILES ===');
  const { data: users, error: userErr } = await adminSupabase.auth.admin.listUsers();
  console.log('Supabase Auth Total Users:', users?.users?.length || 0, userErr ? `Error: ${userErr.message}` : '');
  if (users?.users) {
    users.users.forEach((u, idx) => {
      console.log(`  [${idx + 1}] Auth ID: ${u.id} | Email: ${u.email} | Confirmed: ${!!u.email_confirmed_at} | Role: ${u.user_metadata?.role}`);
    });
  }

  const { data: profiles, error: profErr } = await adminSupabase.from('profiles').select('*');
  console.log('\nPostgreSQL profiles table count:', profiles?.length || 0, profErr ? `Error: ${profErr.message}` : '');
  if (profiles) {
    profiles.forEach((p, idx) => {
      console.log(`  [${idx + 1}] Profile ID: ${p.id} | Role: ${p.role} | Email: ${p.email} | Company: ${p.company_name} | Name: ${p.name}`);
    });
  }

  // Check foreign key constraint on profiles.id
  console.log('\nChecking if profiles has FK to auth.users...');
  const probeId = '00000000-0000-4000-b000-000000000099';
  const { error: probeErr } = await adminSupabase.from('profiles').insert({
    id: probeId,
    email: 'fk_test_probe@example.com',
    name: 'FK Test Probe',
    role: 'customer'
  });
  if (probeErr) {
    console.log('profiles table DOES enforce FK constraint to auth.users:');
    console.log('  Constraint error message:', probeErr.message);
    console.log('  Details:', probeErr.details);
  } else {
    console.log('profiles table DOES NOT enforce FK to auth.users (dummy probe inserted successfully). Deleting probe...');
    await adminSupabase.from('profiles').delete().eq('id', probeId);
  }

  console.log('\n=== AUDIT ITEM 4: RLS & CROSS-TENANT ISOLATION ===');
  // Check RLS by querying with anonSupabase unauthenticated
  const { data: anonProfiles, error: anonProfErr } = await anonSupabase.from('profiles').select('*');
  console.log('Anon unauthenticated query on profiles: count =', anonProfiles?.length ?? 'null', 'Error:', anonProfErr?.message ?? 'None');

  const { data: anonInvoices, error: anonInvErr } = await anonSupabase.from('invoices').select('*');
  console.log('Anon unauthenticated query on invoices: count =', anonInvoices?.length ?? 'null', 'Error:', anonInvErr?.message ?? 'None');

  const { data: anonSubs, error: anonSubsErr } = await anonSupabase.from('subscriptions').select('*');
  console.log('Anon unauthenticated query on subscriptions: count =', anonSubs?.length ?? 'null', 'Error:', anonSubsErr?.message ?? 'None');

  const { data: anonProds, error: anonProdErr } = await anonSupabase.from('products').select('*');
  console.log('Anon unauthenticated query on products (should be public read): count =', anonProds?.length ?? 'null', 'Error:', anonProdErr?.message ?? 'None');

  console.log('\n=== AUDIT ITEM 6: INVOICES, LINES, TAXES, DISCOUNTS ===');
  const { data: invoices } = await adminSupabase.from('invoices').select('*, invoice_lines(*)');
  console.log('Total invoices in DB:', invoices?.length || 0);
  if (invoices && invoices.length > 0) {
    invoices.slice(0, 5).forEach(inv => {
      console.log(`Invoice ${inv.invoice_number}: Total=${inv.total_amount}, Due=${inv.amount_due}, Status=${inv.status}, LinesCount=${inv.invoice_lines?.length}`);
      if (inv.invoice_lines && inv.invoice_lines.length > 0) {
        inv.invoice_lines.forEach(l => {
          console.log(`  Line: ${l.description} | Qty: ${l.quantity} | UnitPrice: ${l.unit_price} | Disc%: ${l.discount_rate} | Tax%: ${l.tax_rate} | Subtotal: ${l.subtotal} | Total: ${l.total}`);
        });
      }
    });
  }

  console.log('\n=== AUDIT ITEM 7: PAYMENTS & OVERPAYMENT RECONCILIATION ===');
  const { data: payments } = await adminSupabase.from('payments').select('*');
  console.log('Total payments in DB:', payments?.length || 0);
  if (payments && payments.length > 0) {
    payments.slice(0, 5).forEach(p => {
      console.log(`Payment ${p.payment_reference}: Amount=${p.amount}, Status=${p.status}, Method=${p.payment_method}, InvID=${p.invoice_id}`);
    });
  }

  console.log('\n=== AUDIT ITEM 8: SUBSCRIPTIONS & UNIQUE PERIOD CONSTRAINT ===');
  const { data: subs } = await adminSupabase.from('subscriptions').select('*, subscription_lines(*)');
  console.log('Total subscriptions in DB:', subs?.length || 0);
  if (subs && subs.length > 0) {
    subs.slice(0, 5).forEach(s => {
      console.log(`Sub ${s.subscription_number}: Status=${s.status}, PeriodStart=${s.current_period_start}, PeriodEnd=${s.current_period_end}, Lines=${s.subscription_lines?.length}`);
    });
  }
}

runAudit().catch(console.error);

