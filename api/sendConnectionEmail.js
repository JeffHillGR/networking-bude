/**
 * Vercel Serverless Function: Send Connection Request Email
 *
 * Sends a simple email notification when a user wants to connect
 */

import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { senderName, senderEmail, senderId, recipientName, recipientEmail, message, connectionScore } = req.body;

    // Validate required fields
    if (!senderName || !senderEmail || !recipientName || !recipientEmail) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['senderName', 'senderEmail', 'recipientName', 'recipientEmail']
      });
    }

    // Send to the actual recipient's email address
    const recipientEmailAddress = recipientEmail;

    // Initialize Resend (you'll need to add RESEND_API_KEY to Vercel env vars)
    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #009900 0%, #D0ED00 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .badge { background: #D0ED00; color: #009900; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 10px 0; }
            .button { display: inline-block; background: #009900; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .message-box { background: #f5f5f5; padding: 15px; border-left: 4px solid #009900; margin: 20px 0; font-style: italic; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🤝 New Connection Request</h1>
            </div>
            <div class="content">
              <p><strong>Hi ${recipientName}</strong>,</p>

              <p>This Networking BudE user would like to connect with you!</p>

              <div style="margin: 20px 0;">
                <strong>From:</strong> ${senderName}<br>
                <span class="badge">${connectionScore}% Compatible</span>
              </div>

              ${message ? `
                <div class="message-box">
                  <strong>Personal Message:</strong><br>
                  ${message}
                </div>
              ` : ''}

              <p>
                <a href="https://app.networkingbude.com/profile/${senderId || 'view'}" class="button">
                  View ${senderName}'s Profile
                </a>
              </p>

              <p style="color: #666; font-size: 14px;">
                Click the button above to log in and see ${senderName}'s full profile. If you'd like to connect, click "Connect" on their profile to create a mutual connection.
              </p>
            </div>
            <div class="footer">
              <p>This email was sent by Networking BudE<br>
              <a href="https://networkingbude.com">networkingbude.com</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend
    const data = await resend.emails.send({
      from: 'BudE Connections <connections@networkingbude.com>',
      to: recipientEmailAddress,
      subject: `${senderName} wants to connect with you on Networking BudE`,
      html: emailHtml,
      replyTo: senderEmail
    });

    console.log('✅ Connection email sent:', data);

    return res.status(200).json({
      success: true,
      message: 'Connection request sent successfully',
      emailId: data.id
    });

  } catch (error) {
    console.error('❌ Error sending connection email:', error);

    return res.status(500).json({
      error: 'Failed to send connection request',
      message: error.message
    });
  }
}
