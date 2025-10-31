import { supabase } from './supabase';

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
    console.log('ℹ️ Running matching algorithm inline...');

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) throw usersError;

    if (!users || users.length < 2) {
      console.log('ℹ️ Not enough users to run matching (need at least 2)');
      return { success: true, message: 'Not enough users' };
    }

    // Simple matching logic - calculate compatibility between all users
    let matchesCreated = 0;
    let matchesUpdated = 0;
    let totalPairsEvaluated = 0;

    console.log(`📊 Evaluating ${users.length} users for matches...`);

    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const userA = users[i];
        const userB = users[j];
        totalPairsEvaluated++;

        const score = calculateCompatibility(userA, userB);

        console.log(`🔍 ${userA.first_name} ↔ ${userB.first_name}: ${score}% compatibility`);

        // Only create matches above threshold (65%)
        if (score >= 65) {
          // Create match for both directions
          const resultA = await createMatch(userA.id, userB.id, score);
          const resultB = await createMatch(userB.id, userA.id, score);

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
 * Calculate compatibility score between two users
 * Returns a score from 0-100
 */
function calculateCompatibility(userA, userB) {
  let score = 0;
  let totalWeight = 0;

  // Organizations overlap (20% weight)
  const orgScore = calculateArrayOverlap(
    userA.organizations_current || [],
    userB.organizations_current || []
  );
  score += orgScore * 0.20;
  totalWeight += 0.20;

  // Organizations interested (20% weight)
  const orgInterestedScore = calculateArrayOverlap(
    userA.organizations_interested || [],
    userB.organizations_interested || []
  );
  score += orgInterestedScore * 0.20;
  totalWeight += 0.20;

  // Professional interests (25% weight)
  const profInterestsScore = calculateArrayOverlap(
    userA.professional_interests || [],
    userB.professional_interests || []
  );
  score += profInterestsScore * 0.25;
  totalWeight += 0.25;

  // Personal interests (15% weight)
  const personalInterestsScore = calculateTextSimilarity(
    Array.isArray(userA.personal_interests) ? userA.personal_interests.join(' ') : (userA.personal_interests || ''),
    Array.isArray(userB.personal_interests) ? userB.personal_interests.join(' ') : (userB.personal_interests || '')
  );
  score += personalInterestsScore * 0.15;
  totalWeight += 0.15;

  // Industry match (15% weight)
  if (userA.industry && userB.industry && userA.industry === userB.industry) {
    score += 100 * 0.15;
  }
  totalWeight += 0.15;

  // Networking goals similarity (5% weight)
  const goalsScore = calculateTextSimilarity(
    userA.networking_goals || '',
    userB.networking_goals || ''
  );
  score += goalsScore * 0.05;
  totalWeight += 0.05;

  return Math.round(score / totalWeight);
}

/**
 * Calculate overlap between two arrays (returns 0-100)
 */
function calculateArrayOverlap(arr1, arr2) {
  if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) return 0;

  const set1 = new Set(arr1.map(item => String(item).toLowerCase()));
  const set2 = new Set(arr2.map(item => String(item).toLowerCase()));

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return union.size > 0 ? (intersection.size / union.size) * 100 : 0;
}

/**
 * Calculate text similarity (simple keyword matching, returns 0-100)
 */
function calculateTextSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;

  const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  if (words1.length === 0 || words2.length === 0) return 0;

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return union.size > 0 ? (intersection.size / union.size) * 100 : 0;
}

/**
 * Create or update a match in the database
 */
async function createMatch(userId, matchedUserId, score) {
  // Check if match already exists
  const { data: existing } = await supabase
    .from('matches')
    .select('id')
    .eq('user_id', userId)
    .eq('matched_user_id', matchedUserId)
    .single();

  const { error } = await supabase
    .from('matches')
    .upsert({
      user_id: userId,
      matched_user_id: matchedUserId,
      compatibility_score: score,
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
