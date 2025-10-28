-- Reset saved-for-later connections back to recommended every Monday
-- This excludes mutual connections (status='connected')
-- Run this in Supabase SQL Editor

-- Create a function to reset saved connections (non-mutual) back to recommended
CREATE OR REPLACE FUNCTION reset_saved_for_later_connections()
RETURNS TABLE(reset_count BIGINT) AS $$
BEGIN
  -- Only reset 'saved' status (not 'connected' which are mutual connections)
  UPDATE public.matches
  SET status = 'recommended', updated_at = NOW()
  WHERE status = 'saved';

  -- Return the count of reset connections
  GET DIAGNOSTICS reset_count = ROW_COUNT;

  RETURN QUERY SELECT reset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION reset_saved_for_later_connections() TO authenticated;
GRANT EXECUTE ON FUNCTION reset_saved_for_later_connections() TO service_role;

-- Optional: Create a log table to track when resets happen
CREATE TABLE IF NOT EXISTS public.connection_resets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  connections_reset INTEGER NOT NULL,
  notes TEXT
);

-- Add RLS for the log table
ALTER TABLE public.connection_resets ENABLE ROW LEVEL SECURITY;

-- Only admins can view reset logs (using service role)
CREATE POLICY "Service role can manage reset logs"
ON public.connection_resets
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create a wrapper function that logs the reset
CREATE OR REPLACE FUNCTION reset_and_log_connections()
RETURNS JSON AS $$
DECLARE
  v_count INTEGER;
  v_result JSON;
BEGIN
  -- Call the reset function
  SELECT reset_count INTO v_count FROM reset_saved_for_later_connections();

  -- Log the reset
  INSERT INTO public.connection_resets (connections_reset, notes)
  VALUES (v_count, 'Weekly Monday reset');

  -- Return JSON result
  v_result := json_build_object(
    'success', true,
    'reset_count', v_count,
    'reset_date', NOW()
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION reset_and_log_connections() TO authenticated;
GRANT EXECUTE ON FUNCTION reset_and_log_connections() TO service_role;
