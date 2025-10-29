import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Parse date in various formats
function parseDate(dateStr) {
  if (!dateStr) return null;

  // Handle formats like "6/12/1970" or "11/15/2025"
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const month = parts[0].padStart(2, '0');
    const day = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }

  // Handle year only like "1986" or "1968"
  if (dateStr.length === 4 && !isNaN(dateStr)) {
    return `${dateStr}-01-01`; // Default to Jan 1
  }

  return null;
}

// Split comma-separated values into array
function parseArray(str) {
  if (!str || str.trim() === '') return [];
  return str.split(',').map(s => s.trim()).filter(s => s !== '');
}

// Map preference values
function mapPreference(value) {
  if (!value) return null;
  const lower = value.toLowerCase();
  if (lower === 'yes' || lower === 'same') return 'yes';
  if (lower === 'no') return 'no';
  if (lower === 'either' || lower === 'any') return 'no_preference';
  return null;
}

// Map DOB connect preference
function mapDobConnect(value) {
  if (!value) return null;
  const lower = value.toLowerCase();
  if (lower.includes('similar10')) return 'similar10';
  if (lower.includes('similar5')) return 'similar5';
  if (lower.includes('no preference')) return 'no_preference';
  return null;
}

async function migrateUsers() {
  console.log('🚀 Starting user migration...\n');

  // Read CSV file
  const csvPath = 'C:\\Users\\Jeff\\OneDrive\\Desktop\\networking-bude-clean\\Networking BudE Forms (Responses) - Form_Responses (1) as of 10-27-2025.csv';
  const fileContent = fs.readFileSync(csvPath, 'utf-8');

  // Parse CSV
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  console.log(`📊 Found ${records.length} records in CSV\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < records.length; i++) {
    const row = records[i];

    // Skip rows without required fields
    if (!row['Email'] || !row['First Name'] || !row['Last Name']) {
      console.log(`⏭️  Row ${i + 2}: Skipping (missing required fields)`);
      skipCount++;
      continue;
    }

    // Map CSV columns to Supabase columns
    const userData = {
      email: row['Email'],
      first_name: row['First Name'],
      last_name: row['Last Name'],
      name: `${row['First Name']} ${row['Last Name']}`, // Keep full name for now
      username: row['Username'] || null,

      // Job info
      title: row['Job Title'] || null,
      company: row['Company'] || null,
      industry: row['Industry'] || null,

      // Location
      zip_code: row['Zip Code'] || null,
      location: row['Zip Code'] || null, // Use zip as location for now

      // Date of birth
      dob: parseDate(row['DOB']),
      dob_connect: mapDobConnect(row['DOB Connect']),

      // Gender
      gender: row['Gender']?.toLowerCase() || null,
      gender_preference: row['Gender Preference']?.toLowerCase() || null,

      // Industry preference
      same_industry_preference: mapPreference(row['Same Industry Preference']),

      // Organizations
      organizations_current: parseArray(row['Organizations That Have Events I Like To Attend']),
      organizations_other: row['Organizations Other'] || null,
      organizations_interested: parseArray(row["Organizations That I've Wanted to Check Out"]),
      organizations_to_check_out_other: row['Organizations to Check Out Other'] || null,

      // Interests
      professional_interests: parseArray(row['Professional Interests']),
      professional_interests_other: row['Professional Interests Other'] || null,
      personal_interests: parseArray(row['Personal Interests']),

      // Goals
      networking_goals: row['Networking Goals'] || null,

      // Metadata
      connection_count: 0,
      max_connections: 10,
      created_at: new Date(row['Timestamp']).toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select();

    if (error) {
      console.log(`❌ Row ${i + 2}: Failed - ${error.message}`);
      console.log(`   Email: ${userData.email}`);
      errorCount++;
    } else {
      console.log(`✅ Row ${i + 2}: ${userData.first_name} ${userData.last_name} (${userData.email})`);
      successCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📈 Migration Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ⏭️  Skipped: ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log('='.repeat(50));
}

// Run migration
migrateUsers().catch(console.error);
