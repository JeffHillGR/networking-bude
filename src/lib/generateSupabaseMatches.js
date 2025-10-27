/**
 * Generate matching recommendations from Supabase users
 * Run this script to generate connection recommendations for all users
 *
 * Usage: node src/lib/generateSupabaseMatches.js
 */

import { createClient } from '@supabase/supabase-js';
import { calculateCompatibility } from './matchingAlgorithm.js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Transform Supabase user to matching algorithm format
 * The algorithm expects comma-separated strings, but Supabase stores arrays
 */
function transformUser(user) {
  // Helper to convert array to comma-separated string
  const arrayToString = (arr) => {
    if (!arr) return '';
    if (Array.isArray(arr)) return arr.join(', ');
    return arr;
  };

  return {
    email: user.email,
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    name: user.name || `${user.first_name} ${user.last_name}`,
    jobTitle: user.title || '',
    company: user.company || '',
    industry: user.industry || '',
    orgsAttend: arrayToString(user.organizations_current),
    orgsWantToCheckOut: arrayToString(user.organizations_interested),
    professionalInterests: arrayToString(user.professional_interests),
    professionalInterestsOther: user.professional_interests_other || '',
    personalInterests: arrayToString(user.personal_interests),
    networkingGoals: user.networking_goals || '',
    gender: user.gender || '',
    genderPreference: user.gender_preference || '',
    yearBorn: user.year_born || null,
    yearBornConnect: user.year_born_connect || '',
    sameIndustryPreference: user.same_industry_preference || ''
  };
}

/**
 * Fetch all users from Supabase
 */
async function fetchAllUsers() {
  console.log('📥 Fetching users from Supabase...');

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching users:', error);
    throw error;
  }

  console.log(`✅ Fetched ${data.length} users from Supabase`);
  return data.map(transformUser);
}

/**
 * Find top matches for each user
 */
function findMatchesForAllUsers(users, minScore = 70, maxMatches = 5) {
  console.log(`\n🔍 Calculating matches (min score: ${minScore}, max per user: ${maxMatches})...\n`);

  const allMatches = {};

  users.forEach((user, index) => {
    const matches = [];

    // Compare with all other users
    users.forEach((candidate, candidateIndex) => {
      if (index === candidateIndex) return; // Skip self

      const result = calculateCompatibility(user, candidate);

      if (result.score >= minScore) {
        matches.push({
          email: candidate.email,
          name: candidate.name,
          jobTitle: candidate.jobTitle,
          company: candidate.company,
          score: result.score,
          matches: result.matches
        });
      }
    });

    // Sort by score and take top N
    matches.sort((a, b) => b.score - a.score);
    const topMatches = matches.slice(0, maxMatches);

    allMatches[user.email] = topMatches;

    console.log(`${user.name} (${user.email}): ${topMatches.length} matches`);
  });

  return allMatches;
}

/**
 * Format matches for email generator
 */
function formatForEmailGenerator(allMatches) {
  const connections = [];

  Object.entries(allMatches).forEach(([recipientEmail, matches]) => {
    if (matches.length > 0) {
      connections.push({
        recipient: recipientEmail,
        connections: matches.map(m => m.email)
      });
    }
  });

  return connections;
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🚀 BudE Connection Matching - Supabase Edition\n');
    console.log('=' .repeat(60));

    // Fetch users
    const users = await fetchAllUsers();

    if (users.length === 0) {
      console.log('⚠️  No users found in Supabase');
      return;
    }

    // Generate matches
    const allMatches = findMatchesForAllUsers(users, 70, 3);

    // Show summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));

    const totalMatches = Object.values(allMatches).reduce((sum, matches) => sum + matches.length, 0);
    const usersWithMatches = Object.values(allMatches).filter(matches => matches.length > 0).length;

    console.log(`Total users: ${users.length}`);
    console.log(`Users with matches: ${usersWithMatches}`);
    console.log(`Total connections: ${totalMatches}`);
    console.log(`Average matches per user: ${(totalMatches / users.length).toFixed(1)}`);

    // Format for email generator
    console.log('\n' + '='.repeat(60));
    console.log('📧 EMAIL GENERATOR FORMAT');
    console.log('='.repeat(60));
    console.log('\nCopy this into connection-cards-generator.html:\n');

    const emailFormat = formatForEmailGenerator(allMatches);
    console.log('const connections = ' + JSON.stringify(emailFormat, null, 2) + ';');

    // Show detailed matches for first 3 users
    console.log('\n' + '='.repeat(60));
    console.log('🔍 SAMPLE DETAILED MATCHES (First 3 users)');
    console.log('='.repeat(60));

    Object.entries(allMatches).slice(0, 3).forEach(([email, matches]) => {
      console.log(`\n${email}:`);
      matches.forEach((match, index) => {
        console.log(`  ${index + 1}. ${match.name} (${match.email}) - ${match.score}% compatible`);
      });
    });

    console.log('\n✅ Done! Use the connections array above in your email generator.\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
