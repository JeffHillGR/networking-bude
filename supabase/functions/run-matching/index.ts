/**
 * BudE Matching Algorithm - Edge Function
 *
 * Mirrors src/lib/matchingAlgorithm.js exactly
 *
 * Scoring:
 * - Networking Goals (30 points)
 * - Organizations (25 points) - 12.5 complementary + 12.5 same-field
 * - Professional Interests (20 points)
 * - Personal Interests (15 points)
 * - Industry (10 points)
 *
 * TEMPORARILY DISABLED (fields blank for most users - reinstate later):
 * - Looking To Accomplish (0 points) - was 15
 * - Groups in Common (0 points) - was 10
 *
 * Total: 100 points possible
 * Minimum threshold: 60/100
 */

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
  industry: string | null;
  networking_goals: string | null;
  organizations_current: string[] | string | null;
  organizations_interested: string[] | string | null;
  groups_belong_to: string | null;
  looking_to_accomplish: string[] | string | null;
  professional_interests: string[] | string | null;
  personal_interests: string[] | string | null;
}

interface AlgorithmUser {
  id: string;
  firstName: string;
  lastName: string;
  industry: string;
  networkingGoals: string;
  orgsAttend: string;
  orgsWantToCheckOut: string;
  groupsBelongTo: string;
  lookingToAccomplish: string[];
  professionalInterests: string;
  personalInterests: string;
}

function convertUserToAlgorithmFormat(user: User): AlgorithmUser {
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
    lookingToAccomplish: Array.isArray(user.looking_to_accomplish)
      ? user.looking_to_accomplish
      : (user.looking_to_accomplish ? [user.looking_to_accomplish] : []),
    professionalInterests: Array.isArray(user.professional_interests)
      ? user.professional_interests.join(', ')
      : (user.professional_interests || ''),
    personalInterests: Array.isArray(user.personal_interests)
      ? user.personal_interests.join(', ')
      : (user.personal_interests || '')
  };
}

// ============= HELPER FUNCTIONS =============

function parseList(str: string): string[] {
  if (!str) return [];
  return str
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(item => item.length > 0);
}

function findSharedItems(arr1: string[], arr2: string[]): string[] {
  return arr1.filter(item => arr2.includes(item));
}

function findSharedKeywords(text1: string, text2: string, keywords: string[]): string[] {
  return keywords.filter(kw => text1.includes(kw) && text2.includes(kw));
}

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

// ============= SCORING FUNCTIONS =============

/**
 * Score Networking Goals (30 points max)
 */
function scoreNetworkingGoals(goals1: string, goals2: string): { score: number; matches: string[] } {
  const maxScore = 30;
  let score = 0;
  const matches: string[] = [];

  if (!goals1 || !goals2) return { score, matches };

  const text1 = goals1.toLowerCase();
  const text2 = goals2.toLowerCase();

  // High priority keywords
  const meaningfulConnectionsKeywords = ['meaningful connection'];
  const growthKeywords = ['grow', 'growth', 'expand'];
  const salesKeywords = ['find new clients', 'find clients', 'sell my services', 'sell services', 'generate leads', 'business development'];

  // Check for "meaningful connections" in both
  const user1HasMeaningful = meaningfulConnectionsKeywords.some(kw => text1.includes(kw));
  const user2HasMeaningful = meaningfulConnectionsKeywords.some(kw => text2.includes(kw));

  if (user1HasMeaningful && user2HasMeaningful) {
    score += 18;
    matches.push('Both seeking meaningful connections');
  } else if (user1HasMeaningful || user2HasMeaningful) {
    score += 8;
    matches.push('Focus on meaningful connections');
  }

  // Check for growth keywords
  const user1HasGrowth = growthKeywords.some(kw => text1.includes(kw));
  const user2HasGrowth = growthKeywords.some(kw => text2.includes(kw));

  if (user1HasGrowth && user2HasGrowth) {
    score += 12;
    matches.push('Both focused on growth');
  } else if (user1HasGrowth || user2HasGrowth) {
    score += 5;
    matches.push('Growth-oriented');
  }

  // Check if both are sales-focused
  const user1Sales = salesKeywords.some(kw => text1.includes(kw));
  const user2Sales = salesKeywords.some(kw => text2.includes(kw));

  if (user1Sales && user2Sales) {
    score += 18;
    matches.push('Both interested in business development');
  } else if (user1Sales || user2Sales) {
    score += 2;
  }

  // General similarity bonus
  const sharedWords = findSharedKeywords(text1, text2, [
    'mentor', 'mentee', 'learn', 'teach', 'collaborate', 'partner',
    'connect', 'network', 'relationships', 'community'
  ]);
  if (sharedWords.length > 0) {
    score += Math.min(sharedWords.length * 2, 8);
    matches.push(`Shared goals: ${sharedWords.join(', ')}`);
  }

  // BudE Philosophy Bonus
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
    score += Math.min(sharedPhilosophy.length * 3, 12);
    matches.push(`Shared values: ${sharedPhilosophy.join(', ')}`);
  }

  return {
    score: Math.min(score, maxScore),
    matches
  };
}

/**
 * Score Organizations (25 points max)
 * - Complementary (12.5 pts): My attend <-> Your check out
 * - Same-field (12.5 pts): Both attend same OR both check out same
 */
