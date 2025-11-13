-- Check current RLS policies on conversations table
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
WHERE tablename = 'conversations';

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

-- Create SELECT policy: Users can view conversations they're part of
CREATE POLICY "Users can view their conversations"
ON conversations
FOR SELECT
TO authenticated
USING (
  auth.uid() = user1_id
  OR auth.uid() = user2_id
);

-- Create UPDATE policy: Users can update conversations they're part of
CREATE POLICY "Users can update their conversations"
ON conversations
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user1_id
  OR auth.uid() = user2_id
);

-- Create INSERT policy: Users can create conversations where they are one of the participants
CREATE POLICY "Users can create conversations"
ON conversations
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user1_id
  OR auth.uid() = user2_id
);

-- Verify the new policies
SELECT
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'conversations';
