import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const env = {};
fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx !== -1) env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
  }
});

async function testCron() {
  console.log('Testing CRON endpoint security with CRON_SECRET configured:');
  
  // 1. Unauthenticated
  const res1 = await fetch('http://localhost:3000/api/cron/billing', { method: 'POST' });
  console.log('1. Unauthenticated request -> Status:', res1.status, await res1.json());

  // 2. Invalid Bearer Token
  const res2 = await fetch('http://localhost:3000/api/cron/billing', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer wrong_token_123' }
  });
  console.log('2. Invalid Bearer Token -> Status:', res2.status, await res2.json());

  // 3. Valid Bearer Token
  const res3 = await fetch('http://localhost:3000/api/cron/billing', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.CRON_SECRET}` }
  });
  console.log('3. Valid Bearer Token -> Status:', res3.status, await res3.json());
}

testCron().catch(console.error);

