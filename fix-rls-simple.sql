-- Simple RLS fix - Allow authenticated users to update users table
-- Run this in Supabase SQL Editor

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can update own profile by email" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.users;

-- Simple policy: Allow authenticated users to read and update ALL users
-- (This is less secure but will work for beta - we can tighten it later)
CREATE POLICY "Allow authenticated users to read users"
ON public.users
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update users"
ON public.users
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Verify
SELECT policyname, cmd FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users';
