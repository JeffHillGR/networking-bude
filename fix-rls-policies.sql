-- Check current RLS policies on users table
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users';

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert their own profile during signup" ON users;

-- Create new INSERT policy that allows authenticated users to insert their own record
CREATE POLICY "Users can insert their own profile during signup"
ON users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Verify the new policy
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users' AND cmd = 'INSERT';
