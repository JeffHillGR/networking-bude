require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function updateProfile() {
  console.log('Updating Jeff Hill profile...\n');

  const { data, error } = await supabase
    .from('users')
    .update({
      first_name: 'Jeff',
      last_name: 'Hill',
      name: 'Jeff Hill',
      title: 'Wayfinder',
      company: 'BudE',
      industry: 'technology',
      zip_code: '49503',
      organizations_current: ['Start Garden', 'GR Chamber of Commerce'],
      organizations_interested: ['Inforum', 'Creative Mornings'],
      professional_interests: ['Technology', 'Startup', 'Leadership', 'Marketing'],
      professional_interests_other: 'Event planning, networking platforms',
      personal_interests: 'Building community, helping people connect, music',
      networking_goals: 'I want to help professionals in Grand Rapids make meaningful connections. I am building BudE to solve the problem of inefficient networking - too many events, not enough real connections. I want to meet others who are passionate about community building and technology.',
      same_industry_preference: 'no',
      gender: 'male',
      gender_preference: 'any',
      year_born: 1985,
      year_born_connect: 'any'
    })
    .eq('email', 'connections@networkingbude.com');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('✅ Profile updated successfully!');
  console.log('\nYour profile now has:');
  console.log('  - Company: BudE');
  console.log('  - Industry: Technology');
  console.log('  - 4 Professional Interests');
  console.log('  - 2 Current Organizations');
  console.log('  - 2 Organizations to Check Out');
  console.log('  - Meaningful Networking Goals\n');
  console.log('Now run: node src/lib/generateSupabaseMatches.js');
}

updateProfile();
