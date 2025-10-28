-- Update matches table to support mutual connection logic
-- Run this in Supabase SQL Editor

-- Step 1: Update the status check constraint to include 'pending'
ALTER TABLE public.matches
DROP CONSTRAINT IF EXISTS matches_status_check;

ALTER TABLE public.matches
ADD CONSTRAINT matches_status_check
CHECK (status IN ('recommended', 'passed', 'saved', 'pending', 'connected'));

-- Create a function to handle mutual connections
-- When User A sends a connection request to User B:
--   1. User A's match with User B becomes 'pending'
--   2. If User B's match with User A also exists and is 'pending', both become 'connected'

CREATE OR REPLACE FUNCTION handle_connection_request(
  p_user_id UUID,
  p_matched_user_id UUID
)
RETURNS TEXT AS $$
DECLARE
  v_reverse_match_status TEXT;
BEGIN
  -- Update current user's match to pending
  UPDATE public.matches
  SET status = 'pending', updated_at = NOW()
  WHERE user_id = p_user_id
    AND matched_user_id = p_matched_user_id;

  -- Check if the other user has also sent a connection request (reverse match)
  SELECT status INTO v_reverse_match_status
  FROM public.matches
  WHERE user_id = p_matched_user_id
    AND matched_user_id = p_user_id;

  -- If reverse match exists and is 'pending', make both 'connected'
  IF v_reverse_match_status = 'pending' THEN
    -- Update both matches to connected
    UPDATE public.matches
    SET status = 'connected', updated_at = NOW()
    WHERE (user_id = p_user_id AND matched_user_id = p_matched_user_id)
       OR (user_id = p_matched_user_id AND matched_user_id = p_user_id);

    RETURN 'connected';
  ELSE
    RETURN 'pending';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION handle_connection_request(UUID, UUID) TO authenticated;
