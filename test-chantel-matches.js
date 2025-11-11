/**
 * Test script to calculate Chantel's compatibility with all users
 * Run this with: node test-chantel-matches.js
 */

import { createClient } from '@supabase/supabase-js';
import { calculateCompatibility } from './src/lib/matchingAlgorithm.js';

const supabaseUrl = 'https://hrxbqhpdbnlitdvcdwpu.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyeGJxaHBkYm5saXRkdmNkd3B1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk3MDE5NzAsImV4cCI6MjA0NTI3Nzk3MH0.vYy3p7KlIhBgYxaHPGKGpOXyO1Gt-9Q-JbcJ4i6X-bQ';

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

async function testChantelMatches() {
  console.log('🔍 Fetching all users...\n');

  const { data: users, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  // Find Chantel
  const chantel = users.find(u => u.email === 'chantel@mittenhomeinfusion.com');

  if (!chantel) {
    console.error('❌ Chantel not found!');
    return;
  }

  console.log('✅ Found Chantel:', chantel.first_name, chantel.last_name);
  console.log('   Industry:', chantel.industry);
  console.log('   Company:', chantel.company);
  console.log('   Title:', chantel.title);
  console.log('\n📊 Calculating compatibility with all users...\n');

  // Convert to algorithm format
  const chantelFormatted = convertUserToAlgorithmFormat(chantel);

  // Calculate compatibility with everyone
  const results = [];

  for (const user of users) {
    if (user.email === 'chantel@mittenhomeinfusion.com') continue; // Skip self

    const userFormatted = convertUserToAlgorithmFormat(user);
    const compatibility = calculateCompatibility(chantelFormatted, userFormatted);

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
      }
    });
  }

  // Sort by score
  results.sort((a, b) => b.score - a.score);

  // Print results
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    COMPATIBILITY REPORT');
  console.log('═══════════════════════════════════════════════════════════════');
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
  console.log(`Users scoring 50-64% (close but not quite): ${results.filter(r => r.score >= 50 && r.score < 65).length}`);
  console.log(`Users scoring 40-49%: ${results.filter(r => r.score >= 40 && r.score < 50).length}`);
  console.log(`Users scoring below 40%: ${results.filter(r => r.score < 40).length}`);
}

testChantelMatches().catch(console.error);
