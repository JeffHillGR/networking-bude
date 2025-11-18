import { supabase } from './supabase';
import { calculateCompatibility } from './matchingAlgorithm';

/**
 * Convert Supabase user format to matching algorithm format
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

/**
 * Trigger the matching algorithm for all users
 * This is called after:
 * - New user signup
 * - Profile updates
 *
 * Calculates compatibility between all users and creates
 * matches in the connection_flow table for scores >= 70%
 */
export async function runMatchingAlgorithm() {
  try {
    console.log('🔄 Running matching algorithm...');

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) throw usersError;

    if (!users || users.length < 2) {
      console.log('ℹ️ Not enough users to run matching (need at least 2)');
      return { success: true, message: 'Not enough users' };
    }

    // Convert users to algorithm format
    const algorithmUsers = users.map(convertUserToAlgorithmFormat);

    // First, delete ALL existing matches to start fresh
    console.log('🗑️ Clearing existing matches...');
    const { error: deleteError } = await supabase
      .from('connection_flow')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (deleteError) {
      console.error('Error clearing matches:', deleteError);
      // Continue anyway - we can still create new matches
    }

    // Calculate compatibility between all users
    let matchesCreated = 0;
    let totalPairsEvaluated = 0;
    const matchThreshold = 70; // Only create matches above 70%

    console.log(`📊 Evaluating ${users.length} users for matches...`);

    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const userA = algorithmUsers[i];
        const userB = algorithmUsers[j];
        const dbUserA = users[i];
        const dbUserB = users[j];
        totalPairsEvaluated++;

        // Use the REAL algorithm
        const result = calculateCompatibility(userA, userB);

        console.log(`🔍 ${userA.firstName} ↔ ${userB.firstName}: ${result.score}% compatibility`);

        // Only create matches above threshold
        if (result.score >= matchThreshold) {
          // Extract match reasons from the result
          const reasons = [];
          Object.keys(result.matches).forEach(category => {
            if (result.matches[category].details && result.matches[category].details.length > 0) {
              reasons.push(...result.matches[category].details);
            }
          });

          console.log(`  ✨ Creating match! Reasons: ${reasons.slice(0, 3).join(', ')}`);

          // Create match for both directions
          const resultA = await createMatch(dbUserA.id, dbUserB.id, result.score, reasons);
          const resultB = await createMatch(dbUserB.id, dbUserA.id, result.score, reasons);

          if (resultA.created) matchesCreated++;
          if (resultB.created) matchesCreated++;
        }
      }
    }

    console.log(`✅ Matching completed:`);
    console.log(`   - Pairs evaluated: ${totalPairsEvaluated}`);
    console.log(`   - Total matches created: ${matchesCreated}`);
    return { success: true, matchesCreated, totalPairsEvaluated };

  } catch (error) {
    console.error('❌ Error running matching algorithm:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a match in the database
 */
async function createMatch(userId, matchedUserId, score, reasons = []) {
  const { error } = await supabase
    .from('connection_flow')
    .insert({
      user_id: userId,
      matched_user_id: matchedUserId,
      compatibility_score: score,
      match_reasons: reasons,
      status: 'recommended',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error creating match:', error);
    return { created: false };
  }

  return { created: true };
}
