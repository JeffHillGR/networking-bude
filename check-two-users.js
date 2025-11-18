#!/usr/bin/env node
/**
 * Simple script to check Chantel and Steve's compatibility scores
 * Usage: node check-two-users.js
 */

import { createClient } from '@supabase/supabase-js';
import { calculateCompatibility } from './src/lib/matchingAlgorithm.js';

const supabase = createClient(
  'https://moqhghbqapcppzydgqyt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vcWhnaGJxYXBjcHB6eWRncXl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NDczNzMsImV4cCI6MjA3NzAyMzM3M30.8WjiloL6xF-u_1vydb_7QMyGWc8c0vHgmt5NyQoNZzc'
);

function toAlgoFormat(user) {
  const year = new Date().getFullYear();
  return {
    id: user.id,
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    age: user.year_born ? year - user.year_born : 0,
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

async function main() {
  try {
    console.log('Fetching users...\n');

    const { data: users, error } = await supabase
      .from('users')
      .select('*');

    if (error) throw error;

    const chantel = users.find(u => u.email?.toLowerCase() === 'chantel@mittenhomeinfusion.com');
    const steve = users.find(u => u.email?.toLowerCase() === 'steve@getkelso.com');

    if (!chantel && !steve) {
      console.log('Neither user found!');
      return;
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('CHANTEL');
    console.log('═══════════════════════════════════════════════════════');
    if (chantel) {
      console.log(`Name: ${chantel.first_name} ${chantel.last_name}`);
      console.log(`Email: ${chantel.email}`);
      console.log(`Company: ${chantel.company || 'N/A'}`);
      console.log(`Title: ${chantel.title || 'N/A'}`);
      console.log(`Industry: ${chantel.industry || 'N/A'}`);

      const cf = toAlgoFormat(chantel);
      const results = [];

      for (const u of users) {
        if (u.id === chantel.id) continue;
        const uf = toAlgoFormat(u);
        const comp = calculateCompatibility(cf, uf);
        results.push({
          name: `${u.first_name} ${u.last_name}`,
          email: u.email,
          score: comp.score
        });
      }

      results.sort((a, b) => b.score - a.score);

      console.log(`\nTop 5 Matches:`);
      results.slice(0, 5).forEach((r, i) => {
        const pass = r.score >= 65 ? '✅' : '❌';
        console.log(`  ${i+1}. ${r.name} - ${r.score}% ${pass}`);
      });

      const above65 = results.filter(r => r.score >= 65).length;
      console.log(`\nTotal matches (65%+): ${above65}/${results.length}`);
    } else {
      console.log('Not found');
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('STEVE');
    console.log('═══════════════════════════════════════════════════════');
    if (steve) {
      console.log(`Name: ${steve.first_name} ${steve.last_name}`);
      console.log(`Email: ${steve.email}`);
      console.log(`Company: ${steve.company || 'N/A'}`);
      console.log(`Title: ${steve.title || 'N/A'}`);
      console.log(`Industry: ${steve.industry || 'N/A'}`);

      const sf = toAlgoFormat(steve);
      const results = [];

      for (const u of users) {
        if (u.id === steve.id) continue;
        const uf = toAlgoFormat(u);
        const comp = calculateCompatibility(sf, uf);
        results.push({
          name: `${u.first_name} ${u.last_name}`,
          email: u.email,
          score: comp.score
        });
      }

      results.sort((a, b) => b.score - a.score);

      console.log(`\nTop 5 Matches:`);
      results.slice(0, 5).forEach((r, i) => {
        const pass = r.score >= 65 ? '✅' : '❌';
        console.log(`  ${i+1}. ${r.name} - ${r.score}% ${pass}`);
      });

      const above65 = results.filter(r => r.score >= 65).length;
      console.log(`\nTotal matches (65%+): ${above65}/${results.length}`);
    } else {
      console.log('Not found');
    }

    // Check if they match each other
    if (chantel && steve) {
      const cf = toAlgoFormat(chantel);
      const sf = toAlgoFormat(steve);
      const comp = calculateCompatibility(cf, sf);
      console.log('\n═══════════════════════════════════════════════════════');
      console.log(`Chantel ↔️ Steve: ${comp.score}% ${comp.score >= 65 ? '✅ MATCH' : '❌ NO MATCH'}`);
      console.log('═══════════════════════════════════════════════════════');
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
