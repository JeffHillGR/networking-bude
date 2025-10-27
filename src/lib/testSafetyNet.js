/**
 * Test Safety Net Rule for Michael and Jackson
 */

import { findMatches } from './matchingAlgorithm.js';

const michael = {
  id: 'user_016',
  firstName: 'Michael',
  lastName: 'Yoder',
  age: 35,
  gender: 'male',
  industry: 'marketing',
  networkingGoals: '',
  orgsAttend: 'LinkedUp Grand Rapids',
  orgsWantToCheckOut: '',
  professionalInterests: 'Marketing, Healthcare, Consulting',
  personalInterests: '',
  genderPreference: 'No preference',
  agePreference: 'No Preference'
};

const jackson = {
  id: 'user_030',
  firstName: 'Jackson',
  lastName: 'Payer',
  age: 30,
  gender: 'male',
  industry: 'technology',
  networkingGoals: 'Beta Test of BudE',
  orgsAttend: '',
  orgsWantToCheckOut: '',
  professionalInterests: '',
  personalInterests: '',
  genderPreference: 'No preference',
  agePreference: 'No Preference'
};

// Create a pool of 28 users (simulating 100+ with userPoolSize option)
const userPool = [
  {
    id: 'user_024',
    firstName: 'Rob',
    lastName: 'Geer',
    age: 45,
    gender: 'male',
    industry: 'technology',
    networkingGoals: 'grow my network, help others network better, grow my business',
    orgsAttend: 'Inforum, Right Place, Hello West Michigan',
    orgsWantToCheckOut: 'Economic Club of Grand Rapids',
    professionalInterests: 'Technology, Marketing, Data Science, Consulting, AI/ML',
    personalInterests: 'Outdoor cooking, biking, walking, travel',
    genderPreference: 'No preference',
    agePreference: 'No Preference'
  },
  {
    id: 'user_032',
    firstName: 'Joe',
    lastName: 'Force',
    age: 35,
    gender: 'male',
    industry: 'technology',
    networkingGoals: 'Just testing',
    orgsAttend: '',
    orgsWantToCheckOut: 'Bamboo, Creative Mornings, Hello West Michigan, AIGA - WM',
    professionalInterests: 'Technology, Marketing, Design, AI/ML',
    personalInterests: 'Architecture, Chicago Bears, Video Games',
    genderPreference: 'No preference',
    agePreference: 'No Preference'
  },
  {
    id: 'user_036',
    firstName: 'Joel',
    lastName: 'Van Kuiken',
    age: 35,
    gender: 'male',
    industry: 'consulting',
    networkingGoals: 'Making more meaningful connections.',
    orgsAttend: 'Start Garden, GR Chamber of Commerce',
    orgsWantToCheckOut: 'Bamboo, Crain\'s GR Business',
    professionalInterests: 'Technology, Marketing, Design, Consulting, Data Science, Education, Media, AI/ML, Leadership, Sustainability, AI',
    personalInterests: 'I\'m a DJ and I like to ride bicycles.',
    genderPreference: 'No preference',
    agePreference: 'No Preference'
  },
  {
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
    personalInterests: 'Lunch or dinner, 1.1 coffee connections',
    genderPreference: 'No preference',
    agePreference: 'No Preference'
  }
];

console.log('========================================');
console.log('SAFETY NET RULE TEST');
console.log('========================================\n');

// Test Michael (marketing professional)
console.log('TEST 1: Michael Yoder (Marketing)');
console.log('─'.repeat(60));
console.log('Simulating 100+ user pool where highest match is <40%\n');

const michaelMatches = findMatches(michael, userPool, 10, {
  userPoolSize: 150, // Simulate large pool
  includeSafetyNet: true
});

if (michaelMatches.length > 0) {
  console.log('✅ Safety Net Activated!\n');
  michaelMatches.forEach((match, i) => {
    console.log(`${i + 1}. ${match.candidate.firstName} ${match.candidate.lastName}`);
    if (match.isSafetyNetMatch) {
      console.log(`   🛟 Safety Net Match`);
      console.log(`   Reason: ${match.exceptionReason}`);
      console.log(`   Shared Attributes:`);
      match.sharedAttributes.forEach(attr => {
        console.log(`     • ${attr.type}: ${attr.value}`);
      });
    } else {
      console.log(`   Score: ${match.score}%`);
    }
    console.log('');
  });
} else {
  console.log('❌ No matches found (safety net did not activate)\n');
}

console.log('='.repeat(60) + '\n');

// Test Jackson (tech professional with minimal profile)
console.log('TEST 2: Jackson Payer (Technology)');
console.log('─'.repeat(60));
console.log('Simulating 100+ user pool where highest match is <40%\n');

const jacksonMatches = findMatches(jackson, userPool, 10, {
  userPoolSize: 150, // Simulate large pool
  includeSafetyNet: true
});

if (jacksonMatches.length > 0) {
  console.log('✅ Safety Net Activated!\n');
  jacksonMatches.forEach((match, i) => {
    console.log(`${i + 1}. ${match.candidate.firstName} ${match.candidate.lastName}`);
    if (match.isSafetyNetMatch) {
      console.log(`   🛟 Safety Net Match`);
      console.log(`   Reason: ${match.exceptionReason}`);
      console.log(`   Shared Attributes:`);
      match.sharedAttributes.forEach(attr => {
        console.log(`     • ${attr.type}: ${attr.value}`);
      });
    } else {
      console.log(`   Score: ${match.score}%`);
    }
    console.log('');
  });
} else {
  console.log('❌ No matches found (safety net did not activate)\n');
}

console.log('========================================');
console.log('RECOMMENDATION FOR UI');
console.log('========================================\n');
console.log('When displaying safety net matches:');
console.log('• Show in separate "Expand Your Network" section');
console.log('• Include message: "Based on your [attribute], you might connect with:"');
console.log('• Add prompt: "Want more personalized matches? Complete your profile"');
console.log('• Link to profile editing with suggestions');
