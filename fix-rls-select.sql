-- Fix RLS to allow users to READ their own profile
-- The issue: App queries "WHERE email = joe@joeblume.com" but user can't read it

-- Drop all SELECT policies
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "Allow users to read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Enable read access for own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON public.users;

-- Create a SELECT policy that allows querying by email
CREATE POLICY "users_can_read_own_by_email"
ON public.users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR
  email = auth.jwt()->>'email'
);

-- Verify
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users' AND cmd = 'SELECT';
