import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('ERROR: .env.local not found in project root.');
  process.exit(1);
}

const env = {};
fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx > -1) {
      env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
    }
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Seed definitions preserving existing store values exactly
const SEED_PRODUCTS = [
  {
    name: 'Brightloop Core SaaS Platform',
    type: 'service',
    sales_price: 1200.00,
    cost_price: 320.00,
    notes: 'Main multitenant SaaS subscription infrastructure with high-availability clustering.',
    variants: [
      {
        attribute_name: 'Brand',
        attribute_value: 'Odoo',
        price_extra: 560.00 // Required: Base 1200 + 560 = 1760 unit price
      },
      {
        attribute_name: 'Brand',
        attribute_value: 'Enterprise Custom',
        price_extra: 850.00
      }
    ]
  },
  {
    name: 'FinOps AI Copilot & Automated Ledger',
    type: 'service',
    sales_price: 450.00,
    cost_price: 90.00,
    notes: 'Machine learning driven invoice matching, anomaly detection, and cashflow forecast.',
    variants: [
      {
        attribute_name: 'Intelligence Tier',
        attribute_value: 'High-Throughput Neural',
        price_extra: 200.00
      }
    ]
  },
  {
    name: 'Real-time Bank Statement Reconciliation Gateway',
    type: 'service',
    sales_price: 350.00,
    cost_price: 50.00,
    notes: 'Automated webhook synchronization with Plaid, Stripe, and global SWIFT feeds.',
    variants: []
  }
];

const SEED_PLANS = [
  {
    name: 'Starter Monthly',
    price: 299.00,
    billing_period: 'monthly',
    minimum_quantity: 1,
    auto_close: false,
    allow_early_close: true,
    allow_pause: true,
    allow_renew: true
  },
  {
    name: 'Growth Monthly',
    price: 799.00,
    billing_period: 'monthly',
    minimum_quantity: 1,
    auto_close: false,
    allow_early_close: true,
    allow_pause: true,
    allow_renew: true
  },
  {
    name: 'Scale Yearly',
    price: 2999.00,
    billing_period: 'yearly',
    minimum_quantity: 1,
    auto_close: false,
    allow_early_close: true,
    allow_pause: true,
    allow_renew: true
  },
  {
    name: 'Enterprise Pro Yearly',
    price: 7999.00,
    billing_period: 'yearly',
    minimum_quantity: 5,
    auto_close: false,
    allow_early_close: true,
    allow_pause: true,
    allow_renew: true
  }
];

const SEED_TAXES = [
  { name: 'Standard VAT', rate: 10.00, is_active: true },
  { name: 'Software Sales Tax', rate: 8.25, is_active: true }
];

const SEED_DISCOUNTS = [
  {
    code: 'WELCOME10',
    name: 'Early Adopter 10% Discount',
    type: 'percentage',
    value: 10.00,
    min_purchase: 500.00,
    min_quantity: 1,
    usage_limit: 500,
    times_used: 0,
    applies_to: 'whole_subscription',
    is_active: true
  },
  {
    code: 'BRIGHT50',
    name: 'Direct Rep Courtesy Credit',
    type: 'fixed',
    value: 50.00,
    min_purchase: 200.00,
    min_quantity: 1,
    usage_limit: 100,
    times_used: 0,
    applies_to: 'whole_subscription',
    is_active: true
  }
];

