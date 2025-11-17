-- ============================================================================
-- FIX CONVERSATIONS RLS POLICIES AFTER FORK MERGE
-- Date: 2025-11-14
-- Issue: Fork merge may have overwritten conversation table policies
-- ROOT CAUSE: check_users_connected() function queries old 'matches' table
-- Symptom: "Send Message" worked last night, broken after merge
-- ============================================================================

-- STEP 1: Fix the check_users_connected() function to use connection_flow table
CREATE OR REPLACE FUNCTION public.check_users_connected(uid1 UUID, uid2 UUID)
RETURNS BOOLEAN AS $$
DECLARE
  are_connected BOOLEAN;
BEGIN
  -- Check if users are connected in connection_flow table (not matches!)
  SELECT EXISTS(
    SELECT 1 FROM connection_flow
    WHERE status = 'connected'
    AND (
      (user_id = uid1 AND matched_user_id = uid2) OR
      (user_id = uid2 AND matched_user_id = uid1)
    )
  ) INTO are_connected;

  RETURN are_connected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the function was updated
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'check_users_connected';

-- STEP 2: Check what policies currently exist
SELECT
  policyname,
  cmd as operation,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'conversations'
ORDER BY cmd;

-- Drop ALL existing policies (in case merge created conflicting ones)
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can update conversations" ON public.conversations;
DROP POLICY IF EXISTS "Enable read access for users" ON public.conversations;
DROP POLICY IF EXISTS "Enable insert for users" ON public.conversations;
DROP POLICY IF EXISTS "Enable update for users" ON public.conversations;

-- Ensure RLS is enabled
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE CORRECT POLICIES
-- ============================================================================

-- Policy 1: SELECT - Users can view conversations they're part of
CREATE POLICY "Users can view their own conversations"
ON public.conversations
FOR SELECT
TO authenticated
USING (
  auth.uid() = user1_id OR auth.uid() = user2_id
);

-- Policy 2: INSERT - Users can create conversations where they are a participant
CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user1_id OR auth.uid() = user2_id
);

-- Policy 3: UPDATE - Users can update conversations they're part of (for unread counts)
CREATE POLICY "Users can update their conversations"
ON public.conversations
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user1_id OR auth.uid() = user2_id
)
WITH CHECK (
  auth.uid() = user1_id OR auth.uid() = user2_id
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show final policies
SELECT
  policyname,
  cmd as operation,
  permissive,
  roles
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'conversations'
ORDER BY cmd;

-- Test if you can select conversations (as authenticated user)
-- This should return your conversations
SELECT COUNT(*) as my_conversations_count
FROM public.conversations
WHERE auth.uid() = user1_id OR auth.uid() = user2_id;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Conversations policies fixed!';
  RAISE NOTICE 'You should now be able to send messages again.';
END $$;
