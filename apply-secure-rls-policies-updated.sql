-- ============================================================================
-- SECURE RLS POLICIES UPDATE (UPDATED FOR CONNECTION_FLOW)
-- Date: 2025-11-14
-- Purpose: Fix critical RLS security issues identified in security audit
-- UPDATED: Changed all references from 'matches' to 'connection_flow'
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
-- UPDATED: Changed from 'matches' to 'connection_flow'
CREATE POLICY "Users can view matched profiles"
ON public.users
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT matched_user_id
    FROM public.connection_flow
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
-- 2. CONNECTION_FLOW TABLE - Restrict INSERT to service role only
-- UPDATED: Changed from 'matches' to 'connection_flow'
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own matches" ON public.connection_flow;
DROP POLICY IF EXISTS "Users can view their own connections" ON public.connection_flow;
DROP POLICY IF EXISTS "Users can insert their own matches" ON public.connection_flow;
DROP POLICY IF EXISTS "Users can update their own matches" ON public.connection_flow;
DROP POLICY IF EXISTS "Users can update their own connections" ON public.connection_flow;
DROP POLICY IF EXISTS "Allow inserting matches" ON public.connection_flow;
DROP POLICY IF EXISTS "Allow anon to insert matches" ON public.connection_flow;
DROP POLICY IF EXISTS "Allow insert matches" ON public.connection_flow;
DROP POLICY IF EXISTS "Service role can insert matches" ON public.connection_flow;
DROP POLICY IF EXISTS "Users can delete their own matches" ON public.connection_flow;
DROP POLICY IF EXISTS "Users can delete their own connections" ON public.connection_flow;

-- Re-enable RLS on connection_flow table
ALTER TABLE public.connection_flow ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own connections (both directions)
CREATE POLICY "Users can view their own connections"
ON public.connection_flow
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR matched_user_id = auth.uid());

-- Allow users to update their own connection status (for accepting/rejecting connections)
-- Note: Updated to allow BOTH user_id and matched_user_id to update
-- This is required for the bidirectional connection flow
CREATE POLICY "Users can update their own connections"
ON public.connection_flow
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR matched_user_id = auth.uid())
WITH CHECK (user_id = auth.uid() OR matched_user_id = auth.uid());

-- Allow users to delete their own connections
CREATE POLICY "Users can delete their own connections"
ON public.connection_flow
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- CRITICAL: NO INSERT POLICY for authenticated users
-- Only service role (matching algorithm) can insert connections
-- This prevents users from creating fake connections

-- ============================================================================
-- 3. VERIFY POLICIES
-- ============================================================================

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'connection_flow');

-- List all policies
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users', 'connection_flow')
ORDER BY tablename, cmd;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies updated for connection_flow table!';
  RAISE NOTICE 'All references to old "matches" table have been replaced.';
END $$;