export async function seedDatabase() {
  console.log('====================================================');
  console.log(' Brightloop Billing — Idempotent Database Seeding');
  console.log('====================================================\n');

  const summary = {
    productsCreated: 0,
    productsUpdated: 0,
    variantsCreated: 0,
    variantsUpdated: 0,
    plansCreated: 0,
    plansUpdated: 0,
    taxesCreated: 0,
    taxesUpdated: 0,
    discountsCreated: 0,
    discountsUpdated: 0
  };

  // 1. Seed Products & Variants
  console.log('[1/4] Seeding Products & Attribute Variants...');
  for (const prodData of SEED_PRODUCTS) {
    const { variants, ...prodFields } = prodData;

    // Check if product exists by name
    const { data: existingProds, error: pErr } = await supabase
      .from('products')
      .select('id, name')
      .eq('name', prodFields.name);

    if (pErr) throw new Error(`Failed to query product ${prodFields.name}: ${pErr.message}`);

    let productId;
    if (existingProds && existingProds.length > 0) {
      productId = existingProds[0].id;
      await supabase
        .from('products')
        .update({
          sales_price: prodFields.sales_price,
          cost_price: prodFields.cost_price,
          notes: prodFields.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);
      summary.productsUpdated++;
      console.log(`  - ↺ Product updated: "${prodFields.name}" (${productId})`);
    } else {
      const { data: newProd, error: insertErr } = await supabase
        .from('products')
        .insert(prodFields)
        .select('id')
        .single();
      if (insertErr) throw new Error(`Insert product failed: ${insertErr.message}`);
      productId = newProd.id;
      summary.productsCreated++;
      console.log(`  - ＋ Product created: "${prodFields.name}" (${productId})`);
    }

    // Seed Variants for this product
    for (const vData of variants) {
      const { data: existingVars, error: vErr } = await supabase
        .from('product_variants')
        .select('id, attribute_name, attribute_value')
        .eq('product_id', productId)
        .eq('attribute_name', vData.attribute_name)
        .eq('attribute_value', vData.attribute_value);

      if (vErr) throw new Error(`Variant query failed: ${vErr.message}`);

      if (existingVars && existingVars.length > 0) {
        await supabase
          .from('product_variants')
          .update({ price_extra: vData.price_extra })
          .eq('id', existingVars[0].id);
        summary.variantsUpdated++;
        console.log(`    - ↺ Variant updated: ${vData.attribute_name}=${vData.attribute_value} (+$${vData.price_extra})`);
      } else {
        await supabase
          .from('product_variants')
          .insert({
            product_id: productId,
            attribute_name: vData.attribute_name,
            attribute_value: vData.attribute_value,
            price_extra: vData.price_extra
          });
        summary.variantsCreated++;
        console.log(`    - ＋ Variant created: ${vData.attribute_name}=${vData.attribute_value} (+$${vData.price_extra})`);
      }
    }
  }

  // 2. Seed Plans
  console.log('\n[2/4] Seeding Subscription Plans...');
  for (const planData of SEED_PLANS) {
    const { data: existingPlans, error: plErr } = await supabase
      .from('plans')
      .select('id, name')
      .eq('name', planData.name);

    if (plErr) throw new Error(`Query plan failed: ${plErr.message}`);

    if (existingPlans && existingPlans.length > 0) {
      await supabase
        .from('plans')
        .update({
          price: planData.price,
          billing_period: planData.billing_period,
          minimum_quantity: planData.minimum_quantity,
          allow_early_close: planData.allow_early_close,
          allow_pause: planData.allow_pause,
          allow_renew: planData.allow_renew,
          auto_close: planData.auto_close
        })
        .eq('id', existingPlans[0].id);
      summary.plansUpdated++;
      console.log(`  - ↺ Plan updated: "${planData.name}" ($${planData.price}/${planData.billing_period})`);
    } else {
      await supabase.from('plans').insert(planData);
      summary.plansCreated++;
      console.log(`  - ＋ Plan created: "${planData.name}" ($${planData.price}/${planData.billing_period})`);
    }
  }

  // 3. Seed Taxes
  console.log('\n[3/4] Seeding Tax Rules...');
  for (const taxData of SEED_TAXES) {
    const { data: existingTaxes, error: txErr } = await supabase
      .from('taxes')
      .select('id, name')
      .eq('name', taxData.name);

    if (txErr) throw new Error(`Query tax failed: ${txErr.message}`);

    if (existingTaxes && existingTaxes.length > 0) {
      await supabase
        .from('taxes')
        .update({ rate: taxData.rate, is_active: taxData.is_active })
        .eq('id', existingTaxes[0].id);
      summary.taxesUpdated++;
      console.log(`  - ↺ Tax updated: "${taxData.name}" (${taxData.rate}%)`);
    } else {
      await supabase.from('taxes').insert(taxData);
      summary.taxesCreated++;
      console.log(`  - ＋ Tax created: "${taxData.name}" (${taxData.rate}%)`);
    }
  }

  // 4. Seed Discounts
  console.log('\n[4/4] Seeding Discounts...');
  for (const discData of SEED_DISCOUNTS) {
    const { data: existingDiscs, error: dcErr } = await supabase
      .from('discounts')
      .select('id, code')
      .eq('code', discData.code);

    if (dcErr) throw new Error(`Query discount failed: ${dcErr.message}`);

    if (existingDiscs && existingDiscs.length > 0) {
      await supabase
        .from('discounts')
        .update({
          name: discData.name,
          type: discData.type,
          value: discData.value,
          min_purchase: discData.min_purchase,
          usage_limit: discData.usage_limit,
          is_active: discData.is_active
        })
        .eq('id', existingDiscs[0].id);
      summary.discountsUpdated++;
      console.log(`  - ↺ Discount updated: "${discData.code}" (${discData.name})`);
    } else {
      await supabase.from('discounts').insert(discData);
      summary.discountsCreated++;
      console.log(`  - ＋ Discount created: "${discData.code}" (${discData.name})`);
    }
  }

  console.log('\n====================================================');
  console.log(' Seeding Complete Summary:');
  console.log(` - Products:   ${summary.productsCreated} created, ${summary.productsUpdated} updated`);
  console.log(` - Variants:   ${summary.variantsCreated} created, ${summary.variantsUpdated} updated`);
  console.log(` - Plans:      ${summary.plansCreated} created, ${summary.plansUpdated} updated`);
  console.log(` - Taxes:      ${summary.taxesCreated} created, ${summary.taxesUpdated} updated`);
  console.log(` - Discounts:  ${summary.discountsCreated} created, ${summary.discountsUpdated} updated`);
  console.log('====================================================\n');

  return summary;
}

seedDatabase()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('\n❌ Fatal Seeding Error:', err);
    process.exit(1);
  });