function scoreOrganizations(user1Attend: string, user1WantToCheckOut: string, user2Attend: string, user2WantToCheckOut: string): { score: number; matches: string[] } {
  let score = 0;
  const matches: string[] = [];

  if (!user1Attend && !user1WantToCheckOut && !user2Attend && !user2WantToCheckOut) {
    return { score, matches };
  }

  const u1Attend = parseList(user1Attend);
  const u1CheckOut = parseList(user1WantToCheckOut);
  const u2Attend = parseList(user2Attend);
  const u2CheckOut = parseList(user2WantToCheckOut);

  // BUCKET 1: Complementary Match (12.5 points max)
  const complementary1 = findSharedItems(u1Attend, u2CheckOut);
  const complementary2 = findSharedItems(u1CheckOut, u2Attend);
  const allComplementary = [...complementary1, ...complementary2];

  if (allComplementary.length > 0) {
    score += 12.5;
    if (complementary1.length > 0) {
      matches.push(`Introduction opportunity: ${complementary1.join(', ')}`);
    }
    if (complementary2.length > 0) {
      matches.push(`Introduction opportunity: ${complementary2.join(', ')}`);
    }
  }

  // BUCKET 2: Same-Field Match (12.5 points max)
  const sharedAttend = findSharedItems(u1Attend, u2Attend);
  const sharedCheckOut = findSharedItems(u1CheckOut, u2CheckOut);

  if (sharedAttend.length > 0 || sharedCheckOut.length > 0) {
    score += 12.5;
    if (sharedAttend.length > 0) {
      matches.push(`Both attend: ${sharedAttend.join(', ')}`);
    }
    if (sharedCheckOut.length > 0) {
      matches.push(`Both interested in: ${sharedCheckOut.join(', ')}`);
    }
  }

  return {
    score: Math.min(score, 25),
    matches
  };
}

/**
 * Score Professional Interests (20 points max)
 */
function scoreProfessionalInterests(interests1: string, interests2: string): { score: number; matches: string[] } {
  let score = 0;
  const matches: string[] = [];

  if (!interests1 || !interests2) return { score, matches };

  const list1 = parseList(interests1);
  const list2 = parseList(interests2);
  const shared = findSharedItems(list1, list2);

  if (shared.length > 0) {
    const avgLength = (list1.length + list2.length) / 2;
    score = (shared.length / avgLength) * 20;
    matches.push(...shared);
  }

  return {
    score: Math.min(Math.round(score), 20),
    matches
  };
}

/**
 * Score Industry (10 points max)
 */
function scoreIndustry(industry1: string, industry2: string): { score: number; matches: string[] } {
  let score = 0;
  const matches: string[] = [];

  if (!industry1 || !industry2) return { score, matches };

  if (industry1.toLowerCase() === industry2.toLowerCase()) {
    score = 10;
    matches.push(industry1);
  } else {
    const related = areIndustriesRelated(industry1, industry2);
    if (related) {
      score = 6;
      matches.push(`Related: ${industry1} & ${industry2}`);
    }
  }

  return { score, matches };
}

/**
 * Score Groups in Common (10 points max)
 */
function scoreGroups(groups1: string, groups2: string): { score: number; matches: string[] } {
  let score = 0;
  const matches: string[] = [];

  if (!groups1 || !groups2) return { score, matches };

  const text1 = groups1.toLowerCase();
  const text2 = groups2.toLowerCase();

  const list1 = text1.split(/[,;]/).map(g => g.trim()).filter(g => g.length > 0);
  const list2 = text2.split(/[,;]/).map(g => g.trim()).filter(g => g.length > 0);

  const sharedGroups: string[] = [];
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
    score = 10;
    matches.push(`Shared groups: ${sharedGroups.join(', ')}`);
  }

  return { score, matches };
}

/**
 * Score "Looking To" Overlap (15 points max)
 */
function scoreLookingTo(looking1: string[], looking2: string[]): { score: number; matches: string[] } {
  let score = 0;
  const matches: string[] = [];

  if (looking1.length === 0 || looking2.length === 0) return { score, matches };

  const sharedGoals = looking1.filter(g => looking2.includes(g));

  if (sharedGoals.length > 0) {
    score = 15;
    matches.push(`Shared goals: ${sharedGoals.join(', ')}`);
  }

  return { score, matches };
}

/**
 * Score Personal Interests/Hobbies (15 points max)
 * Shared hobbies build rapport but weighted lower to avoid over-matching
 */
function scorePersonalInterests(interests1: string, interests2: string): { score: number; matches: string[] } {
  let score = 0;
  const matches: string[] = [];

  if (!interests1 || !interests2) return { score, matches };

  const text1 = interests1.toLowerCase();
  const text2 = interests2.toLowerCase();

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
    // Scale: 1 hobby = 7pts, 2+ = 15pts (full points)
    score = sharedHobbies.length >= 2 ? 15 : 7;
    matches.push(...sharedHobbies);
  }

  return {
    score: Math.min(score, 15),
    matches
  };
}

/**
 * Calculate compatibility score between two users
 */
function calculateCompatibility(user1: AlgorithmUser, user2: AlgorithmUser): { score: number; matches: any } {
  let totalScore = 0;
  const matches: any = {
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

  // 2. ORGANIZATIONS (20 points)
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

  // 7. PERSONAL INTERESTS/HOBBIES (20 points)
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

// ============= MAIN HANDLER =============

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

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
      .eq('status', 'recommended');

    if (deleteError) {
      console.error('Error clearing recommended matches:', deleteError);
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

        const result = calculateCompatibility(userA, userB);

        console.log(`🔍 ${userA.firstName} ↔ ${userB.firstName}: ${result.score}% compatibility`);

        if (result.score >= matchThreshold) {
          const reasons: string[] = [];
          Object.keys(result.matches).forEach(category => {
            if (result.matches[category].details && result.matches[category].details.length > 0) {
              reasons.push(...result.matches[category].details);
            }
          });

          console.log(`  ✨ Creating match! Reasons: ${reasons.slice(0, 3).join(', ')}`);

          // Create match for both directions
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
