import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

// Inline the calculateCompatibility function (simplified version of the algorithm)
function calculateCompatibility(user1: AlgorithmUser, user2: AlgorithmUser): { score: number; matches: any } {
  const WEIGHTS = {
    networkingGoals: 35,
    organizationsAttend: 20,
    organizationsInterested: 20,
    professionalInterests: 15,
    industry: 5,
    gender: 5,
    age: 5,
    personalInterests: 5
  };

  const matches: any = {
    networkingGoals: { score: 0, details: [] },
    organizations: { score: 0, details: [] },
    professionalInterests: { score: 0, details: [] },
    industry: { score: 0, details: [] },
    gender: { score: 0, details: [] },
    age: { score: 0, details: [] },
    personalInterests: { score: 0, details: [] }
  };

  // Networking Goals (35 points)
  const keywords = [
    'meaningful', 'authentic', 'genuine', 'real', 'deep', 'connection',
    'relationship', 'growth', 'learn', 'mentor', 'mentee', 'teach',
    'share', 'collaborate', 'partner', 'support', 'help', 'give',
    'community', 'professional', 'career', 'business', 'opportunity',
    'disingenuous', 'organic', 'conversations', 'conversation', 'connect'
  ];

  const user1Goals = user1.networkingGoals.toLowerCase();
  const user2Goals = user2.networkingGoals.toLowerCase();

  let goalMatches = 0;
  keywords.forEach(keyword => {
    if (user1Goals.includes(keyword) && user2Goals.includes(keyword)) {
      goalMatches++;
      matches.networkingGoals.details.push(`Shared goals: ${keyword}`);
    }
  });

  matches.networkingGoals.score = Math.min(Math.round((goalMatches / keywords.length) * WEIGHTS.networkingGoals), WEIGHTS.networkingGoals);

  // Organizations (40 points total: 20 for current, 20 for interested)
  const user1Orgs = user1.orgsAttend.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
  const user2Orgs = user2.orgsAttend.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

  let orgMatches = 0;
  user1Orgs.forEach(org => {
    if (user2Orgs.some(o => o.includes(org) || org.includes(o))) {
      orgMatches++;
      matches.organizations.details.push(org);
    }
  });

  const user1OrgsInterested = user1.orgsWantToCheckOut.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
  const user2OrgsInterested = user2.orgsWantToCheckOut.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

  let interestedMatches = 0;
  user1OrgsInterested.forEach(org => {
    if (user2OrgsInterested.some(o => o.includes(org) || org.includes(o))) {
      interestedMatches++;
      matches.organizations.details.push(org);
    }
  });

  matches.organizations.score = Math.min(
    Math.round((orgMatches / Math.max(user1Orgs.length, 1)) * WEIGHTS.organizationsAttend) +
    Math.round((interestedMatches / Math.max(user1OrgsInterested.length, 1)) * WEIGHTS.organizationsInterested),
    WEIGHTS.organizationsAttend + WEIGHTS.organizationsInterested
  );

  // Professional Interests (15 points)
  const user1Interests = user1.professionalInterests.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
  const user2Interests = user2.professionalInterests.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

  let interestMatches = 0;
  user1Interests.forEach(interest => {
    if (user2Interests.some(i => i.includes(interest) || interest.includes(i))) {
      interestMatches++;
      matches.professionalInterests.details.push(interest);
    }
  });

  matches.professionalInterests.score = Math.min(
    Math.round((interestMatches / Math.max(user1Interests.length, 1)) * WEIGHTS.professionalInterests),
    WEIGHTS.professionalInterests
  );

  // Industry (5 points)
  if (user1.industry && user2.industry && user1.industry.toLowerCase() === user2.industry.toLowerCase()) {
    matches.industry.score = WEIGHTS.industry;
    matches.industry.details.push(user1.industry);
  }

  // Gender Preference (5 points)
  if (user1.genderPreference === 'No preference' || user1.genderPreference.toLowerCase() === user2.gender.toLowerCase()) {
    matches.gender.score = WEIGHTS.gender;
  }

  // Age Preference (5 points)
  if (user1.agePreference === 'No Preference') {
    matches.age.score = WEIGHTS.age;
  } else {
    const ageRanges: any = {
      '20s': [20, 29],
      '30s': [30, 39],
      '40s': [40, 49],
      '50s': [50, 59],
      '60+': [60, 120]
    };
    const range = ageRanges[user1.agePreference];
    if (range && user2.age >= range[0] && user2.age <= range[1]) {
      matches.age.score = WEIGHTS.age;
    }
  }

  // Personal Interests (5 points)
  const user1Personal = user1.personalInterests.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
  const user2Personal = user2.personalInterests.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

  let personalMatches = 0;
  user1Personal.forEach(interest => {
    if (user2Personal.some(i => i.includes(interest) || interest.includes(i))) {
      personalMatches++;
      matches.personalInterests.details.push(interest);
    }
  });

  matches.personalInterests.score = Math.min(
    Math.round((personalMatches / Math.max(user1Personal.length, 1)) * WEIGHTS.personalInterests),
    WEIGHTS.personalInterests
  );

  // Calculate total score (cap at 100)
  const totalScore = Math.min(
    matches.networkingGoals.score +
    matches.organizations.score +
    matches.professionalInterests.score +
    matches.industry.score +
    matches.gender.score +
    matches.age.score +
    matches.personalInterests.score,
    100
  );

  return { score: totalScore, matches };
}

Deno.serve(async (req) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
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
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert users to algorithm format
    const algorithmUsers = users.map(convertUserToAlgorithmFormat);

    // First, delete ALL existing matches to start fresh
    console.log('🗑️ Clearing existing matches...');
    const { error: deleteError } = await supabaseAdmin
      .from('connection_flow')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (deleteError) {
      console.error('Error clearing matches:', deleteError);
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

        // Calculate compatibility
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
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error running matching algorithm:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
