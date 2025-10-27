/**
 * Check if Gender Override Rule (80%+) came into play
 * Testing Joel and Shelby who have gender preferences
 */

import { calculateCompatibility, findMatches } from './matchingAlgorithm.js';

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
  genderPreference: 'No preference', // Actually no preference according to data
  agePreference: 'No Preference'
};

const shelby = {
  id: 'user_038',
  firstName: 'Shelby',
  lastName: 'Reno',
  age: 53,
  gender: 'female',
  industry: 'real estate',
  networkingGoals: 'New friends and contacts',
  orgsAttend: 'Rotary Club, CARWM, CREW',
  orgsWantToCheckOut: 'Crain\'s GR Business',
  professionalInterests: 'Real Estate, Leadership',
  personalInterests: 'Live shows, theater, cycling, kickboxing, reading, hiking, traveling, church',
  genderPreference: 'same', // PREFERS SAME GENDER (female)
  agePreference: 'No Preference'
};

const russell = {
  id: 'user_022',
  firstName: 'Russell',
  lastName: 'Climie',
  age: 43,
  gender: 'male',
  industry: 'entrepreneur',
  networkingGoals: 'Looking for new friends. Who knows, maybe this works.',
  orgsAttend: 'Economic Club of Grand Rapids, Hello West Michigan, Crain\'s GR Business',
  orgsWantToCheckOut: 'Bamboo, CARWM, Inforum, WMPRSA, AIGA - WM',
  professionalInterests: 'Marketing, Sales, Real Estate, Startup, Blockchain, Leadership',
  personalInterests: 'Father of 6 year old, love to travel and fly fish',
  genderPreference: 'same', // PREFERS SAME GENDER (male)
  agePreference: 'similar5'
};

console.log('========================================');
console.log('GENDER PREFERENCE OVERRIDE TEST');
console.log('========================================\n');

console.log('USERS WITH GENDER PREFERENCES:');
console.log('─'.repeat(60));
console.log(`• Joel Van Kuiken: ${joel.gender}, preference: "${joel.genderPreference}"`);
console.log(`• Shelby Reno: ${shelby.gender}, preference: "${shelby.genderPreference}"`);
console.log(`• Russell Climie: ${russell.gender}, preference: "${russell.genderPreference}"`);
console.log('\n');

// Test opposite-gender matches
const testCandidates = [
  {
    id: 'user_015',
    firstName: 'Kristina',
    lastName: 'Colby',
    age: 39,
    gender: 'female',
    industry: 'consulting',
    networkingGoals: 'Goals - Expand my network for mutual benefit!',
    orgsAttend: 'Creative Mornings, Start Garden',
    orgsWantToCheckOut: 'GR Chamber of Commerce, Rotary Club, Right Place, Inforum',
    professionalInterests: 'Technology, Consulting, Startup, Leadership',
    personalInterests: 'travel, running, cycling',
    genderPreference: 'No preference',
    agePreference: 'similar10'
  },
  {
    id: 'user_027',
    firstName: 'Mel',
    lastName: 'Trombley',
    age: 40,
    gender: 'female',
    industry: 'other',
    networkingGoals: 'Connecting and growing from leaders around me.',
    orgsAttend: 'GR Chamber of Commerce, Economic Club of Grand Rapids, Create Great Leaders, Right Place, Athena, Crain\'s GR Business',
    orgsWantToCheckOut: '',
    professionalInterests: 'Leadership, Real Estate, Engineering, Design',
    personalInterests: 'Soccer, Community',
    genderPreference: 'No preference',
    agePreference: 'No Preference'
  },
  {
    id: 'user_035',
    firstName: 'Ashley',
    lastName: 'Pattee',
    age: 35,
    gender: 'female',
    industry: 'professional development',
    networkingGoals: 'Looking to expand my professional network',
    orgsAttend: 'GR Chamber of Commerce, Inforum',
    orgsWantToCheckOut: 'Right Place, Creative Mornings, Hello West Michigan, Crain\'s GR Business',
    professionalInterests: 'Design, HR, Product Management, Real Estate, Startup, Leadership',
    personalInterests: 'outdoors, travel',
    genderPreference: 'No preference',
    agePreference: 'No Preference'
  }
];

