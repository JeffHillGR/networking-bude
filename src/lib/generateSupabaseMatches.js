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
const envPath = resolve(__dirname, '../../.env.local');
console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env.local:', result.error);
}

console.log('Environment variables loaded:');
console.log('- VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'Found' : 'Missing');
console.log('- VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'Found' : 'Missing');
console.log('- VITE_SUPABASE_SERVICE_ROLE_KEY:', process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? 'Found' : 'Missing');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Try to use service role key first (for admin operations), fall back to anon key
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Need VITE_SUPABASE_URL and either VITE_SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

if (process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
  console.log('✅ Using service role key (bypasses RLS policies)');
} else {
  console.log('⚠️  Using anon key - may hit RLS restrictions. Add VITE_SUPABASE_SERVICE_ROLE_KEY to .env.local for admin operations.');
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

  // Return both the raw data (with IDs) and transformed data
  return {
    rawUsers: data,
    transformedUsers: data.map(transformUser)
  };
}

/**
 * Find top matches for each user
 */
function findMatchesForAllUsers(users, usersWithIds, minScore = 70, maxMatches = 5) {
  console.log(`\n🔍 Calculating matches (min score: ${minScore}, max per user: ${maxMatches})...\n`);

  const allMatches = {};

  users.forEach((user, index) => {
    const matches = [];
    const userRecord = usersWithIds.find(u => u.email === user.email);

    if (!userRecord) {
      console.warn(`⚠️  No user record found for ${user.email}`);
      return;
    }

    // Compare with all other users
    users.forEach((candidate, candidateIndex) => {
      if (index === candidateIndex) return; // Skip self

      const candidateRecord = usersWithIds.find(u => u.email === candidate.email);
      if (!candidateRecord) return;

      const result = calculateCompatibility(user, candidate);

      if (result.score >= minScore) {
        matches.push({
          userId: userRecord.id,
          matchedUserId: candidateRecord.id,
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
 * Insert matches into Supabase matches table
 */
async function insertMatchesToSupabase(allMatches) {
  console.log('\n💾 Inserting matches into Supabase...\n');

  // First, clear existing matches
  const { error: deleteError } = await supabase
    .from('connections')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (deleteError) {
    console.error('❌ Error clearing old matches:', deleteError);
    throw deleteError;
  }

  console.log('✅ Cleared old matches');

  // Prepare all match records for insertion
  const matchRecords = [];
  Object.entries(allMatches).forEach(([email, matches]) => {
    matches.forEach(match => {
      matchRecords.push({
        user_id: match.userId,
        matched_user_id: match.matchedUserId,
        compatibility_score: match.score,
        match_reasons: match.matches,
        status: 'recommended'
      });
    });
  });

  if (matchRecords.length === 0) {
    console.log('⚠️  No matches to insert');
    return;
  }

  // Insert in batches of 100
  const batchSize = 100;
  let insertedCount = 0;

  for (let i = 0; i < matchRecords.length; i += batchSize) {
    const batch = matchRecords.slice(i, i + batchSize);
    const { error: insertError } = await supabase
      .from('connections')
      .insert(batch);

    if (insertError) {
      console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, insertError);
      throw insertError;
    }

    insertedCount += batch.length;
    console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} matches`);
  }

  console.log(`\n✅ Total matches inserted: ${insertedCount}`);
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
    const { rawUsers, transformedUsers } = await fetchAllUsers();

    if (transformedUsers.length === 0) {
      console.log('⚠️  No users found in Supabase');
      return;
    }

    // Generate matches
    // TODO: INCREASE THRESHOLD when user base grows
    // Current: 60% min score, 5 max matches (BETA - ensures everyone gets matches)
    // Recommended at 100+ users: 70% min score, 3 max matches (PRODUCTION)
    const MIN_SCORE = 60;  // Lower for beta to ensure engagement
    const MAX_MATCHES = 5; // More matches for beta users to explore
    const allMatches = findMatchesForAllUsers(transformedUsers, rawUsers, MIN_SCORE, MAX_MATCHES);

    // Insert matches into Supabase
    await insertMatchesToSupabase(allMatches);

    // Show summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));

    const totalMatches = Object.values(allMatches).reduce((sum, matches) => sum + matches.length, 0);
    const usersWithMatches = Object.values(allMatches).filter(matches => matches.length > 0).length;

    console.log(`Total users: ${transformedUsers.length}`);
    console.log(`Users with matches: ${usersWithMatches}`);
    console.log(`Total connections: ${totalMatches}`);
    console.log(`Average matches per user: ${(totalMatches / transformedUsers.length).toFixed(1)}`);

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

    console.log('\n✅ Done! Matches have been saved to Supabase.\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
