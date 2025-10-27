/**
 * Test file for the BudE Matching Algorithm
 * Run this to validate scoring logic with sample user profiles
 */

import { calculateCompatibility, findMatches } from './matchingAlgorithm.js';

// Sample user profiles for testing
const sampleUsers = {
  // User 1: Marketing professional seeking meaningful connections
  jeff: {
    id: 'user_001',
    firstName: 'Jeff',
    lastName: 'Hill',
    age: 35,
    gender: 'Male',
    industry: 'Marketing',
    networkingGoals: 'I want to build meaningful connections with other marketing professionals and grow my network. Looking to expand professionally and meet new people in the Grand Rapids business community.',
    orgsAttend: 'GR Chamber of Commerce, Inforum',
    orgsWantToCheckOut: 'Econ Club, Experience GR',
    professionalInterests: 'Marketing, Leadership, Entrepreneurship, Technology',
    personalInterests: 'Running, hiking, pickleball, travel, photography',
    genderPreference: 'No preference',
    agePreference: '25-44'
  },

  // User 2: High compatibility - shared orgs, similar goals
  maria: {
    id: 'user_002',
    firstName: 'Maria',
    lastName: 'Rodriguez',
    age: 32,
    gender: 'Female',
    industry: 'Marketing',
    networkingGoals: 'Looking to grow my network and build meaningful connections with other leaders in marketing and media.',
    orgsAttend: 'GR Chamber of Commerce, West Michigan Woman',
    orgsWantToCheckOut: 'Econ Club',
    professionalInterests: 'Marketing, Design, Media, Leadership',
    personalInterests: 'Yoga, reading, travel, wine tasting',
    genderPreference: 'No preference',
    agePreference: 'No preference'
  },

  // User 3: Sales-focused user
  bob: {
    id: 'user_003',
    firstName: 'Bob',
    lastName: 'Johnson',
    age: 42,
    gender: 'Male',
    industry: 'Technology',
    networkingGoals: 'Find new clients and sell my services. Looking to generate leads and grow my business.',
    orgsAttend: 'Tech Meetup, Startup Grind',
    orgsWantToCheckOut: 'GR Chamber of Commerce',
    professionalInterests: 'Sales, Business Development, Technology',
    personalInterests: 'Golf, fishing, sports',
    genderPreference: 'No preference',
    agePreference: 'No preference'
  },

  // User 4: Another sales-focused user (should match well with Bob)
  sarah: {
    id: 'user_004',
    firstName: 'Sarah',
    lastName: 'Chen',
    age: 38,
    gender: 'Female',
    industry: 'Technology',
    networkingGoals: 'Build my client base and find new clients for my consulting business. Business development is my focus.',
    orgsAttend: 'BNI, Tech Meetup',
    orgsWantToCheckOut: 'Startup Grind',
    professionalInterests: 'Sales, Consulting, Technology, Business Development',
    personalInterests: 'Running, cooking, music',
    genderPreference: 'No preference',
    agePreference: 'No preference'
  },

  // User 5: Growth-focused, complementary org match
  alex: {
    id: 'user_005',
    firstName: 'Alex',
    lastName: 'Kim',
    age: 29,
    gender: 'Non-binary',
    industry: 'Technology',
    networkingGoals: 'I want to grow professionally and connect with others in the tech community. Personal growth is important to me.',
    orgsAttend: 'Econ Club, Tech Meetup',
    orgsWantToCheckOut: 'GR Chamber of Commerce',
    professionalInterests: 'Technology, AI/ML, Engineering, Product Management',
    personalInterests: 'Hiking, gaming, photography, cooking',
    genderPreference: 'No preference',
    agePreference: 'No preference'
  },

  // User 6: Low compatibility - different industry, no shared orgs, no matching keywords
  lisa: {
    id: 'user_006',
    firstName: 'Lisa',
    lastName: 'Thompson',
    age: 55,
    gender: 'Female',
    industry: 'Healthcare',
    networkingGoals: 'Connect with healthcare professionals in my field.',
    orgsAttend: 'Hospital Board, Medical Association',
    orgsWantToCheckOut: 'Healthcare Leadership Forum',
    professionalInterests: 'Healthcare Administration, Policy, Research',
    personalInterests: 'Gardening, book clubs, volunteering',
    genderPreference: 'No preference',
    agePreference: 'No preference'
  }
};

