const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function verify() {
  // Get Jeff's user ID
  const { data: user } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', 'connections@networkingbude.com')
    .single();
  
  console.log('User:', user);

  // Check matches with status 'recommended'
  const { data: matches, error } = await supabase
    .from('matches')
    .select(`
      matched_user_id,
      compatibility_score,
      status,
      matched_user:users!matches_matched_user_id_fkey (
        first_name,
        last_name,
        name
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'recommended')
    .order('compatibility_score', { ascending: false })
    .limit(3);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('\nTop 3 Recommended Matches for Dashboard:');
    matches.forEach((m, i) => {
      const name = m.matched_user.name || `${m.matched_user.first_name} ${m.matched_user.last_name}`;
      console.log(`${i+1}. ${name} - ${m.compatibility_score}% (status: ${m.status})`);
    });
  }
}

verify();
