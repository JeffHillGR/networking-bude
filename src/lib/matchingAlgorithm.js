/**
 * BudE Matching Algorithm
 *
 * Calculates compatibility scores between users based on:
 * - Networking Goals (30 points)
 * - Organizations (25 points) - split into:
 *   - Complementary match (12.5 points): My attend ↔ Your check out
 *   - Same-field match (12.5 points): Both attend same OR both check out same
 * - Professional Interests (20 points)
 * - Personal Interests (15 points) - builds rapport
 * - Industry (10 points)
 *
 * TEMPORARILY DISABLED (fields blank for most users - reinstate later):
 * - Looking To Accomplish (0 points) - was 15
 * - Groups in Common (0 points) - was 10
 *
 * Total: 100 points possible
 * Minimum threshold: 60/100 to be shown as a potential connection
 *
 * Updated Dec 2024: Removed Groups & LookingTo scoring (blank fields),
 * rebalanced remaining categories for better match distribution
 */

import { supabase } from './supabase';

/**
 * Calculate compatibility score between two users
 * @param {Object} user1 - First user's profile data
 * @param {Object} user2 - Second user's profile data
 * @returns {Object} { score: number, matches: Object } - Score out of 100 and matching details
 */
export function calculateCompatibility(user1, user2) {
  let totalScore = 0;
  const matches = {
    networkingGoals: { score: 0, details: [] },
    organizations: { score: 0, details: [] },
    professionalInterests: { score: 0, details: [] },
    industry: { score: 0, details: [] },
    groups: { score: 0, details: [] },
    lookingTo: { score: 0, details: [] },
    personalInterests: { score: 0, details: [] }
  };

  // 1. NETWORKING GOALS (25 points)
  const goalsScore = scoreNetworkingGoals(user1.networkingGoals, user2.networkingGoals);
  matches.networkingGoals.score = goalsScore.score;
  matches.networkingGoals.details = goalsScore.matches;
  totalScore += goalsScore.score;

  // 2. ORGANIZATIONS (30 points total)
  const orgsScore = scoreOrganizations(
    user1.orgsAttend,
    user1.orgsWantToCheckOut,
    user2.orgsAttend,
    user2.orgsWantToCheckOut
  );
  matches.organizations.score = orgsScore.score;
  matches.organizations.details = orgsScore.matches;
  totalScore += orgsScore.score;

  // 3. PROFESSIONAL INTERESTS (15 points)
  const professionalScore = scoreProfessionalInterests(
    user1.professionalInterests,
    user2.professionalInterests
  );
  matches.professionalInterests.score = professionalScore.score;
  matches.professionalInterests.details = professionalScore.matches;
  totalScore += professionalScore.score;

  // 4. INDUSTRY (5 points)
  const industryScore = scoreIndustry(user1.industry, user2.industry);
  matches.industry.score = industryScore.score;
  matches.industry.details = industryScore.matches;
  totalScore += industryScore.score;

  // 5. GROUPS IN COMMON - TEMPORARILY DISABLED (blank for most users)
  // TODO: Reinstate when users have filled in groups_belong_to field
  // const groupsScore = scoreGroups(user1.groupsBelongTo, user2.groupsBelongTo);
  // matches.groups.score = groupsScore.score;
  // matches.groups.details = groupsScore.matches;
  // totalScore += groupsScore.score;

  // 6. "LOOKING TO" OVERLAP - TEMPORARILY DISABLED (blank for most users)
  // TODO: Reinstate when users have filled in looking_to_accomplish field
  // const lookingToScore = scoreLookingTo(user1.lookingToAccomplish, user2.lookingToAccomplish);
  // matches.lookingTo.score = lookingToScore.score;
  // matches.lookingTo.details = lookingToScore.matches;
  // totalScore += lookingToScore.score;

  // 7. PERSONAL INTERESTS/HOBBIES (5 points)
  const personalScore = scorePersonalInterests(
    user1.personalInterests,
    user2.personalInterests
  );
  matches.personalInterests.score = personalScore.score;
  matches.personalInterests.details = personalScore.matches;
  totalScore += personalScore.score;

  return {
    score: Math.round(totalScore),
    matches,
    meetsThreshold: totalScore >= 60
  };
}

