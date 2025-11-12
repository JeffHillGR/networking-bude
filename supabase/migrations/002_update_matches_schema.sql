-- Update matches table to support new statuses and soft delete functionality

-- Add hidden_by_user_id column for soft deletes
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS hidden_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Add perhaps_since column to track when status was set to 'perhaps'
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS perhaps_since TIMESTAMPTZ;

-- Update status constraint to include new statuses
ALTER TABLE public.matches 
DROP CONSTRAINT IF EXISTS matches_status_check;

ALTER TABLE public.matches 
ADD CONSTRAINT matches_status_check 
CHECK (status IN ('recommended', 'perhaps', 'pending', 'connected', 'saved', 'rejected', 'removed'));

-- Create index for hidden_by_user_id for performance
CREATE INDEX IF NOT EXISTS idx_matches_hidden_by_user_id ON public.matches(hidden_by_user_id);

-- Create index for perhaps_since
CREATE INDEX IF NOT EXISTS idx_matches_perhaps_since ON public.matches(perhaps_since);

-- Update RLS policies to hide soft-deleted matches
DROP POLICY IF EXISTS "Users can read their own matches" ON public.matches;

-- New policy that excludes matches hidden by the current user
CREATE POLICY "Users can read their own non-hidden matches"
ON public.matches FOR SELECT TO authenticated
USING (
  auth.uid() = user_id 
  AND (hidden_by_user_id IS NULL OR hidden_by_user_id != auth.uid())
);

-- Policy for reading matches where current user is the matched_user_id (for reciprocal checks)
CREATE POLICY "Users can read matches where they are the target"
ON public.matches FOR SELECT TO authenticated
USING (auth.uid() = matched_user_id);

COMMENT ON COLUMN public.matches.hidden_by_user_id IS 'User ID who soft-deleted this match. When set, the match is hidden from that users view but preserved for the other user.';
COMMENT ON COLUMN public.matches.perhaps_since IS 'Timestamp when status was set to perhaps, used for re-queuing logic.';

-- Update existing perhaps records to set perhaps_since if null
UPDATE public.matches 
SET perhaps_since = updated_at 
WHERE status = 'perhaps' AND perhaps_since IS NULL;