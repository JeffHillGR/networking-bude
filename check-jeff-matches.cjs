const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkMatches() {
  const { data: user } = await supabase
    .from('users')
    .select('id, first_name, last_name')
    .eq('email', 'connections@networkingbude.com')
    .single();
  
  if (!user) {
    console.log('User not found');
    return;
  }

  const { data: matches, count } = await supabase
    .from('connection_flow')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('status', 'recommended');
  
  console.log(`${user.first_name} ${user.last_name} has ${count} matches`);
}

checkMatches();
