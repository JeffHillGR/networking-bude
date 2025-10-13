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

    // Prepare column data - each response goes in a separate row within the same column
    // Based on your Google Sheet structure from the screenshots
    const columnData = [
      [feedbackData.name || ''],                      // Row 1 - Name
      [feedbackData.email || ''],                     // Row 2 - Email
      [''],                                           // Row 3 - empty
      [''],                                           // Row 4 - Onboarding & First Impressions header
      [''],                                           // Row 5 - Question text
      [feedbackData.signUpSmoothness || ''],         // Row 6 - Answer
      [''],                                           // Row 7 - empty
      [''],                                           // Row 8 - User Experience (UX) header
      [feedbackData.navigationEase || ''],           // Row 9 - Answer
      [feedbackData.confusingSteps || ''],           // Row 10 - Answer
      [''],                                           // Row 11 - empty
      [''],                                           // Row 12 - Design & Branding header
      [feedbackData.visualAppeal || ''],             // Row 13 - Answer
      [feedbackData.brandClarity || ''],             // Row 14 - Answer
      [''],                                           // Row 15 - empty
      [''],                                           // Row 16 - Performance & Speed header
      [feedbackData.performance || ''],              // Row 17 - Answer
      [feedbackData.crashesOrBugs || ''],            // Row 18 - Answer
      [''],                                           // Row 19 - empty
      [''],                                           // Row 20 - Features & Functionality header
      [feedbackData.usefulFeatures || ''],           // Row 21 - Answer
      [feedbackData.missingFeatures || ''],          // Row 22 - Answer
      [''],                                           // Row 23 - empty
      [feedbackData.corePurposeUnderstood || ''],    // Row 24 - Did users understand core purpose
      [''],                                           // Row 25 - Value Proposition & Relevance header
      [''],                                           // Row 26 - empty
      [''],                                           // Row 27 - Does app solve real problem header
      [feedbackData.solvesRealProblem || ''],        // Row 28 - Answer
      [''],                                           // Row 29 - empty
      [''],                                           // Row 30 - Does app give reason to come back header
      [feedbackData.reasonToComeBack || ''],         // Row 31 - Answer (moved from row 31 header)
      [''],                                           // Row 32 - empty
      [''],                                           // Row 33 - Overall rating header
      [feedbackData.overallRating || ''],            // Row 34 - Answer
      [feedbackData.netPromoterScore || ''],         // Row 35 - NPS Answer
    ];

    // Write to the next available column starting from row 1
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Beta_Feedback!${nextColumnLetter}1:${nextColumnLetter}35`,
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
