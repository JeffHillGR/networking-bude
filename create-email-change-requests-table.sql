-- Create email_change_requests table for secure two-step email changes
-- This ensures both old and new email addresses must confirm before change takes effect

CREATE TABLE IF NOT EXISTS email_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_email TEXT NOT NULL,
  new_email TEXT NOT NULL,
  old_email_confirmed BOOLEAN DEFAULT FALSE,
  new_email_confirmed BOOLEAN DEFAULT FALSE,
  old_email_token TEXT NOT NULL UNIQUE,
  new_email_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_change_tokens ON email_change_requests(old_email_token, new_email_token);
CREATE INDEX IF NOT EXISTS idx_email_change_user ON email_change_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_email_change_expires ON email_change_requests(expires_at);

-- Add Row Level Security (RLS)
ALTER TABLE email_change_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own email change requests
CREATE POLICY "Users can view own email change requests"
  ON email_change_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own email change requests
CREATE POLICY "Users can create own email change requests"
  ON email_change_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own email change requests (for confirmation)
CREATE POLICY "Users can update own email change requests"
  ON email_change_requests
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to clean up expired requests (run daily via cron or manually)
CREATE OR REPLACE FUNCTION cleanup_expired_email_change_requests()
RETURNS void AS $$
BEGIN
  DELETE FROM email_change_requests
  WHERE expires_at < NOW()
    AND completed_at IS NULL
    AND cancelled_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on cleanup function
GRANT EXECUTE ON FUNCTION cleanup_expired_email_change_requests() TO authenticated;

COMMENT ON TABLE email_change_requests IS 'Tracks two-step email change requests requiring confirmation from both old and new email addresses';
