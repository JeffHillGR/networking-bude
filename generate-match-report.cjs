#!/usr/bin/env node

/**
 * Generate a report of all matches with reasons
 * Shows compatibility scores and why users matched
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function generateMatchReport() {
  console.log('\n📊 MATCHING REPORT\n');
  console.log('='.repeat(80));

  try {
    // Get all matches with user details
    const { data: matches, error } = await supabase
      .from('connection_flow')
      .select(`
        *,
        user:users!matches_user_id_fkey(first_name, last_name),
        matched_user:users!matches_matched_user_id_fkey(first_name, last_name)
      `)
      .eq('status', 'recommended')
      .order('compatibility_score', { ascending: false });

    if (error) {
      console.error('Error fetching matches:', error);
      return;
    }

    if (!matches || matches.length === 0) {
      console.log('\nNo matches found in the database.');
      return;
    }

    // Group matches by user pairs (avoid duplicates)
    const uniquePairs = new Map();

    matches.forEach(match => {
      // Skip if user data is missing
      if (!match.user || !match.matched_user) {
        return;
      }

      const userId1 = match.user_id;
      const userId2 = match.matched_user_id;
      const pairKey = [userId1, userId2].sort().join('_');

      if (!uniquePairs.has(pairKey)) {
        uniquePairs.set(pairKey, {
          user1: `${match.user.first_name} ${match.user.last_name}`,
          user2: `${match.matched_user.first_name} ${match.matched_user.last_name}`,
          score: match.compatibility_score,
          reasons: match.match_reasons || [],
          createdAt: match.created_at
        });
      }
    });

    console.log(`\nTotal Unique Matches: ${uniquePairs.size}`);
    console.log(`Total Match Records: ${matches.length}\n`);
    console.log('='.repeat(80));

    // Sort by score descending
    const sortedPairs = Array.from(uniquePairs.values())
      .sort((a, b) => b.score - a.score);

    // Print each match
    sortedPairs.forEach((pair, index) => {
      console.log(`\n${index + 1}. ${pair.user1} ↔ ${pair.user2}`);
      console.log(`   Compatibility: ${pair.score}%`);

      if (pair.reasons && pair.reasons.length > 0) {
        console.log(`   Reasons:`);
        pair.reasons.forEach(reason => {
          console.log(`      • ${reason}`);
        });
      } else {
        console.log(`   Reasons: (none stored)`);
      }

      console.log(`   Created: ${new Date(pair.createdAt).toLocaleString()}`);
      console.log('-'.repeat(80));
    });

    // Statistics
    console.log('\n📈 STATISTICS\n');
    const scores = sortedPairs.map(p => p.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    console.log(`Average Compatibility: ${avgScore.toFixed(1)}%`);
    console.log(`Highest Score: ${maxScore}%`);
    console.log(`Lowest Score: ${minScore}%`);

    // Score distribution
    const score90Plus = scores.filter(s => s >= 90).length;
    const score80Plus = scores.filter(s => s >= 80 && s < 90).length;
    const score70Plus = scores.filter(s => s >= 70 && s < 80).length;
    const score65Plus = scores.filter(s => s >= 65 && s < 70).length;

    console.log('\nScore Distribution:');
    console.log(`  90-100%: ${score90Plus} matches`);
    console.log(`  80-89%:  ${score80Plus} matches`);
    console.log(`  70-79%:  ${score70Plus} matches`);
    console.log(`  65-69%:  ${score65Plus} matches`);

    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('Error generating report:', error);
  }
}

generateMatchReport();
