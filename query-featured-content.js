import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function queryFeaturedContent() {
  const { data, error } = await supabase
    .from('featured_content')
    .select('*')
    .eq('slot_number', 1)
    .single();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

queryFeaturedContent();
