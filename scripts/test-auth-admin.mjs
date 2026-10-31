import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env.local');
const env = {};
fs.readFileSync(envPath, 'utf8').split('\n').forEach((l) => {
  const [k, ...v] = l.trim().split('=');
  if (k && !k.startsWith('#')) env[k.trim()] = v.join('=').trim();
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testUserAndProfile() {
  const testEmail = `test_admin_${Date.now()}@brightloop.io`;
  console.log('1. Creating test auth user:', testEmail);
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: 'Bright@2026!Test',
    email_confirm: true,
    user_metadata: { name: 'Test Sarah Admin', role: 'admin' }
  });

  if (authErr) {
    console.error('Auth create error:', authErr);
    return;
  }

  const userId = authData.user.id;
  console.log('2. Auth user created with ID:', userId);

  console.log('3. Inserting profile for ID:', userId);
  const { data: profData, error: profErr } = await supabase.from('profiles').insert({
    id: userId,
    email: testEmail,
    name: 'Test Sarah Admin',
    role: 'admin',
    company_name: 'Brightloop Software HQ'
  }).select();

  console.log('Profile insert result:', { profData, profErr });

  // Cleanup
  console.log('4. Cleaning up test user...');
  await supabase.from('profiles').delete().eq('id', userId);
  await supabase.auth.admin.deleteUser(userId);
  console.log('Done!');
}

testUserAndProfile();
