/**
 * Check Daryn Lawson - another low matcher
 */

import { findMatches, calculateCompatibility } from './matchingAlgorithm.js';

const daryn = {
  id: 'user_026',
  firstName: 'Daryn',
  lastName: 'Lawson',
  age: 58,
  gender: 'male',
  industry: 'professional development',
  networkingGoals: 'introductions to companies building sales teams',
  orgsAttend: '',
  orgsWantToCheckOut: '',
  professionalInterests: '',
  personalInterests: 'Golf, working out',
  genderPreference: 'No preference',
  agePreference: 'No Preference'
};

// Sample of other users to test against
const testUsers = [
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
    id: 'user_026_sales1',
    firstName: 'Sarah',
    lastName: 'Sales',
    age: 45,
    gender: 'female',
    industry: 'professional development',
    networkingGoals: 'find new clients and grow my sales team',
    orgsAttend: 'BNI',
    orgsWantToCheckOut: '',
    professionalInterests: 'Sales, Business Development, Leadership',
    personalInterests: 'Golf, networking events',
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
    orgsAttend: 'Inforum',
    orgsWantToCheckOut: 'GR Chamber of Commerce',
    professionalInterests: 'Marketing, Sustainability, Sales, Consulting, Leadership',
    personalInterests: 'Golf, networking events',
    genderPreference: 'No preference',
    agePreference: 'No Preference'
  }
];

console.log('========================================');
console.log('DARYN LAWSON ANALYSIS');
console.log('========================================\n');

console.log('PROFILE:');
console.log('─'.repeat(60));
console.log(`Name: ${daryn.firstName} ${daryn.lastName}`);
console.log(`Industry: ${daryn.industry}`);
console.log(`Networking Goals: "${daryn.networkingGoals}"`);
console.log(`Organizations: None listed`);
console.log(`Professional Interests: None listed`);
console.log(`Personal Interests: ${daryn.personalInterests}`);
console.log('\nISSUE: Very minimal profile - only has industry and personal interests');
console.log('       Sales-focused goal but no professional interests to match on\n');

console.log('='.repeat(60) + '\n');

console.log('COMPATIBILITY WITH SAMPLE USERS:');
console.log('─'.repeat(60) + '\n');

testUsers.forEach(user => {
  const result = calculateCompatibility(daryn, user);
  console.log(`${user.firstName} ${user.lastName}: ${result.score}%`);
  console.log(`  Networking Goals: ${result.matches.networkingGoals.score}/25`);
  if (result.matches.networkingGoals.details.length > 0) {
    console.log(`    ${result.matches.networkingGoals.details.join('; ')}`);
  }
  console.log(`  Organizations: ${result.matches.organizations.score}/50`);
  console.log(`  Professional Interests: ${result.matches.professionalInterests.score}/15`);
  console.log(`  Industry: ${result.matches.industry.score}/5`);
  if (result.matches.industry.details.length > 0) {
    console.log(`    ${result.matches.industry.details.join('; ')}`);
  }
  console.log(`  Personal Interests: ${result.matches.personalInterests.score}/5`);
  if (result.matches.personalInterests.details.length > 0) {
    console.log(`    Shared: ${result.matches.personalInterests.details.join(', ')}`);
  }
  console.log('');
});

console.log('='.repeat(60) + '\n');

console.log('TESTING SAFETY NET RULE:');
console.log('─'.repeat(60) + '\n');

const darynMatches = findMatches(daryn, testUsers, 10, {
  userPoolSize: 150, // Simulate 100+ user pool
  includeSafetyNet: true
});

if (darynMatches.length > 0) {
  console.log('✅ Safety Net Activated!\n');
  darynMatches.forEach((match, i) => {
    console.log(`${i + 1}. ${match.candidate.firstName} ${match.candidate.lastName}`);
    if (match.isSafetyNetMatch) {
      console.log(`   🛟 Safety Net Match`);
      console.log(`   Shared Attributes:`);
      match.sharedAttributes.forEach(attr => {
        console.log(`     • ${attr.type}: ${attr.value}`);
      });
    } else {
      console.log(`   Regular Match: ${match.score}%`);
    }
    console.log('');
  });
} else {
  console.log('❌ No matches found\n');
  console.log('PROBLEM: Daryn has NO professional interests listed!');
  console.log('         Industry match alone might not be enough.\n');
}

console.log('='.repeat(60) + '\n');

console.log('RECOMMENDATIONS:');
console.log('─'.repeat(60));
console.log('1. Safety net should match on "professional development" industry');
console.log('2. Personal interests like "Golf" could create low-priority matches');
console.log('3. Suggest Daryn adds professional interests (Sales, Business Dev)');
console.log('4. In future: Match sales-focused keywords in goals even without');
console.log('   professional interests listed');
