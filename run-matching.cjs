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

// Use service role key to bypass RLS (needed for inserting matches)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  console.log('\n⚠️  You need to add your service role key to .env.local:');
  console.log('   1. Go to Supabase Dashboard > Settings > API');
  console.log('   2. Copy the "service_role" key (NOT the anon key)');
  console.log('   3. Add to .env.local: SUPABASE_SERVICE_ROLE_KEY=your-key-here');
  console.log('\n⚠️  OR for beta testing, run fix-matches-rls-simple.sql to disable RLS on matches table');
  process.exit(1);
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Import the matching algorithm (we'll need to adapt it)
function calculateCompatibility(user1, user2) {
  let score = 0;
  const reasons = [];

  // 1. Organizations overlap (20 points max)
  const user1Orgs = [...(user1.organizations_current || []), ...(user1.organizations_interested || [])];
  const user2Orgs = [...(user2.organizations_current || []), ...(user2.organizations_interested || [])];
  const orgOverlap = user1Orgs.filter(org => user2Orgs.includes(org)).length;
  if (orgOverlap > 0) {
    const orgScore = Math.min(orgOverlap * 5, 20);
    score += orgScore;
    reasons.push(`Shared ${orgOverlap} org(s) (+${orgScore})`);
  }

  // 2. Professional interests overlap (20 points max)
  const user1Interests = user1.professional_interests || [];
  const user2Interests = user2.professional_interests || [];
  const interestOverlap = user1Interests.filter(int => user2Interests.includes(int)).length;
  if (interestOverlap > 0) {
    const interestScore = Math.min(interestOverlap * 5, 20);
    score += interestScore;
    reasons.push(`Shared ${interestOverlap} interest(s) (+${interestScore})`);
  }

  // 3. Industry match (15 points)
  if (user1.industry && user2.industry && user1.industry === user2.industry) {
    score += 15;
    reasons.push(`Same industry: ${user1.industry} (+15)`);
  }

  // 4. Personal interests keyword matching (15 points max)
  const user1Personal = (user1.personal_interests || '').toLowerCase();
  const user2Personal = (user2.personal_interests || '').toLowerCase();
  if (user1Personal && user2Personal) {
    const keywords1 = user1Personal.split(/[\s,]+/).filter(w => w.length > 3);
    const keywords2 = user2Personal.split(/[\s,]+/).filter(w => w.length > 3);
    const personalOverlap = keywords1.filter(w => keywords2.includes(w)).length;
    if (personalOverlap > 0) {
      const personalScore = Math.min(personalOverlap * 5, 15);
      score += personalScore;
      reasons.push(`Shared personal interests (+${personalScore})`);
    }
  }

  // 5. Networking goals keyword matching (15 points max)
  const user1Goals = (user1.networking_goals || '').toLowerCase();
  const user2Goals = (user2.networking_goals || '').toLowerCase();
  if (user1Goals && user2Goals) {
    const commonGoalKeywords = ['connect', 'network', 'grow', 'expand', 'meet', 'build', 'relationship'];
    const user1HasGoals = commonGoalKeywords.some(kw => user1Goals.includes(kw));
    const user2HasGoals = commonGoalKeywords.some(kw => user2Goals.includes(kw));
    if (user1HasGoals && user2HasGoals) {
      score += 15;
      reasons.push('Both have networking goals (+15)');
    }
  }

  // 6. Gender preference (10 points if compatible, -50 if incompatible)
  const user1GenderPref = user1.gender_preference || 'No preference';
  const user2GenderPref = user2.gender_preference || 'No preference';
  if (user1GenderPref === 'same' && user1.gender !== user2.gender) {
    score -= 50;
    reasons.push('Gender preference not met (-50)');
  } else if (user2GenderPref === 'same' && user1.gender !== user2.gender) {
    score -= 50;
    reasons.push('Gender preference not met (-50)');
  } else if (
    (user1GenderPref === 'No preference' || user1GenderPref === user2.gender) &&
    (user2GenderPref === 'No preference' || user2GenderPref === user1.gender)
  ) {
    score += 10;
    reasons.push('Gender preferences compatible (+10)');
  }

  // 7. Age preference (5 points if compatible)
  if (user1.year_born && user2.year_born) {
    const currentYear = new Date().getFullYear();
    const user1Age = currentYear - user1.year_born;
    const user2Age = currentYear - user2.year_born;
    const ageDiff = Math.abs(user1Age - user2Age);

    const user1AgePref = user1.year_born_connect || 'No Preference';
    const user2AgePref = user2.year_born_connect || 'No Preference';

    let ageCompatible = true;
    if (user1AgePref === 'similar10' && ageDiff > 10) ageCompatible = false;
    if (user1AgePref === 'similar5' && ageDiff > 5) ageCompatible = false;
    if (user2AgePref === 'similar10' && ageDiff > 10) ageCompatible = false;
    if (user2AgePref === 'similar5' && ageDiff > 5) ageCompatible = false;

    if (ageCompatible) {
      score += 5;
      reasons.push('Age preferences compatible (+5)');
    }
  }

  return { score, reasons };
}

async function runMatchingAlgorithm() {
  console.log('🤖 Running BudE Matching Algorithm...\n');

  try {
    // Fetch all users from database
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    console.log(`📊 Found ${users.length} users in database\n`);

    // Delete existing matches
    const { error: deleteError } = await supabase
      .from('matches')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.log('⚠️  Note: Could not clear old matches:', deleteError.message);
    } else {
      console.log('🗑️  Cleared old matches\n');
    }

    let totalMatches = 0;
    const matchThreshold = 60; // 60% compatibility minimum
    let scoreDistribution = { '0-20': 0, '20-40': 0, '40-60': 0, '60-80': 0, '80-100': 0 };

    // For each user, find their matches
    for (const user of users) {
      const userMatches = [];
      let highestScore = 0;
      let lowestScore = 100;

      for (const otherUser of users) {
        if (user.id === otherUser.id) continue;

        const result = calculateCompatibility(user, otherUser);

        // Track score distribution
        if (result.score < 20) scoreDistribution['0-20']++;
        else if (result.score < 40) scoreDistribution['20-40']++;
        else if (result.score < 60) scoreDistribution['40-60']++;
        else if (result.score < 80) scoreDistribution['60-80']++;
        else scoreDistribution['80-100']++;

        highestScore = Math.max(highestScore, result.score);
        if (result.score > 0) lowestScore = Math.min(lowestScore, result.score);

        if (result.score >= matchThreshold) {
          userMatches.push({
            user_id: user.id,
            matched_user_id: otherUser.id,
            compatibility_score: result.score,
            match_reasons: result.reasons,
            status: 'recommended',
            created_at: new Date().toISOString()
          });
        }
      }

      if (userMatches.length === 0 && highestScore > 0) {
        console.log(`⚪ ${user.first_name} ${user.last_name}: 0 matches (highest score: ${highestScore})`);
      }

      if (userMatches.length > 0) {
        // Insert matches for this user
        const { error: insertError } = await supabase
          .from('matches')
          .insert(userMatches);

        if (insertError) {
          console.log(`❌ Error inserting matches for ${user.first_name} ${user.last_name}:`, insertError.message);
        } else {
          console.log(`✅ ${user.first_name} ${user.last_name}: ${userMatches.length} matches`);
          totalMatches += userMatches.length;
        }
      } else {
        console.log(`⚪ ${user.first_name} ${user.last_name}: 0 matches (need more profile data)`);
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
