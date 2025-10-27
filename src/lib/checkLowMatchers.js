/**
 * Check Michael Yoder and Jackson Payer's match scores
 */

import { calculateCompatibility, findMatches } from './matchingAlgorithm.js';

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

// Sample tech people they could match with
const techPeople = [
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
  }
];

console.log('========================================');
console.log('LOW MATCHER ANALYSIS');
console.log('========================================\n');

console.log('MICHAEL YODER');
console.log('─'.repeat(60));
console.log('Profile: Marketing industry, interests in Marketing/Healthcare/Consulting');
console.log('Issue: No networking goals, minimal org involvement\n');

const michaelMatches = findMatches(michael, techPeople, 10);
console.log('Matches with tech people (70%+ threshold):');
if (michaelMatches.length === 0) {
  console.log('  ❌ No matches above 70%\n');

  console.log('Best scores (below threshold):');
  techPeople.forEach(person => {
    const result = calculateCompatibility(michael, person);
    console.log(`  ${person.firstName} ${person.lastName}: ${result.score}%`);
    if (result.matches.professionalInterests.details.length > 0) {
      console.log(`    Shared: ${result.matches.professionalInterests.details.join(', ')}`);
    }
  });
} else {
  michaelMatches.forEach(m => {
    console.log(`  ✅ ${m.candidate.firstName} ${m.candidate.lastName}: ${m.score}%`);
  });
}

console.log('\n' + '='.repeat(60) + '\n');

console.log('JACKSON PAYER');
console.log('─'.repeat(60));
console.log('Profile: Technology industry, no professional interests listed');
console.log('Issue: Minimal profile data, "Beta Test of BudE" as goal\n');

const jacksonMatches = findMatches(jackson, techPeople, 10);
console.log('Matches with tech people (70%+ threshold):');
if (jacksonMatches.length === 0) {
  console.log('  ❌ No matches above 70%\n');

  console.log('Best scores (below threshold):');
  techPeople.forEach(person => {
    const result = calculateCompatibility(jackson, person);
    console.log(`  ${person.firstName} ${person.lastName}: ${result.score}%`);
    if (result.matches.industry.score > 0) {
      console.log(`    Same industry: Technology`);
    }
  });
} else {
  jacksonMatches.forEach(m => {
    console.log(`  ✅ ${m.candidate.firstName} ${m.candidate.lastName}: ${m.score}%`);
  });
}

console.log('\n========================================');
console.log('RECOMMENDATION');
console.log('========================================\n');
console.log('These users need the "Safety Net" rule:');
console.log('• Show 1-2 matches based on single shared attribute');
console.log('• For Michael: Match on "Marketing" professional interest');
console.log('• For Jackson: Match on "Technology" industry');
console.log('• Prompt them to improve profile for better matches');
