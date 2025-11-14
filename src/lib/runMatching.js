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
 * This can be called after:
 * - New user signup
 * - Profile updates
 *
 * Uses the Supabase Edge Function if available,
 * or falls back to direct database function call
 */
export async function runMatchingAlgorithm() {
  try {
    console.log('🔄 Triggering matching algorithm...');

    // Option 1: Try to call the Edge Function (if deployed)
    try {
      const { data, error } = await supabase.functions.invoke('run-matching', {
        body: {}
      });

      if (!error) {
        console.log('✅ Matching algorithm completed via Edge Function:', data);
        return { success: true, data };
      }

      console.log('⚠️ Edge Function not available, trying direct database call...');
    } catch (edgeFunctionError) {
      console.log('⚠️ Edge Function error:', edgeFunctionError);
    }

    // Option 2: Call database function directly via RPC
    try {
      const { data, error } = await supabase.rpc('trigger_matching_algorithm');

      if (error) {
        console.error('❌ Database RPC error:', error);
        throw error;
      }

      console.log('✅ Matching algorithm completed via database RPC');
      return { success: true, data };
    } catch (rpcError) {
      console.log('⚠️ Database RPC not available:', rpcError);
    }

    // Option 3: Run the matching logic inline (fallback)
    console.log('ℹ️ Running matching algorithm inline using REAL algorithm...');

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

    // Calculate compatibility between all users
    let matchesCreated = 0;
    let matchesUpdated = 0;
    let totalPairsEvaluated = 0;
    const matchThreshold = 65; // Only create matches above 65%

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

          if (resultA.created || resultB.created) {
            matchesCreated += 2;
          } else {
            matchesUpdated += 2;
          }
        }
      }
    }

    console.log(`✅ Matching completed:`);
    console.log(`   - Pairs evaluated: ${totalPairsEvaluated}`);
    console.log(`   - New matches created: ${matchesCreated}`);
    console.log(`   - Existing matches updated: ${matchesUpdated}`);
    return { success: true, matchesCreated, matchesUpdated, totalPairsEvaluated };

  } catch (error) {
    console.error('❌ Error running matching algorithm:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create or update a match in the database
 */
async function createMatch(userId, matchedUserId, score, reasons = []) {
  // Check if match already exists
  const { data: existing } = await supabase
    .from('connection_flow')
    .select('id')
    .eq('user_id', userId)
    .eq('matched_user_id', matchedUserId)
    .single();

  const { error } = await supabase
    .from('connection_flow')
    .upsert({
      user_id: userId,
      matched_user_id: matchedUserId,
      compatibility_score: score,
      match_reasons: reasons,
      status: 'recommended',
      created_at: existing ? undefined : new Date().toISOString(), // Keep original created_at if exists
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,matched_user_id'
    });

  if (error && error.code !== '23505') { // Ignore duplicate key errors
    console.error('Error creating match:', error);
    return { created: false };
  }

  return { created: !existing }; // Return true if it was newly created
}
