-- Restore the RLS policies that were working before we broke everything
-- This should restore full functionality

-- First, drop ALL policies on users table to start clean
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.users';
    END LOOP;
END $$;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Grant basic permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;

-- Policy 1: Allow authenticated users to read ALL users (needed for matching/connections)
CREATE POLICY "Enable read access for authenticated users"
ON public.users
FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Allow users to insert their own profile
CREATE POLICY "Enable insert for authenticated users"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy 3: Allow users to update their own profile
CREATE POLICY "Enable update for own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Verify the policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';
