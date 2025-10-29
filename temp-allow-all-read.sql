-- TEMPORARY: Allow all authenticated users to read users table
-- This is just for testing - we'll restrict it later

DROP POLICY IF EXISTS "users_can_read_own_by_email" ON public.users;

CREATE POLICY "temp_allow_all_authenticated_read"
ON public.users
FOR SELECT
TO authenticated
USING (true);  -- TEMPORARY - allows any authenticated user to read

-- Verify
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';
