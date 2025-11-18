import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Create Supabase client with SERVICE ROLE key (bypasses RLS)
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface User {
  id: string;
  first_name: string;
  last_name: string;
  year_born: number | null;
  gender: string | null;
  industry: string | null;
  networking_goals: string | null;
  organizations_current: string[] | string | null;
  organizations_interested: string[] | string | null;
  professional_interests: string[] | string | null;
  personal_interests: string[] | string | null;
  gender_preference: string | null;
  year_born_connect: string | null;
}

interface AlgorithmUser {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  industry: string;
  networkingGoals: string;
  orgsAttend: string;
  orgsWantToCheckOut: string;
  professionalInterests: string;
  personalInterests: string;
  genderPreference: string;
  agePreference: string;
}

function convertUserToAlgorithmFormat(user: User): AlgorithmUser {
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

// ============= HELPER FUNCTIONS =============

/**
 * Parse comma-separated list into array of trimmed lowercase items
 */
function parseList(str: string): string[] {
  if (!str) return [];
  return str
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(item => item.length > 0);
}

/**
 * Find shared items between two arrays
 */
function findSharedItems(arr1: string[], arr2: string[]): string[] {
  return arr1.filter(item => arr2.includes(item));
}

/**
 * Find shared keywords between two text strings
 */
function findSharedKeywords(text1: string, text2: string, keywords: string[]): string[] {
  return keywords.filter(kw => text1.includes(kw) && text2.includes(kw));
}

/**
 * Check if two industries are related
 */
function areIndustriesRelated(industry1: string, industry2: string): boolean {
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
 * Check if an age falls within a preferred range
 */
function isAgeInRange(age: number, agePreference: string): boolean {
  if (!agePreference || agePreference === 'No preference' || agePreference === 'No Preference') return true;

  // Parse age range (e.g., "25-34", "35-44", "45+", "60+")
  if (agePreference.includes('+')) {
    const minAge = parseInt(agePreference.replace('+', ''));
    return age >= minAge;
  }

  // Handle decade ranges like "20s", "30s", etc.
  if (agePreference.match(/^\d0s$/)) {
    const decade = parseInt(agePreference);
    return age >= decade && age < decade + 10;
  }

  const [min, max] = agePreference.split('-').map(n => parseInt(n));
  return age >= min && age <= max;
}

// ============= SCORING FUNCTIONS =============

/**
 * Score Networking Goals (35 points max)
 */
function scoreNetworkingGoals(goals1: string, goals2: string): { score: number; matches: string[] } {
  const maxScore = 35;
  let score = 0;
  const matches: string[] = [];

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
function scoreOrganizations(user1Attend: string, user1WantToCheckOut: string, user2Attend: string, user2WantToCheckOut: string): { score: number; matches: string[] } {
  let score = 0;
  const matches: string[] = [];

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
function scoreProfessionalInterests(interests1: string, interests2: string): { score: number; matches: string[] } {
  let score = 0;
  const matches: string[] = [];

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
function scoreIndustry(industry1: string, industry2: string): { score: number; matches: string[] } {
  let score = 0;
  const matches: string[] = [];

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
function scoreGenderPreference(user1: AlgorithmUser, user2: AlgorithmUser): { score: number; matches: string[] } {
  let score = 0;
  const matches: string[] = [];

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
function scoreAgePreference(user1: AlgorithmUser, user2: AlgorithmUser): { score: number; matches: string[] } {
  let score = 0;
  const matches: string[] = [];

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
function scorePersonalInterests(interests1: string, interests2: string): { score: number; matches: string[] } {
  let score = 0;
  const matches: string[] = [];

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

/**
 * Calculate compatibility score between two users (CORRECT ALGORITHM)
 */
function calculateCompatibility(user1: AlgorithmUser, user2: AlgorithmUser): { score: number; matches: any } {
  let totalScore = 0;
  const matches: any = {
    networkingGoals: { score: 0, details: [] },
    organizations: { score: 0, details: [] },
    professionalInterests: { score: 0, details: [] },
    industry: { score: 0, details: [] },
    gender: { score: 0, details: [] },
    age: { score: 0, details: [] },
    personalInterests: { score: 0, details: [] }
  };

  // 1. NETWORKING GOALS (35 points)
  const goalsScore = scoreNetworkingGoals(user1.networkingGoals, user2.networkingGoals);
  matches.networkingGoals.score = goalsScore.score;
  matches.networkingGoals.details = goalsScore.matches;
  totalScore += goalsScore.score;

  // 2. ORGANIZATIONS (40 points total)
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

  // 5. GENDER PREFERENCE (2.5 points)
  const genderScore = scoreGenderPreference(user1, user2);
  matches.gender.score = genderScore.score;
  matches.gender.details = genderScore.matches;
  totalScore += genderScore.score;

  // 6. AGE PREFERENCE (2.5 points)
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
    matches
  };
}

Deno.serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('🔄 Running matching algorithm...');

    // Get all users
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*');

    if (usersError) throw usersError;

    if (!users || users.length < 2) {
      console.log('ℹ️ Not enough users to run matching (need at least 2)');
      return new Response(
        JSON.stringify({ success: true, message: 'Not enough users', matchesCreated: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert users to algorithm format
    const algorithmUsers = users.map(convertUserToAlgorithmFormat);

    // Delete ONLY 'recommended' matches to start fresh
    // Preserve: saved, pending, accepted, rejected (user actions)
    console.log('🗑️ Clearing old recommended matches...');
    const { error: deleteError } = await supabaseAdmin
      .from('connection_flow')
      .delete()
      .eq('status', 'recommended'); // Only delete recommendations

    if (deleteError) {
      console.error('Error clearing recommended matches:', deleteError);
    }

    // Calculate compatibility between all users
    let matchesCreated = 0;
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

        // Calculate compatibility using the CORRECT algorithm
        const result = calculateCompatibility(userA, userB);

        console.log(`🔍 ${userA.firstName} ↔ ${userB.firstName}: ${result.score}% compatibility`);

        // Only create matches above threshold
        if (result.score >= matchThreshold) {
          // Extract match reasons from the result
          const reasons: string[] = [];
          Object.keys(result.matches).forEach(category => {
            if (result.matches[category].details && result.matches[category].details.length > 0) {
              reasons.push(...result.matches[category].details);
            }
          });

          console.log(`  ✨ Creating match! Reasons: ${reasons.slice(0, 3).join(', ')}`);

          // Create match for both directions (using SERVICE ROLE - bypasses RLS)
          const { error: errorA } = await supabaseAdmin
            .from('connection_flow')
            .insert({
              user_id: dbUserA.id,
              matched_user_id: dbUserB.id,
              compatibility_score: result.score,
              match_reasons: reasons,
              status: 'recommended',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          const { error: errorB } = await supabaseAdmin
            .from('connection_flow')
            .insert({
              user_id: dbUserB.id,
              matched_user_id: dbUserA.id,
              compatibility_score: result.score,
              match_reasons: reasons,
              status: 'recommended',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (!errorA) matchesCreated++;
          if (!errorB) matchesCreated++;

          if (errorA) console.error('Error creating match A:', errorA);
          if (errorB) console.error('Error creating match B:', errorB);
        }
      }
    }

    console.log(`✅ Matching completed:`);
    console.log(`   - Pairs evaluated: ${totalPairsEvaluated}`);
    console.log(`   - Total matches created: ${matchesCreated}`);

    return new Response(
      JSON.stringify({ success: true, matchesCreated, totalPairsEvaluated }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error running matching algorithm:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
