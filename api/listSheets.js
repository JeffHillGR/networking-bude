/**
 * Debug endpoint to list all sheets in the spreadsheet
 */

import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    console.log('📋 Listing all sheets in spreadsheet');

    // Set up Google Sheets API authentication
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : '';

    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: privateKey,
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.GOOGLE_CERT_URL
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Get spreadsheet metadata to list all sheets
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID
    });

    const sheetNames = spreadsheet.data.sheets.map(sheet => ({
      title: sheet.properties.title,
      sheetId: sheet.properties.sheetId,
      index: sheet.properties.index
    }));

    console.log('✅ Found sheets:', sheetNames);

    return res.status(200).json({
      success: true,
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      spreadsheetTitle: spreadsheet.data.properties.title,
      sheets: sheetNames
    });

  } catch (error) {
    console.error('❌ Error listing sheets:', error);

    return res.status(500).json({
      error: 'Failed to list sheets',
      message: error.message,
      code: error.code
    });
  }
}