/**
 * Score Networking Goals (30 points max)
 */
function scoreNetworkingGoals(goals1, goals2) {
  const maxScore = 30;
  let score = 0;
  const matches = [];

  if (!goals1 || !goals2) return { score, matches };

  const text1 = goals1.toLowerCase();
  const text2 = goals2.toLowerCase();

  // High priority keywords
  const meaningfulConnectionsKeywords = ['meaningful connection', 'meaningful connections', 'genuine connection', 'genuine connections', 'authentic connection', 'authentic connections', 'real connection', 'real connections'];
  const growthKeywords = ['grow', 'growth', 'expand', 'scale', 'scaling', 'build', 'building'];
  const salesKeywords = ['find new clients', 'find clients', 'sell my services', 'sell services', 'generate leads', 'business development', 'referrals', 'referral', 'pipeline', 'prospecting', 'new business'];

  // Check for "meaningful connections" in both (BOOSTED - high priority)
  const user1HasMeaningful = meaningfulConnectionsKeywords.some(kw => text1.includes(kw));
  const user2HasMeaningful = meaningfulConnectionsKeywords.some(kw => text2.includes(kw));

  if (user1HasMeaningful && user2HasMeaningful) {
    score += 18;  // Both mention meaningful
    matches.push('Both seeking meaningful connections');
  } else if (user1HasMeaningful || user2HasMeaningful) {
    score += 8;  // One mentions meaningful - still good!
    matches.push('Focus on meaningful connections');
  }

  // Check for growth keywords (BOOSTED)
  const user1HasGrowth = growthKeywords.some(kw => text1.includes(kw));
  const user2HasGrowth = growthKeywords.some(kw => text2.includes(kw));

  if (user1HasGrowth && user2HasGrowth) {
    score += 12;  // Both mention growth
    matches.push('Both focused on growth');
  } else if (user1HasGrowth || user2HasGrowth) {
    score += 5;  // One mentions growth
    matches.push('Growth-oriented');
  }

  // Check if both are sales-focused (BOOSTED so LinkedIn power users find each other)
  const user1Sales = salesKeywords.some(kw => text1.includes(kw));
  const user2Sales = salesKeywords.some(kw => text2.includes(kw));

  if (user1Sales && user2Sales) {
    score += 18;  // Increased from 10 - sales people should match together
    matches.push('Both interested in business development');
  } else if (user1Sales || user2Sales) {
    // One sales-focused, one not = lower compatibility
    score += 2;
  }

  // General similarity bonus (if they share similar language/goals)
  const sharedWords = findSharedKeywords(text1, text2, [
    'mentor', 'mentee', 'learn', 'teach', 'collaborate', 'partner',
    'connect', 'network', 'relationships', 'community'
  ]);
  if (sharedWords.length > 0) {
    score += Math.min(sharedWords.length * 2, 8);
    matches.push(`Shared goals: ${sharedWords.join(', ')}`);
  }

  // BudE Philosophy Bonus - authentic relationship-building values
  const budePhilosophyKeywords = [
    'purpose', 'relationship', 'connecting', 'collaboration', 'shared', 'share',
    'uplifting', 'community', 'partnership', 'partnerships', 'real', 'genuine',
    'authentic', 'meaningful', 'serve', 'support', 'uplift', 'disingenuous',
    'organic', 'conversations', 'conversation'
  ];
  const sharedPhilosophy = budePhilosophyKeywords.filter(kw =>
    text1.includes(kw) && text2.includes(kw)
  );
  if (sharedPhilosophy.length > 0) {
    score += Math.min(sharedPhilosophy.length * 3, 12); // Higher weight for philosophy match
    matches.push(`Shared values: ${sharedPhilosophy.join(', ')}`);
  }

  return {
    score: Math.min(score, maxScore),
    matches
  };
}

/**
 * Score Organizations (40 points max)
 *
 * BUCKET 1 (20 points): Complementary Match
 *   - My "Orgs I attend" ↔ Your "Orgs I want to check out"
 *   - OR Your "Orgs I attend" ↔ My "Orgs I want to check out"
 *
 * BUCKET 2 (20 points): Same-Field Match
 *   - Both attend same orgs
 *   - OR both want to check out same orgs
 */