// Run tests
console.log('========================================');
console.log('BudE MATCHING ALGORITHM TEST RESULTS');
console.log('========================================\n');

// Test 1: Jeff vs Maria (Expected: High score ~80-90)
console.log('TEST 1: Jeff vs Maria (Expected: HIGH compatibility)');
console.log('---------------------------------------------------');
const jeffMariaMatch = calculateCompatibility(sampleUsers.jeff, sampleUsers.maria);
console.log(`Score: ${jeffMariaMatch.score}/100`);
console.log(`Meets Threshold (70+): ${jeffMariaMatch.meetsThreshold ? '✅ YES' : '❌ NO'}`);
console.log('\nBreakdown:');
console.log(`  Networking Goals: ${jeffMariaMatch.matches.networkingGoals.score}/30`);
console.log(`    - ${jeffMariaMatch.matches.networkingGoals.details.join(', ')}`);
console.log(`  Organizations: ${jeffMariaMatch.matches.organizations.score}/30`);
console.log(`    - ${jeffMariaMatch.matches.organizations.details.join(', ')}`);
console.log(`  Professional Interests: ${jeffMariaMatch.matches.professionalInterests.score}/20`);
console.log(`    - Shared: ${jeffMariaMatch.matches.professionalInterests.details.join(', ')}`);
console.log(`  Industry: ${jeffMariaMatch.matches.industry.score}/5`);
console.log(`  Gender: ${jeffMariaMatch.matches.gender.score}/5`);
console.log(`  Age: ${jeffMariaMatch.matches.age.score}/5`);
console.log(`  Personal Interests: ${jeffMariaMatch.matches.personalInterests.score}/5`);
console.log('\n');

// Test 2: Jeff vs Bob (Sales user - Expected: Lower score ~40-50)
console.log('TEST 2: Jeff vs Bob (Sales user - Expected: LOWER compatibility)');
console.log('---------------------------------------------------');
const jeffBobMatch = calculateCompatibility(sampleUsers.jeff, sampleUsers.bob);
console.log(`Score: ${jeffBobMatch.score}/100`);
console.log(`Meets Threshold (70+): ${jeffBobMatch.meetsThreshold ? '✅ YES' : '❌ NO'}`);
console.log('\nBreakdown:');
console.log(`  Networking Goals: ${jeffBobMatch.matches.networkingGoals.score}/30`);
console.log(`  Organizations: ${jeffBobMatch.matches.organizations.score}/30`);
console.log(`    - ${jeffBobMatch.matches.organizations.details.join(', ') || 'No matches'}`);
console.log(`  Professional Interests: ${jeffBobMatch.matches.professionalInterests.score}/20`);
console.log(`  Industry: ${jeffBobMatch.matches.industry.score}/5`);
console.log(`  Gender: ${jeffBobMatch.matches.gender.score}/5`);
console.log(`  Age: ${jeffBobMatch.matches.age.score}/5`);
console.log(`  Personal Interests: ${jeffBobMatch.matches.personalInterests.score}/5`);
console.log('\n');

// Test 3: Bob vs Sarah (Both sales - Expected: High score ~70-85)
console.log('TEST 3: Bob vs Sarah (Both sales-focused - Expected: HIGH compatibility)');
console.log('---------------------------------------------------');
const bobSarahMatch = calculateCompatibility(sampleUsers.bob, sampleUsers.sarah);
console.log(`Score: ${bobSarahMatch.score}/100`);
console.log(`Meets Threshold (70+): ${bobSarahMatch.meetsThreshold ? '✅ YES' : '❌ NO'}`);
console.log('\nBreakdown:');
console.log(`  Networking Goals: ${bobSarahMatch.matches.networkingGoals.score}/30`);
console.log(`    - ${bobSarahMatch.matches.networkingGoals.details.join(', ')}`);
console.log(`  Organizations: ${bobSarahMatch.matches.organizations.score}/30`);
console.log(`    - ${bobSarahMatch.matches.organizations.details.join(', ') || 'No matches'}`);
console.log(`  Professional Interests: ${bobSarahMatch.matches.professionalInterests.score}/20`);
console.log(`  Industry: ${bobSarahMatch.matches.industry.score}/5`);
console.log(`  Gender: ${bobSarahMatch.matches.gender.score}/5`);
console.log(`  Age: ${bobSarahMatch.matches.age.score}/5`);
console.log(`  Personal Interests: ${bobSarahMatch.matches.personalInterests.score}/5`);
console.log('\n');

