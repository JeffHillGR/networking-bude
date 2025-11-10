import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getFeaturedContent() {
  const { data, error } = await supabase
    .from('featured_content')
    .select('*')
    .eq('slot_number', 1)
    .single();

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  console.log(JSON.stringify(data, null, 2));
}

getFeaturedContent();