function scoreOrganizations(user1Attend, user1WantToCheckOut, user2Attend, user2WantToCheckOut) {
  let score = 0;
  const matches = [];

  if (!user1Attend && !user1WantToCheckOut && !user2Attend && !user2WantToCheckOut) {
    return { score, matches };
  }

  // Parse comma-separated lists
  const u1Attend = parseList(user1Attend);
  const u1CheckOut = parseList(user1WantToCheckOut);
  const u2Attend = parseList(user2Attend);
  const u2CheckOut = parseList(user2WantToCheckOut);

  // BUCKET 1: Complementary Match (20 points max)
  // User1 attends, User2 wants to check out (or vice versa)
  const complementary1 = findSharedItems(u1Attend, u2CheckOut);
  const complementary2 = findSharedItems(u1CheckOut, u2Attend);
  const allComplementary = [...complementary1, ...complementary2];

  if (allComplementary.length > 0) {
    score += 20;
    if (complementary1.length > 0) {
      matches.push(`Introduction opportunity: ${complementary1.join(', ')}`);
    }
    if (complementary2.length > 0) {
      matches.push(`Introduction opportunity: ${complementary2.join(', ')}`);
    }
  }

  // BUCKET 2: Same-Field Match (20 points max)
  // Both attend same OR both want to check out same
  const sharedAttend = findSharedItems(u1Attend, u2Attend);
  const sharedCheckOut = findSharedItems(u1CheckOut, u2CheckOut);

  if (sharedAttend.length > 0 || sharedCheckOut.length > 0) {
    score += 20;
    if (sharedAttend.length > 0) {
      matches.push(`Both attend: ${sharedAttend.join(', ')}`);
    }
    if (sharedCheckOut.length > 0) {
      matches.push(`Both interested in: ${sharedCheckOut.join(', ')}`);
    }
  }

  return {
    score: Math.min(score, 40),
    matches
  };
}

/**
 * Score Professional Interests (15 points max)
 */
function scoreProfessionalInterests(interests1, interests2) {
  let score = 0;
  const matches = [];

  if (!interests1 || !interests2) return { score, matches };

  const list1 = parseList(interests1);
  const list2 = parseList(interests2);
  const shared = findSharedItems(list1, list2);

  if (shared.length > 0) {
    // Calculate score: (shared items / average list length) * max points
    const avgLength = (list1.length + list2.length) / 2;
    score = (shared.length / avgLength) * 15;
    matches.push(...shared);
  }

  return {
    score: Math.min(Math.round(score), 15),
    matches
  };
}

/**
 * Score Industry (5 points max)
 */
function scoreIndustry(industry1, industry2) {
  let score = 0;
  const matches = [];

  if (!industry1 || !industry2) return { score, matches };

  // Exact match
  if (industry1.toLowerCase() === industry2.toLowerCase()) {
    score = 5;
    matches.push(industry1);
  } else {
    // Partial match (related industries)
    const related = areIndustriesRelated(industry1, industry2);
    if (related) {
      score = 3;
      matches.push(`Related: ${industry1} & ${industry2}`);
    }
  }

  return { score, matches };
}

/**
 * Score Groups in Common (10 points max)
 */
function scoreGroups(groups1, groups2) {
  let score = 0;
  const matches = [];

  if (!groups1 || !groups2) return { score, matches };

  const text1 = groups1.toLowerCase();
  const text2 = groups2.toLowerCase();

  // Parse groups (comma-separated or similar)
  const list1 = text1.split(/[,;]/).map(g => g.trim()).filter(g => g.length > 0);
  const list2 = text2.split(/[,;]/).map(g => g.trim()).filter(g => g.length > 0);

  // Find shared groups (allow partial matches for flexibility)
  const sharedGroups = [];
  list1.forEach(g1 => {
    list2.forEach(g2 => {
      if (g1.includes(g2) || g2.includes(g1)) {
        if (!sharedGroups.includes(g1)) {
          sharedGroups.push(g1);
        }
      }
    });
  });

  if (sharedGroups.length > 0) {
    // Give full points if any groups match
    score = 10;
    matches.push(`Shared groups: ${sharedGroups.join(', ')}`);
  }

  return { score, matches };
}

/**
 * Score "Looking To" Overlap (15 points max)
 */
