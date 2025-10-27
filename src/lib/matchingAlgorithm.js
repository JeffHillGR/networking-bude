/**
 * BudE Matching Algorithm
 *
 * Calculates compatibility scores between users based on:
 * - Networking Goals (25%)
 * - Organizations (50%) - split into:
 *   - Complementary match (25%): My attend ↔ Your check out
 *   - Same-field match (25%): Both attend same OR both check out same
 * - Professional Interests (15%)
 * - Industry (5%)
 * - Gender Preference (2.5%)
 * - Age Preference (2.5%)
 *
 * Minimum threshold: 70/100 to be shown as a potential connection
 */

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
    gender: { score: 0, details: [] },
    age: { score: 0, details: [] },
    personalInterests: { score: 0, details: [] }
  };

  // 1. NETWORKING GOALS (25 points)
  const goalsScore = scoreNetworkingGoals(user1.networkingGoals, user2.networkingGoals);
  matches.networkingGoals.score = goalsScore.score;
  matches.networkingGoals.details = goalsScore.matches;
  totalScore += goalsScore.score;

  // 2. ORGANIZATIONS (50 points total)
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

  // 5. GENDER PREFERENCE (5 points)
  const genderScore = scoreGenderPreference(user1, user2);
  matches.gender.score = genderScore.score;
  matches.gender.details = genderScore.matches;
  totalScore += genderScore.score;

  // 6. AGE PREFERENCE (5 points)
  const ageScore = scoreAgePreference(user1, user2);
  matches.age.score = ageScore.score;
  matches.age.details = ageScore.matches;
  totalScore += ageScore.score;

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
    meetsThreshold: totalScore >= 70
  };
}

/**
 * Score Networking Goals (25 points max)
 */
function scoreNetworkingGoals(goals1, goals2) {
  const maxScore = 25;
  let score = 0;
  const matches = [];

  if (!goals1 || !goals2) return { score, matches };

  const text1 = goals1.toLowerCase();
  const text2 = goals2.toLowerCase();

  // High priority keywords
  const meaningfulConnectionsKeywords = ['meaningful connection'];
  const growthKeywords = ['grow', 'growth', 'expand'];
  const salesKeywords = ['find new clients', 'find clients', 'sell my services', 'sell services', 'generate leads', 'business development'];

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

  return {
    score: Math.min(score, maxScore),
    matches
  };
}

/**
 * Score Organizations (50 points max)
 *
 * BUCKET 1 (25 points): Complementary Match
 *   - My "Orgs I attend" ↔ Your "Orgs I want to check out"
 *   - OR Your "Orgs I attend" ↔ My "Orgs I want to check out"
 *
 * BUCKET 2 (25 points): Same-Field Match
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

  // BUCKET 1: Complementary Match (25 points max)
  // User1 attends, User2 wants to check out (or vice versa)
  const complementary1 = findSharedItems(u1Attend, u2CheckOut);
  const complementary2 = findSharedItems(u1CheckOut, u2Attend);
  const allComplementary = [...complementary1, ...complementary2];

  if (allComplementary.length > 0) {
    score += 25;
    if (complementary1.length > 0) {
      matches.push(`Introduction opportunity: ${complementary1.join(', ')}`);
    }
    if (complementary2.length > 0) {
      matches.push(`Introduction opportunity: ${complementary2.join(', ')}`);
    }
  }

  // BUCKET 2: Same-Field Match (25 points max)
  // Both attend same OR both want to check out same
  const sharedAttend = findSharedItems(u1Attend, u2Attend);
  const sharedCheckOut = findSharedItems(u1CheckOut, u2CheckOut);

  if (sharedAttend.length > 0 || sharedCheckOut.length > 0) {
    score += 25;
    if (sharedAttend.length > 0) {
      matches.push(`Both attend: ${sharedAttend.join(', ')}`);
    }
    if (sharedCheckOut.length > 0) {
      matches.push(`Both interested in: ${sharedCheckOut.join(', ')}`);
    }
  }

  return {
    score: Math.min(score, 50),
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
 * Score Gender Preference (2.5 points max)
 */
