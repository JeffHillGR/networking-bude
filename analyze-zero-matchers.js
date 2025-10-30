import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const zeroMatchEmails = [
  'arian@hillislandfinancial.com',
  'alissa.robinson@gmail.com',
  'sledouxx@gmail.com',
  'dlawson@salesindex.ai',
  'jpayeriii@yahoo.com',
  'mdyoder@michaelyodergr.com',
  'Keri@specialoccasionsmi.com',
  'shelby@ckogr.com'
];

const { data, error } = await supabase
  .from('users')
  .select('*')
  .in('email', zeroMatchEmails);

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log('\n🔍 USERS WITH ZERO MATCHES - PROFILE ANALYSIS\n');
console.log('='.repeat(80));

let summaryStats = {
  missingOrgs: 0,
  missingInterestedOrgs: 0,
  missingProfInterests: 0,
  missingPersonalInterests: 0,
  missingGoals: 0
};

data.forEach(user => {
  console.log(`\n👤 ${user.name} (${user.email})`);
  console.log('-'.repeat(80));

  const missing = [];

  // Check key fields
  if (!user.organizations_current || user.organizations_current.length === 0) {
    missing.push('Organizations Currently Attending');
    summaryStats.missingOrgs++;
  }
  if (!user.organizations_interested || user.organizations_interested.length === 0) {
    missing.push('Organizations Interested In');
    summaryStats.missingInterestedOrgs++;
  }
  if (!user.professional_interests || user.professional_interests.length === 0) {
    missing.push('Professional Interests');
    summaryStats.missingProfInterests++;
  }
  if (!user.personal_interests) {
    missing.push('Personal Interests');
    summaryStats.missingPersonalInterests++;
  }
  if (!user.networking_goals) {
    missing.push('Networking Goals');
    summaryStats.missingGoals++;
  }

  // Show what they have
  console.log('✅ HAS:');
  if (user.title) console.log(`   - Title: ${user.title}`);
  if (user.company) console.log(`   - Company: ${user.company}`);
  if (user.industry) console.log(`   - Industry: ${user.industry}`);
  if (user.organizations_current?.length > 0) console.log(`   - Current Orgs: ${user.organizations_current.join(', ')}`);
  if (user.organizations_interested?.length > 0) console.log(`   - Interested Orgs: ${user.organizations_interested.join(', ')}`);
  if (user.professional_interests?.length > 0) console.log(`   - Prof Interests: ${user.professional_interests.join(', ')}`);
  if (user.networking_goals) console.log(`   - Goals: ${user.networking_goals.substring(0, 60)}...`);

  // Show what's missing
  if (missing.length > 0) {
    console.log(`\n❌ MISSING (Critical for matching):`);
    missing.forEach(m => console.log(`   - ${m}`));
  }

  console.log(`\n📊 Profile Completeness: ${((7 - missing.length) / 7 * 100).toFixed(0)}%`);
});

console.log('\n' + '='.repeat(80));
console.log('\n📈 SUMMARY - Most Common Missing Fields:\n');
console.log(`   ${summaryStats.missingProfInterests}/8 missing Professional Interests`);
console.log(`   ${summaryStats.missingInterestedOrgs}/8 missing Organizations Interested In`);
console.log(`   ${summaryStats.missingOrgs}/8 missing Current Organizations`);
console.log(`   ${summaryStats.missingGoals}/8 missing Networking Goals`);
console.log(`   ${summaryStats.missingPersonalInterests}/8 missing Personal Interests`);

console.log('\n💡 RECOMMENDATION:');
console.log('   Send targeted email asking users to complete:');
console.log('   1. Professional Interests (most critical)');
console.log('   2. Organizations they want to check out');
console.log('   3. Current organizations they attend');
console.log('\n');
