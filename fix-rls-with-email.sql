-- Fix RLS to allow users to query by their own email
-- The issue: App queries "WHERE email = user.email" but RLS only allows "WHERE id = auth.uid()"

-- Drop all existing policies
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

-- Allow users to read their own profile by EITHER id OR email
CREATE POLICY "users_select_own"
ON public.users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR
  email = auth.jwt()->>'email'
);

-- Allow users to update their own profile
CREATE POLICY "users_update_own"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile during signup
CREATE POLICY "users_insert_own"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Verify the new policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';
