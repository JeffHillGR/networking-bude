const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key.trim()] = value.trim();
  }
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkNewSignups() {
  console.log('👥 Checking for new signups today...\n');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .gte('created_at', todayISO)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`📊 New signups today: ${users.length}\n`);

  if (users.length === 0) {
    console.log('✅ No new signups today - your 29 beta users are still the same.');
  } else {
    console.log('🆕 New users who signed up today:\n');
    users.forEach((user, i) => {
      const createdAt = new Date(user.created_at);
      console.log(`${i + 1}. ${user.first_name} ${user.last_name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Signed up: ${createdAt.toLocaleTimeString()}`);
      console.log(`   Profile completeness: ${user.industry ? '✓' : '✗'} Industry, ${user.organizations_current?.length || 0} orgs, ${user.professional_interests?.length || 0} interests`);
      console.log('');
    });

    console.log(`💡 You should re-run the matching algorithm to generate matches for new users:`);
    console.log(`   node run-matching-v2.cjs`);
  }

  // Also check total user count
  const { count, error: countError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  if (!countError) {
    console.log(`\n📈 Total users in database: ${count}`);
  }
}

checkNewSignups();
