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

const CUSTOMER_SEEDS = [
  {
    email: 'customer@acme.corp',
    name: 'Jane Doe',
    company: 'Acme Industrial Technologies',
    phone: '+1 (555) 839-2041',
    address: '450 Industrial Parkway, Austin, TX 78701',
  },
  {
    email: 'billing@wayne.ent',
    name: 'Lucius Fox',
    company: 'Wayne Enterprises Global',
    phone: '+1 (555) 234-5678',
    address: '1007 Mountain Drive, Gotham City, NJ',
  },
  {
    email: 'accounts@stark.ind',
    name: 'Pepper Potts',
    company: 'Stark Industries R&D',
    phone: '+1 (555) 345-6789',
    address: '10880 Wilshire Blvd, Los Angeles, CA',
  },
  {
    email: 'finance@cyberdyne.sys',
    name: 'Miles Dyson',
    company: 'Cyberdyne Systems Corp',
    phone: '+1 (555) 456-7890',
    address: '18144 El Camino Real, Sunnyvale, CA',
  },
  {
    email: 'contact@piedpiper.com',
    name: 'Richard Hendricks',
    company: 'Pied Piper Compression',
    phone: '+1 (555) 567-8901',
    address: '5230 Newell Rd, Palo Alto, CA',
  },
  {
    email: 'admin@hooli.tech',
    name: 'Gavin Belson',
    company: 'Hooli Cloud Corporation',
    phone: '+1 (555) 678-9012',
    address: '4990 Great America Pkwy, Santa Clara, CA',
  },
  {
    email: 'ops@initech.com',
    name: 'Peter Gibbons',
    company: 'Initech Consulting LLC',
    phone: '+1 (555) 789-0123',
    address: '4120 Freidrich Lane, Austin, TX',
  },
  {
    email: 'procure@massivedynamic.com',
    name: 'Nina Sharp',
    company: 'Massive Dynamic Scientific',
    phone: '+1 (555) 890-1234',
    address: '650 Townsend St, San Francisco, CA',
  },
  {
    email: 'finance@umbrella.corp',
    name: 'Albert Wesker',
    company: 'Umbrella Pharmaceuticals Tech',
    phone: '+1 (555) 901-2345',
    address: '777 Raccoon St, Arklay, CO',
  },
  {
    email: 'billing@globex.corp',
    name: 'Hank Scorpio',
    company: 'Globex Strategic Systems',
    phone: '+1 (555) 012-3456',
    address: '1 Cypress Creek Rd, Eugene, OR',
  },
];

