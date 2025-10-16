import { google } from 'googleapis';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const feedbackData = req.body;

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

    // First, find the next empty column by checking row 1
    const checkRange = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Beta_Feedback!1:1', // Get all values in row 1
    });

    // Find the next empty column (B is index 1, C is index 2, etc.)
    const existingColumns = checkRange.data.values?.[0] || [];
    const nextColumnIndex = existingColumns.length > 0 ? existingColumns.length : 1; // Start at B (index 1) if empty
    const nextColumnLetter = String.fromCharCode(65 + nextColumnIndex); // Convert index to letter (B, C, D, etc.)

    // Format timestamp
    const timestamp = new Date(feedbackData.submittedAt || new Date()).toLocaleString('en-US', {
      timeZone: 'America/Detroit',
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    // Prepare column data - each response goes in a separate row within the same column
    // Based on your Google Sheet structure from the screenshots
    const columnData = [
      [feedbackData.name || ''],                      // Row 1 - Name
      [feedbackData.email || ''],                     // Row 2 - Email
      [timestamp],                                    // Row 3 - Timestamp
      [''],                                           // Row 4 - empty
      [''],                                           // Row 5 - Onboarding & First Impressions header
      [''],                                           // Row 6 - Question text
      [feedbackData.signUpSmoothness || ''],         // Row 7 - Answer
      [''],                                           // Row 8 - empty
      [''],                                           // Row 9 - User Experience (UX) header
      [feedbackData.navigationEase || ''],           // Row 10 - Answer
      [feedbackData.confusingSteps || ''],           // Row 11 - Answer
      [''],                                           // Row 12 - empty
      [''],                                           // Row 13 - Design & Branding header
      [feedbackData.visualAppeal || ''],             // Row 14 - Answer
      [feedbackData.brandClarity || ''],             // Row 15 - Answer
      [''],                                           // Row 16 - empty
      [''],                                           // Row 17 - Performance & Speed header
      [feedbackData.performance || ''],              // Row 18 - Answer
      [feedbackData.crashesOrBugs || ''],            // Row 19 - Answer
      [''],                                           // Row 20 - empty
      [''],                                           // Row 21 - Features & Functionality header
      [feedbackData.usefulFeatures || ''],           // Row 22 - Answer
      [feedbackData.missingFeatures || ''],          // Row 23 - Answer
      [''],                                           // Row 24 - empty
      [feedbackData.corePurposeUnderstood || ''],    // Row 25 - Did users understand core purpose
      [''],                                           // Row 26 - Value Proposition & Relevance header
      [''],                                           // Row 27 - empty
      [''],                                           // Row 28 - Does app solve real problem header
      [feedbackData.solvesRealProblem || ''],        // Row 29 - Answer
      [''],                                           // Row 30 - empty
      [''],                                           // Row 31 - Does app give reason to come back header
      [feedbackData.reasonToComeBack || ''],         // Row 32 - Answer
      [''],                                           // Row 33 - empty
      [''],                                           // Row 34 - Overall rating header
      [feedbackData.overallRating || ''],            // Row 35 - Answer
      [feedbackData.netPromoterScore || ''],         // Row 36 - NPS Answer
    ];

    // Write to the next available column starting from row 1
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Beta_Feedback!${nextColumnLetter}1:${nextColumnLetter}36`,
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
