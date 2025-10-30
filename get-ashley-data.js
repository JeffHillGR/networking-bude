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
  .select('*')
  .eq('email', 'ashley@evokecs.com')
  .single();

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log('Ashley Pattee Data:');
console.log('Old ID:', data.id);
console.log('Name:', data.name || `${data.first_name} ${data.last_name}`);
console.log('\nFull data:', JSON.stringify(data, null, 2));
