import { google } from 'googleapis';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, feedback, category } = req.body;

    // Validate required fields
    if (!name || !email || !feedback) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Setup Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Prepare the row data
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'America/Detroit',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const values = [[
      timestamp,
      category || 'general',
      name,
      email,
      feedback
    ]];

    // Append to Quick_Feedback tab (or create it if it doesn't exist)
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Quick_Feedback!A:E',
      valueInputOption: 'RAW',
      resource: { values },
    });

    console.log('✅ Quick feedback submitted successfully');
    return res.status(200).json({
      message: 'Feedback submitted successfully',
      timestamp
    });

  } catch (error) {
    console.error('❌ Error submitting quick feedback:', error);
    return res.status(500).json({
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
}
