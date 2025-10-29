// Vercel Serverless Function to run matching algorithm
// This endpoint will be called after a new user signs up

const { createClient } = require('@supabase/supabase-js');

// Import the matching algorithm
const { calculateCompatibility } = require('../src/lib/matchingAlgorithm.js');

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

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    console.log('🤖 Running matching algorithm via API...');

    // Fetch all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true });

    if (usersError) throw usersError;

    console.log(`📊 Found ${users.length} users`);

    const algorithmUsers = users.map(convertUserToAlgorithmFormat);
    const matchThreshold = 60;
    let totalMatches = 0;

    // For each user, calculate matches
    for (let i = 0; i < algorithmUsers.length; i++) {
      const user = algorithmUsers[i];
      const dbUser = users[i];
      const userMatches = [];

      for (let j = 0; j < algorithmUsers.length; j++) {
        if (i === j) continue;

        const otherUser = algorithmUsers[j];
        const otherDbUser = users[j];

        const result = calculateCompatibility(user, otherUser);

        if (result.score >= matchThreshold) {
          const reasons = [];
          Object.keys(result.matches).forEach(category => {
            if (result.matches[category].details && result.matches[category].details.length > 0) {
              reasons.push(...result.matches[category].details);
            }
          });

          userMatches.push({
            user_id: dbUser.id,
            matched_user_id: otherDbUser.id,
            compatibility_score: result.score,
            match_reasons: reasons,
            status: 'recommended',
            created_at: new Date().toISOString()
          });
        }
      }

      // Delete existing matches for this user
      await supabase
        .from('matches')
        .delete()
        .eq('user_id', dbUser.id);

      // Insert new matches
      if (userMatches.length > 0) {
        const { error: insertError } = await supabase
          .from('matches')
          .insert(userMatches);

        if (!insertError) {
          console.log(`✅ ${user.firstName} ${user.lastName}: ${userMatches.length} matches`);
          totalMatches += userMatches.length;
        }
      }
    }

    console.log(`🎉 Generated ${totalMatches} total matches`);

    return res.status(200).json({
      success: true,
      totalMatches,
      totalUsers: users.length
    });

  } catch (error) {
    console.error('❌ Error running matching:', error);
    return res.status(500).json({
      error: error.message,
      success: false
    });
  }
};
