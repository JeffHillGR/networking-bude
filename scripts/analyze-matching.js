/**
 * Matching Algorithm Analysis Script
 *
 * Runs all user pairs through the algorithm and outputs:
 * - Which categories produce the most matches
 * - Top keywords/items that match across users
 * - Category contribution to total scores
 *
 * Run with: node scripts/analyze-matching.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// ============= SCORING FUNCTIONS (copied from matchingAlgorithm.js) =============

function parseList(str) {
  if (!str) return [];
  return str
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(item => item.length > 0);
}

function findSharedItems(arr1, arr2) {
  return arr1.filter(item => arr2.includes(item));
}

function findSharedKeywords(text1, text2, keywords) {
  return keywords.filter(kw => text1.includes(kw) && text2.includes(kw));
}

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

// Scoring functions with detailed tracking
function scoreNetworkingGoals(goals1, goals2) {
  const maxScore = 30;
  let score = 0;
  const matches = [];
  const keywordHits = [];

  if (!goals1 || !goals2) return { score, matches, keywordHits };

  const text1 = goals1.toLowerCase();
  const text2 = goals2.toLowerCase();

  const meaningfulConnectionsKeywords = ['meaningful connection', 'meaningful connections', 'genuine connection', 'genuine connections', 'authentic connection', 'authentic connections', 'real connection', 'real connections'];
  const growthKeywords = ['grow', 'growth', 'expand', 'scale', 'scaling', 'build', 'building'];
  const salesKeywords = ['find new clients', 'find clients', 'sell my services', 'sell services', 'generate leads', 'business development', 'referrals', 'referral', 'pipeline', 'prospecting', 'new business'];

  const user1HasMeaningful = meaningfulConnectionsKeywords.some(kw => text1.includes(kw));
  const user2HasMeaningful = meaningfulConnectionsKeywords.some(kw => text2.includes(kw));

  if (user1HasMeaningful && user2HasMeaningful) {
    score += 18;
    matches.push('Both seeking meaningful connections');
    keywordHits.push('meaningful_connections_both');
  } else if (user1HasMeaningful || user2HasMeaningful) {
    score += 8;
    matches.push('Focus on meaningful connections');
    keywordHits.push('meaningful_connections_one');
  }

  const user1HasGrowth = growthKeywords.some(kw => text1.includes(kw));
  const user2HasGrowth = growthKeywords.some(kw => text2.includes(kw));

  if (user1HasGrowth && user2HasGrowth) {
    score += 12;
    matches.push('Both focused on growth');
    keywordHits.push('growth_both');
  } else if (user1HasGrowth || user2HasGrowth) {
    score += 5;
    matches.push('Growth-oriented');
    keywordHits.push('growth_one');
  }

  const user1Sales = salesKeywords.some(kw => text1.includes(kw));
  const user2Sales = salesKeywords.some(kw => text2.includes(kw));

  if (user1Sales && user2Sales) {
    score += 18;
    matches.push('Both interested in business development');
    keywordHits.push('sales_both');
  } else if (user1Sales || user2Sales) {
    score += 2;
    keywordHits.push('sales_one');
  }

  const sharedWords = findSharedKeywords(text1, text2, [
    'mentor', 'mentee', 'learn', 'teach', 'collaborate', 'partner',
    'connect', 'network', 'relationships', 'community'
  ]);
  if (sharedWords.length > 0) {
    score += Math.min(sharedWords.length * 2, 8);
    matches.push(`Shared goals: ${sharedWords.join(', ')}`);
    sharedWords.forEach(w => keywordHits.push(`shared_goal_${w}`));
  }

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
    sharedPhilosophy.forEach(w => keywordHits.push(`philosophy_${w}`));
  }

  return { score: Math.min(score, maxScore), matches, keywordHits };
}

function scoreOrganizations(user1Attend, user1WantToCheckOut, user2Attend, user2WantToCheckOut) {
  let score = 0;
  const matches = [];
  const keywordHits = [];

  if (!user1Attend && !user1WantToCheckOut && !user2Attend && !user2WantToCheckOut) {
    return { score, matches, keywordHits };
  }

  const u1Attend = parseList(user1Attend);
  const u1CheckOut = parseList(user1WantToCheckOut);
  const u2Attend = parseList(user2Attend);
  const u2CheckOut = parseList(user2WantToCheckOut);

  const complementary1 = findSharedItems(u1Attend, u2CheckOut);
  const complementary2 = findSharedItems(u1CheckOut, u2Attend);
  const allComplementary = [...complementary1, ...complementary2];

  if (allComplementary.length > 0) {
    score += 20;
    matches.push(`Introduction opportunity: ${allComplementary.join(', ')}`);
    keywordHits.push('complementary_orgs');
    allComplementary.forEach(org => keywordHits.push(`org_complementary_${org}`));
  }

  const sharedAttend = findSharedItems(u1Attend, u2Attend);
  const sharedCheckOut = findSharedItems(u1CheckOut, u2CheckOut);

  if (sharedAttend.length > 0 || sharedCheckOut.length > 0) {
    score += 20;
    if (sharedAttend.length > 0) {
      matches.push(`Both attend: ${sharedAttend.join(', ')}`);
      sharedAttend.forEach(org => keywordHits.push(`org_both_attend_${org}`));
    }
    if (sharedCheckOut.length > 0) {
      matches.push(`Both interested in: ${sharedCheckOut.join(', ')}`);
      sharedCheckOut.forEach(org => keywordHits.push(`org_both_checkout_${org}`));
    }
    keywordHits.push('same_field_orgs');
  }

  return { score: Math.min(score, 40), matches, keywordHits };
}

function scoreProfessionalInterests(interests1, interests2) {
  let score = 0;
  const matches = [];
  const keywordHits = [];

  if (!interests1 || !interests2) return { score, matches, keywordHits };

  const list1 = parseList(interests1);
  const list2 = parseList(interests2);
  const shared = findSharedItems(list1, list2);

  if (shared.length > 0) {
    const avgLength = (list1.length + list2.length) / 2;
    score = (shared.length / avgLength) * 15;
    matches.push(...shared);
    shared.forEach(item => keywordHits.push(`professional_${item}`));
  }

  return { score: Math.min(Math.round(score), 15), matches, keywordHits };
}

function scoreIndustry(industry1, industry2) {
  let score = 0;
  const matches = [];
  const keywordHits = [];

  if (!industry1 || !industry2) return { score, matches, keywordHits };

  if (industry1.toLowerCase() === industry2.toLowerCase()) {
    score = 5;
    matches.push(industry1);
    keywordHits.push(`industry_exact_${industry1.toLowerCase()}`);
  } else {
    const related = areIndustriesRelated(industry1, industry2);
    if (related) {
      score = 3;
      matches.push(`Related: ${industry1} & ${industry2}`);
      keywordHits.push(`industry_related`);
    }
  }

  return { score, matches, keywordHits };
}

function scorePersonalInterests(interests1, interests2) {
  let score = 0;
  const matches = [];
  const keywordHits = [];

  if (!interests1 || !interests2) return { score, matches, keywordHits };

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
    score = sharedHobbies.length >= 2 ? 10 : 5;
    matches.push(...sharedHobbies);
    sharedHobbies.forEach(hobby => keywordHits.push(`hobby_${hobby}`));
  }

  return { score: Math.min(score, 10), matches, keywordHits };
}

function scoreGroups(groups1, groups2) {
  let score = 0;
  const matches = [];
  const keywordHits = [];

  if (!groups1 || !groups2) return { score, matches, keywordHits };

  const text1 = groups1.toLowerCase();
  const text2 = groups2.toLowerCase();

  const list1 = text1.split(/[,;]/).map(g => g.trim()).filter(g => g.length > 0);
  const list2 = text2.split(/[,;]/).map(g => g.trim()).filter(g => g.length > 0);

  const sharedGroups = [];
  list1.forEach(g1 => {
    list2.forEach(g2 => {
      if (g1.includes(g2) || g2.includes(g1)) {
        if (!sharedGroups.includes(g1)) sharedGroups.push(g1);
      }
    });
  });

  if (sharedGroups.length > 0) {
    score = 10;
    matches.push(`Shared groups: ${sharedGroups.join(', ')}`);
    sharedGroups.forEach(g => keywordHits.push(`group_${g}`));
  }

  return { score, matches, keywordHits };
}

function scoreLookingTo(looking1, looking2) {
  let score = 0;
  const matches = [];
  const keywordHits = [];

  const goals1 = Array.isArray(looking1) ? looking1 : (looking1 ? [looking1] : []);
  const goals2 = Array.isArray(looking2) ? looking2 : (looking2 ? [looking2] : []);

  if (goals1.length === 0 || goals2.length === 0) return { score, matches, keywordHits };

  const sharedGoals = goals1.filter(g => goals2.includes(g));

  if (sharedGoals.length > 0) {
    score = 15;
    matches.push(`Shared goals: ${sharedGoals.join(', ')}`);
    sharedGoals.forEach(g => keywordHits.push(`lookingto_${g}`));
  }

  return { score, matches, keywordHits };
}

// Convert user to algorithm format
function convertUser(user) {
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

// Main analysis
async function runAnalysis() {
  console.log('\n🔬 MATCHING ALGORITHM DEEP ANALYSIS\n');
  console.log('='.repeat(60));

  // Fetch all users
  const { data: users, error } = await supabase.from('users').select('*');

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  console.log(`\n📊 Total Users: ${users.length}`);
  console.log(`📊 Total Possible Pairs: ${(users.length * (users.length - 1)) / 2}\n`);

  const algorithmUsers = users.map(convertUser);

  // Track stats
  const categoryStats = {
    networkingGoals: { totalScore: 0, pairsWithScore: 0, maxPossible: 30 },
    organizations: { totalScore: 0, pairsWithScore: 0, maxPossible: 40 },
    professionalInterests: { totalScore: 0, pairsWithScore: 0, maxPossible: 15 },
    industry: { totalScore: 0, pairsWithScore: 0, maxPossible: 5 },
    personalInterests: { totalScore: 0, pairsWithScore: 0, maxPossible: 10 },
    groups: { totalScore: 0, pairsWithScore: 0, maxPossible: 10 },
    lookingTo: { totalScore: 0, pairsWithScore: 0, maxPossible: 15 }
  };

  const keywordCounts = {};
  const matchingPairs = [];
  let totalPairs = 0;

  // Run all pairs
  for (let i = 0; i < algorithmUsers.length; i++) {
    for (let j = i + 1; j < algorithmUsers.length; j++) {
      const userA = algorithmUsers[i];
      const userB = algorithmUsers[j];
      totalPairs++;

      // Score each category separately
      const goalsResult = scoreNetworkingGoals(userA.networkingGoals, userB.networkingGoals);
      const orgsResult = scoreOrganizations(userA.orgsAttend, userA.orgsWantToCheckOut, userB.orgsAttend, userB.orgsWantToCheckOut);
      const profResult = scoreProfessionalInterests(userA.professionalInterests, userB.professionalInterests);
      const industryResult = scoreIndustry(userA.industry, userB.industry);
      const personalResult = scorePersonalInterests(userA.personalInterests, userB.personalInterests);
      const groupsResult = scoreGroups(userA.groupsBelongTo, userB.groupsBelongTo);
      const lookingToResult = scoreLookingTo(userA.lookingToAccomplish, userB.lookingToAccomplish);

      // Track category stats
      if (goalsResult.score > 0) {
        categoryStats.networkingGoals.totalScore += goalsResult.score;
        categoryStats.networkingGoals.pairsWithScore++;
      }
      if (orgsResult.score > 0) {
        categoryStats.organizations.totalScore += orgsResult.score;
        categoryStats.organizations.pairsWithScore++;
      }
      if (profResult.score > 0) {
        categoryStats.professionalInterests.totalScore += profResult.score;
        categoryStats.professionalInterests.pairsWithScore++;
      }
      if (industryResult.score > 0) {
        categoryStats.industry.totalScore += industryResult.score;
        categoryStats.industry.pairsWithScore++;
      }
      if (personalResult.score > 0) {
        categoryStats.personalInterests.totalScore += personalResult.score;
        categoryStats.personalInterests.pairsWithScore++;
      }
      if (groupsResult.score > 0) {
        categoryStats.groups.totalScore += groupsResult.score;
        categoryStats.groups.pairsWithScore++;
      }
      if (lookingToResult.score > 0) {
        categoryStats.lookingTo.totalScore += lookingToResult.score;
        categoryStats.lookingTo.pairsWithScore++;
      }

      // Track keyword hits
      const allKeywords = [
        ...goalsResult.keywordHits,
        ...orgsResult.keywordHits,
        ...profResult.keywordHits,
        ...industryResult.keywordHits,
        ...personalResult.keywordHits,
        ...groupsResult.keywordHits,
        ...lookingToResult.keywordHits
      ];
      allKeywords.forEach(kw => {
        keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
      });

      // Calculate total score (current algorithm: no groups/lookingTo)
      const totalScore = goalsResult.score + orgsResult.score + profResult.score +
                         industryResult.score + personalResult.score;

      if (totalScore >= 60) {
        matchingPairs.push({
          userA: `${userA.firstName} ${userA.lastName}`,
          userB: `${userB.firstName} ${userB.lastName}`,
          totalScore,
          breakdown: {
            networkingGoals: goalsResult.score,
            organizations: orgsResult.score,
            professionalInterests: profResult.score,
            industry: industryResult.score,
            personalInterests: personalResult.score
          }
        });
      }
    }
  }

  // Output results
  console.log('='.repeat(60));
  console.log('\n📈 CATEGORY PERFORMANCE (Current Algorithm)\n');
  console.log('Category                  | Max | Pairs w/ Score | Avg Score | Hit Rate');
  console.log('-'.repeat(75));

  const categoryOrder = ['networkingGoals', 'organizations', 'professionalInterests', 'industry', 'personalInterests'];

  categoryOrder.forEach(cat => {
    const stats = categoryStats[cat];
    const avgScore = stats.pairsWithScore > 0
      ? (stats.totalScore / stats.pairsWithScore).toFixed(1)
      : '0.0';
    const hitRate = ((stats.pairsWithScore / totalPairs) * 100).toFixed(1);
    const catName = cat.padEnd(25);
    console.log(`${catName} | ${String(stats.maxPossible).padEnd(3)} | ${String(stats.pairsWithScore).padEnd(14)} | ${avgScore.padEnd(9)} | ${hitRate}%`);
  });

  console.log('\n📈 DISABLED CATEGORIES (for reference)\n');
  console.log('Category                  | Max | Pairs w/ Score | Avg Score | Hit Rate');
  console.log('-'.repeat(75));

  ['groups', 'lookingTo'].forEach(cat => {
    const stats = categoryStats[cat];
    const avgScore = stats.pairsWithScore > 0
      ? (stats.totalScore / stats.pairsWithScore).toFixed(1)
      : '0.0';
    const hitRate = ((stats.pairsWithScore / totalPairs) * 100).toFixed(1);
    const catName = cat.padEnd(25);
    console.log(`${catName} | ${String(stats.maxPossible).padEnd(3)} | ${String(stats.pairsWithScore).padEnd(14)} | ${avgScore.padEnd(9)} | ${hitRate}%`);
  });

  // Top keywords
  console.log('\n' + '='.repeat(60));
  console.log('\n🔑 TOP 20 MATCHING KEYWORDS/ITEMS\n');

  const sortedKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  sortedKeywords.forEach(([keyword, count], idx) => {
    console.log(`${String(idx + 1).padStart(2)}. ${keyword.padEnd(40)} - ${count} pairs`);
  });

  // Field completion analysis
  console.log('\n' + '='.repeat(60));
  console.log('\n📝 FIELD COMPLETION RATES\n');

  const fieldCompletion = {
    networkingGoals: users.filter(u => u.networking_goals && u.networking_goals.trim()).length,
    orgsAttend: users.filter(u => u.organizations_current && (Array.isArray(u.organizations_current) ? u.organizations_current.length > 0 : u.organizations_current.trim())).length,
    orgsWantToCheckOut: users.filter(u => u.organizations_interested && (Array.isArray(u.organizations_interested) ? u.organizations_interested.length > 0 : u.organizations_interested.trim())).length,
    professionalInterests: users.filter(u => u.professional_interests && (Array.isArray(u.professional_interests) ? u.professional_interests.length > 0 : u.professional_interests.trim())).length,
    personalInterests: users.filter(u => u.personal_interests && (Array.isArray(u.personal_interests) ? u.personal_interests.length > 0 : u.personal_interests.trim())).length,
    industry: users.filter(u => u.industry && u.industry.trim()).length,
    groups: users.filter(u => u.groups_belong_to && u.groups_belong_to.trim()).length,
    lookingTo: users.filter(u => u.looking_to_accomplish && (Array.isArray(u.looking_to_accomplish) ? u.looking_to_accomplish.length > 0 : false)).length
  };

  Object.entries(fieldCompletion).forEach(([field, count]) => {
    const pct = ((count / users.length) * 100).toFixed(0);
    console.log(`${field.padEnd(25)} - ${count}/${users.length} users (${pct}%)`);
  });

  // Matching pairs summary
  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ MATCHES ABOVE 60% THRESHOLD: ${matchingPairs.length} unique pairs`);
  console.log(`   (This creates ${matchingPairs.length * 2} records in connection_flow - bidirectional)\n`);

  // Score distribution
  console.log('SCORE DISTRIBUTION OF MATCHES:');
  const ranges = [
    { min: 90, max: 100, label: '90-100%' },
    { min: 80, max: 89, label: '80-89%' },
    { min: 70, max: 79, label: '70-79%' },
    { min: 60, max: 69, label: '60-69%' }
  ];

  ranges.forEach(range => {
    const count = matchingPairs.filter(p => p.totalScore >= range.min && p.totalScore <= range.max).length;
    console.log(`  ${range.label}: ${count} pairs`);
  });

  // Sample high-scoring matches
  if (matchingPairs.length > 0) {
    console.log('\n📋 TOP 5 HIGHEST SCORING MATCHES:\n');
    matchingPairs
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5)
      .forEach((pair, idx) => {
        console.log(`${idx + 1}. ${pair.userA} ↔ ${pair.userB} (${pair.totalScore}%)`);
        console.log(`   Goals: ${pair.breakdown.networkingGoals}, Orgs: ${pair.breakdown.organizations}, Prof: ${pair.breakdown.professionalInterests}, Industry: ${pair.breakdown.industry}, Personal: ${pair.breakdown.personalInterests}`);
      });
  }

  console.log('\n' + '='.repeat(60));
  console.log('Analysis complete!\n');
}

runAnalysis().catch(console.error);
