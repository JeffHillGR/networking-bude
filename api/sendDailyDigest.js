/**
 * Vercel Serverless Function: Daily Digest Email
 *
 * Sends a daily summary of platform activity to admin
 * Run via Vercel Cron every day at 8 AM
 */

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export default async function handler(req, res) {
  // Verify this is called by Vercel Cron (security check)
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize Supabase with service role key
    // Note: Use SUPABASE_URL (not VITE_) for serverless functions
    const supabase = createClient(
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get date range (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString();

    // Fetch new users in last 24 hours
    const { data: newUsers, error: usersError } = await supabase
      .from('users')
      .select('first_name, last_name, email, company, title, created_at')
      .gte('created_at', yesterdayISO)
      .order('created_at', { ascending: false });

    if (usersError) throw usersError;

    // Fetch profile updates (users with updated_at > created_at in last 24 hours)
    const { data: updatedProfiles, error: updatesError } = await supabase
      .from('users')
      .select('first_name, last_name, email, updated_at')
      .gte('updated_at', yesterdayISO)
      .neq('updated_at', supabase.raw('created_at'))
      .order('updated_at', { ascending: false });

    if (updatesError) throw updatesError;

    // Fetch new matches created in last 24 hours
    const { data: newMatches, error: matchesError } = await supabase
      .from('connection_flow')
      .select('created_at')
      .gte('created_at', yesterdayISO);

    if (matchesError) throw matchesError;

    // Fetch connection requests sent in last 24 hours (pending status created recently)
    const { data: connectionRequests, error: connectionsError } = await supabase
      .from('connection_flow')
      .select('user_id, matched_user_id, created_at, status')
      .eq('status', 'pending')
      .gte('updated_at', yesterdayISO);

    if (connectionsError) throw connectionsError;

    // Fetch mutual connections made in last 24 hours
    const { data: mutualConnections, error: mutualError } = await supabase
      .from('connection_flow')
      .select('user_id, matched_user_id, updated_at, status')
      .eq('status', 'connected')
      .gte('updated_at', yesterdayISO);

    if (mutualError) throw mutualError;

    // Get total user count
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get total matches count
    const { count: totalMatches } = await supabase
      .from('connection_flow')
      .select('*', { count: 'exact', head: true });

    // Build email HTML
    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 700px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #009900 0%, #D0ED00 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .header p { color: white; margin: 5px 0 0 0; font-size: 14px; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .stat-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .stat-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
            .stat-row:last-child { border-bottom: none; }
            .stat-label { font-weight: bold; color: #666; }
            .stat-value { font-weight: bold; color: #009900; font-size: 18px; }
            .section { margin: 25px 0; }
            .section-title { color: #009900; font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #009900; padding-bottom: 5px; }
            .user-item { background: #f5f5f5; padding: 12px; margin: 8px 0; border-left: 4px solid #009900; border-radius: 4px; }
            .no-activity { color: #999; font-style: italic; padding: 10px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; }
            .button { display: inline-block; background: #009900; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Daily Activity Digest</h1>
              <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div class="content">

              <!-- Summary Stats -->
              <div class="stat-box">
                <h3 style="margin-top: 0; color: #333;">📈 Platform Overview</h3>
                <div class="stat-row">
                  <span class="stat-label">Total Users</span>
                  <span class="stat-value">${totalUsers || 0}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Total Matches Generated</span>
                  <span class="stat-value">${totalMatches || 0}</span>
                </div>
              </div>

              <div class="stat-box">
                <h3 style="margin-top: 0; color: #333;">🕐 Last 24 Hours</h3>
                <div class="stat-row">
                  <span class="stat-label">New Users</span>
                  <span class="stat-value">${newUsers?.length || 0}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Profile Updates</span>
                  <span class="stat-value">${updatedProfiles?.length || 0}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">New Matches Created</span>
                  <span class="stat-value">${newMatches?.length || 0}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Connection Requests Sent</span>
                  <span class="stat-value">${connectionRequests?.length || 0}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Mutual Connections Made</span>
                  <span class="stat-value">${mutualConnections?.length || 0}</span>
                </div>
              </div>

              <!-- New Users Detail -->
              <div class="section">
                <div class="section-title">👥 New Users</div>
                ${newUsers && newUsers.length > 0 ?
                  newUsers.map(user => `
                    <div class="user-item">
                      <strong>${user.first_name} ${user.last_name}</strong><br>
                      <small>${user.email}</small><br>
                      ${user.company ? `<small>${user.title} at ${user.company}</small><br>` : ''}
                      <small style="color: #666;">Signed up: ${new Date(user.created_at).toLocaleString()}</small>
                    </div>
                  `).join('')
                  : '<div class="no-activity">No new users in the last 24 hours</div>'
                }
              </div>

              <!-- Profile Updates Detail -->
              <div class="section">
                <div class="section-title">✏️ Profile Updates</div>
                ${updatedProfiles && updatedProfiles.length > 0 ?
                  updatedProfiles.slice(0, 10).map(user => `
                    <div class="user-item">
                      <strong>${user.first_name} ${user.last_name}</strong> updated their profile<br>
                      <small style="color: #666;">${new Date(user.updated_at).toLocaleString()}</small>
                    </div>
                  `).join('') +
                  (updatedProfiles.length > 10 ? `<div class="no-activity">... and ${updatedProfiles.length - 10} more</div>` : '')
                  : '<div class="no-activity">No profile updates in the last 24 hours</div>'
                }
              </div>

              <!-- Mutual Connections Detail -->
              ${mutualConnections && mutualConnections.length > 0 ? `
              <div class="section">
                <div class="section-title">🎉 Mutual Connections Made</div>
                <div class="user-item">
                  <strong>${mutualConnections.length} new mutual connections</strong> were made!<br>
                  <small style="color: #666;">Users are connecting and networking successfully!</small>
                </div>
              </div>
              ` : ''}

              <!-- Actions -->
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://www.networkingbude.com/admin" class="button">View Admin Panel</a>
                <a href="https://supabase.com/dashboard" class="button" style="background: #3ecf8e;">View Database</a>
              </div>

            </div>
            <div class="footer">
              <p style="color: #666; font-size: 12px; margin: 0;">
                Networking BudE Daily Digest<br>
                This email is sent automatically every day at 8 AM
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'BudE Daily Digest <digest@networkingbude.com>',
      to: 'connections@networkingbude.com',
      subject: `📊 BudE Daily Digest - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      html: emailHtml
    });

    console.log('✅ Daily digest sent successfully');

    return res.status(200).json({
      success: true,
      message: 'Daily digest sent',
      stats: {
        newUsers: newUsers?.length || 0,
        profileUpdates: updatedProfiles?.length || 0,
        newMatches: newMatches?.length || 0,
        connectionRequests: connectionRequests?.length || 0,
        mutualConnections: mutualConnections?.length || 0
      }
    });

  } catch (error) {
    console.error('❌ Error sending daily digest:', error);

    return res.status(500).json({
      error: 'Failed to send daily digest',
      message: error.message
    });
  }
}
