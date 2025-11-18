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
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY // Use service role to bypass RLS
);

// Import the real matching algorithm
const { calculateCompatibility } = require('./src/lib/matchingAlgorithm.js');

/**
 * Convert Supabase user format to algorithm format
 */
function convertUserToAlgorithmFormat(user) {
  const currentYear = new Date().getFullYear();

  return {
    id: user.id,
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    age: user.year_born ? currentYear - user.year_born : 0,
    gender: user.gender || '',
    industry: user.industry || '',
    networkingGoals: user.networking_goals || '',
    orgsAttend: Array.isArray(user.organizations_current)
      ? user.organizations_current.join(', ')
      : (user.organizations_current || ''),
    orgsWantToCheckOut: Array.isArray(user.organizations_interested)
      ? user.organizations_interested.join(', ')
      : (user.organizations_interested || ''),
    professionalInterests: Array.isArray(user.professional_interests)
      ? user.professional_interests.join(', ')
      : (user.professional_interests || ''),
    personalInterests: Array.isArray(user.personal_interests)
      ? user.personal_interests.join(', ')
      : (user.personal_interests || ''),
    genderPreference: user.gender_preference || 'No preference',
    agePreference: user.year_born_connect || 'No Preference'
  };
}

async function runMatchingAlgorithm() {
  console.log('🤖 Running BudE Matching Algorithm (v2 - Real Algorithm)...\n');

  try {
    // Fetch all users from database
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    console.log(`📊 Found ${users.length} users in database\n`);

    // Convert users to algorithm format
    const algorithmUsers = users.map(convertUserToAlgorithmFormat);

    // Delete existing matches
    const { error: deleteError } = await supabase
      .from('connection_flow')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.log('⚠️  Note: Could not clear old matches:', deleteError.message);
    } else {
      console.log('🗑️  Cleared old matches\n');
    }

    let totalMatches = 0;
    const matchThreshold = 65; // 65% threshold (matches production)
    let scoreDistribution = { '0-20': 0, '20-40': 0, '40-60': 0, '60-80': 0, '80-100': 0 };

    // For each user, find their matches
    for (let i = 0; i < algorithmUsers.length; i++) {
      const user = algorithmUsers[i];
      const dbUser = users[i];
      const userMatches = [];
      let highestScore = 0;

      for (let j = 0; j < algorithmUsers.length; j++) {
        if (i === j) continue;

        const otherUser = algorithmUsers[j];
        const otherDbUser = users[j];

        // Use the REAL algorithm
        const result = calculateCompatibility(user, otherUser);

        // Track score distribution
        if (result.score < 20) scoreDistribution['0-20']++;
        else if (result.score < 40) scoreDistribution['20-40']++;
        else if (result.score < 60) scoreDistribution['40-60']++;
        else if (result.score < 80) scoreDistribution['60-80']++;
        else scoreDistribution['80-100']++;

        highestScore = Math.max(highestScore, result.score);

        if (result.score >= matchThreshold) {
          // Build match reasons array from the matches object
          const reasons = [];
          Object.keys(result.matches).forEach(category => {
            if (result.matches[category].details && result.matches[category].details.length > 0) {
              reasons.push(...result.matches[category].details);
            }
          });

          userMatches.push({
            user_id: dbUser.id,
            matched_user_id: otherDbUser.id,
            compatibility_score: result.score,
            match_reasons: reasons,
            status: 'recommended',
            created_at: new Date().toISOString()
          });
        }
      }

      if (userMatches.length === 0 && highestScore > 0) {
        console.log(`⚪ ${user.firstName} ${user.lastName}: 0 matches (highest score: ${highestScore})`);
      } else if (userMatches.length > 0) {
        // Insert matches for this user
        const { error: insertError } = await supabase
          .from('connection_flow')
          .insert(userMatches);

        if (insertError) {
          console.log(`❌ Error inserting matches for ${user.firstName} ${user.lastName}:`, insertError.message);
        } else {
          console.log(`✅ ${user.firstName} ${user.lastName}: ${userMatches.length} matches (highest: ${Math.max(...userMatches.map(m => m.compatibility_score))}%)`);
          totalMatches += userMatches.length;
        }
      } else {
        console.log(`⚪ ${user.firstName} ${user.lastName}: 0 matches (need more profile data)`);
      }
    }

    console.log(`\n🎉 Matching complete! Generated ${totalMatches} total matches`);
    console.log(`📈 Threshold: ${matchThreshold}% compatibility minimum`);
    console.log(`\n📊 Score Distribution:`);
    console.log(`   0-20%:   ${scoreDistribution['0-20']} pairs`);
    console.log(`   20-40%:  ${scoreDistribution['20-40']} pairs`);
    console.log(`   40-60%:  ${scoreDistribution['40-60']} pairs`);
    console.log(`   60-80%:  ${scoreDistribution['60-80']} pairs`);
    console.log(`   80-100%: ${scoreDistribution['80-100']} pairs`);

  } catch (error) {
    console.error('❌ Error running matching algorithm:', error);
  }
}

runMatchingAlgorithm();
