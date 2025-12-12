import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import crypto from 'crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { oldEmail, newEmail, userId } = req.body;

  if (!oldEmail || !newEmail || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if new email is already in use
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', newEmail.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'This email is already in use. Please choose a different email.' });
    }

    // Generate secure tokens
    const oldEmailToken = crypto.randomBytes(32).toString('hex');
    const newEmailToken = crypto.randomBytes(32).toString('hex');

    // Cancel any existing pending email change requests for this user
    await supabase
      .from('email_change_requests')
      .update({ cancelled_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('completed_at', null)
      .is('cancelled_at', null);

    // Create new email change request
    const { data: emailChangeRequest, error: insertError } = await supabase
      .from('email_change_requests')
      .insert({
        user_id: userId,
        old_email: oldEmail.toLowerCase(),
        new_email: newEmail.toLowerCase(),
        old_email_token: oldEmailToken,
        new_email_token: newEmailToken,
        old_email_confirmed: false,
        new_email_confirmed: false
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating email change request:', insertError);
      return res.status(500).json({ error: 'Failed to create email change request' });
    }

    // Send confirmation email to OLD email address
    const oldEmailConfirmUrl = `https://www.networkingbude.com/confirm-email-change?token=${oldEmailToken}&type=old`;
    const oldEmailCancelUrl = `https://www.networkingbude.com/cancel-email-change?token=${oldEmailToken}`;

    const oldEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #009900 0%, #D0ED00 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { padding: 30px; background: #ffffff; }
            .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; padding: 14px 28px; margin: 10px 5px; text-decoration: none; border-radius: 8px; font-weight: bold; text-align: center; }
            .button-confirm { background: #009900; color: white !important; }
            .button-cancel { background: #dc3545; color: white !important; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔐 Email Change Request</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p>Someone requested to change the email address for your Networking BudE account from <strong>${oldEmail}</strong> to <strong>${newEmail}</strong>.</p>

            <div class="warning-box">
              <strong>⚠️ Action Required:</strong> For your security, BOTH your old and new email addresses must confirm this change before it takes effect.
            </div>

            <p><strong>If this was you:</strong></p>
            <p style="text-align: center;">
              <a href="${oldEmailConfirmUrl}" class="button button-confirm">✓ Confirm Email Change</a>
            </p>

            <p><strong>If this was NOT you:</strong></p>
            <p style="text-align: center;">
              <a href="${oldEmailCancelUrl}" class="button button-cancel">✗ Cancel This Request</a>
            </p>

            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 14px;">
              This confirmation link will expire in 24 hours. If you did not request this change, please cancel it immediately to keep your account secure.
            </p>
          </div>
          <div class="footer">
            © 2025 The BudE System | <a href="https://www.networkingbude.com">networkingbude.com</a>
          </div>
        </body>
      </html>
    `;

    const { data: oldEmailData, error: oldEmailError } = await resend.emails.send({
      from: 'BudE Security <security@networkingbude.com>',
      to: oldEmail,
      subject: '🔐 Confirm Your Email Change Request',
      html: oldEmailHtml
    });

    if (oldEmailError) {
      console.error('Error sending email to old address:', oldEmailError);
      return res.status(500).json({ error: 'Failed to send confirmation email to current address' });
    }

    console.log('Old email sent successfully:', oldEmailData);

    // Send confirmation email to NEW email address
    const newEmailConfirmUrl = `https://www.networkingbude.com/confirm-email-change?token=${newEmailToken}&type=new`;

    const newEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #009900 0%, #D0ED00 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { padding: 30px; background: #ffffff; }
            .info-box { background: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; padding: 14px 28px; margin: 10px 5px; text-decoration: none; border-radius: 8px; font-weight: bold; background: #009900; color: white !important; text-align: center; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>✉️ Verify Your Email Address</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p>You (or someone with access to your account) requested to change the email address for your Networking BudE account to <strong>${newEmail}</strong>.</p>

            <div class="info-box">
              <strong>ℹ️ Two-Step Verification:</strong> For security, BOTH your old email (${oldEmail}) and this new email must confirm before the change takes effect.
            </div>

            <p>Please click the button below to verify that you own this email address:</p>
            <p style="text-align: center;">
              <a href="${newEmailConfirmUrl}" class="button">✓ Verify This Email Address</a>
            </p>

            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 14px;">
              This verification link will expire in 24 hours. If you did not request this change, you can safely ignore this email.
            </p>
          </div>
          <div class="footer">
            © 2025 The BudE System | <a href="https://www.networkingbude.com">networkingbude.com</a>
          </div>
        </body>
      </html>
    `;

    const { data: newEmailData, error: newEmailError } = await resend.emails.send({
      from: 'BudE Security <security@networkingbude.com>',
      to: newEmail,
      subject: '✉️ Verify Your New Email Address',
      html: newEmailHtml
    });

    if (newEmailError) {
      console.error('Error sending email to new address:', newEmailError);
      return res.status(500).json({ error: 'Failed to send confirmation email to new address' });
    }

    console.log('New email sent successfully:', newEmailData);

    return res.status(200).json({
      success: true,
      message: 'Email change request created. Please check BOTH email addresses for confirmation links.',
      requestId: emailChangeRequest.id
    });

  } catch (error) {
    console.error('Error in requestEmailChange:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
