/**
 * Test script to calculate Chantel and Steve's compatibility with all users
 * Run this with: node test-chantel-steve-matches.js
 */

import { createClient } from '@supabase/supabase-js';
import { calculateCompatibility } from './src/lib/matchingAlgorithm.js';

const supabaseUrl = 'https://moqhghbqapcppzydgqyt.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vcWhnaGJxYXBjcHB6eWRncXl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NDczNzMsImV4cCI6MjA3NzAyMzM3M30.8WjiloL6xF-u_1vydb_7QMyGWc8c0vHgmt5NyQoNZzc';

const supabase = createClient(supabaseUrl, supabaseKey);

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

function testUserMatches(testUser, testUserRaw, users) {
  console.log(`\n═══════════════════════════════════════════════════════════════`);
  console.log(`         COMPATIBILITY REPORT FOR ${testUserRaw.first_name?.toUpperCase()} ${testUserRaw.last_name?.toUpperCase()}`);
  console.log(`═══════════════════════════════════════════════════════════════`);
  console.log(`Email: ${testUserRaw.email}`);
  console.log(`Industry: ${testUserRaw.industry || 'N/A'}`);
  console.log(`Company: ${testUserRaw.company || 'N/A'}`);
  console.log(`Title: ${testUserRaw.title || 'N/A'}`);
  console.log(`Gender: ${testUserRaw.gender || 'N/A'}`);
  console.log(`Year Born: ${testUserRaw.year_born || 'N/A'}`);
  console.log(`\n📊 Profile Data:`);
  console.log(`  Organizations Current: ${testUserRaw.organizations_current || 'None'}`);
  console.log(`  Organizations Interested: ${testUserRaw.organizations_interested || 'None'}`);
  console.log(`  Networking Goals: ${testUserRaw.networking_goals || 'None'}`);
  console.log(`  Professional Interests: ${testUserRaw.professional_interests || 'None'}`);
  console.log(`  Personal Interests: ${testUserRaw.personal_interests || 'None'}`);
  console.log(`  Gender Preference: ${testUserRaw.gender_preference || 'No preference'}`);
  console.log(`  Age Preference: ${testUserRaw.year_born_connect || 'No Preference'}`);
  console.log(`\n📊 Calculating compatibility with all users...\n`);

  // Calculate compatibility with everyone
  const results = [];

  for (const user of users) {
    if (user.email === testUserRaw.email) continue; // Skip self

    const userFormatted = convertUserToAlgorithmFormat(user);
    const compatibility = calculateCompatibility(testUser, userFormatted);

    results.push({
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      company: user.company,
      industry: user.industry,
      score: compatibility.score,
      meetsThreshold: compatibility.score >= 65,
      breakdown: {
        networkingGoals: compatibility.matches.networkingGoals.score,
        organizations: compatibility.matches.organizations.score,
        professionalInterests: compatibility.matches.professionalInterests.score,
        industry: compatibility.matches.industry.score,
        gender: compatibility.matches.gender.score,
        age: compatibility.matches.age.score,
        personalInterests: compatibility.matches.personalInterests.score
      },
      details: compatibility.matches
    });
  }

  // Sort by score
  results.sort((a, b) => b.score - a.score);

  // Print summary
  console.log(`Total users evaluated: ${results.length}`);
  console.log(`Threshold: 65%`);
  console.log(`Users above threshold: ${results.filter(r => r.meetsThreshold).length}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Show top 10
  console.log('🏆 TOP 10 MATCHES:\n');
  results.slice(0, 10).forEach((result, index) => {
    const passOrFail = result.meetsThreshold ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${result.name} - ${result.score}% ${passOrFail}`);
    console.log(`   Email: ${result.email}`);
    console.log(`   Company: ${result.company || 'N/A'}`);
    console.log(`   Industry: ${result.industry || 'N/A'}`);
    console.log(`   Breakdown:`);
    console.log(`     - Networking Goals: ${result.breakdown.networkingGoals}/25`);
    console.log(`     - Organizations: ${result.breakdown.organizations}/50`);
    console.log(`     - Professional Interests: ${result.breakdown.professionalInterests}/15`);
    console.log(`     - Industry: ${result.breakdown.industry}/5`);
    console.log(`     - Gender Pref: ${result.breakdown.gender}/5`);
    console.log(`     - Age Pref: ${result.breakdown.age}/5`);
    console.log(`     - Personal Interests: ${result.breakdown.personalInterests}/5`);

    // Show organization match details if any
    if (result.details.organizations.details && result.details.organizations.details.length > 0) {
      console.log(`   Organization Matches: ${result.details.organizations.details.join(', ')}`);
    }
    console.log('');
  });

  // Show stats
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📈 STATISTICS:');
  console.log('═══════════════════════════════════════════════════════════════');
  const scores = results.map(r => r.score);
  const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);

  console.log(`Average compatibility: ${avgScore}%`);
  console.log(`Highest score: ${maxScore}%`);
  console.log(`Lowest score: ${minScore}%`);
  console.log(`Users scoring 65+% (would match): ${results.filter(r => r.score >= 65).length}`);
  console.log(`Users scoring 50-64% (close but not quite): ${results.filter(r => r.score >= 50 && r.score < 65).length}`);
  console.log(`Users scoring 40-49%: ${results.filter(r => r.score >= 40 && r.score < 50).length}`);
  console.log(`Users scoring below 40%: ${results.filter(r => r.score < 40).length}`);

  return results;
}

async function testBothUsers() {
  console.log('🔍 Fetching all users...\n');

  const { data: users, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  console.log(`Found ${users.length} total users in database\n`);

  // Find Chantel
  const chantel = users.find(u => u.email?.toLowerCase() === 'chantel@mittenhomeinfusion.com');

  // Find Steve
  const steve = users.find(u => u.email?.toLowerCase() === 'steve@getkelso.com');

  if (!chantel) {
    console.error('❌ Chantel not found!');
  }

  if (!steve) {
    console.error('❌ Steve not found!');
  }

  if (!chantel && !steve) {
    return;
  }

  // Test Chantel's matches
  if (chantel) {
    const chantelFormatted = convertUserToAlgorithmFormat(chantel);
    const chantelResults = testUserMatches(chantelFormatted, chantel, users);

    // Check if they match with each other
    if (steve) {
      const steveMatch = chantelResults.find(r => r.email?.toLowerCase() === 'steve@getkelso.com');
      if (steveMatch) {
        console.log(`\n🔗 Chantel ↔️ Steve compatibility: ${steveMatch.score}% ${steveMatch.meetsThreshold ? '✅' : '❌'}`);
      }
    }
  }

  // Test Steve's matches
  if (steve) {
    const steveFormatted = convertUserToAlgorithmFormat(steve);
    const steveResults = testUserMatches(steveFormatted, steve, users);

    // Check if they match with each other
    if (chantel) {
      const chantelMatch = steveResults.find(r => r.email?.toLowerCase() === 'chantel@mittenhomeinfusion.com');
      if (chantelMatch) {
        console.log(`\n🔗 Steve ↔️ Chantel compatibility: ${chantelMatch.score}% ${chantelMatch.meetsThreshold ? '✅' : '❌'}`);
      }
    }
  }
}

testBothUsers().catch(console.error);
