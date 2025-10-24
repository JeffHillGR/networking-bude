/**
 * Vercel Serverless Function: Submit Connection Request to Google Sheets
 *
 * This endpoint receives connection request data from the React app and:
 * 1. Appends it to a Google Sheet (Connection_Requests tab)
 * 2. Sends notification email to the person being requested
 */

import { google } from 'googleapis';

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    console.log('📥 Received connection request submission');

    // Validate environment variables are set
    const requiredEnvVars = ['GOOGLE_PROJECT_ID', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_CLIENT_EMAIL', 'GOOGLE_SHEET_ID'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingEnvVars.length > 0) {
      console.error('❌ Missing environment variables:', missingEnvVars);
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Missing required environment variables',
        missingVars: missingEnvVars
      });
    }

    // Parse the request body
    const formData = req.body;

    // Validate required fields
    const requiredFields = ['senderName', 'senderEmail', 'recipientName', 'recipientEmail', 'message'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields
      });
    }

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

    // Format timestamp
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', {
      timeZone: 'America/Detroit',
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    // Prepare the row data
    const rowData = [
      timestamp,                      // A: Timestamp
      formData.senderName || '',      // B: Sender Name
      formData.senderEmail || '',     // C: Sender Email
      formData.recipientName || '',   // D: Recipient Name
      formData.recipientEmail || '',  // E: Recipient Email
      formData.message || '',         // F: Message
      formData.senderTitle || '',     // G: Sender Title
      formData.senderCompany || ''    // H: Sender Company
    ];

    console.log('📊 Preparing to append connection request to Google Sheet');
    console.log('Sheet ID:', process.env.GOOGLE_SHEET_ID);
    console.log('Range:', 'Connection_Requests!A:H');

    // Append the data to the Google Sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Connection_Requests!A:H', // Sheet tab name for Connection Requests
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [rowData]
      }
    });

    console.log('✅ Successfully appended to Google Sheet');
    console.log('Updated range:', response.data.updates.updatedRange);
    console.log('Updated rows:', response.data.updates.updatedRows);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Connection request successfully sent',
      updatedRows: response.data.updates.updatedRows,
      updatedRange: response.data.updates.updatedRange
    });

  } catch (error) {
    console.error('❌ Error submitting connection request to Google Sheets:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.status
    });

    // Return detailed error for debugging
    return res.status(500).json({
      error: 'Failed to send connection request',
      message: error.message,
      code: error.code,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
