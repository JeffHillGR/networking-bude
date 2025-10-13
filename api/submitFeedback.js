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

    // Prepare row data matching the Google Sheet columns
    const rowData = [
      feedbackData.name || '',
      feedbackData.email || '',
      feedbackData.signUpSmoothness || '',
      feedbackData.navigationEase || '',
      feedbackData.confusingSteps || '',
      feedbackData.visualAppeal || '',
      feedbackData.brandClarity || '',
      feedbackData.performance || '',
      feedbackData.crashesOrBugs || '',
      feedbackData.usefulFeatures || '',
      feedbackData.missingFeatures || '',
      feedbackData.corePurposeUnderstood || '',
      feedbackData.valueProposition || '',
      feedbackData.solvesRealProblem || '',
      feedbackData.wouldUseOrRecommend || '',
      feedbackData.reasonToComeBack || '',
      feedbackData.overallSatisfaction || '',
      feedbackData.overallRating || '',
      feedbackData.netPromoterScore || '',
      feedbackData.submittedAt || new Date().toISOString()
    ];

    // Append to the Beta_Feedback sheet starting from row 3, column B (skipping row headers in column A)
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Beta_Feedback!B3', // Start from row 3, column B
      valueInputOption: 'RAW',
      resource: {
        values: [rowData],
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
