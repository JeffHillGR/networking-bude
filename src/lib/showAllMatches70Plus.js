/**
 * Show ALL matches above 70% with detailed breakdown
 * For Jeff to validate against his real-world relationships
 */

import { calculateCompatibility } from './matchingAlgorithm.js';

// All 28 beta users
const betaUsers = [
  {
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
  },
  {
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
  {
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
  },
  {
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
    personalInterests: 'Lunch or dinner, 1.1 coffee connections, Connecting on socials, Festivals, Grand Opening Events, Art Exhibits, Rosa Parks Events',
    genderPreference: 'No preference',
    agePreference: 'No Preference'
  },
  {
    id: 'user_019',
    firstName: 'Keri',
    lastName: 'Kujala',
    age: 35,
    gender: 'female',
    industry: 'other',
    networkingGoals: '',
    orgsAttend: 'GR Chamber of Commerce, Econ Club, Athena',
    orgsWantToCheckOut: 'Inforum',
    professionalInterests: 'Marketing, Design, Media',
    personalInterests: 'Being a mom to three kids, Meeting others that I can assist with their events!',
    genderPreference: 'No preference',
    agePreference: 'No Preference'
  },
  {
    id: 'user_020',
    firstName: 'Arian',
    lastName: 'Nelson',
    age: 35,
    gender: 'female',
    industry: 'finance',
    networkingGoals: '',
    orgsAttend: '',
    orgsWantToCheckOut: '',
    professionalInterests: 'Technology, Finance, Sales, Healthcare',
    personalInterests: 'Pickleball!',
    genderPreference: 'No preference',
    agePreference: 'No Preference'
  },
  {
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
  },
  {
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
    genderPreference: 'same',
    agePreference: 'similar5'
  },
  {
    id: 'user_023',
    firstName: 'Rick',
    lastName: 'Treur',
    age: 40,
    gender: 'male',
    industry: 'professional development',
    networkingGoals: 'Building my network.',
    orgsAttend: 'GR Chamber of Commerce, Rotary Club, Create Great Leaders, Economic Club of Grand Rapids, Athena',
    orgsWantToCheckOut: 'Creative Mornings, Crain\'s GR Business, Bamboo',
    professionalInterests: '',
    personalInterests: 'Serving on the Grand Rapids Planning Commission and the ICCF Board. I also perform with River City Improv.',
    genderPreference: 'No preference',
    agePreference: 'No Preference'
  },
  {
    id: 'user_024',
    firstName: 'Rob',
    lastName: 'Geer',
    age: 45,
    gender: 'male',
    industry: 'technology',
    networkingGoals: 'grow my network, help others network better, grow my business',
    orgsAttend: 'Inforum, Right Place, Hello West Michigan, SIM West Michigan, Michigan Council of Women in Technology (MCWT), U of M Club of Grand Rapids, West Michigan Tech Talent, AI Lab',
    orgsWantToCheckOut: 'Economic Club of Grand Rapids',
    professionalInterests: 'Technology, Marketing, Data Science, Consulting, AI/ML',
    personalInterests: 'Outdoor cooking, biking, walking, travel, sunshine and beaches',
    genderPreference: 'No preference',
    agePreference: 'No Preference'
  },
  {
    id: 'user_025',
    firstName: 'Julie',
    lastName: 'VanGessel',
    age: 40,
    gender: 'female',
    industry: 'other',
    networkingGoals: 'Community connections, Building positive relationships, Helping businesses make connections',
    orgsAttend: 'GR Chamber of Commerce, Economic Club of Grand Rapids, Athena, Inforum, Crain\'s GR Business, Create Great Leaders, Right Place',
    orgsWantToCheckOut: '',
    professionalInterests: 'Marketing, Finance, Sales, Real Estate, Media, Startup, Sustainability, Leadership',
    personalInterests: 'Supporting local businesses, Active on 3 boards - YMCA, Revive and Thrive Project and MWF, Local bars and restaurants, Golf, Pickleball',
    genderPreference: 'No preference',
    agePreference: 'No Preference'
  },
  {
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
  },
  {
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
  {
    id: 'user_028',
    firstName: 'Ken',
    lastName: 'Fortier',
    age: 58,
    gender: 'male',
    industry: 'healthcare',
    networkingGoals: 'Expand my network of local business owners',
    orgsAttend: 'Economic Club of Grand Rapids, Right Place, Crain\'s GR Business',
    orgsWantToCheckOut: '',
    professionalInterests: '',
    personalInterests: 'Love to play golf and meet up with friends. Mega 80s!',
    genderPreference: 'No preference',
    agePreference: 'No Preference'
  },
  {
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
  },
  {
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
  },
  {
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
    id: 'user_033',
    firstName: 'Sonja',
    lastName: 'Carmichael',
    age: 57,
    gender: 'female',
    industry: 'education',
    networkingGoals: 'Networking and meeting new people and discovering new potential clients for my consulting business.',
    orgsAttend: 'Creative Mornings, AIGA - WM, College and University Events',
    orgsWantToCheckOut: 'Economic Club of Grand Rapids, Bamboo, Start Garden, AIGA - WM, GR Chamber of Commerce',
    professionalInterests: 'Technology, Marketing, Design, Sales, Consulting, Education, Media, Startup, Sustainability, Leadership, HR, Product Management, Healthcare',
    personalInterests: 'I enjoy reading, writing, thrifting, walking, watching movies, happy hours and community building!',
    genderPreference: 'No preference',
    agePreference: 'No Preference'
  },
  {
    id: 'user_034',
    firstName: 'Jim',
    lastName: 'Davis',
    age: 44,
    gender: 'male',
    industry: 'non-profit',
    networkingGoals: 'I am looking for influential leaders who want to learn about our housing crisis and local homelessness. We have a giant need and very few people making efforts to allocate necessary resources to adequately deal with our growing issue in Grand Rapids',
    orgsAttend: 'GR Chamber of Commerce, Create Great Leaders',
    orgsWantToCheckOut: 'Economic Club of Grand Rapids, Hello West Michigan',
    professionalInterests: 'Housing',
    personalInterests: 'Detroit Tigers. Detroit Pistons. Detroit Lions. Detroit Redwings. AC Grand Rapids. Grand Rapids RISE. Grand Rapids Griffins. West Michigan Whitecaps. Cooking. Golf. Disc golf. Darts. Crokinole. Board games. Reading. Camping.',
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
    networkingGoals: 'Looking to expand my professional network, both for connection and business growth.',
    orgsAttend: 'GR Chamber of Commerce, Inforum',
    orgsWantToCheckOut: 'Right Place, Creative Mornings, Hello West Michigan, Crain\'s GR Business',
    professionalInterests: 'Design, HR, Product Management, Real Estate, Startup, Leadership',
    personalInterests: 'I like to stay active outdoors and travel.',
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
    orgsAttend: 'Start Garden, GR Chamber of Commerce, GRCCT',
    orgsWantToCheckOut: 'Bamboo, Crain\'s GR Business',
    professionalInterests: 'Technology, Marketing, Design, Consulting, Data Science, Education, Media, AI/ML, Leadership, Sustainability, AI',
    personalInterests: 'I\'m a DJ and I like to ride bicycles.',
    genderPreference: 'No preference',
    agePreference: 'No Preference'
  },
  {
    id: 'user_037',
    firstName: 'Brian',
    lastName: 'Mack',
    age: 58,
    gender: 'male',
    industry: 'manufacturing',
    networkingGoals: 'Connecting with other area professionals',
    orgsAttend: '',
    orgsWantToCheckOut: 'GR Chamber of Commerce, Economic Club of Grand Rapids, Start Garden, WMPRSA',
    professionalInterests: 'Technology, Marketing, Healthcare, Media, AI/ML, Leadership',
    personalInterests: 'Hanging w/ family, Church',
    genderPreference: 'No preference',
    agePreference: 'No Preference'
  },
  {
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
    genderPreference: 'same',
    agePreference: 'No Preference'
  },
  {
    id: 'user_039',
    firstName: 'Sara',
    lastName: 'Schwark',
    age: 46,
    gender: 'female',
    industry: 'other',
    networkingGoals: 'My goal in networking is to build lasting relationships with professionals who help clients protect their financial well-being. At the same time, I enjoy connecting with professionals across all industries who value collaboration and client care. My goal is to be the go-to person for any insurance questions or needs—someone you can trust to provide guidance, education, and personalized solutions that truly protect what matters most.',
    orgsAttend: 'GR Chamber of Commerce, Lakeshore HBA, Women of Habitat Kent, Holland Chamber of Commerce',
    orgsWantToCheckOut: 'Economic Club of Grand Rapids, Create Great Leaders, Hello West Michigan, Crain\'s GR Business',
    professionalInterests: 'Finance, Sales, Legal, Real Estate',
    personalInterests: 'Outside of work, I love spending time with my family and staying involved in my community. Much of our free time is spent at the ballfield cheering on my son\'s travel baseball team or supporting my daughter at her track meets. I also enjoy traveling, trying new restaurants, and relaxing with a good movie. Giving back through volunteer and community work is something I\'m truly passionate about and always try to make time for.',
    genderPreference: 'No preference',
    agePreference: 'No Preference'
  },
  {
    id: 'user_040',
    firstName: 'CJ',
    lastName: 'VeOra',
    age: 40,
    gender: 'other',
    industry: 'marketing',
    networkingGoals: 'Connections for clients, Future client connection',
    orgsAttend: 'GRABB, GR Chamber of Commerce, Start Garden',
    orgsWantToCheckOut: '',
    professionalInterests: 'Technology, Marketing, Finance, Design, Sales, AI, Media, Consulting',
    personalInterests: 'Exploring cities, Hiking, Camping (winter camping)',
    genderPreference: 'No preference',
    agePreference: 'No Preference'
  },
  {
    id: 'user_041',
    firstName: 'Tina',
    lastName: 'Derusha',
    age: 52,
    gender: 'female',
    industry: 'other',
    networkingGoals: 'I love connecting with people and learning new things, though I can be shy in new spaces. Having a wider professional circle would make networking easier. I care deeply about supporting local businesses and entrepreneurs to strengthen our community.',
    orgsAttend: 'Creative Mornings',
    orgsWantToCheckOut: 'GR Chamber of Commerce, Hello West Michigan, Start Garden',
    professionalInterests: 'Design, Sustainability, Leadership',
    personalInterests: 'Wellness-related activities such as yoga and hiking are high on my list. I also enjoy creative exploration, art projects, and music events.',
    genderPreference: 'same',
    agePreference: 'similar10'
  }
];

// Calculate all matches
const allMatches = [];

for (let i = 0; i < betaUsers.length; i++) {
  for (let j = i + 1; j < betaUsers.length; j++) {
    const user1 = betaUsers[i];
    const user2 = betaUsers[j];
    const result = calculateCompatibility(user1, user2);

    if (result.score >= 70) {
      allMatches.push({
        user1,
        user2,
        ...result
      });
    }
  }
}

// Sort by score descending
allMatches.sort((a, b) => b.score - a.score);

console.log('========================================');
console.log('ALL MATCHES ABOVE 70% THRESHOLD');
console.log(`Total: ${allMatches.length} matches`);
console.log('========================================\n');

allMatches.forEach((match, index) => {
  console.log(`${index + 1}. ${match.user1.firstName} ${match.user1.lastName} ↔ ${match.user2.firstName} ${match.user2.lastName}: ${match.score}%`);
  console.log('─'.repeat(70));

  console.log(`\n📊 SCORE BREAKDOWN:`);
  console.log(`   Networking Goals:        ${match.matches.networkingGoals.score}/25`);
  console.log(`   Organizations:           ${match.matches.organizations.score}/50 ⭐`);
  console.log(`   Professional Interests:  ${match.matches.professionalInterests.score}/15`);
  console.log(`   Industry:                ${match.matches.industry.score}/5`);
  console.log(`   Gender:                  ${match.matches.gender.score}/2.5`);
  console.log(`   Age:                     ${match.matches.age.score}/2.5`);
  console.log(`   Personal Interests:      ${match.matches.personalInterests.score}/5`);

  console.log(`\n🎯 KEY MATCHES:`);

  if (match.matches.networkingGoals.details.length > 0) {
    console.log(`   Networking Goals:`);
    match.matches.networkingGoals.details.forEach(d => console.log(`     • ${d}`));
  }

  if (match.matches.organizations.details.length > 0) {
    console.log(`   Organizations:`);
    match.matches.organizations.details.forEach(d => console.log(`     • ${d}`));
  }

  if (match.matches.professionalInterests.details.length > 0) {
    console.log(`   Professional Interests:`);
    console.log(`     • ${match.matches.professionalInterests.details.join(', ')}`);
  }

  if (match.matches.industry.details.length > 0) {
    console.log(`   Industry:`);
    match.matches.industry.details.forEach(d => console.log(`     • ${d}`));
  }

  console.log(`\n📝 THEIR NETWORKING GOALS:`);
  console.log(`   ${match.user1.firstName}: "${match.user1.networkingGoals || 'Not specified'}"`);
  console.log(`   ${match.user2.firstName}: "${match.user2.networkingGoals || 'Not specified'}"`);

  console.log('\n' + '='.repeat(70) + '\n');
});

console.log('========================================');
console.log('DO YOU KNOW THESE PEOPLE?');
console.log('========================================\n');
console.log('For each match, ask yourself:');
console.log('1. Do I know both people?');
console.log('2. Would they get along in real life?');
console.log('3. Do their networking goals align with what I know about them?');
console.log('4. Does the algorithm capture the "vibe" of why they\'d match?');
console.log('\nThis validation is KEY to refining the algorithm!');
