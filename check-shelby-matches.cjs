const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key.trim()] = value.trim();
  }
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const { calculateCompatibility } = require('./src/lib/matchingAlgorithm.js');

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

(async () => {
  const targetEmails = [
    'shelby@ckogr.com',
    'saraschwark@gmail.com',
    'ashley@evokecs.com',
    'JimDavisGR@gmail.com'
  ];

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .in('email', targetEmails);

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  const shelby = users.find(u => u.email === 'shelby@ckogr.com');
  const others = users.filter(u => u.email !== 'shelby@ckogr.com');

  const shelbyAlgo = convertUserToAlgorithmFormat(shelby);

  console.log('\n🔍 SHELBY\'S COMPATIBILITY SCORES\n');
  console.log('='.repeat(80));
  console.log('\nShelby Reno Profile:');
  console.log(`  Industry: ${shelby.industry}`);
  console.log(`  Current Orgs: ${shelby.organizations_current?.join(', ') || 'None'}`);
  console.log(`  Interested Orgs: ${shelby.organizations_interested?.join(', ') || 'None'}`);
  console.log(`  Prof Interests: ${shelby.professional_interests?.join(', ') || 'None'}`);
  console.log(`  Gender Pref: ${shelby.gender_preference}`);
  console.log(`  Goals: ${shelby.networking_goals}`);
  console.log('\n' + '='.repeat(80));

  others.forEach(other => {
    const otherAlgo = convertUserToAlgorithmFormat(other);
    const result = calculateCompatibility(shelbyAlgo, otherAlgo);

    console.log(`\n👥 ${other.name} - Score: ${result.score}%`);
    console.log('-'.repeat(80));
    console.log(`  Industry: ${other.industry}`);
    console.log(`  Current Orgs: ${other.organizations_current?.join(', ') || 'None'}`);
    console.log(`  Interested Orgs: ${other.organizations_interested?.join(', ') || 'None'}`);
    console.log(`  Prof Interests: ${other.professional_interests?.join(', ') || 'None'}`);
    console.log(`  Gender: ${other.gender} (Pref: ${other.gender_preference})`);

    console.log('\n  Score Breakdown:');
    Object.keys(result.matches).forEach(category => {
      const match = result.matches[category];
      const weightedScore = (match.score / 100) * match.weight;
      console.log(`    ${category}: ${match.score}/100 (weight: ${match.weight}, contribution: ${weightedScore.toFixed(1)})`);
      if (match.details && match.details.length > 0) {
        match.details.forEach(detail => console.log(`      - ${detail}`));
      }
    });
  });

  console.log('\n' + '='.repeat(80));
  console.log('\n💡 RECOMMENDATION:');
  console.log('   Shelby is looking for same-gender connections (female)');
  console.log('   Jim Davis is male - this is why his score might be low');
  console.log('   Sara and Ashley are both female - should score higher\n');
})();
