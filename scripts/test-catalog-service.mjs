import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("ERROR: .env.local not found in project root.");
  process.exit(1);
}

const env = {};
fs.readFileSync(envPath, "utf8").split("\n").forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const idx = trimmed.indexOf("=");
    if (idx > -1) {
      env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
    }
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function runTests() {
  console.log("====================================================");
  console.log(" Brightloop Billing — Catalog PostgreSQL Test Suite ");
  console.log("====================================================");

  // Test 1: Read Products & Variants
  console.log("\n[Test 1] Reading Products & Variants from PostgreSQL...");
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .order("created_at", { ascending: true });

  if (prodErr) {
    console.error("  ✕ Failed to read products:", prodErr);
    process.exit(1);
  }

  console.log(`  ✓ Successfully fetched ${products.length} products from PostgreSQL.`);
  for (const p of products) {
    console.log(`    - Product: "${p.name}" ($${p.sales_price}) [${p.product_variants.length} variant(s)]`);
    for (const v of p.product_variants) {
      console.log(`      * Variant: ${v.attribute_name}=${v.attribute_value} (+${v.price_extra}) Total: $${Number(p.sales_price) + Number(v.price_extra)}`);
    }
  }

  // Verify Odoo variant calculation
  const odooProd = products.find((p) => p.name.includes("Brightloop Core SaaS Platform"));
  const odooVariant = odooProd?.product_variants.find((v) => v.attribute_value === "Odoo");
  if (!odooVariant || Number(odooVariant.price_extra) !== 560) {
    console.error("  ✕ Odoo variant extra price mismatch! Expected 560, got:", odooVariant?.price_extra);
    process.exit(1);
  }
  const totalOdooPrice = Number(odooProd.sales_price) + Number(odooVariant.price_extra);
  console.log(`  ✓ Verified Odoo variant pricing: Base $${odooProd.sales_price} + Extra $${odooVariant.price_extra} = Total $${totalOdooPrice} (Expected: $1760.00)`);

  // Test 2: Read Subscription Plans
  console.log("\n[Test 2] Reading Subscription Plans from PostgreSQL...");
  const { data: plans, error: planErr } = await supabase
    .from("plans")
    .select("*")
    .order("price", { ascending: true });

  if (planErr) {
    console.error("  ✕ Failed to read plans:", planErr);
    process.exit(1);
  }
  console.log(`  ✓ Successfully fetched ${plans.length} plans from PostgreSQL.`);
  for (const pl of plans) {
    console.log(`    - Plan: "${pl.name}" ($${pl.price}/${pl.billing_period})`);
  }

  // Test 3: Test Product Creation
  console.log("\n[Test 3] Testing Product & Variant Creation in PostgreSQL...");
  const testName = `Test Integration Service Product ${Date.now()}`;
  const { data: createdProd, error: createErr } = await supabase
    .from("products")
    .insert({
      name: testName,
      type: "service",
      sales_price: 499.0,
      cost_price: 150.0,
      notes: "Temporary test product for Phase 3A verification",
    })
    .select()
    .single();

  if (createErr || !createdProd) {
    console.error("  ✕ Failed to create test product:", createErr);
    process.exit(1);
  }
  console.log(`  ✓ Created test product "${createdProd.name}" (${createdProd.id})`);

  // Insert variant
  const { data: createdVar, error: varErr } = await supabase
    .from("product_variants")
    .insert({
      product_id: createdProd.id,
      attribute_name: "Region",
      attribute_value: "EU Central",
      price_extra: 75.0,
    })
    .select()
    .single();

  if (varErr || !createdVar) {
    console.error("  ✕ Failed to create test variant:", varErr);
    process.exit(1);
  }
  console.log(`  ✓ Created test variant "${createdVar.attribute_name}=${createdVar.attribute_value}" (+$${createdVar.price_extra})`);

  // Test 4: Test Product Update
  console.log("\n[Test 4] Testing Product Update in PostgreSQL...");
  const updatedPrice = 549.0;
  const { data: updatedProd, error: updateErr } = await supabase
    .from("products")
    .update({ sales_price: updatedPrice, notes: "Updated note during test" })
    .eq("id", createdProd.id)
    .select()
    .single();

  if (updateErr || !updatedProd || Number(updatedProd.sales_price) !== updatedPrice) {
    console.error("  ✕ Failed to update test product:", updateErr);
    process.exit(1);
  }
  console.log(`  ✓ Updated test product sales price to $${updatedProd.sales_price}`);

  // Test 5: Safe Product Deletion
  console.log("\n[Test 5] Testing Safe Product Deletion (with Cascade Variants)...");
  const { error: delErr } = await supabase
    .from("products")
    .delete()
    .eq("id", createdProd.id);

  if (delErr) {
    console.error("  ✕ Failed to delete test product:", delErr);
    process.exit(1);
  }

  // Verify variant was cascaded
  const { data: verifyVar } = await supabase
    .from("product_variants")
    .select("*")
    .eq("id", createdVar.id);

  if (verifyVar && verifyVar.length > 0) {
    console.error("  ✕ Cascade deletion failed: variant still exists!");
    process.exit(1);
  }
  console.log("  ✓ Test product and cascaded variant successfully removed from PostgreSQL.");

  console.log("\n====================================================");
  console.log(" All Catalog PostgreSQL Tests Passed Successfully! ");
  console.log("====================================================");
}

runTests();