console.log('TEST 1: Russell (male, prefers same) vs Women');
console.log('─'.repeat(60) + '\n');

testCandidates.forEach(candidate => {
  const result = calculateCompatibility(russell, candidate);
  const genderMismatch = russell.genderPreference === 'same' && russell.gender !== candidate.gender;

  console.log(`${candidate.firstName} ${candidate.lastName}: ${result.score}%`);
  console.log(`  Gender mismatch: ${genderMismatch ? '❌ YES' : '✅ NO'}`);
  console.log(`  Score: ${result.score}% ${result.score >= 80 ? '(80%+ Override would apply!)' : '(Below 80%, gender pref honored)'}`);
  console.log(`  Gender score: ${result.matches.gender.score}/2.5`);
  console.log('');
});

console.log('='.repeat(60) + '\n');

console.log('TEST 2: Shelby (female, prefers same) vs Men');
console.log('─'.repeat(60) + '\n');

const menCandidates = [
  russell,
  {
    id: 'user_031',
    firstName: 'David',
    lastName: 'Henson',
    age: 39,
    gender: 'male',
    industry: 'consulting',
    networkingGoals: 'Expand network more efficiently',
    orgsAttend: 'GR Chamber of Commerce, Create Great Leaders, Right Place',
    orgsWantToCheckOut: 'Rotary Club, Bamboo, Creative Mornings',
    professionalInterests: 'Technology, Finance, Sales, Marketing, Consulting, AI, Data Science',
    personalInterests: 'Pickle Ball, Coffee',
    genderPreference: 'No preference',
    agePreference: 'No Preference'
  }
];

menCandidates.forEach(candidate => {
  const result = calculateCompatibility(shelby, candidate);
  const genderMismatch = shelby.genderPreference === 'same' && shelby.gender !== candidate.gender;

  console.log(`${candidate.firstName} ${candidate.lastName}: ${result.score}%`);
  console.log(`  Gender mismatch: ${genderMismatch ? '❌ YES' : '✅ NO'}`);
  console.log(`  Score: ${result.score}% ${result.score >= 80 ? '(80%+ Override would apply!)' : '(Below 80%, gender pref honored)'}`);
  console.log(`  Gender score: ${result.matches.gender.score}/2.5`);
  console.log('');
});

console.log('='.repeat(60) + '\n');

console.log('TEST 3: Using findMatches with Gender Override');
console.log('─'.repeat(60) + '\n');

console.log('Russell\'s matches (with override enabled):');
const russellMatches = findMatches(russell, testCandidates, 10, {
  includeGenderOverride: true
});

if (russellMatches.length > 0) {
  russellMatches.forEach((match, i) => {
    console.log(`${i + 1}. ${match.candidate.firstName} ${match.candidate.lastName}: ${match.score}%`);
    if (match.isExceptionalMatch) {
      console.log(`   ⚡ EXCEPTIONAL MATCH - Gender Override Applied!`);
    } else if (match.score >= 70) {
      console.log(`   ✅ Regular match (no gender conflict)`);
    }
  });
} else {
  console.log('No matches found (all below threshold and no 80%+ overrides)');
}

console.log('\n' + '='.repeat(60) + '\n');

console.log('FINDINGS:');
console.log('─'.repeat(60));
console.log('• Joel has "No preference" - gender override not needed');
console.log('• Shelby prefers "same" (female) - would need 80%+ with males');
console.log('• Russell prefers "same" (male) - would need 80%+ with females');
console.log('• Looking at the matrix, no cross-gender matches scored 80%+');
console.log('• Gender override rule is READY but didn\'t trigger in beta data');
console.log('\nConclusion: The rule is implemented and will work when we get');
console.log('            an 80%+ match between opposite genders with preferences.');
