-- Update the insert policy to allow service role to insert matches
-- Run this in Supabase SQL Editor

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Service role can insert matches" ON public.matches;

-- Create a new policy that allows all inserts
-- (We'll control access via the service role key)
CREATE POLICY "Allow insert matches"
ON public.matches
FOR INSERT
TO authenticated
WITH CHECK (true);
