import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
      }
    }
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const adminSupabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('=== STEP 1: AUDITING CUSTOMER MIGRATION & MISSING RECORDS ===');
  // Check store.ts
  const storePath = path.resolve(process.cwd(), 'src/lib/data/store.ts');
  const storeContent = fs.readFileSync(storePath, 'utf8');
  
  // Extract COMPANY_NAMES from store.ts
  const match = storeContent.match(/const COMPANY_NAMES = \[([\s\S]*?)\];/);
  let expectedCompanies = [];
  if (match) {
    expectedCompanies = match[1]
      .split(',')
      .map(s => s.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }
  console.log(`Expected companies in store.ts: ${expectedCompanies.length}`);

  // Fetch all profiles from Supabase
  const { data: dbProfiles } = await adminSupabase.from('profiles').select('*');
  console.log(`Actual profiles in PostgreSQL: ${dbProfiles?.length}`);

  const dbEmails = new Set(dbProfiles?.map(p => p.email.toLowerCase()) || []);
  const dbCompanies = new Set(dbProfiles?.map(p => p.company_name?.toLowerCase()) || []);

  const missingCompanies = [];
  expectedCompanies.forEach((comp, idx) => {
    const firstName = ["Alex", "Jordan", "Taylor", "Morgan", "Sam", "Chris", "Pat", "Riley"][idx % 8];
    const lastName = ["Smith", "Johnson", "Miller", "Davis", "Wilson", "Anderson", "Taylor", "Thomas"][idx % 8];
    const cleanComp = comp.toLowerCase().replace(/[^a-z0-9]/g, "");
    const email = idx === 0 ? "customer@acme.corp" : `${firstName.toLowerCase()}@${cleanComp}.com`;
    const name = idx === 0 ? "Jane Doe (Acme Corp)" : `${firstName} ${lastName}`;
    
    // Check if in DB
    const foundByEmail = dbEmails.has(email.toLowerCase());
    const foundByCompany = Array.from(dbCompanies).some(c => c && c.includes(comp.toLowerCase()));
    
    if (!foundByEmail && !foundByCompany) {
      missingCompanies.push({ index: idx + 1, company: comp, email, name });
    }
  });

  console.log(`Total missing customer records: ${missingCompanies.length}`);
  console.log('First 5 missing:', missingCompanies.slice(0, 5));

  console.log('\n=== STEP 2: AUDITING RLS & CROSS-TENANT ISOLATION ===');
  // Test authentication for two customers:
  // Customer 1: customer@acme.corp
  // Customer 2: billing@wayne.ent
  const client1 = createClient(supabaseUrl, anonKey);
  const client2 = createClient(supabaseUrl, anonKey);

  const { data: auth1, error: err1 } = await client1.auth.signInWithPassword({
    email: 'customer@acme.corp',
    password: 'Bright@2026!'
  });

  const { data: auth2, error: err2 } = await client2.auth.signInWithPassword({
    email: 'billing@wayne.ent',
    password: 'Bright@2026!'
  });

  console.log('Customer 1 (Acme) Login:', err1 ? `FAILED: ${err1.message}` : `SUCCESS (UID: ${auth1.user?.id})`);
  console.log('Customer 2 (Wayne) Login:', err2 ? `FAILED: ${err2.message}` : `SUCCESS (UID: ${auth2.user?.id})`);

  if (!err1 && !err2) {
    // 1. Can Customer 1 see Customer 2's profile?
    const { data: p2FromClient1, error: rlsProfErr } = await client1
      .from('profiles')
      .select('*')
      .eq('id', auth2.user.id);
    console.log("Customer 1 querying Customer 2's profile:", p2FromClient1?.length ? `LEAK DETECTED! (${p2FromClient1.length} rows)` : 'SECURE (0 rows returned)');

    // 2. Can Customer 1 see Customer 2's subscriptions?
    const { data: s2FromClient1 } = await client1
      .from('subscriptions')
      .select('*')
      .eq('customer_id', auth2.user.id);
    console.log("Customer 1 querying Customer 2's subscriptions:", s2FromClient1?.length ? `LEAK DETECTED! (${s2FromClient1.length} rows)` : 'SECURE (0 rows returned)');

    // 3. Can Customer 1 see Customer 2's invoices?
    const { data: i2FromClient1 } = await client1
      .from('invoices')
      .select('*')
      .eq('customer_id', auth2.user.id);
    console.log("Customer 1 querying Customer 2's invoices:", i2FromClient1?.length ? `LEAK DETECTED! (${i2FromClient1.length} rows)` : 'SECURE (0 rows returned)');

    // 4. Can Customer 1 see Customer 1's own invoices?
    const { data: i1FromClient1 } = await client1
      .from('invoices')
      .select('*')
      .eq('customer_id', auth1.user.id);
    console.log("Customer 1 querying Customer 1's OWN invoices:", `Found ${i1FromClient1?.length || 0} rows`);

    // 5. Can Customer 1 update Customer 2's profile?
    const { error: updErr } = await client1
      .from('profiles')
      .update({ name: 'Hacked by Customer 1' })
      .eq('id', auth2.user.id);
    console.log("Customer 1 attempting to UPDATE Customer 2's profile:", updErr ? `BLOCKED by RLS: ${updErr.message}` : 'Check affected rows...');
    
    // Check if Wayne profile was modified
    const { data: checkWayne } = await adminSupabase.from('profiles').select('name').eq('id', auth2.user.id).single();
    console.log("Wayne profile current name:", checkWayne?.name);
  }

  console.log('\n=== STEP 3: AUDITING CRON ENDPOINT AUTHENTICATION ===');
  // Check CRON_SECRET behavior
  console.log('CRON_SECRET environment value:', process.env.CRON_SECRET || env.CRON_SECRET || '(undefined)');
  
  // Make a request to the local Next.js server cron route
  try {
    const unauthRes = await fetch('http://localhost:3000/api/cron/billing', {
      method: 'POST'
    });
    console.log('Call /api/cron/billing WITHOUT Authorization Header -> Status:', unauthRes.status);
    const unauthBody = await unauthRes.json();
    console.log('Response Body:', unauthBody);

    const badAuthRes = await fetch('http://localhost:3000/api/cron/billing', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer bad-fake-token' }
    });
    console.log('Call /api/cron/billing with INVALID Token -> Status:', badAuthRes.status);
    const badAuthBody = await badAuthRes.json();
    console.log('Response Body:', badAuthBody);
  } catch (err) {
    console.log('Fetch error connecting to /api/cron/billing:', err.message);
  }
}

main().catch(console.error);

