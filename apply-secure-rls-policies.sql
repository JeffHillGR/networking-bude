-- ============================================================================
-- SECURE RLS POLICIES UPDATE
-- Date: 2025-11-14
-- Purpose: Fix critical RLS security issues identified in security audit
-- ============================================================================

-- ============================================================================
-- 1. USERS TABLE - Allow viewing matched profiles
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can view matched profiles" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to read profiles of people they've matched with
CREATE POLICY "Users can view matched profiles"
ON public.users
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT matched_user_id
    FROM public.matches
    WHERE user_id = auth.uid()
  )
);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Allow users to insert their own profile (for signup)
CREATE POLICY "Users can insert own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 2. MATCHES TABLE - Restrict INSERT to service role only
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own matches" ON public.matches;
DROP POLICY IF EXISTS "Users can insert their own matches" ON public.matches;
DROP POLICY IF EXISTS "Users can update their own matches" ON public.matches;
DROP POLICY IF EXISTS "Allow inserting matches" ON public.matches;
DROP POLICY IF EXISTS "Allow anon to insert matches" ON public.matches;
DROP POLICY IF EXISTS "Allow insert matches" ON public.matches;
DROP POLICY IF EXISTS "Service role can insert matches" ON public.matches;
DROP POLICY IF EXISTS "Users can delete their own matches" ON public.matches;

-- Re-enable RLS on matches table
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own matches (both directions)
CREATE POLICY "Users can view their own matches"
ON public.matches
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR matched_user_id = auth.uid());

-- Allow users to update their own match status (for accepting/rejecting connections)
-- Note: Updated to allow BOTH user_id and matched_user_id to update
-- This is required for the bidirectional connection flow
CREATE POLICY "Users can update their own matches"
ON public.matches
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR matched_user_id = auth.uid())
WITH CHECK (user_id = auth.uid() OR matched_user_id = auth.uid());

-- Allow users to delete their own matches
CREATE POLICY "Users can delete their own matches"
ON public.matches
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- CRITICAL: NO INSERT POLICY for authenticated users
-- Only service role (matching algorithm) can insert matches
-- This prevents users from creating fake matches

-- ============================================================================
-- 3. VERIFY POLICIES
-- ============================================================================

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'matches');

-- List all policies
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users', 'matches')
ORDER BY tablename, cmd;
