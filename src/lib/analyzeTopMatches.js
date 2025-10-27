/**
 * Detailed breakdown of top 5 matches
 */

import { calculateCompatibility } from './matchingAlgorithm.js';

const betaUsers = {
  kristina: {
    id: 'user_015',
    firstName: 'Kristina',
    lastName: 'Colby',
    age: 39,
    gender: 'female',
    industry: 'consulting',
    networkingGoals: 'Goals - Expand my network for mutual benefit! Frustrations - Having to pay to play, not actually meeting new people',
    orgsAttend: 'Creative Mornings, Start Garden',
    orgsWantToCheckOut: 'GR Chamber of Commerce, Rotary Club, Right Place, Inforum',
    professionalInterests: 'Technology, Consulting, Startup, Leadership',
    personalInterests: 'travel, running, cycling, nature, backpacking, kayaking, gardening, community, volunteering, vintage',
    genderPreference: 'No preference',
    agePreference: 'similar10'
  },
  david: {
    id: 'user_031',
    firstName: 'David',
    lastName: 'Henson',
    age: 39,
    gender: 'male',
    industry: 'consulting',
    networkingGoals: 'Expand network more efficiently',
    orgsAttend: 'GR Chamber of Commerce, Create Great Leaders, Right Place',
    orgsWantToCheckOut: 'Rotary Club, Bamboo, Creative Mornings, Athena, GRABB, WMPRSA, AIGA - WM, Crain\'s GR Business',
    professionalInterests: 'Technology, Finance, Sales, Marketing, Consulting, AI, Data Science',
    personalInterests: 'Pickle Ball, Coffee',
    genderPreference: 'No preference',
    agePreference: 'No Preference'
  },
  joel: {
    id: 'user_036',
    firstName: 'Joel',
    lastName: 'Van Kuiken',
    age: 35,
    gender: 'male',
    industry: 'consulting',
    networkingGoals: 'Making more meaningful connections.',
    orgsAttend: 'Start Garden, GR Chamber of Commerce, GRCCT',
    orgsWantToCheckOut: 'Bamboo, Crain\'s GR Business',
    professionalInterests: 'Technology, Marketing, Design, Consulting, Data Science, Education, Media, AI/ML, Leadership, Sustainability, AI',
    personalInterests: 'I\'m a DJ and I like to ride bicycles.',
    genderPreference: 'No preference',
    agePreference: 'No Preference'
  },
  mel: {
    id: 'user_027',
    firstName: 'Mel',
    lastName: 'Trombley',
    age: 40,
    gender: 'female',
    industry: 'other',
    networkingGoals: 'Connecting and growing from leaders around me.',
    orgsAttend: 'GR Chamber of Commerce, Economic Club of Grand Rapids, Create Great Leaders, Right Place, Athena, Crain\'s GR Business, Cool Kids Networking - Dave Henson',
    orgsWantToCheckOut: '',
    professionalInterests: 'Leadership, Real Estate, Engineering, Design',
    personalInterests: 'Soccer, Community Engagement/Leadership, Women Empowerment',
    genderPreference: 'No preference',
    agePreference: 'No Preference'
  },
  ashley: {
    id: 'user_035',
    firstName: 'Ashley',
    lastName: 'Pattee',
    age: 35,
    gender: 'female',
    industry: 'professional development',
    networkingGoals: 'Looking to expand my professional network, both for connection and business growth.',
    orgsAttend: 'GR Chamber of Commerce, Inforum',
    orgsWantToCheckOut: 'Right Place, Creative Mornings, Hello West Michigan, Crain\'s GR Business',
    professionalInterests: 'Design, HR, Product Management, Real Estate, Startup, Leadership',
    personalInterests: 'I like to stay active outdoors and travel.',
    genderPreference: 'No preference',
    agePreference: 'No Preference'
  },
  anna: {
    id: 'user_029',
    firstName: 'Anna',
    lastName: 'Baeten',
    age: 46,
    gender: 'female',
    industry: 'consulting',
    networkingGoals: 'Connecting with smart people doing interesting things!',
    orgsAttend: 'Economic Club of Grand Rapids, GR Chamber of Commerce, CREW, Right Place, Bamboo',
    orgsWantToCheckOut: '',
    professionalInterests: 'Technology, HR, Consulting, Leadership, Finance',
    personalInterests: '',
    genderPreference: 'No preference',
    agePreference: 'No Preference'
  }
};

