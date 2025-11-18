// Supabase Edge Function to run matching algorithm
// This function is triggered automatically when a new user is created

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Matching algorithm logic (converted from matchingAlgorithm.js)
// Updated to match the current scoring system:
// - Networking Goals: 35 points
// - Organizations: 40 points (20 complementary + 20 same-field)
// - Professional Interests: 15 points
// - Industry: 5 points
// - Gender Preference: 5 points
// - Age Preference: 5 points
// - Personal Interests: 5 points
// Total: 110 points possible, capped at 100
function calculateCompatibility(user1: any, user2: any) {
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

  // Helper function to get array from string or array
  const toArray = (val: any): string[] => {
    if (Array.isArray(val)) return val.filter(v => v);
    if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(s => s);
    return [];
  };

  // Organizations matching (40 points max)
  // BUCKET 1 (20 points): Complementary Match - My attend ↔ Your check out
  // BUCKET 2 (20 points): Same-Field Match - Both attend same OR both check out same
  const u1Attend = toArray(user1.orgsAttend);
  const u1CheckOut = toArray(user1.orgsWantToCheckOut);
  const u2Attend = toArray(user2.orgsAttend);
  const u2CheckOut = toArray(user2.orgsWantToCheckOut);

  // BUCKET 1: Complementary Match
  const complementary1 = u1Attend.filter(org => u2CheckOut.includes(org));
  const complementary2 = u1CheckOut.filter(org => u2Attend.includes(org));
  const allComplementary = [...complementary1, ...complementary2];

  if (allComplementary.length > 0) {
    matches.organizations.score += 20;
    if (complementary1.length > 0) {
      complementary1.forEach(org => matches.organizations.details.push(`Introduction opportunity: ${org}`));
    }
    if (complementary2.length > 0) {
      complementary2.forEach(org => matches.organizations.details.push(`Introduction opportunity: ${org}`));
    }
  }

  // BUCKET 2: Same-Field Match
  const sharedAttend = u1Attend.filter(org => u2Attend.includes(org));
  const sharedCheckOut = u1CheckOut.filter(org => u2CheckOut.includes(org));

  if (sharedAttend.length > 0 || sharedCheckOut.length > 0) {
    matches.organizations.score += 20;
    if (sharedAttend.length > 0) {
      sharedAttend.forEach(org => matches.organizations.details.push(`Both attend: ${org}`));
    }
    if (sharedCheckOut.length > 0) {
      sharedCheckOut.forEach(org => matches.organizations.details.push(`Both interested in: ${org}`));
    }
  }

  matches.organizations.score = Math.min(matches.organizations.score, 40);

  // Professional interests
  const profInt1 = toArray(user1.professionalInterests);
  const profInt2 = toArray(user2.professionalInterests);
  const commonProfInt = profInt1.filter(int => profInt2.includes(int));

  if (commonProfInt.length > 0) {
    matches.professionalInterests.score = Math.min(100, commonProfInt.length * 33);
    commonProfInt.forEach(int => matches.professionalInterests.details.push(`Both interested in ${int}`));
  }

  // Personal interests
  const persInt1 = toArray(user1.personalInterests);
  const persInt2 = toArray(user2.personalInterests);
  const commonPersInt = persInt1.filter(int => persInt2.includes(int));

  if (commonPersInt.length > 0) {
    matches.personalInterests.score = Math.min(100, commonPersInt.length * 50);
    commonPersInt.forEach(int => matches.personalInterests.details.push(`Both enjoy ${int}`));
  }

  // Industry
  if (user1.industry && user2.industry && user1.industry.toLowerCase() === user2.industry.toLowerCase()) {
    matches.industry.score = 100;
    matches.industry.details.push(`Same industry: ${user1.industry}`);
  }

  // Networking goals (keyword matching)
  const goals1 = (user1.networkingGoals || '').toLowerCase();
  const goals2 = (user2.networkingGoals || '').toLowerCase();
  const keywords = ['mentor', 'partnership', 'collaboration', 'hiring', 'learning', 'growth', 'investment'];
  const matchedKeywords = keywords.filter(kw => goals1.includes(kw) && goals2.includes(kw));

  if (matchedKeywords.length > 0) {
    matches.networkingGoals.score = Math.min(100, matchedKeywords.length * 33);
    matchedKeywords.forEach(kw => matches.networkingGoals.details.push(`Both seeking ${kw}`));
  }

  // Gender preferences
  const gender1 = user1.gender?.toLowerCase();
  const gender2 = user2.gender?.toLowerCase();
  const pref1 = user1.genderPreference?.toLowerCase();
  const pref2 = user2.genderPreference?.toLowerCase();

  if (pref1 === 'any' || pref2 === 'any' || !pref1 || !pref2 || pref1 === 'no preference' || pref2 === 'no preference') {
    matches.genderMatch.score = 100;
  } else if (pref1 === 'same' && pref2 === 'same' && gender1 === gender2) {
    matches.genderMatch.score = 100;
  } else if (pref1 === 'different' && pref2 === 'different' && gender1 !== gender2) {
    matches.genderMatch.score = 100;
  }

  // Age preferences
  const age1 = user1.age || 0;
  const age2 = user2.age || 0;
  const agePref1 = user1.agePreference?.toLowerCase();
  const agePref2 = user2.agePreference?.toLowerCase();

  if (!agePref1 || !agePref2 || agePref1 === 'no preference' || agePref2 === 'no preference') {
    matches.ageMatch.score = 100;
  } else {
    const ageDiff = Math.abs(age1 - age2);
    if (agePref1.includes('similar') && agePref2.includes('similar')) {
      if (ageDiff <= 5) matches.ageMatch.score = 100;
      else if (ageDiff <= 10) matches.ageMatch.score = 75;
      else matches.ageMatch.score = 50;
    }
  }

  // Calculate total score
  Object.keys(matches).forEach(category => {
    totalScore += (matches[category].score / 100) * matches[category].weight;
  });

  return {
    score: Math.round(totalScore),
    matches
  };
}

