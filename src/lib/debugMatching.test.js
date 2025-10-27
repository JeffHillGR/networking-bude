/**
 * Debug version - Show all scores regardless of threshold
 */

import { calculateCompatibility } from './matchingAlgorithm.js';

// Just test a few key pairs to see what scores we're getting
const jeff = {
  id: 'user_014',
  firstName: 'Jeff',
  lastName: 'Hill',
  age: 55,
  gender: 'male',
  industry: 'technology',
  networkingGoals: 'awkward, don\'t like going alone',
  orgsAttend: 'GR Chamber of Commerce, Create Great Leaders, Economic Club of Grand Rapids, Right Place, Creative Mornings, Start Garden',
  orgsWantToCheckOut: 'Bamboo',
  professionalInterests: 'Technology, Design',
  personalInterests: 'Mountain biking',
  genderPreference: 'No preference',
  agePreference: '25-44'
};

const kristina = {
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
};

const julie = {
  id: 'user_021',
  firstName: 'Julie',
  lastName: 'Lankes',
  age: 47,
  gender: 'female',
  industry: 'marketing',
  networkingGoals: 'Meeting new people, creating genuine connections and friends',
  orgsAttend: 'GR Chamber of Commerce, Right Place, Creative Mornings, Create Great Leaders, Athena, StartGarden, GRABB',
  orgsWantToCheckOut: 'Rotary Club, Economic Club of Grand Rapids, Bamboo, Hello West Michigan, Crain\'s GR Business, AIGA - WM',
  professionalInterests: 'Technology, Marketing, Design, Product Management, Engineering, Consulting, Media, Startup, AI/ML, Sustainability, Leadership, AI',
  personalInterests: 'Hiking, working, exploring the city',
  genderPreference: 'No preference',
  agePreference: 'No preference'
};

const mindy = {
  id: 'user_017',
  firstName: 'Mindy',
  lastName: 'Miller',
  age: 0,
  gender: 'female',
  industry: 'other',
  networkingGoals: 'Continue to meet more people and make meaningful connections that help build resources and relationships for my business, and others.',
  orgsAttend: 'GR Chamber of Commerce',
  orgsWantToCheckOut: '',
  professionalInterests: 'Marketing, Sales, Leadership',
  personalInterests: 'Sailing, skiing, gardening',
  genderPreference: 'No preference',
  agePreference: 'No Preference'
};

const christine = {
  id: 'user_018',
  firstName: 'Christine',
  lastName: 'Morse',
  age: 59,
  gender: 'female',
  industry: 'marketing',
  networkingGoals: 'Ideal Clients, Strategic Alliance Partners, Referral Sources',
  orgsAttend: 'Inforum, Ada Business Association, Marketing Sales Network, SouthKent Chamber',
  orgsWantToCheckOut: 'Economic Club of Grand Rapids, Right Place, Hello West Michigan, Creative Mornings, Rotary Club, GR Chamber of Commerce',
  professionalInterests: 'Marketing, Sustainability, Sales, Consulting, Leadership, AI, Technology, Finance, Healthcare',
  personalInterests: 'Lunch or dinner, 1.1 coffee connections, Connecting on socials, Festivals, Grand Opening Events, Art Exhibits, Rosa Parks Events',
  genderPreference: 'No preference',
  agePreference: 'No Preference'
};

const joel = {
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
};

console.log('========================================');
console.log('DEBUG: Sample Compatibility Scores');
console.log('========================================\n');

const tests = [
  [jeff, kristina, 'Jeff vs Kristina (shared orgs: Start Garden, Creative Mornings)'],
  [jeff, julie, 'Jeff vs Julie (many shared orgs, both tech/design)'],
  [mindy, joel, 'Mindy vs Joel (both mention "meaningful connections")'],
  [kristina, julie, 'Kristina vs Julie (shared orgs, similar goals)'],
  [christine, julie, 'Christine vs Julie (both marketing, many org overlaps)']
];

tests.forEach(([user1, user2, description]) => {
  const result = calculateCompatibility(user1, user2);
  console.log(`${description}`);
  console.log(`Score: ${result.score}/100 ${result.meetsThreshold ? '✅' : '❌'}\n`);
  console.log(`  Networking Goals: ${result.matches.networkingGoals.score}/30`);
  if (result.matches.networkingGoals.details.length > 0) {
    console.log(`    ${result.matches.networkingGoals.details.join('; ')}`);
  }
  console.log(`  Organizations: ${result.matches.organizations.score}/30`);
  if (result.matches.organizations.details.length > 0) {
    console.log(`    ${result.matches.organizations.details.join('; ')}`);
  }
  console.log(`  Professional Interests: ${result.matches.professionalInterests.score}/20`);
  if (result.matches.professionalInterests.details.length > 0) {
    console.log(`    Shared: ${result.matches.professionalInterests.details.join(', ')}`);
  }
  console.log(`  Industry: ${result.matches.industry.score}/5`);
  console.log(`  Gender: ${result.matches.gender.score}/5`);
  console.log(`  Age: ${result.matches.age.score}/5`);
  console.log(`  Personal Interests: ${result.matches.personalInterests.score}/5`);
  console.log('\n' + '='.repeat(50) + '\n');
});
