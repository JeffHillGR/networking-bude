-- Clean slate: Remove ALL existing policies on users table and create fresh ones

-- First, let's see what we have
SELECT policyname FROM pg_policies WHERE tablename = 'users';

-- Drop ALL existing policies on users table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.users';
    END LOOP;
END $$;

-- Verify all policies are gone
SELECT policyname FROM pg_policies WHERE tablename = 'users';

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create ONLY the essential policies

-- 1. Allow users to read their own profile
CREATE POLICY "users_select_own"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 2. Allow users to update their own profile
CREATE POLICY "users_update_own"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Allow users to insert their own profile during signup
CREATE POLICY "users_insert_own"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Verify the new policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';
