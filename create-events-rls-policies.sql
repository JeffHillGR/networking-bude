-- Row Level Security (RLS) Policies for Events Table
-- This allows authenticated admin users to manage events while keeping them publicly viewable

-- Enable RLS on events table (if not already enabled)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow everyone (including non-authenticated users) to VIEW events
-- This is important so the public Events page works for all users
CREATE POLICY "Anyone can view events"
  ON events
  FOR SELECT
  USING (true);

-- Policy 2: Allow authenticated users (admins) to INSERT new events
CREATE POLICY "Authenticated users can insert events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 3: Allow authenticated users (admins) to UPDATE events
CREATE POLICY "Authenticated users can update events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 4: Allow authenticated users (admins) to DELETE events
CREATE POLICY "Authenticated users can delete events"
  ON events
  FOR DELETE
  TO authenticated
  USING (true);

-- Note: "authenticated" in Supabase RLS means any user who is logged in via Supabase Auth
-- This includes all admin users you add to your auth.users table
-- Regular website visitors are "anon" (anonymous) and can only SELECT (view) events

COMMENT ON TABLE events IS 'Events table with RLS: Public can view, authenticated admins can manage';