async function seedPhase3C() {
  console.log('====================================================');
  console.log(' Brightloop Billing — Phase 3C Invoices & Payments  ');
  console.log('====================================================');

  // 1. Get or create auth users & profiles
  console.log('\n[1/4] Ensuring Customer Auth Accounts & Profiles...');
  const customerProfileMap = new Map();

  const { data: userList } = await supabase.auth.admin.listUsers();
  const existingUsers = userList?.users || [];

  for (const c of CUSTOMER_SEEDS) {
    let authUser = existingUsers.find((u) => u.email?.toLowerCase() === c.email.toLowerCase());

    if (!authUser) {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: c.email,
        password: 'Bright@2026!',
        email_confirm: true,
        user_metadata: { name: c.name, role: 'customer', company: c.company },
      });

      if (createErr || !created.user) {
        console.error(`  ✕ Error creating user ${c.email}:`, createErr?.message);
        continue;
      }
      authUser = created.user;
      console.log(`  ＋ Created Customer User: ${c.email}`);
    } else {
      console.log(`  ↺ Reusing Customer User: ${c.email}`);
    }

    // Upsert profile
    const { error: profErr } = await supabase.from('profiles').upsert(
      {
        id: authUser.id,
        email: c.email.toLowerCase(),
        name: c.name,
        company_name: c.company,
        role: 'customer',
        phone: c.phone,
        billing_address: c.address,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (profErr) {
      console.error(`  ✕ Profile error for ${c.email}:`, profErr.message);
    } else {
      customerProfileMap.set(c.email.toLowerCase(), { id: authUser.id, ...c });
    }
  }

  // 2. Fetch catalog products and plans
  console.log('\n[2/4] Fetching Products and Plans...');
  const { data: prods } = await supabase
    .from('products')
    .select('id, name, sales_price, product_variants(*)');
  const { data: plans } = await supabase
    .from('plans')
    .select('id, name, billing_period, price');

  const baseProd = prods.find((p) => p.name.includes('Brightloop Core')) || prods[0];
  const odooVariant = baseProd?.product_variants?.find((v) => v.attribute_value === 'Odoo');
  const copilotProd = prods.find((p) => p.name.includes('FinOps AI')) || prods[1];

  // 3. Ensure Subscriptions and Subscription Lines exist
  console.log('\n[3/4] Ensuring Subscriptions & Lines...');
  const customerList = Array.from(customerProfileMap.values());
  const subscriptionMap = new Map();

  for (let i = 0; i < customerList.length; i++) {
    const cust = customerList[i];
    const plan = plans[i % plans.length];
    const subNum = `SUB-${String(i + 1).padStart(4, '0')}`;

    const daysAgo = (i + 1) * 15;
    const startDateObj = new Date(Date.now() - daysAgo * 86400000);
    const startDate = startDateObj.toISOString().split('T')[0];
    const expiryDateObj = new Date(startDateObj);
    expiryDateObj.setFullYear(expiryDateObj.getFullYear() + 1);
    const expiryDate = expiryDateObj.toISOString().split('T')[0];

    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id, subscription_number')
      .eq('subscription_number', subNum)
      .maybeSingle();

    let subId = existingSub?.id;

    if (!existingSub) {
      const { data: newSub, error: subErr } = await supabase
        .from('subscriptions')
        .insert({
          subscription_number: subNum,
          customer_id: cust.id,
          plan_id: plan.id,
          status: i === 9 ? 'closed' : i === 7 ? 'confirmed' : 'active',
          start_date: startDate,
          expiry_date: expiryDate,
          payment_terms: 'Net 30',
        })
        .select()
        .single();

      if (subErr) {
        console.error(`  ✕ Error creating subscription ${subNum}:`, subErr.message);
        continue;
      }
      subId = newSub.id;
      console.log(`  ＋ Created Subscription ${subNum} for ${cust.company}`);
    } else {
      console.log(`  ↺ Reusing Subscription ${subNum}`);
    }

    subscriptionMap.set(subNum, { id: subId, customer: cust, plan, startDate, expiryDate });

    // Ensure subscription lines exist
    const { data: lines } = await supabase
      .from('subscription_lines')
      .select('id')
      .eq('subscription_id', subId);

    if (!lines || lines.length === 0) {
      const hasOdoo = i % 2 === 0 && odooVariant;
      const unitPrice = hasOdoo
        ? Number(baseProd.sales_price) + Number(odooVariant.price_extra)
        : Number(baseProd.sales_price);

      await supabase.from('subscription_lines').insert([
        {
          subscription_id: subId,
          product_id: baseProd.id,
          variant_id: hasOdoo ? odooVariant.id : null,
          quantity: 1,
          unit_price: unitPrice,
          tax_rate: 10.0,
          amount: unitPrice,
        },
      ]);
      console.log(`    ✓ Attached line items to ${subNum}`);
    }
  }

  // 4. Seed Invoices and Payments
  console.log('\n[4/4] Seeding Invoices, Lines, and Payments...');
  const subEntries = Array.from(subscriptionMap.entries());

  let invoicesCreated = 0;
  let paymentsCreated = 0;

  for (let i = 0; i < 15; i++) {
    const invNum = `INV-2026-${String(i + 1).padStart(4, '0')}`;
    const [subNum, subData] = subEntries[i % subEntries.length];

    // Check if invoice already exists
    const { data: existingInv } = await supabase
      .from('invoices')
      .select('id, invoice_number, total_amount, amount_paid')
      .eq('invoice_number', invNum)
      .maybeSingle();

    if (existingInv) {
      console.log(`  ↺ Reusing Invoice ${invNum}`);
      continue;
    }

    const hasOdoo = i % 2 === 0 && odooVariant;
    const basePrice = hasOdoo
      ? Number(baseProd.sales_price) + Number(odooVariant.price_extra)
      : Number(baseProd.sales_price);
    const hasAddon = i % 3 === 0 && copilotProd;
    const addonPrice = hasAddon ? Number(copilotProd.sales_price) : 0;

    const subtotal = basePrice + addonPrice;
    const taxRate = 10.0;
    const taxAmount = Math.round(subtotal * 0.1 * 100) / 100;
    const totalAmount = subtotal + taxAmount;

    // Pricing & Status scenarios
    let status = 'paid';
    let amountPaid = totalAmount;
    let dueDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];

    if (i === 1 || i === 5) {
      // OVERDUE: Confirmed, unpaid/partially paid, due date in the past
      status = 'confirmed';
      amountPaid = i === 1 ? 500.0 : 0.0;
      dueDate = new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0];
    } else if (i === 3 || i === 8) {
      // OUTSTANDING: Confirmed, due in future
      status = 'confirmed';
      amountPaid = 0.0;
      dueDate = new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0];
    } else if (i === 11) {
      // DRAFT: newly generated
      status = 'draft';
      amountPaid = 0.0;
      dueDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    } else if (i === 14) {
      // CANCELLED
      status = 'cancelled';
      amountPaid = 0.0;
    }

    // Billing period
    const periodStart = new Date(Date.now() - (i + 1) * 30 * 86400000).toISOString().split('T')[0];
    const periodEnd = new Date(Date.now() - i * 30 * 86400000).toISOString().split('T')[0];

    const { data: newInv, error: invErr } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invNum,
        subscription_id: subData.id,
        customer_id: subData.customer.id,
        billing_period_start: periodStart,
        billing_period_end: periodEnd,
        status,
        subtotal,
        discount_amount: 0.0,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        amount_paid: amountPaid,
        due_date: dueDate,
      })
      .select()
      .single();

    if (invErr || !newInv) {
      console.error(`  ✕ Error creating invoice ${invNum}:`, invErr?.message);
      continue;
    }

    invoicesCreated++;
    console.log(`  ＋ Created Invoice ${invNum} (${status.toUpperCase()}) Total: $${totalAmount} Paid: $${amountPaid}`);

    // Snapshot invoice lines
    const lineItems = [
      {
        invoice_id: newInv.id,
        product_id: baseProd.id,
        description: `${baseProd.name}${hasOdoo ? ' (Brand: Odoo +$560.00)' : ''}`,
        quantity: 1,
        unit_price: basePrice,
        tax_rate: taxRate,
        amount: basePrice,
      },
    ];

    if (hasAddon) {
      lineItems.push({
        invoice_id: newInv.id,
        product_id: copilotProd.id,
        description: copilotProd.name,
        quantity: 1,
        unit_price: addonPrice,
        tax_rate: taxRate,
        amount: addonPrice,
      });
    }

    const { error: linesErr } = await supabase.from('invoice_lines').insert(lineItems);
    if (linesErr) {
      console.error(`    ✕ Error inserting lines for ${invNum}:`, linesErr.message);
    }

    // If amount_paid > 0, record real payment
    if (amountPaid > 0) {
      const methods = ['bank_transfer', 'credit_card', 'wire', 'ach'];
      const method = methods[i % methods.length];
      const payDate = new Date(Date.now() - (i + 1) * 12 * 86400000).toISOString().split('T')[0];

      const { error: payErr } = await supabase.from('payments').insert({
        invoice_id: newInv.id,
        customer_id: subData.customer.id,
        amount: amountPaid,
        method,
        payment_date: payDate,
        note: amountPaid === totalAmount ? 'Full settlement cleared' : 'Partial installment wire received',
      });

      if (payErr) {
        console.error(`    ✕ Payment record error for ${invNum}:`, payErr.message);
      } else {
        paymentsCreated++;
        console.log(`    ✓ Payment of $${amountPaid} logged via ${method}`);
      }
    }
  }

  console.log('\n====================================================');
  console.log(` Phase 3C Seed Complete: ${invoicesCreated} Invoices, ${paymentsCreated} Payments created.`);
  console.log('====================================================');
}

seedPhase3C();