const topMatches = [
  { user1: 'kristina', user2: 'david', name: 'Kristina Colby ↔ David Henson' },
  { user1: 'kristina', user2: 'joel', name: 'Kristina Colby ↔ Joel Van Kuiken' },
  { user1: 'mel', user2: 'ashley', name: 'Mel Trombley ↔ Ashley Pattee' },
  { user1: 'kristina', user2: 'ashley', name: 'Kristina Colby ↔ Ashley Pattee' },
  { user1: 'anna', user2: 'joel', name: 'Anna Baeten ↔ Joel Van Kuiken' }
];

console.log('========================================');
console.log('TOP 5 MATCHES - DETAILED BREAKDOWN');
console.log('========================================\n');

topMatches.forEach((match, index) => {
  const user1 = betaUsers[match.user1];
  const user2 = betaUsers[match.user2];
  const result = calculateCompatibility(user1, user2);

  console.log(`${index + 1}. ${match.name} - ${result.score}%`);
  console.log('─'.repeat(60));

  // Show breakdown
  console.log(`\n📊 SCORE BREAKDOWN:`);
  console.log(`   Networking Goals:        ${result.matches.networkingGoals.score}/25`);
  console.log(`   Organizations:           ${result.matches.organizations.score}/50`);
  console.log(`   Professional Interests:  ${result.matches.professionalInterests.score}/15`);
  console.log(`   Industry:                ${result.matches.industry.score}/5`);
  console.log(`   Gender Preference:       ${result.matches.gender.score}/2.5`);
  console.log(`   Age Preference:          ${result.matches.age.score}/2.5`);
  console.log(`   Personal Interests:      ${result.matches.personalInterests.score}/5`);
  console.log(`   ─────────────────────────────────────`);
  console.log(`   TOTAL:                   ${result.score}/100`);

  // Find the highest scoring category
  const scores = [
    { name: 'Networking Goals', score: result.matches.networkingGoals.score, max: 25 },
    { name: 'Organizations', score: result.matches.organizations.score, max: 50 },
    { name: 'Professional Interests', score: result.matches.professionalInterests.score, max: 15 },
    { name: 'Industry', score: result.matches.industry.score, max: 5 }
  ];

  const sortedScores = scores.sort((a, b) => b.score - a.score);
  const topCategory = sortedScores[0];

  console.log(`\n🎯 HIGHEST SCORING CATEGORY: ${topCategory.name} (${topCategory.score}/${topCategory.max})`);

  // Show details for each category
  console.log(`\n💡 MATCH DETAILS:`);

  if (result.matches.networkingGoals.details.length > 0) {
    console.log(`   Networking Goals:`);
    result.matches.networkingGoals.details.forEach(d => console.log(`     • ${d}`));
  }

  if (result.matches.organizations.details.length > 0) {
    console.log(`   Organizations:`);
    result.matches.organizations.details.forEach(d => console.log(`     • ${d}`));
  }

  if (result.matches.professionalInterests.details.length > 0) {
    console.log(`   Professional Interests:`);
    console.log(`     • Shared: ${result.matches.professionalInterests.details.join(', ')}`);
  }

  if (result.matches.industry.details.length > 0) {
    console.log(`   Industry:`);
    result.matches.industry.details.forEach(d => console.log(`     • ${d}`));
  }

  console.log('\n' + '='.repeat(60) + '\n');
});

// Summary
console.log('========================================');
console.log('SUMMARY: WHERE DO TOP MATCHES SCORE?');
console.log('========================================\n');

const categoryCounts = {
  'Organizations': 0,
  'Networking Goals': 0,
  'Professional Interests': 0,
  'Industry': 0
};

topMatches.forEach(match => {
  const user1 = betaUsers[match.user1];
  const user2 = betaUsers[match.user2];
  const result = calculateCompatibility(user1, user2);

  const scores = [
    { name: 'Networking Goals', score: result.matches.networkingGoals.score },
    { name: 'Organizations', score: result.matches.organizations.score },
    { name: 'Professional Interests', score: result.matches.professionalInterests.score },
    { name: 'Industry', score: result.matches.industry.score }
  ];

  const topCategory = scores.sort((a, b) => b.score - a.score)[0];
  categoryCounts[topCategory.name]++;
});

console.log('Top scoring category across all 5 matches:\n');
Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).forEach(([category, count]) => {
  const bar = '█'.repeat(count);
  console.log(`  ${category.padEnd(25)} ${bar} ${count}/5`);
});
