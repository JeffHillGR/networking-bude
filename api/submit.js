/**
 * Vercel Serverless Function: Submit Onboarding Data to Google Sheets
 *
 * This endpoint receives form data from the React app and appends it to a Google Sheet
 * using the official Google Sheets API v4.
 *
 * Setup Required:
 * 1. Create Google Cloud Project
 * 2. Enable Google Sheets API
 * 3. Create Service Account and download credentials JSON
 * 4. Share your Google Sheet with the service account email
 * 5. Add environment variables to Vercel (see GOOGLE_SHEETS_SETUP.md)
 */

import { google } from 'googleapis';

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    console.log('📥 Received form submission');

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
    const requiredFields = ['firstName', 'lastName', 'email', 'username'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields
      });
    }

    // Set up Google Sheets API authentication
    // Handle private key formatting - replace escaped newlines with actual newlines
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

    // Prepare the row data in the same order as Google Form columns
    const rowData = [
      new Date().toISOString(), // Timestamp
      formData.firstName || '',
      formData.lastName || '',
      formData.username || '',
      formData.email || '',
      formData.jobTitle || '',
      formData.company || '',
      formData.zipCode || '', // Added zipCode field
      formData.industry || '',
      formData.sameIndustry || '',
      formData.gender || '',
      formData.genderPreference || '',
      formData.dob || '',
      formData.dobPreference || '',
      // Handle arrays for organizations
      Array.isArray(formData.organizations) ? formData.organizations.join(', ') : (formData.organizations || ''),
      formData.organizationsOther || '',
      Array.isArray(formData.organizationsToCheckOut) ? formData.organizationsToCheckOut.join(', ') : (formData.organizationsToCheckOut || ''),
      formData.organizationsToCheckOutOther || '',
      // Handle arrays for professional interests
      Array.isArray(formData.professionalInterests) ? formData.professionalInterests.join(', ') : (formData.professionalInterests || ''),
      formData.professionalInterestsOther || '',
      formData.personalInterests || '',
      formData.networkingGoals || ''
    ];

    console.log('📊 Preparing to append row to Google Sheet');
    console.log('Sheet ID:', process.env.GOOGLE_SHEET_ID);
    console.log('Range:', 'Form_Responses!A:V');
    console.log('Row data length:', rowData.length);

    // Append the data to the Google Sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Form_Responses!A:V', // Sheet name without quotes
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
      message: 'Form data successfully saved',
      updatedRows: response.data.updates.updatedRows,
      updatedRange: response.data.updates.updatedRange
    });

  } catch (error) {
    console.error('❌ Error submitting to Google Sheets:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.status
    });

    // Return detailed error for debugging
    return res.status(500).json({
      error: 'Failed to save form data',
      message: error.message,
      code: error.code,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
