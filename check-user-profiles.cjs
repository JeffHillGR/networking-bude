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

async function checkProfiles() {
  console.log('📊 Checking user profile completeness...\n');

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Total users: ${users.length}\n`);

  let completeCount = 0;
  let incompleteCount = 0;

  users.forEach(user => {
    const hasOrgs = (user.organizations_current && user.organizations_current.length > 0) ||
                    (user.organizations_interested && user.organizations_interested.length > 0);
    const hasInterests = user.professional_interests && user.professional_interests.length > 0;
    const hasPersonal = user.personal_interests && user.personal_interests.length > 0;
    const hasGoals = user.networking_goals && user.networking_goals.length > 0;
    const hasIndustry = user.industry && user.industry.length > 0;

    const completionScore = [hasOrgs, hasInterests, hasPersonal, hasGoals, hasIndustry].filter(Boolean).length;
    const isComplete = completionScore >= 3;

    if (isComplete) {
      completeCount++;
      console.log(`✅ ${user.first_name} ${user.last_name} (${completionScore}/5 fields)`);
    } else {
      incompleteCount++;
      console.log(`⚪ ${user.first_name} ${user.last_name} (${completionScore}/5 fields) - Missing:`);
      if (!hasOrgs) console.log('   - Organizations');
      if (!hasInterests) console.log('   - Professional interests');
      if (!hasPersonal) console.log('   - Personal interests');
      if (!hasGoals) console.log('   - Networking goals');
      if (!hasIndustry) console.log('   - Industry');
    }
  });

  console.log(`\n📈 Summary:`);
  console.log(`   Complete profiles (3+ fields): ${completeCount}`);
  console.log(`   Incomplete profiles: ${incompleteCount}`);
  console.log(`\n💡 Users need at least 3 fields filled to get quality matches.`);
}

checkProfiles();
