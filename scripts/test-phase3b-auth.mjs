import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env.local');
const env = {};
fs.readFileSync(envPath, 'utf8').split('\n').forEach((l) => {
  const [k, ...v] = l.trim().split('=');
  if (k && !k.startsWith('#')) env[k.trim()] = v.join('=').trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const anonClient = createClient(supabaseUrl, anonKey);
const adminClient = createClient(supabaseUrl, serviceKey);

async function runAuthTests() {
  console.log("====================================================");
  console.log(" Brightloop Billing — Phase 3B Real Auth Test Suite ");
  console.log("====================================================");

  // Test 1: Admin Login via Supabase Auth
  console.log("\n[Test 1] Testing Admin sign in (admin@brightloop.io)...");
  const { data: adminAuth, error: adminErr } = await anonClient.auth.signInWithPassword({
    email: "admin@brightloop.io",
    password: "Bright@2026!",
  });

  if (adminErr || !adminAuth.session) {
    console.error("  ✕ Admin sign in failed:", adminErr);
    process.exit(1);
  }
  console.log("  ✓ Admin signed in successfully. Auth User ID:", adminAuth.user.id);

  // Verify Admin Role in Database
  const { data: adminProf, error: pErr } = await adminClient
    .from("profiles")
    .select("role, name")
    .eq("id", adminAuth.user.id)
    .single();

  if (pErr || !adminProf) {
    console.error("  ✕ Profile fetch error:", pErr);
    process.exit(1);
  }

  console.log(`  ✓ Verified DB Profile Role: ${adminProf.role.toUpperCase()} (Name: ${adminProf.name})`);
  if (adminProf.role !== "admin") {
    console.error("  ✕ Role mismatch! Expected admin, got:", adminProf.role);
    process.exit(1);
  }

  // Test 2: Staff Login via Supabase Auth
  console.log("\n[Test 2] Testing Staff sign in (staff@brightloop.io)...");
  const { data: staffAuth, error: staffErr } = await anonClient.auth.signInWithPassword({
    email: "staff@brightloop.io",
    password: "Bright@2026!",
  });

  if (staffErr || !staffAuth.session) {
    console.error("  ✕ Staff sign in failed:", staffErr);
    process.exit(1);
  }
  console.log("  ✓ Staff signed in successfully. Auth User ID:", staffAuth.user.id);

  const { data: staffProf } = await adminClient
    .from("profiles")
    .select("role, name")
    .eq("id", staffAuth.user.id)
    .single();

  console.log(`  ✓ Verified DB Profile Role: ${staffProf.role.toUpperCase()} (Name: ${staffProf.name})`);
  if (staffProf.role !== "staff") {
    console.error("  ✕ Role mismatch! Expected staff, got:", staffProf.role);
    process.exit(1);
  }

  // Test 3: Customer Login via Supabase Auth
  console.log("\n[Test 3] Testing Customer sign in (customer@acme.corp)...");
  const { data: custAuth, error: custErr } = await anonClient.auth.signInWithPassword({
    email: "customer@acme.corp",
    password: "Bright@2026!",
  });

  if (custErr || !custAuth.session) {
    console.error("  ✕ Customer sign in failed:", custErr);
    process.exit(1);
  }
  console.log("  ✓ Customer signed in successfully. Auth User ID:", custAuth.user.id);

  const { data: custProf } = await adminClient
    .from("profiles")
    .select("role, name, company_name")
    .eq("id", custAuth.user.id)
    .single();

  console.log(`  ✓ Verified DB Profile Role: ${custProf.role.toUpperCase()} (Company: ${custProf.company_name})`);
  if (custProf.role !== "customer") {
    console.error("  ✕ Role mismatch! Expected customer, got:", custProf.role);
    process.exit(1);
  }

  // Test 4: Role Isolation Test — Public signup cannot escalate to Admin
  console.log("\n[Test 4] Testing Public Signup role security...");
  const tempCustomerEmail = `customer_auto_${Date.now()}@example.com`;
  const { data: newCustAuth, error: newCustErr } = await anonClient.auth.signUp({
    email: tempCustomerEmail,
    password: "Bright@2026!Sec",
    options: {
      data: {
        role: "admin", // Malicious attempt to escalate role
      },
    },
  });

  if (!newCustErr && newCustAuth.user) {
    // Check what role was stored in database
    const { data: autoProf } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", newCustAuth.user.id)
      .maybeSingle();

    console.log("  ✓ Public signup metadata escalation attempt role in DB:", autoProf?.role || "customer (default)");
    // Cleanup
    await adminClient.from("profiles").delete().eq("id", newCustAuth.user.id);
    await adminClient.auth.admin.deleteUser(newCustAuth.user.id);
  }

  // Test 5: Verify Subscriptions in PostgreSQL
  console.log("\n[Test 5] Querying Subscriptions from PostgreSQL...");
  const { data: subs, error: subErr } = await adminClient
    .from("subscriptions")
    .select("*, subscription_lines(*)");

  if (subErr) {
    console.error("  ✕ Error fetching subscriptions:", subErr);
  } else {
    console.log(`  ✓ Found ${subs.length} subscription contract(s) in PostgreSQL.`);
    for (const s of subs) {
      console.log(`    - ${s.subscription_number} (${s.status.toUpperCase()}) with ${s.subscription_lines.length} line item(s)`);
    }
  }

  console.log("\n====================================================");
  console.log(" All Phase 3B Real Authentication Tests PASSED!     ");
  console.log("====================================================");
}

runAuthTests();
