-- Check current RLS policies on messages table
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
WHERE tablename = 'messages';

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- Create INSERT policy: Users can send messages
CREATE POLICY "Users can insert their own messages"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- Create SELECT policy: Users can view messages they sent or received
CREATE POLICY "Users can view their messages"
ON messages
FOR SELECT
TO authenticated
USING (
  auth.uid() = sender_id
  OR auth.uid() = recipient_id
);

-- Create UPDATE policy: Users can update their own messages (for read status, etc)
CREATE POLICY "Users can update their own messages"
ON messages
FOR UPDATE
TO authenticated
USING (
  auth.uid() = sender_id
  OR auth.uid() = recipient_id
);

-- Verify the new policies
SELECT
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'messages';
