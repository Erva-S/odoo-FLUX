import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const envPath = path.resolve(process.cwd(), '.env.local');
let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

if (!content.includes('CRON_SECRET=')) {
  const secret = 'cron_sec_' + crypto.randomBytes(24).toString('hex');
  fs.appendFileSync(envPath, `\n# Recurring Billing Engine Automation Secret\nCRON_SECRET=${secret}\n`);
  console.log('CRON_SECRET generated and appended safely to .env.local');
} else {
  console.log('CRON_SECRET already exists in .env.local');
}

