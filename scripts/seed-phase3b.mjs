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

// Import seed customers from store
const COMPANY_NAMES = [
  "Acme Corporation", "Wayne Enterprises", "Stark Industries", "Cyberdyne Systems",
  "Pied Piper", "Hooli Tech", "Initech Solutions", "Massive Dynamic", "Umbrella Corp",
  "Globex Corporation", "Soylent Industries", "Oscorp Technologies", "Aperture Science",
  "Black Mesa Labs", "Tyrell Corporation", "Weyland-Yutani", "Dunder Mifflin Tech",
  "Gekko & Co", "Oceanic Global", "Nakatomi Trading", "Bluth Software", "Prestige Worldwide",
  "Vandelay Industries", "Sterling Cooper", "Monsters Inc Media", "E-Corp Digital",
  "Wonka Confections Tech", "Buy More Systems", "Krusty Enterprises", "Strickland Propane",
  "Brobdingnag Cloud", "Lilliput Micro", "Gargantua AI", "Pantagruel Analytics",
  "Omni Consumer Products", "Dharma Initiative", "Wonka Labs", "Ankh-Morpork Post",
  "Sirius Cybernetics", "Virtucon Global"
];

async function seedPhase3B() {
  console.log("====================================================");
  console.log(" Brightloop Billing — Phase 3B Database Seeding     ");
  console.log("====================================================");

  // 1. Provision 3 Core Auth Users (Admin, Staff, Customer)
  console.log("\n[1/3] Provisioning Supabase Auth Accounts...");
  const authUsersToProvision = [
    {
      email: "admin@brightloop.io",
      password: "Bright@2026!",
      name: "Sarah Jenkins (Admin)",
      role: "admin",
      company: "Brightloop Software HQ",
    },
    {
      email: "staff@brightloop.io",
      password: "Bright@2026!",
      name: "Marcus Vance (Staff)",
      role: "staff",
      company: "Brightloop Operations",
    },
    {
      email: "customer@acme.corp",
      password: "Bright@2026!",
      name: "Jane Doe (Acme Corp)",
      role: "customer",
      company: "Acme Industrial Technologies",
    },
  ];

  const provisionedAuthMap = new Map();

  for (const user of authUsersToProvision) {
    // Check if auth user exists
    const { data: userList } = await supabase.auth.admin.listUsers();
    let authUser = userList?.users?.find((u) => u.email?.toLowerCase() === user.email.toLowerCase());

    if (!authUser) {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { name: user.name, role: user.role, company: user.company },
      });

      if (createErr || !created.user) {
        console.error(`  ✕ Error creating auth user ${user.email}:`, createErr?.message);
        continue;
      }
      authUser = created.user;
      console.log(`  ＋ Created Auth user: ${user.email} (${user.role.toUpperCase()})`);
    } else {
      console.log(`  ↺ Auth user already exists: ${user.email} (${user.role.toUpperCase()})`);
    }

    provisionedAuthMap.set(user.email.toLowerCase(), authUser.id);

    // Upsert into profiles
    const profPayload = {
      id: authUser.id,
      email: user.email.toLowerCase(),
      name: user.name,
      role: user.role,
      company_name: user.company,
    };

    const { error: profErr } = await supabase.from("profiles").upsert(profPayload);
    if (profErr) {
      console.error(`  ✕ Profile upsert error for ${user.email}:`, profErr.message);
    } else {
      console.log(`  ✓ Synced profile record for ${user.email}`);
    }
  }

  // 2. Check if profiles_id_fkey is still present
  const checkFkeyRes = await supabase.from("profiles").select("id").limit(1);
  let canInsertUnlinkedProfiles = false;

  // Test insert with deterministic test customer
  const testId = "00000000-0000-4000-a000-000000000001";
  const { error: testFkErr } = await supabase.from("profiles").insert({
    id: testId,
    email: "fk_check_probe@example.com",
    name: "FK Probe",
    role: "customer",
  });

  if (!testFkErr) {
    canInsertUnlinkedProfiles = true;
    await supabase.from("profiles").delete().eq("id", testId);
  }

  console.log("\n[2/3] Migrating Customer Profiles to PostgreSQL...");
  if (!canInsertUnlinkedProfiles) {
    console.log("  ⚠️  Notice: 'profiles_id_fkey' is currently active in PostgreSQL.");
    console.log("  👉 To seed all 40 customer accounts without generating fake Auth users,");
    console.log("     please execute 'supabase/migrations/20261031150000_phase3b_customers_auth.sql' in the Supabase Dashboard SQL editor.");
  } else {
    let createdCount = 0;
    let updatedCount = 0;

    for (let i = 0; i < COMPANY_NAMES.length; i++) {
      const company = COMPANY_NAMES[i];
      const firstName = ["Alex", "Jordan", "Taylor", "Morgan", "Sam", "Chris", "Pat", "Riley"][i % 8];
      const lastName = ["Smith", "Johnson", "Miller", "Davis", "Wilson", "Anderson", "Taylor", "Thomas"][i % 8];
      const cleanComp = company.toLowerCase().replace(/[^a-z0-9]/g, "");
      const email = i === 0 ? "customer@acme.corp" : `${firstName.toLowerCase()}@${cleanComp}.com`;
      const name = i === 0 ? "Jane Doe (Acme Corp)" : `${firstName} ${lastName}`;

      // Check if profile exists by email
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      const custPayload = {
        name,
        email,
        company_name: company,
        phone: `+1 (555) ${100 + i}-${2000 + i * 11}`,
        billing_address: `${100 + i * 14} Commercial Ave, Floor ${1 + (i % 12)}, New York, NY`,
        role: "customer",
      };

      if (!existing) {
        const { error: insErr } = await supabase.from("profiles").insert(custPayload);
        if (!insErr) createdCount++;
      } else {
        const { error: updErr } = await supabase.from("profiles").update(custPayload).eq("id", existing.id);
        if (!updErr) updatedCount++;
      }
    }
    console.log(`  ✓ Customer Migration: ${createdCount} created, ${updatedCount} preserved/updated.`);
  }

  // 3. Seed Subscriptions
  console.log("\n[3/3] Migrating Subscriptions & Lines to PostgreSQL...");
  const { data: prods } = await supabase.from("products").select("*, product_variants(*)");
  const { data: plans } = await supabase.from("plans").select("*");
  const { data: custProfiles } = await supabase.from("profiles").select("id, email, company_name");

  if (!custProfiles || custProfiles.length === 0 || !prods || prods.length === 0 || !plans || plans.length === 0) {
    console.log("  ✕ Prerequisites missing (customers, products, or plans). Cannot seed subscriptions.");
    return;
  }

  const baseProd = prods.find((p) => p.name.includes("Brightloop Core SaaS Platform")) || prods[0];
  const odooVariant = baseProd?.product_variants?.find((v) => v.attribute_value === "Odoo");

  const statuses = ["active", "active", "confirmed", "quotation", "draft", "closed"];
  let subCreated = 0;
  let subPreserved = 0;

  // Seed 20 diverse representative subscriptions
  for (let i = 0; i < Math.min(20, custProfiles.length); i++) {
    const subNum = `SUB-${String(i + 1).padStart(4, "0")}`;
    const cust = custProfiles[i % custProfiles.length];
    const plan = plans[i % plans.length];
    const status = statuses[i % statuses.length];

    const daysAgo = (i + 1) * 12;
    const startDateObj = new Date(Date.now() - daysAgo * 86400000);
    const startDate = startDateObj.toISOString().split("T")[0];
    const expiryDateObj = new Date(startDateObj);
    expiryDateObj.setFullYear(expiryDateObj.getFullYear() + 1);
    const expiryDate = expiryDateObj.toISOString().split("T")[0];

    // Check if subscription exists
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("subscription_number", subNum)
      .maybeSingle();

    let subId = existingSub?.id;

    if (!existingSub) {
      const { data: newSub, error: insSubErr } = await supabase
        .from("subscriptions")
        .insert({
          subscription_number: subNum,
          customer_id: cust.id,
          plan_id: plan.id,
          status,
          start_date: startDate,
          expiry_date: expiryDate,
          payment_terms: "Net 30",
        })
        .select()
        .single();

      if (insSubErr || !newSub) {
        console.error(`  ✕ Error creating subscription ${subNum}:`, insSubErr?.message);
        continue;
      }
      subId = newSub.id;
      subCreated++;
    } else {
      subPreserved++;
    }

    // Insert or preserve line items
    const hasOdoo = i % 2 === 0 && odooVariant;
    const unitPrice = hasOdoo
      ? Number(baseProd.sales_price) + Number(odooVariant.price_extra)
      : Number(baseProd.sales_price);

    const { data: existingLines } = await supabase
      .from("subscription_lines")
      .select("id")
      .eq("subscription_id", subId);

    if (!existingLines || existingLines.length === 0) {
      await supabase.from("subscription_lines").insert({
        subscription_id: subId,
        product_id: baseProd.id,
        variant_id: hasOdoo ? odooVariant.id : null,
        quantity: 1,
        unit_price: unitPrice,
        tax_rate: 10.0,
        amount: unitPrice,
      });
    }
  }

  console.log(`  ✓ Subscriptions Migration: ${subCreated} created, ${subPreserved} preserved.`);
  console.log("\n====================================================");
  console.log(" Phase 3B Seeding Process Completed!               ");
  console.log("====================================================");
}

seedPhase3B();