function convertUserToAlgorithmFormat(user: any) {
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

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🤖 Running matching algorithm...')

    // Fetch all users
    const { data: users, error: usersError } = await supabaseClient
      .from('users')
      .select('*')
      .order('created_at', { ascending: true })

    if (usersError) throw usersError

    console.log(`📊 Found ${users.length} users`)

    const algorithmUsers = users.map(convertUserToAlgorithmFormat)
    const matchThreshold = 65 // Raised to 65% to reduce match count per user
    let totalMatches = 0

    // For each user, calculate matches
    for (let i = 0; i < algorithmUsers.length; i++) {
      const user = algorithmUsers[i]
      const dbUser = users[i]
      const userMatches = []

      for (let j = 0; j < algorithmUsers.length; j++) {
        if (i === j) continue

        const otherUser = algorithmUsers[j]
        const otherDbUser = users[j]

        const result = calculateCompatibility(user, otherUser)

        if (result.score >= matchThreshold) {
          const reasons: string[] = []
          Object.keys(result.matches).forEach(category => {
            if (result.matches[category].details && result.matches[category].details.length > 0) {
              reasons.push(...result.matches[category].details)
            }
          })

          userMatches.push({
            user_id: dbUser.id,
            matched_user_id: otherDbUser.id,
            compatibility_score: result.score,
            match_reasons: reasons,
            status: 'recommended',
            created_at: new Date().toISOString()
          })
        }
      }

      // Delete existing matches for this user
      await supabaseClient
        .from('connection_flow')
        .delete()
        .eq('user_id', dbUser.id)

      // Insert new matches
      if (userMatches.length > 0) {
        const { error: insertError } = await supabaseClient
          .from('connection_flow')
          .insert(userMatches)

        if (insertError) {
          console.error(`❌ Error inserting matches for ${user.firstName}:`, insertError)
        } else {
          console.log(`✅ ${user.firstName} ${user.lastName}: ${userMatches.length} matches`)
          totalMatches += userMatches.length
        }
      }
    }

    console.log(`🎉 Generated ${totalMatches} total matches`)

    return new Response(
      JSON.stringify({ success: true, totalMatches }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
