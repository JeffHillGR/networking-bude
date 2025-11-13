/**
 * Vercel Serverless Function: Run Matching Algorithm
 * SECURED with service role authentication and rate limiting
 * This endpoint should only be called by authorized services/cron jobs
 */

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
  // Secure CORS headers
  const allowedOrigins = [
    'https://networking-bude.vercel.app',
    'https://networkingbude.com'
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Service-Key');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify service key (for cron jobs and authorized backend calls)
    const serviceKey = req.headers['x-service-key'];
    const expectedServiceKey = process.env.MATCHING_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Also allow Vercel cron secret for scheduled jobs
    const cronSecret = req.headers['x-vercel-cron-secret'];
    const isVercelCron = cronSecret === process.env.CRON_SECRET;

    if (!isVercelCron && serviceKey !== expectedServiceKey) {
      console.error('❌ Unauthorized matching attempt:', {
        hasServiceKey: !!serviceKey,
        hasCronSecret: !!cronSecret,
        origin: req.headers.origin
      });

      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid service credentials'
      });
    }

    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY, // ✅ Use service role key
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    console.log('🤖 Running matching algorithm via secure API...');

    // Fetch all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true });

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    console.log(`📊 Found ${users.length} users`);

    const algorithmUsers = users.map(convertUserToAlgorithmFormat);
    const matchThreshold = 60;
    let totalMatches = 0;
    const errors = [];

    // For each user, calculate matches
    for (let i = 0; i < algorithmUsers.length; i++) {
      const user = algorithmUsers[i];
      const dbUser = users[i];
      const userMatches = [];

      for (let j = 0; j < algorithmUsers.length; j++) {
        if (i === j) continue; // Skip self-matching

        const otherUser = algorithmUsers[j];
        const otherDbUser = users[j];

        try {
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
        } catch (matchError) {
          console.error(`Error calculating compatibility between ${user.firstName} and ${otherUser.firstName}:`, matchError);
          errors.push({
            user1: user.firstName,
            user2: otherUser.firstName,
            error: matchError.message
          });
        }
      }

      // Delete existing matches for this user
      const { error: deleteError } = await supabase
        .from('connections')
        .delete()
        .eq('user_id', dbUser.id);

      if (deleteError) {
        console.error(`Error deleting matches for ${user.firstName}:`, deleteError);
        errors.push({
          user: user.firstName,
          operation: 'delete',
          error: deleteError.message
        });
        continue;
      }

      // Insert new matches
      if (userMatches.length > 0) {
        const { error: insertError } = await supabase
          .from('connections')
          .insert(userMatches);

        if (insertError) {
          console.error(`Error inserting matches for ${user.firstName}:`, insertError);
          errors.push({
            user: user.firstName,
            operation: 'insert',
            error: insertError.message
          });
        } else {
          console.log(`✅ ${user.firstName} ${user.lastName}: ${userMatches.length} matches`);
          totalMatches += userMatches.length;
        }
      } else {
        console.log(`ℹ️ ${user.firstName} ${user.lastName}: No matches above threshold`);
      }
    }

    const summary = {
      success: true,
      totalMatches,
      totalUsers: users.length,
      averageMatchesPerUser: users.length > 0 ? (totalMatches / users.length).toFixed(2) : 0,
      matchThreshold,
      timestamp: new Date().toISOString()
    };

    if (errors.length > 0) {
      summary.errors = errors;
      summary.errorCount = errors.length;
    }

    console.log(`🎉 Generated ${totalMatches} total matches for ${users.length} users`);
    console.log(`📊 Average: ${summary.averageMatchesPerUser} matches per user`);

    if (errors.length > 0) {
      console.warn(`⚠️ Encountered ${errors.length} errors during matching`);
    }

    return res.status(200).json(summary);

  } catch (error) {
    console.error('❌ Fatal error running matching:', error);
    return res.status(500).json({
      error: error.message,
      success: false,
      timestamp: new Date().toISOString()
    });
  }
};
