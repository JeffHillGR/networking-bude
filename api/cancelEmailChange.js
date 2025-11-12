import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the email change request by old email token (only old email can cancel)
    const { data: request, error: findError } = await supabase
      .from('email_change_requests')
      .select('*')
      .eq('old_email_token', token)
      .is('completed_at', null)
      .is('cancelled_at', null)
      .single();

    if (findError || !request) {
      return res.status(404).json({ error: 'Invalid or expired cancellation link' });
    }

    // Mark request as cancelled
    const { error: cancelError } = await supabase
      .from('email_change_requests')
      .update({ cancelled_at: new Date().toISOString() })
      .eq('id', request.id);

    if (cancelError) {
      console.error('Error cancelling email change request:', cancelError);
      return res.status(500).json({ error: 'Failed to cancel email change' });
    }

    return res.status(200).json({
      success: true,
      message: 'Email change request cancelled successfully. Your email address remains unchanged.'
    });

  } catch (error) {
    console.error('Error in cancelEmailChange:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
