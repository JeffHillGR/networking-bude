-- Fix RLS policy for matches table to allow script to insert matches

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own matches" ON public.matches;
DROP POLICY IF EXISTS "Users can insert their own matches" ON public.matches;
DROP POLICY IF EXISTS "Users can update their own matches" ON public.matches;

-- Allow authenticated users to read their own matches
CREATE POLICY "Users can view their own matches"
ON public.matches
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR matched_user_id = auth.uid());

-- Allow authenticated users (including scripts) to insert matches
CREATE POLICY "Allow inserting matches"
ON public.matches
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to update their own match status
CREATE POLICY "Users can update their own matches"
ON public.matches
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Verify policies
SELECT policyname, cmd FROM pg_policies WHERE schemaname = 'public' AND tablename = 'matches';
