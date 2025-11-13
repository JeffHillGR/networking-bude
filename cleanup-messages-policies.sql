-- Drop ALL existing policies on messages table
DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can update received messages" ON messages;

-- Create clean, simple policies
-- 1. INSERT: Users can send messages where they are the sender
CREATE POLICY "Allow authenticated users to send messages"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- 2. SELECT: Users can view messages they sent or received
CREATE POLICY "Allow users to view their messages"
ON messages
FOR SELECT
TO authenticated
USING (
  auth.uid() = sender_id
  OR auth.uid() = recipient_id
);

-- 3. UPDATE: Users can update messages (for marking as read)
CREATE POLICY "Allow users to update message status"
ON messages
FOR UPDATE
TO authenticated
USING (
  auth.uid() = sender_id
  OR auth.uid() = recipient_id
);

-- Verify policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'messages'
ORDER BY cmd;
