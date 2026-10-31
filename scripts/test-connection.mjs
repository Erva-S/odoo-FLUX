import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Parse .env.local without external dependencies
const envPath = path.resolve(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('ERROR: .env.local file not found in project root.');
  process.exit(1);
}

const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
const env = {};
envLines.forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx > -1) {
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim();
      env[key] = val;
    }
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('====================================================');
console.log(' Brightloop Billing — PostgreSQL Connection Test');
console.log('====================================================');
console.log('Project URL:       ', url ? url : '[MISSING]');
console.log('Anon Key Present:  ', !!anonKey);
console.log('Service Key Present:', !!serviceKey);

if (!url || !serviceKey) {
  console.error('\nFAIL: Required environment variables are missing in .env.local.');
  process.exit(1);
}

const startTime = Date.now();
const client = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

try {
  console.log('\n[1/3] Testing PostgreSQL connection through Supabase API...');
  
  const tables = [
    'profiles', 'taxes', 'products', 'product_variants', 'plans',
    'discounts', 'quotation_templates', 'quotation_template_lines',
    'subscriptions', 'subscription_lines', 'invoices', 'invoice_lines',
    'payments', 'discount_usages'
  ];

  console.log('[2/3] Checking table availability in public schema:');
  let successCount = 0;

  for (const table of tables) {
    const { count, error } = await client.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`  - ❌ Table [${table}]: Error (${error.message})`);
    } else {
      console.log(`  - ✅ Table [${table}]: Verified (Row count: ${count || 0})`);
      successCount++;
    }
  }

  const duration = Date.now() - startTime;
  console.log(`\n[3/3] Health Check Summary:`);
  console.log(`  - Verified ${successCount}/${tables.length} tables in PostgreSQL database.`);
  console.log(`  - Connection Latency: ${duration}ms`);

  if (successCount === tables.length) {
    console.log('\n🎉 SUCCESS: PostgreSQL database connection verified successfully!');
    process.exit(0);
  } else {
    console.warn('\n⚠️ PARTIAL: Some tables were unreachable. Check migrations.');
    process.exit(1);
  }
} catch (err) {
  console.error('\n❌ ERROR: Connection failed:', err.message);
  process.exit(1);
}

