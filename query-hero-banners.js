import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function queryHeroBanners() {
  const { data, error } = await supabase
    .from('hero_banners')
    .select('*')
    .eq('is_active', true)
    .order('slot_number');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('\n=== Active Hero Banners ===\n');
    data.forEach((banner, index) => {
      console.log(`Banner ${index + 1}:`);
      console.log(`  Slot: ${banner.slot_number}`);
      console.log(`  Image URL: ${banner.image_url}`);
      console.log(`  Alt Text: ${banner.alt_text || 'N/A'}`);
      console.log(`  Click URL: ${banner.click_url || 'N/A'}`);
      console.log('');
    });
    console.log(`Total: ${data.length} active banners\n`);
  }
}

queryHeroBanners();
