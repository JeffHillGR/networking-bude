/**
 * Vercel Serverless Function: Notify Admin of New User
 * SECURED with service role authentication
 * Called by Supabase webhook when a new user is added to the users table
 * Sends email notification to admin
 */

import { Resend } from 'resend';
import { requireServiceRole, setCorsHeaders } from './_middleware/auth.js';

async function handleNewUserNotification(req, res) {
  // Set secure CORS headers
  setCorsHeaders(res, req.headers.origin);

  // Verify this is a POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get base URL from environment variable with fallback
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://networking-bude.vercel.app';

    const { type, table, record } = req.body;

    // Only handle INSERT events on users table
    if (type !== 'INSERT' || table !== 'users') {
      return res.status(200).json({ message: 'Event ignored' });
    }

    const newUser = record;

    // Validate required user data
    if (!newUser || !newUser.email) {
      return res.status(400).json({ error: 'Invalid user data' });
    }

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send notification email to admin
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #009900 0%, #D0ED00 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 20px; }
            .content { background: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-top: none; }
            .user-info { background: #f5f5f5; padding: 15px; border-left: 4px solid #009900; margin: 15px 0; }
            .label { font-weight: bold; color: #009900; }
            .button { display: inline-block; background: #009900; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 New User Signed Up!</h1>
            </div>
            <div class="content">
              <p>A new user just joined Networking BudE:</p>

              <div class="user-info">
                <p><span class="label">Name:</span> ${newUser.first_name || 'N/A'} ${newUser.last_name || 'N/A'}</p>
                <p><span class="label">Email:</span> ${newUser.email}</p>
                <p><span class="label">Company:</span> ${newUser.company || 'Not provided'}</p>
                <p><span class="label">Title:</span> ${newUser.title || 'Not provided'}</p>
                <p><span class="label">Industry:</span> ${newUser.industry || 'Not provided'}</p>
                <p><span class="label">Signed up:</span> ${new Date(newUser.created_at).toLocaleString()}</p>
              </div>

              <p style="margin-top: 20px;">
                <a href="${baseUrl}/admin" class="button">
                  View in Admin Panel
                </a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'BudE Notifications <notifications@networkingbude.com>',
      to: process.env.ADMIN_EMAIL || 'connections@networkingbude.com',
      subject: `🎉 New User: ${newUser.first_name || ''} ${newUser.last_name || ''}`,
      html: emailHtml
    });

    console.log('✅ New user notification sent:', newUser.email);

    return res.status(200).json({
      success: true,
      message: 'Notification sent'
    });

  } catch (error) {
    console.error('❌ Error sending notification:', error);

    return res.status(500).json({
      error: 'Failed to send notification',
      message: error.message
    });
  }
}

// Protect with service role authentication (Supabase webhooks should include service key)
export default requireServiceRole(handleNewUserNotification);
