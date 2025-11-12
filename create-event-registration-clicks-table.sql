-- Event Registration Clicks Table
-- Tracks when users click "Register Now" to show event interest

-- Create event_registration_clicks table
CREATE TABLE event_registration_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id) -- One registration click per user per event
);

-- Enable RLS on event_registration_clicks table
ALTER TABLE event_registration_clicks ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view registration clicks (to show interested counts)
CREATE POLICY "Anyone can view registration clicks"
  ON event_registration_clicks
  FOR SELECT
  USING (true);

-- Policy 2: Authenticated users can record clicks
CREATE POLICY "Authenticated users can record registration clicks"
  ON event_registration_clicks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can remove their own registration clicks
CREATE POLICY "Users can remove registration clicks"
  ON event_registration_clicks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_event_registration_clicks_event_id ON event_registration_clicks(event_id);
CREATE INDEX idx_event_registration_clicks_user_id ON event_registration_clicks(user_id);

COMMENT ON TABLE event_registration_clicks IS 'Tracks Register Now button clicks to measure event interest';
