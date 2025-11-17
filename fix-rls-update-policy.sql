-- FIX: Allow users to update matches where they are EITHER user_id OR matched_user_id
-- This allows User B to accept connections initiated by User A
--
-- THE BUG: Current policy only allows updates where user_id = auth.uid()
-- This means Jeff can't update Joe's row when accepting a connection
--
-- Run this in Supabase SQL Editor

-- Drop the restrictive UPDATE policy
DROP POLICY IF EXISTS "Users can update their own matches" ON public.matches;
DROP POLICY IF EXISTS "Users can update their matches (both directions)" ON public.matches;

-- Create new policy that allows updates from BOTH sides
CREATE POLICY "Users can update their matches (both directions)"
ON public.matches
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR matched_user_id = auth.uid())
WITH CHECK (user_id = auth.uid() OR matched_user_id = auth.uid());

-- Verify the fix worked
SELECT
  policyname,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'matches'
  AND cmd = 'UPDATE';
