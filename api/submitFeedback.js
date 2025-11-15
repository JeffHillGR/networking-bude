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
      range: 'Feedback_Form!1:1', // Get all values in row 1
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

    // Prepare column data - each new record goes in next column (B, C, D, etc.)
    const columnData = [
      [name || 'Anonymous'],                // A1 - Name
      [email || ''],                        // A2 - Email
      [timestamp],                          // A3 - Timestamp
      [loveFeatures || ''],                // A4 - I love these features
      [improveFeatures || ''],             // A5 - These features could use work
      [newFeatures || ''],                 // A6 - I'd love to see these features
    ];

    // Write to the next available column starting from row 1
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Feedback_Form!${nextColumnLetter}1:${nextColumnLetter}6`,
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
