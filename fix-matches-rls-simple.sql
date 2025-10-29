-- Simplest fix: Allow service role to bypass RLS for matches table
-- This allows the matching script to insert matches

-- First, check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'matches';

-- Option 1: Disable RLS entirely on matches table (simplest for beta)
ALTER TABLE public.matches DISABLE ROW LEVEL SECURITY;

-- Option 2 (if you want to keep some security):
-- Create policy that allows anon inserts (comment out Option 1 and use this instead)
/*
DROP POLICY IF EXISTS "Allow anon to insert matches" ON public.matches;

CREATE POLICY "Allow anon to insert matches"
ON public.matches
FOR INSERT
TO anon
WITH CHECK (true);
*/

-- Verify
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'matches';
