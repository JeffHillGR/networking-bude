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

async function checkRLS() {
  console.log('🔍 Checking RLS status on matches table...\n');

  // Try to insert a test match
  const testMatch = {
    user_id: '00000000-0000-0000-0000-000000000001',
    matched_user_id: '00000000-0000-0000-0000-000000000002',
    compatibility_score: 75,
    match_reasons: ['Test'],
    status: 'recommended',
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('connection_flow')
    .insert(testMatch)
    .select();

  if (error) {
    console.log('❌ RLS is still ENABLED (blocking insert)');
    console.log('Error:', error.message);
    console.log('\n💡 You need to run fix-matches-rls-simple.sql in Supabase SQL Editor to disable RLS');
  } else {
    console.log('✅ RLS is DISABLED (insert succeeded)');
    console.log('Cleaning up test record...');

    // Clean up test record
    await supabase
      .from('connection_flow')
      .delete()
      .eq('user_id', testMatch.user_id);

    console.log('✅ Ready to run matching algorithm!');
  }
}

checkRLS();
