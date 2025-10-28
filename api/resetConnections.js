/**
 * Vercel Serverless Function: Reset Saved-for-Later Connections
 *
 * This runs every Monday via Vercel Cron to reset 'saved' connections back to 'recommended'
 * Mutual connections (status='connected') are NOT affected
 */

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Verify this is called by Vercel Cron (security check)
  const authHeader = req.headers.authorization;

  // In production, Vercel Cron sends a secret in the Authorization header
  // For now, we'll allow POST requests (you can add CRON_SECRET to env vars later)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // Initialize Supabase with service role key (has elevated permissions)
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key needed for this operation
    );

    // Call the Supabase function to reset connections
    const { data, error } = await supabase.rpc('reset_and_log_connections');

    if (error) {
      console.error('❌ Error resetting connections:', error);
      throw error;
    }

    console.log('✅ Monday reset completed:', data);

    return res.status(200).json({
      success: true,
      message: 'Saved-for-later connections reset to recommended',
      ...data
    });

  } catch (error) {
    console.error('❌ Error in reset endpoint:', error);

    return res.status(500).json({
      error: 'Failed to reset connections',
      message: error.message
    });
  }
}