function scoreGenderPreference(user1, user2) {
  let score = 0;
  const matches = [];

  // If either user has no preference, give full points
  if (!user1.genderPreference || user1.genderPreference === 'No preference' || user1.genderPreference === 'any' ||
      !user2.genderPreference || user2.genderPreference === 'No preference' || user2.genderPreference === 'any') {
    score = 2.5;
    matches.push('No gender preference restrictions');
    return { score, matches };
  }

  // Check if preferences are compatible
  const user1WantsUser2 = user1.genderPreference === 'No preference' ||
                          user1.genderPreference === 'any' ||
                          user1.genderPreference === user2.gender;
  const user2WantsUser1 = user2.genderPreference === 'No preference' ||
                          user2.genderPreference === 'any' ||
                          user2.genderPreference === user1.gender;

  if (user1WantsUser2 && user2WantsUser1) {
    score = 2.5;
    matches.push('Gender preferences compatible');
  }

  return { score, matches };
}

/**
 * Score Age Preference (2.5 points max)
 */
function scoreAgePreference(user1, user2) {
  let score = 0;
  const matches = [];

  if (!user1.age || !user2.age) {
    score = 2.5; // Give benefit of doubt if age data missing
    return { score, matches };
  }

  // If either user has no age preference, give full points
  if (!user1.agePreference || user1.agePreference === 'No preference' || user1.agePreference === 'No Preference' ||
      !user2.agePreference || user2.agePreference === 'No preference' || user2.agePreference === 'No Preference') {
    score = 2.5;
    matches.push('No age preference restrictions');
    return { score, matches };
  }

  // Check if ages fall within preferred ranges
  const user1InRange = isAgeInRange(user2.age, user1.agePreference);
  const user2InRange = isAgeInRange(user1.age, user2.agePreference);

  if (user1InRange && user2InRange) {
    score = 2.5;
    matches.push('Age preferences compatible');
  }

  return { score, matches };
}

/**
 * Score Personal Interests/Hobbies (5 points max)
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
    'snowboarding', 'swimming', 'kayaking', 'camping', 'fishing'
  ];

  const sharedHobbies = hobbyKeywords.filter(hobby =>
    text1.includes(hobby) && text2.includes(hobby)
  );

  if (sharedHobbies.length > 0) {
    score = Math.min(sharedHobbies.length * 2, 5);
    matches.push(...sharedHobbies);
  }

  return {
    score: Math.min(score, 5),
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
    ['healthcare', 'medical', 'health', 'pharma', 'biotech'],
    ['finance', 'banking', 'investment', 'financial'],
    ['marketing', 'advertising', 'media', 'communications', 'pr'],
    ['education', 'teaching', 'academic', 'university'],
    ['retail', 'ecommerce', 'consumer', 'shopping'],
    ['real estate', 'property', 'construction'],
    ['hospitality', 'restaurant', 'hotel', 'tourism', 'travel']
  ];

  const i1 = industry1.toLowerCase();
  const i2 = industry2.toLowerCase();

  return relatedGroups.some(group =>
    group.some(keyword => i1.includes(keyword)) &&
    group.some(keyword => i2.includes(keyword))
  );
}

/**
 * Check if an age falls within a preferred range
 */
function isAgeInRange(age, agePreference) {
  if (!agePreference || agePreference === 'No preference') return true;

  // Parse age range (e.g., "25-34", "35-44", "45+")
  if (agePreference.includes('+')) {
    const minAge = parseInt(agePreference.replace('+', ''));
    return age >= minAge;
  }

  const [min, max] = agePreference.split('-').map(n => parseInt(n));
  return age >= min && age <= max;
}

/**
 * Batch calculate compatibility for a user against multiple candidates
 * Returns sorted array of matches that meet the threshold (70+)
 *
 * EXCEPTION RULES:
 * 1. Gender Preference Override (80%+ Rule): Show matches 80%+ even if gender preference mismatches
 * 2. Safety Net Rule: For users with max score <40% in 100+ user pool, show 1-2 basic matches
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

  // Standard matches (70%+ threshold)
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
