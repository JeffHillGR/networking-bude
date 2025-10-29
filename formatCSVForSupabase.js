import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

// Parse year born (just a 4-digit year)
function parseYearBorn(yearStr) {
  if (!yearStr) return null;

  // Handle full date formats like "6/12/1970" - extract just the year
  const parts = yearStr.split('/');
  if (parts.length === 3) {
    return parseInt(parts[2], 10);
  }

  // Handle year only like "1986" or "1968"
  if (yearStr.length === 4 && !isNaN(yearStr)) {
    return parseInt(yearStr, 10);
  }

  return null;
}

// Parse timestamp
function parseTimestamp(timestampStr) {
  if (!timestampStr) return new Date().toISOString();
  const date = new Date(timestampStr);
  if (isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
}

// Split comma-separated values into array format for PostgreSQL
function parseArray(str) {
  if (!str || str.trim() === '') return null;
  const items = str.split(',').map(s => s.trim()).filter(s => s !== '');
  if (items.length === 0) return null;
  // PostgreSQL array format: {"item1","item2","item3"}
  return `{${items.map(item => `"${item.replace(/"/g, '\\"')}"`).join(',')}}`;
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

// Map Year Born connect preference
function mapYearBornConnect(value) {
  if (!value) return null;
  const lower = value.toLowerCase();
  if (lower.includes('similar10')) return 'similar10';
  if (lower.includes('similar5')) return 'similar5';
  if (lower.includes('no preference')) return 'no_preference';
  return null;
}

console.log('🚀 Converting CSV to Supabase format...\n');

// Read original CSV
const csvPath = 'C:\\Users\\Jeff\\OneDrive\\Desktop\\networking-bude-clean\\Networking BudE Forms (Responses) - Form_Responses (1) as of 10-27-2025.csv';
const fileContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const records = parse(fileContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true
});

console.log(`📊 Found ${records.length} records\n`);

// Transform to Supabase format
const supabaseRecords = records.map((row, i) => {
  // Skip rows without required fields
  if (!row['Email'] || !row['First Name'] || !row['Last Name']) {
    console.log(`⏭️  Row ${i + 2}: Skipping (missing required fields)`);
    return null;
  }

  return {
    email: row['Email'],
    first_name: row['First Name'],
    last_name: row['Last Name'],
    name: `${row['First Name']} ${row['Last Name']}`,
    username: row['Username'] || null,
    title: row['Job Title'] || null,
    company: row['Company'] || null,
    industry: row['Industry'] || null,
    zip_code: row['Zip Code'] || null,
    location: row['Zip Code'] || null,
    year_born: parseYearBorn(row['Year_Born']),
    year_born_connect: mapYearBornConnect(row['Year_Born_Connect']),
    gender: row['Gender']?.toLowerCase() || null,
    gender_preference: row['Gender Preference']?.toLowerCase() || null,
    same_industry_preference: mapPreference(row['Same Industry Preference']),
    organizations_current: parseArray(row['Organizations That Have Events I Like To Attend']),
    organizations_other: row['Organizations Other'] || null,
    organizations_interested: parseArray(row["Organizations That I've Wanted to Check Out"]),
    organizations_to_check_out_other: row['Organizations to Check Out Other'] || null,
    professional_interests: parseArray(row['Professional Interests']),
    professional_interests_other: row['Professional Interests Other'] || null,
    personal_interests: parseArray(row['Personal Interests']),
    networking_goals: row['Networking Goals'] || null,
    connection_count: 0,
    max_connections: 10,
    created_at: parseTimestamp(row['Timestamp']),
    updated_at: new Date().toISOString()
  };
}).filter(record => record !== null);

// Write to new CSV
const outputPath = 'C:\\Users\\Jeff\\OneDrive\\Desktop\\networking-bude-clean\\bude-users-formatted.csv';
const csv = stringify(supabaseRecords, {
  header: true,
  quoted: true
});

fs.writeFileSync(outputPath, csv);

console.log(`✅ Created formatted CSV with ${supabaseRecords.length} users`);
console.log(`📁 Saved to: ${outputPath}\n`);
console.log('Next step: Import this file in Supabase Table Editor');
