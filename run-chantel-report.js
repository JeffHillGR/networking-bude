/**
 * Generate Chantel compatibility report to text file
 * Run with: node run-chantel-report.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://hrxbqhpdbnlitdvcdwpu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyeGJxaHBkYm5saXRkdmNkd3B1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk3MDE5NzAsImV4cCI6MjA0NTI3Nzk3MH0.vYy3p7KlIhBgYxaHPGKGpOXyO1Gt-9Q-JbcJ4i6X-bQ';

const supabase = createClient(supabaseUrl, supabaseKey);

// Copy of the actual algorithm
function calculateCompatibility(user1, user2) {
  let totalScore = 0;
  const matches = {
    networkingGoals: { score: 0, details: [] },
    organizations: { score: 0, details: [] },
    professionalInterests: { score: 0, details: [] },
    industry: { score: 0, details: [] },
    gender: { score: 0, details: [] },
    age: { score: 0, details: [] },
    personalInterests: { score: 0, details: [] }
  };

  // 1. NETWORKING GOALS (25 points)
  const goals1 = user1.networkingGoals ? user1.networkingGoals.split(',').map(g => g.trim().toLowerCase()) : [];
  const goals2 = user2.networkingGoals ? user2.networkingGoals.split(',').map(g => g.trim().toLowerCase()) : [];
  const goalsOverlap = goals1.filter(g => goals2.includes(g)).length;
  matches.networkingGoals.score = Math.min(goalsOverlap * 6.25, 25);
  totalScore += matches.networkingGoals.score;

  // 2. ORGANIZATIONS (50 points)
  const orgs1Attend = user1.orgsAttend ? user1.orgsAttend.split(',').map(o => o.trim().toLowerCase()) : [];
  const orgs1CheckOut = user1.orgsWantToCheckOut ? user1.orgsWantToCheckOut.split(',').map(o => o.trim().toLowerCase()) : [];
  const orgs2Attend = user2.orgsAttend ? user2.orgsAttend.split(',').map(o => o.trim().toLowerCase()) : [];
  const orgs2CheckOut = user2.orgsWantToCheckOut ? user2.orgsWantToCheckOut.split(',').map(o => o.trim().toLowerCase()) : [];

  const complementary1 = orgs1Attend.filter(o => orgs2CheckOut.includes(o)).length;
  const complementary2 = orgs2Attend.filter(o => orgs1CheckOut.includes(o)).length;
  const sameAttend = orgs1Attend.filter(o => orgs2Attend.includes(o)).length;
  const sameCheckOut = orgs1CheckOut.filter(o => orgs2CheckOut.includes(o)).length;

  matches.organizations.score = Math.min(complementary1 * 12.5, 25) + Math.min(complementary2 * 12.5, 25);
  matches.organizations.score += Math.min(sameAttend * 12.5, 25) + Math.min(sameCheckOut * 12.5, 25);
  matches.organizations.score = Math.min(matches.organizations.score, 50);
  totalScore += matches.organizations.score;

  // 3. PROFESSIONAL INTERESTS (15 points)
  const prof1 = user1.professionalInterests ? user1.professionalInterests.split(',').map(p => p.trim().toLowerCase()) : [];
  const prof2 = user2.professionalInterests ? user2.professionalInterests.split(',').map(p => p.trim().toLowerCase()) : [];
  const profOverlap = prof1.filter(p => prof2.includes(p)).length;
  matches.professionalInterests.score = Math.min(profOverlap * 5, 15);
  totalScore += matches.professionalInterests.score;

  // 4. INDUSTRY (5 points)
  if (user1.industry && user2.industry && user1.industry.toLowerCase() === user2.industry.toLowerCase()) {
    matches.industry.score = 5;
    totalScore += 5;
  }

  // 5. GENDER PREFERENCE (5 points)
  const g1Pref = (user1.genderPreference || '').toLowerCase();
  const g2Pref = (user2.genderPreference || '').toLowerCase();
  const g1 = (user1.gender || '').toLowerCase();
  const g2 = (user2.gender || '').toLowerCase();

  if (g1Pref === 'no preference' && g2Pref === 'no preference') {
    matches.gender.score = 5;
  } else if (g1Pref === 'no preference' || g2Pref === 'no preference') {
    matches.gender.score = 2.5;
  } else if (g1Pref === g2 && g2Pref === g1) {
    matches.gender.score = 5;
  } else if (g1Pref === g2 || g2Pref === g1) {
    matches.gender.score = 2.5;
  }
  totalScore += matches.gender.score;

  // 6. AGE PREFERENCE (5 points)
  const age1Pref = (user1.agePreference || '').toLowerCase();
  const age2Pref = (user2.agePreference || '').toLowerCase();

  if (age1Pref === 'no preference' && age2Pref === 'no preference') {
    matches.age.score = 5;
  } else if (age1Pref === 'no preference' || age2Pref === 'no preference') {
    matches.age.score = 2.5;
  } else if (Math.abs(user1.age - user2.age) <= 10) {
    matches.age.score = 5;
  }
  totalScore += matches.age.score;

  // 7. PERSONAL INTERESTS (5 points)
  const pers1 = user1.personalInterests ? user1.personalInterests.split(',').map(p => p.trim().toLowerCase()) : [];
  const pers2 = user2.personalInterests ? user2.personalInterests.split(',').map(p => p.trim().toLowerCase()) : [];
  const persOverlap = pers1.filter(p => pers2.includes(p)).length;
  matches.personalInterests.score = Math.min(persOverlap * 2.5, 5);
  totalScore += matches.personalInterests.score;

  return { score: Math.round(totalScore), matches };
}

function convertUser(user) {
  const currentYear = new Date().getFullYear();
  return {
    id: user.id,
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    age: user.year_born ? currentYear - user.year_born : 0,
    gender: user.gender || '',
    industry: user.industry || '',
    networkingGoals: user.networking_goals || '',
    orgsAttend: Array.isArray(user.organizations_current) ? user.organizations_current.join(', ') : (user.organizations_current || ''),
    orgsWantToCheckOut: Array.isArray(user.organizations_interested) ? user.organizations_interested.join(', ') : (user.organizations_interested || ''),
    professionalInterests: Array.isArray(user.professional_interests) ? user.professional_interests.join(', ') : (user.professional_interests || ''),
    personalInterests: Array.isArray(user.personal_interests) ? user.personal_interests.join(', ') : (user.personal_interests || ''),
    genderPreference: user.gender_preference || 'No preference',
    agePreference: user.year_born_connect || 'No Preference'
  };
}

async function generateReport() {
  console.log('🔍 Fetching users from Supabase...');

  const { data: users, error } = await supabase.from('users').select('*');

  if (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  const chantel = users.find(u => u.email === 'chantel@mittenhomeinfusion.com');
  if (!chantel) {
    console.error('❌ Chantel not found!');
    process.exit(1);
  }

  console.log('✅ Found Chantel');
  console.log(`📊 Calculating compatibility with ${users.length - 1} other users...\n`);

  const chantelFormatted = convertUser(chantel);
  const results = [];

  for (const user of users) {
    if (user.email === 'chantel@mittenhomeinfusion.com') continue;

    const userFormatted = convertUser(user);
    const compatibility = calculateCompatibility(chantelFormatted, userFormatted);

    results.push({
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      company: user.company || 'N/A',
      industry: user.industry || 'N/A',
      score: compatibility.score,
      breakdown: compatibility.matches
    });
  }

  results.sort((a, b) => b.score - a.score);

  // Build text report
  let report = '';
  report += '═══════════════════════════════════════════════════════════════\n';
  report += '           CHANTEL COMPATIBILITY REPORT\n';
  report += '═══════════════════════════════════════════════════════════════\n\n';

  const avgScore = (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1);
  const above65 = results.filter(r => r.score >= 65).length;
  const between50and64 = results.filter(r => r.score >= 50 && r.score < 65).length;
  const below50 = results.filter(r => r.score < 50).length;

  report += `📊 STATISTICS:\n`;
  report += `   Total users evaluated: ${results.length}\n`;
  report += `   Average compatibility: ${avgScore}%\n`;
  report += `   Users above threshold (≥65%): ${above65} ✅\n`;
  report += `   Users close (50-64%): ${between50and64} ⚠️\n`;
  report += `   Users below 50%: ${below50} ❌\n`;
  report += `   Highest score: ${results[0].score}%\n`;
  report += `   Lowest score: ${results[results.length - 1].score}%\n\n`;

  report += '═══════════════════════════════════════════════════════════════\n';
  report += 'ALL RESULTS (Ranked by Compatibility):\n';
  report += '═══════════════════════════════════════════════════════════════\n\n';

  results.forEach((r, i) => {
    let status = '❌';
    if (r.score >= 65) status = '✅';
    else if (r.score >= 50) status = '⚠️';

    report += `${i + 1}. ${r.name} - ${r.score}% ${status}\n`;
    report += `   Email: ${r.email}\n`;
    report += `   Company: ${r.company}\n`;
    report += `   Industry: ${r.industry}\n`;
    report += `   Breakdown:\n`;
    report += `     • Networking Goals: ${r.breakdown.networkingGoals.score}/25\n`;
    report += `     • Organizations: ${r.breakdown.organizations.score}/50\n`;
    report += `     • Professional Interests: ${r.breakdown.professionalInterests.score}/15\n`;
    report += `     • Industry Match: ${r.breakdown.industry.score}/5\n`;
    report += `     • Gender Preference: ${r.breakdown.gender.score}/5\n`;
    report += `     • Age Preference: ${r.breakdown.age.score}/5\n`;
    report += `     • Personal Interests: ${r.breakdown.personalInterests.score}/5\n`;
    report += `\n`;
  });

  // Write to file
  fs.writeFileSync('chantel-compatibility-report.txt', report);
  console.log('✅ Report saved to: chantel-compatibility-report.txt');
  console.log(`\n📊 Quick Summary:`);
  console.log(`   ${above65} users above 65% threshold`);
  console.log(`   ${between50and64} users close (50-64%)`);
  console.log(`   Highest score: ${results[0].name} at ${results[0].score}%`);
}

generateReport().catch(console.error);
