require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function showMatches(email) {
  // Get user
  const { data: user } = await supabase
    .from('users')
    .select('id, first_name, last_name')
    .eq('email', email)
    .single();

  if (!user) {
    console.log(`User not found: ${email}`);
    return;
  }

  // Get matches
  const { data: matches } = await supabase
    .from('connection_flow')
    .select(`
      compatibility_score,
      matched_user:users!matches_matched_user_id_fkey(
        first_name,
        last_name,
        title,
        company
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'recommended')
    .order('compatibility_score', { ascending: false });

  console.log(`\n${user.first_name} ${user.last_name}'s Connections:\n`);

  if (matches.length === 0) {
    console.log('  No matches yet - complete your profile to get matched!\n');
    return;
  }

  matches.forEach((m, i) => {
    const mu = m.matched_user;
    console.log(`  ${i + 1}. ${mu.first_name} ${mu.last_name} - ${m.compatibility_score}%`);
    console.log(`     ${mu.title} at ${mu.company}\n`);
  });
}

// Show connections for multiple users
async function main() {
  await showMatches('grjeff@gmail.com');
  await showMatches('anna@humansolutiongroup.com');
  await showMatches('joel.vankuiken@gmail.com');
}

main().catch(console.error);
