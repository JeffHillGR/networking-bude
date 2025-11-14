-- ============================================================================
-- CREATE event_attendees TABLE for "Going" status
-- Date: 2025-11-14
-- Purpose: Track users who are committed to attending events
-- ============================================================================

-- Create the table
CREATE TABLE IF NOT EXISTS public.event_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'going', -- Future: could add 'maybe', 'not_going'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one attendance record per user per event
  UNIQUE(user_id, event_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON public.event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON public.event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_status ON public.event_attendees(status);

-- Enable RLS
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can see who's attending events
CREATE POLICY "Users can view all event attendees"
ON public.event_attendees
FOR SELECT
TO authenticated
USING (true);

-- RLS Policy: Users can only insert their own attendance
CREATE POLICY "Users can mark themselves as attending"
ON public.event_attendees
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own attendance
CREATE POLICY "Users can update their own attendance"
ON public.event_attendees
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own attendance
CREATE POLICY "Users can remove their own attendance"
ON public.event_attendees
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_event_attendees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_attendees_updated_at
BEFORE UPDATE ON public.event_attendees
FOR EACH ROW
EXECUTE FUNCTION update_event_attendees_updated_at();

-- Verify table creation
SELECT
  tablename,
  rowsecurity,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'event_attendees') as index_count
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'event_attendees';

-- List all policies
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'event_attendees'
ORDER BY cmd;
