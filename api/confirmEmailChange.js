import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, type } = req.body; // type is 'old' or 'new'

  if (!token || !type || !['old', 'new'].includes(type)) {
    return res.status(400).json({ error: 'Invalid request parameters' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the email change request by token
    const tokenField = type === 'old' ? 'old_email_token' : 'new_email_token';
    const confirmField = type === 'old' ? 'old_email_confirmed' : 'new_email_confirmed';

    const { data: request, error: findError } = await supabase
      .from('email_change_requests')
      .select('*')
      .eq(tokenField, token)
      .is('completed_at', null)
      .is('cancelled_at', null)
      .single();

    if (findError || !request) {
      return res.status(404).json({ error: 'Invalid or expired confirmation link' });
    }

    // Check if request has expired (24 hours)
    const expiresAt = new Date(request.expires_at);
    if (expiresAt < new Date()) {
      return res.status(400).json({ error: 'This confirmation link has expired. Please request a new email change.' });
    }

    // Mark this email as confirmed
    const updateData = {};
    updateData[confirmField] = true;

    const { data: updatedRequest, error: updateError } = await supabase
      .from('email_change_requests')
      .update(updateData)
      .eq('id', request.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating email change request:', updateError);
      return res.status(500).json({ error: 'Failed to confirm email' });
    }

    // Check if both emails have been confirmed
    const bothConfirmed =
      (type === 'old' ? true : updatedRequest.old_email_confirmed) &&
      (type === 'new' ? true : updatedRequest.new_email_confirmed);

    if (bothConfirmed) {
      // Both emails confirmed - complete the email change!

      // Update the user's email in Supabase Auth
      const { error: authError } = await supabase.auth.admin.updateUserById(
        updatedRequest.user_id,
        { email: updatedRequest.new_email }
      );

      if (authError) {
        console.error('Error updating auth email:', authError);
        return res.status(500).json({ error: 'Failed to update email in authentication system' });
      }

      // Update the user's email in the users table
      const { error: dbError } = await supabase
        .from('users')
        .update({ email: updatedRequest.new_email })
        .eq('id', updatedRequest.user_id);

      if (dbError) {
        console.error('Error updating user email in database:', dbError);
        // This is less critical since auth was updated
      }

      // Mark request as completed
      await supabase
        .from('email_change_requests')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', request.id);

      return res.status(200).json({
        success: true,
        completed: true,
        message: 'Email change completed successfully! You can now log in with your new email address.',
        newEmail: updatedRequest.new_email
      });
    } else {
      // Only one email confirmed so far
      const waitingFor = type === 'old' ? 'new' : 'old';
      return res.status(200).json({
        success: true,
        completed: false,
        message: `${type === 'old' ? 'Old' : 'New'} email confirmed. Waiting for confirmation from your ${waitingFor} email address.`,
        waitingFor
      });
    }

  } catch (error) {
    console.error('Error in confirmEmailChange:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
