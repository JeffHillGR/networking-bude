const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkProfile() {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'connections@networkingbude.com')
    .single();
  
  console.log('Jeff Hill Profile:');
  console.log('Networking Goals:', user.networking_goals || '(empty)');
  console.log('Professional Interests:', user.professional_interests || '(empty)');
  console.log('Organizations Current:', user.organizations_current || '(empty)');
  console.log('Organizations Interested:', user.organizations_interested || '(empty)');
  console.log('Industry:', user.industry || '(empty)');
}

checkProfile();
