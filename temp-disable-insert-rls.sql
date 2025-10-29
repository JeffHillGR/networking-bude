-- Temporarily allow INSERT without RLS check to diagnose the issue
-- This will let us see if RLS is blocking the signup

-- Drop the INSERT policy temporarily
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON public.users;

-- Create a more permissive INSERT policy for testing
CREATE POLICY "users_insert_any_authenticated"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (true);  -- Allow any authenticated user to insert (TEMPORARY FOR TESTING)

-- Keep the SELECT policies as-is for now
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';
