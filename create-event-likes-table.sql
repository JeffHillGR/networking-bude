-- Event Likes Table
-- Allows users to like/unlike events and tracks engagement

-- Create event_likes table
CREATE TABLE event_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id) -- One like per user per event
);

-- Enable RLS on event_likes table
ALTER TABLE event_likes ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view likes (to show like counts)
CREATE POLICY "Anyone can view likes"
  ON event_likes
  FOR SELECT
  USING (true);

-- Policy 2: Authenticated users can add likes
CREATE POLICY "Authenticated users can like"
  ON event_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can remove their own likes
CREATE POLICY "Users can unlike"
  ON event_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_event_likes_event_id ON event_likes(event_id);
CREATE INDEX idx_event_likes_user_id ON event_likes(user_id);

COMMENT ON TABLE event_likes IS 'Event likes: Tracks which users liked which events';