function scoreLookingTo(looking1, looking2) {
  let score = 0;
  const matches = [];

  // Handle both array and string formats
  const goals1 = Array.isArray(looking1) ? looking1 : (looking1 ? [looking1] : []);
  const goals2 = Array.isArray(looking2) ? looking2 : (looking2 ? [looking2] : []);

  if (goals1.length === 0 || goals2.length === 0) return { score, matches };

  // Check for exact matches
  const sharedGoals = goals1.filter(g => goals2.includes(g));

  if (sharedGoals.length > 0) {
    // Give full points if any goals match
    score = 15;
    matches.push(`Shared goals: ${sharedGoals.join(', ')}`);
  }

  return { score, matches };
}

/**
 * Score Personal Interests/Hobbies (10 points max)
 * Shared hobbies build rapport but weighted lower to avoid over-matching
 */
function scorePersonalInterests(interests1, interests2) {
  let score = 0;
  const matches = [];

  if (!interests1 || !interests2) return { score, matches };

  const text1 = interests1.toLowerCase();
  const text2 = interests2.toLowerCase();

  // Common hobby keywords to check
  const hobbyKeywords = [
    'pickleball', 'hiking', 'running', 'biking', 'cycling', 'golf',
    'tennis', 'fitness', 'yoga', 'cooking', 'reading', 'travel',
    'photography', 'music', 'art', 'gaming', 'sports', 'skiing',
    'snowboarding', 'swimming', 'kayaking', 'camping', 'fishing',
    'gardening', 'crafts', 'wine', 'beer', 'coffee', 'foodie',
    'movies', 'theater', 'concerts', 'volunteering', 'family',
    'dogs', 'pets', 'cats', 'outdoors', 'nature', 'beach'
  ];

  const sharedHobbies = hobbyKeywords.filter(hobby =>
    text1.includes(hobby) && text2.includes(hobby)
  );

  if (sharedHobbies.length > 0) {
    // Scale: 1 hobby = 5pts, 2+ = 10pts (full points)
    score = sharedHobbies.length >= 2 ? 10 : 5;
    matches.push(...sharedHobbies);
  }

  return {
    score: Math.min(score, 10),
    matches
  };
}

// ============= HELPER FUNCTIONS =============

/**
 * Parse comma-separated list into array of trimmed lowercase items
 */
function parseList(str) {
  if (!str) return [];
  return str
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(item => item.length > 0);
}

/**
 * Find shared items between two arrays
 */
function findSharedItems(arr1, arr2) {
  return arr1.filter(item => arr2.includes(item));
}

/**
 * Find shared keywords between two text strings
 */
function findSharedKeywords(text1, text2, keywords) {
  return keywords.filter(kw => text1.includes(kw) && text2.includes(kw));
}

/**
 * Check if two industries are related
 */
function areIndustriesRelated(industry1, industry2) {
  const relatedGroups = [
    ['technology', 'software', 'it', 'tech', 'engineering'],
    ['healthcare', 'medical', 'health', 'pharma', 'biotech', 'nursing'],
    ['finance', 'banking', 'investment', 'financial'],
    ['marketing', 'advertising', 'media', 'communications', 'pr'],
    ['education', 'teaching', 'academic', 'university'],
    ['retail', 'ecommerce', 'consumer', 'shopping'],
    ['real estate', 'property', 'construction'],
    ['hospitality', 'restaurant', 'hotel', 'tourism', 'travel'],
    ['business', 'startup', 'entrepreneur', 'small business', 'founder']
  ];

  const i1 = industry1.toLowerCase();
  const i2 = industry2.toLowerCase();

  return relatedGroups.some(group =>
    group.some(keyword => i1.includes(keyword)) &&
    group.some(keyword => i2.includes(keyword))
  );
}

/**
 * Batch calculate compatibility for a user against multiple candidates
 * Returns sorted array of matches that meet the threshold (60+)
 *
 * EXCEPTION RULES:
 * 1. Safety Net Rule: For users with max score <40% in 100+ user pool, show 1-2 basic matches
 */
