-- Secure RLS setup for matches table
-- This keeps RLS enabled but sets proper policies

-- Re-enable RLS on matches table
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own matches" ON public.matches;
DROP POLICY IF EXISTS "Users can insert their own matches" ON public.matches;
DROP POLICY IF EXISTS "Users can update their own matches" ON public.matches;
DROP POLICY IF EXISTS "Allow inserting matches" ON public.matches;
DROP POLICY IF EXISTS "Allow anon to insert matches" ON public.matches;
DROP POLICY IF EXISTS "Allow insert matches" ON public.matches;

-- Allow users to view their own matches
CREATE POLICY "Users can view their own matches"
ON public.matches
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR matched_user_id = auth.uid());

-- Allow users to update their own match status (accept/reject)
CREATE POLICY "Users can update their own matches"
ON public.matches
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Note: We do NOT create an INSERT policy for anon or authenticated users
-- Only the service role (used by the matching script) can insert matches
-- This prevents users from creating fake matches

-- Verify policies
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'matches';
SELECT policyname, cmd FROM pg_policies WHERE schemaname = 'public' AND tablename = 'matches';
