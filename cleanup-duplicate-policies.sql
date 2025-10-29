-- Clean up duplicate RLS policies
-- Run this in Supabase SQL Editor

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Authenticated users can insert" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable read access for own profile" ON public.users;
DROP POLICY IF EXISTS "Enable update for own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON public.users;

-- Create ONE set of clean policies
CREATE POLICY "Allow authenticated insert"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow own profile select"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Allow own profile update"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Verify
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';