export function findMatches(userProfile, candidateProfiles, limit = 10, options = {}) {
  const {
    userPoolSize = candidateProfiles.length,
    includeSafetyNet = true,
    includeGenderOverride = true
  } = options;

  // Calculate all compatibility scores
  const allResults = candidateProfiles.map(candidate => ({
    candidateId: candidate.id,
    candidate,
    ...calculateCompatibility(userProfile, candidate)
  }));

  // Standard matches (60%+ threshold)
  let matches = allResults
    .filter(match => match.meetsThreshold)
    .sort((a, b) => b.score - a.score);

  // EXCEPTION #1: Gender Preference Override (80%+ Rule)
  if (includeGenderOverride) {
    const exceptionalMatches = allResults
      .filter(match => match.score >= 80 && !match.meetsThreshold)
      .map(match => ({
        ...match,
        isExceptionalMatch: true, // Flag for UI to show special badge
        exceptionReason: 'gender_override_80_plus'
      }));

    matches = [...matches, ...exceptionalMatches]
      .sort((a, b) => b.score - a.score);
  }

  // EXCEPTION #2: Safety Net Rule (Network Expansion for Low Matchers)
  if (includeSafetyNet && userPoolSize >= 100 && matches.length === 0) {
    const highestScore = Math.max(...allResults.map(r => r.score), 0);

    if (highestScore < 40) {
      // Find 1-2 matches based on single shared attribute
      const safetyNetMatches = findSafetyNetMatches(userProfile, allResults, 2);

      matches = safetyNetMatches.map(match => ({
        ...match,
        isSafetyNetMatch: true, // Flag for UI to show "Expand Your Network" section
        exceptionReason: 'safety_net_low_matcher'
      }));
    }
  }

  return matches.slice(0, limit);
}

/**
 * Find safety net matches based on single shared attribute
 * Used when user scores below 40% with all candidates in 100+ user pool
 */
function findSafetyNetMatches(userProfile, allResults, limit = 2) {
  const safetyNetCandidates = [];

  allResults.forEach(result => {
    let sharedAttributes = [];
    let score = 0;

    // Check for shared professional interests
    if (result.matches.professionalInterests.details.length > 0) {
      sharedAttributes.push({
        type: 'professional_interest',
        value: result.matches.professionalInterests.details[0]
      });
      score += 10;
    }

    // Check for same industry
    if (result.matches.industry.score > 0) {
      sharedAttributes.push({
        type: 'industry',
        value: result.matches.industry.details[0]
      });
      score += 5;
    }

    // Check for shared organizations
    if (result.matches.organizations.details.length > 0) {
      sharedAttributes.push({
        type: 'organization',
        value: result.matches.organizations.details[0]
      });
      score += 15;
    }

    if (sharedAttributes.length > 0) {
      safetyNetCandidates.push({
        ...result,
        safetyNetScore: score,
        sharedAttributes
      });
    }
  });

  // Sort by number of shared attributes, then by safety net score
  return safetyNetCandidates
    .sort((a, b) => {
      if (b.sharedAttributes.length !== a.sharedAttributes.length) {
        return b.sharedAttributes.length - a.sharedAttributes.length;
      }
      return b.safetyNetScore - a.safetyNetScore;
    })
    .slice(0, limit);
}

/**
 * Convert Supabase user format to matching algorithm format
 */
function convertUserToAlgorithmFormat(user) {
  return {
    id: user.id,
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    industry: user.industry || '',
    networkingGoals: user.networking_goals || '',
    orgsAttend: Array.isArray(user.organizations_current)
      ? user.organizations_current.join(', ')
      : (user.organizations_current || ''),
    orgsWantToCheckOut: Array.isArray(user.organizations_interested)
      ? user.organizations_interested.join(', ')
      : (user.organizations_interested || ''),
    groupsBelongTo: user.groups_belong_to || '',
    lookingToAccomplish: user.looking_to_accomplish || [],
    professionalInterests: Array.isArray(user.professional_interests)
      ? user.professional_interests.join(', ')
      : (user.professional_interests || ''),
    personalInterests: Array.isArray(user.personal_interests)
      ? user.personal_interests.join(', ')
      : (user.personal_interests || '')
  };
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

/**
 * Run the matching algorithm for all users
 * This is called after:
 * - New user signup
 * - Profile updates
 *
 * Calculates compatibility between all users and creates
 * matches in the connection_flow table for scores >= 60%
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
    const matchThreshold = 60; // Only create matches above 60%

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
