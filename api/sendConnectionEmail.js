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
    const { senderName, senderEmail, senderId, senderPhoto, senderTitle, senderCompany, recipientName, recipientEmail, message, connectionScore } = req.body;

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

    // Create initials for fallback if no photo
    const getInitials = (name) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
            .header { background: linear-gradient(135deg, #009900 0%, #D0ED00 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
            .profile-card { display: flex; align-items: center; gap: 20px; background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #D0ED00; }
            .profile-photo { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #009900; flex-shrink: 0; }
            .profile-initials { width: 80px; height: 80px; border-radius: 50%; background: white; border: 3px solid #009900; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; color: #009900; flex-shrink: 0; }
            .profile-info { flex: 1; }
            .profile-name { font-size: 20px; font-weight: bold; color: #009900; margin: 0 0 5px 0; }
            .profile-title { color: #666; margin: 0; font-size: 14px; }
            .badge { background: #D0ED00; color: #009900; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 10px 0; font-size: 16px; }
            .button { display: inline-block; background: #009900; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; font-size: 16px; border: 2px solid #D0ED00; }
            .button:hover { background: #007700; }
            .message-box { background: #f5f5f5; padding: 15px; border-left: 4px solid #009900; margin: 20px 0; font-style: italic; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .footer a { color: #009900; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🤝 New Connection Request</h1>
            </div>
            <div class="content">
              <p><strong>Hi ${recipientName}</strong>,</p>

              <p>Someone wants to connect with you on Networking BudE!</p>

              <div class="profile-card">
                ${senderPhoto
                  ? `<img src="${senderPhoto}" alt="${senderName}" class="profile-photo" />`
                  : `<div class="profile-initials">${getInitials(senderName)}</div>`
                }
                <div class="profile-info">
                  <h2 class="profile-name">${senderName}</h2>
                  ${senderTitle ? `<p class="profile-title">${senderTitle}${senderCompany ? ` at ${senderCompany}` : ''}</p>` : ''}
                  <span class="badge">${connectionScore}% Compatible</span>
                </div>
              </div>

              ${message ? `
                <div class="message-box">
                  <strong>Personal Message:</strong><br>
                  "${message}"
                </div>
              ` : ''}

              <div style="text-align: center;">
                <a href="https://networking-bude.vercel.app/dashboard?viewConnection=${senderId || ''}" class="button">
                  View Profile & Respond
                </a>
              </div>

              <p style="color: #666; font-size: 14px; text-align: center; margin-top: 20px;">
                Log in to see ${senderName}'s full profile and decide if you'd like to connect!
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

    // Log email details before sending
    console.log('📧 Attempting to send connection email:', {
      from: 'connections@networkingbude.com',
      to: recipientEmailAddress,
      subject: `${senderName} wants to connect with you on Networking BudE`,
      hasApiKey: !!process.env.RESEND_API_KEY
    });

    // Send email via Resend
    const data = await resend.emails.send({
      from: 'BudE Connections <connections@networkingbude.com>',
      to: recipientEmailAddress,
      subject: `${senderName} wants to connect with you on Networking BudE`,
      html: emailHtml,
      replyTo: senderEmail
    });

    console.log('✅ Connection email sent successfully:', data);

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
