import { google } from 'googleapis';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const surveyData = req.body;

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

    // Format timestamp
    const timestamp = new Date(surveyData.submittedAt || new Date()).toLocaleString('en-US', {
      timeZone: 'America/Detroit',
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    // Prepare row data - each submission is a new row
    // Row 1 has headers: Timestamp | Your Name | Did you reach out... | Did they respond | Do you plan to meetup... | If you did not reach out...
    const rowData = [
      timestamp,                         // Column A - Timestamp
      surveyData.name || '',            // Column B - Your Name
      surveyData.reachedOut || '',      // Column C - Did you reach out?
      surveyData.didTheyRespond || '',  // Column D - Did they respond?
      surveyData.planToMeetup || '',    // Column E - Plan to meetup?
      surveyData.whyNotReachOut || ''   // Column F - Why not reach out?
    ];

    // Append the new row to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Connection_Feedback_Form!A:F',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [rowData],
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Connection follow-up survey submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting connection follow-up survey:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit survey',
      error: error.message
    });
  }
}
