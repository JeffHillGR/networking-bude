-- RLS Policy: Allow users to read other user data if they have a match record
-- This policy enables users to view profile information of users they are matched with

-- Drop existing conflicting SELECT policies and replace with comprehensive one
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can read matched user profiles" ON users;

-- Create comprehensive policy that handles both own profile and matched users
CREATE POLICY "Users can read own and matched profiles" ON users
  FOR SELECT 
  USING (
    -- Users can always read their own profile
    auth.uid() = id
    OR
    -- Users can read profiles of users they are matched with
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.user_id = auth.uid() 
        AND matches.matched_user_id = users.id
        AND matches.hidden_by_user_id IS NULL -- Exclude hidden matches
        AND matches.status != 'rejected' -- Exclude rejected matches
    )
  );

-- Add comment for documentation
COMMENT ON POLICY "Users can read own and matched profiles" ON users IS 
'Allows users to read their own profile and profile data of other users when they have an active match where the current user is the matcher. Excludes hidden and rejected matches.';