// Test 4: Jeff vs Alex (Complementary org match - Expected: Good score ~70-80)
console.log('TEST 4: Jeff vs Alex (Complementary orgs - Expected: GOOD compatibility)');
console.log('---------------------------------------------------');
const jeffAlexMatch = calculateCompatibility(sampleUsers.jeff, sampleUsers.alex);
console.log(`Score: ${jeffAlexMatch.score}/100`);
console.log(`Meets Threshold (70+): ${jeffAlexMatch.meetsThreshold ? '✅ YES' : '❌ NO'}`);
console.log('\nBreakdown:');
console.log(`  Networking Goals: ${jeffAlexMatch.matches.networkingGoals.score}/30`);
console.log(`    - ${jeffAlexMatch.matches.networkingGoals.details.join(', ')}`);
console.log(`  Organizations: ${jeffAlexMatch.matches.organizations.score}/30`);
console.log(`    - ${jeffAlexMatch.matches.organizations.details.join(', ')}`);
console.log(`  Professional Interests: ${jeffAlexMatch.matches.professionalInterests.score}/20`);
console.log(`  Industry: ${jeffAlexMatch.matches.industry.score}/5`);
console.log(`  Gender: ${jeffAlexMatch.matches.gender.score}/5`);
console.log(`  Age: ${jeffAlexMatch.matches.age.score}/5`);
console.log(`  Personal Interests: ${jeffAlexMatch.matches.personalInterests.score}/5`);
console.log('\n');

// Test 5: Jeff vs Lisa (Expected: Very low score ~20-30, below threshold)
console.log('TEST 5: Jeff vs Lisa (Expected: LOW compatibility - below threshold)');
console.log('---------------------------------------------------');
const jeffLisaMatch = calculateCompatibility(sampleUsers.jeff, sampleUsers.lisa);
console.log(`Score: ${jeffLisaMatch.score}/100`);
console.log(`Meets Threshold (70+): ${jeffLisaMatch.meetsThreshold ? '✅ YES' : '❌ NO'}`);
console.log('\nBreakdown:');
console.log(`  Networking Goals: ${jeffLisaMatch.matches.networkingGoals.score}/30`);
console.log(`  Organizations: ${jeffLisaMatch.matches.organizations.score}/30`);
console.log(`  Professional Interests: ${jeffLisaMatch.matches.professionalInterests.score}/20`);
console.log(`  Industry: ${jeffLisaMatch.matches.industry.score}/5`);
console.log(`  Gender: ${jeffLisaMatch.matches.gender.score}/5`);
console.log(`  Age: ${jeffLisaMatch.matches.age.score}/5`);
console.log(`  Personal Interests: ${jeffLisaMatch.matches.personalInterests.score}/5`);
console.log('\n');

// Test 6: Find top matches for Jeff
console.log('========================================');
console.log('TEST 6: Find Top Matches for Jeff');
console.log('========================================');
const candidateProfiles = [
  sampleUsers.maria,
  sampleUsers.bob,
  sampleUsers.sarah,
  sampleUsers.alex,
  sampleUsers.lisa
];

const topMatches = findMatches(sampleUsers.jeff, candidateProfiles, 10);
console.log(`\nFound ${topMatches.length} matches above 70% threshold:\n`);
topMatches.forEach((match, index) => {
  console.log(`${index + 1}. ${match.candidate.firstName} ${match.candidate.lastName} - ${match.score}% compatible`);
  console.log(`   Top reasons: ${match.matches.organizations.details[0] || match.matches.networkingGoals.details[0] || 'Various shared interests'}`);
});

console.log('\n========================================');
console.log('TESTS COMPLETE');
console.log('========================================');
