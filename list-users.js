import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase
  .from('users')
  .select('email, first_name, last_name, name')
  .order('email', { ascending: true });

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log(`\nTotal users in Supabase: ${data.length}\n`);
data.forEach(u => {
  const displayName = u.name || `${u.first_name} ${u.last_name}`;
  console.log(`${u.email.padEnd(45)} | ${displayName}`);
});
