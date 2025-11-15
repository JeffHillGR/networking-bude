import { google } from 'googleapis';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, loveFeatures, improveFeatures, newFeatures } = req.body;

    // Check if Google API credentials are configured
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
      console.error('Google Sheets API not configured');
      return res.status(500).json({
        success: false,
        message: 'Feedback service not configured'
      });
    }

    // Set up Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Find the next empty column by checking row 1
    const checkRange = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Beta_Feedback!1:1', // Get all values in row 1
    });

    // Find the next empty column (B is index 1, C is index 2, etc.)
    const existingColumns = checkRange.data.values?.[0] || [];
    const nextColumnIndex = existingColumns.length > 0 ? existingColumns.length : 1; // Start at B (index 1) if empty
    const nextColumnLetter = String.fromCharCode(65 + nextColumnIndex); // Convert index to letter (B, C, D, etc.)

    // Format timestamp
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'America/Detroit',
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    // Prepare column data - simplified 3-field feedback form
    const columnData = [
      [name || 'Anonymous'],                          // Row 1 - Name
      [email || ''],                                  // Row 2 - Email
      [timestamp],                                    // Row 3 - Timestamp
      [''],                                           // Row 4 - empty
      ['👍 I love these features:'],                 // Row 5 - Section header
      [loveFeatures || ''],                          // Row 6 - Answer
      [''],                                           // Row 7 - empty
      ['💡 These features could use some work:'],    // Row 8 - Section header
      [improveFeatures || ''],                       // Row 9 - Answer
      [''],                                           // Row 10 - empty
      ['❤️ I\'d love to see this feature:'],        // Row 11 - Section header
      [newFeatures || ''],                           // Row 12 - Answer
    ];

    // Write to the next available column starting from row 1
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Beta_Feedback!${nextColumnLetter}1:${nextColumnLetter}12`,
      valueInputOption: 'RAW',
      resource: {
        values: columnData,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
}
