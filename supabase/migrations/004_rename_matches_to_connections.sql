-- Migration: Rename matches table to connections
-- Date: 2025-11-12
-- Description: Drop old connections/connections_history tables and rename matches to connections
--              Update all RLS policies and constraints

-- =====================================================
-- 1. Drop old tables if they exist
-- =====================================================
DROP TABLE IF EXISTS public.connections_history CASCADE;
DROP TABLE IF EXISTS public.connections CASCADE;

-- =====================================================
-- 2. Rename matches table to connections
-- =====================================================
ALTER TABLE IF EXISTS public.matches RENAME TO connections;

-- =====================================================
-- 3. Rename constraints and indexes
-- =====================================================

-- Rename primary key constraint
ALTER TABLE public.connections
  RENAME CONSTRAINT IF EXISTS matches_pkey TO connections_pkey;

-- Rename unique constraint
ALTER TABLE public.connections
  RENAME CONSTRAINT IF EXISTS matches_user_id_matched_user_id_key TO connections_user_id_matched_user_id_key;

-- Rename indexes
ALTER INDEX IF EXISTS idx_matches_user_id RENAME TO idx_connections_user_id;
ALTER INDEX IF EXISTS idx_matches_status RENAME TO idx_connections_status;
ALTER INDEX IF EXISTS idx_matches_user_status RENAME TO idx_connections_user_status;

-- =====================================================
-- 4. Drop old RLS policies (with matches name)
-- =====================================================
DROP POLICY IF EXISTS "matches_select_own" ON public.connections;
DROP POLICY IF EXISTS "matches_update_own_status" ON public.connections;
DROP POLICY IF EXISTS "matches_delete_own" ON public.connections;
DROP POLICY IF EXISTS "matches_insert_service_role" ON public.connections;
DROP POLICY IF EXISTS "matches_service_role_all" ON public.connections;
DROP POLICY IF EXISTS "Users can read their own matches" ON public.connections;
DROP POLICY IF EXISTS "Users can update their own matches" ON public.connections;
DROP POLICY IF EXISTS "Service role can insert matches" ON public.connections;

-- =====================================================
-- 5. Create new RLS policies (with connections name)
-- =====================================================

-- Ensure RLS is enabled
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own connections
CREATE POLICY "connections_select_own"
  ON public.connections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Users can update status of their own connections
CREATE POLICY "connections_update_own_status"
  ON public.connections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND user_id = user_id  -- Prevent changing user_id
    AND matched_user_id = matched_user_id  -- Prevent changing matched_user_id
  );

-- Policy 3: Users can delete their own connections
CREATE POLICY "connections_delete_own"
  ON public.connections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 4: ONLY service role can insert connections (matching algorithm runs backend-only)
CREATE POLICY "connections_insert_service_role"
  ON public.connections
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy 5: Service role can do anything
CREATE POLICY "connections_service_role_all"
  ON public.connections
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 6. Update trigger function if it exists
-- =====================================================
DO $$
BEGIN
  -- Check if the trigger exists and update it
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_matches_updated_at') THEN
    DROP TRIGGER update_matches_updated_at ON public.connections;

    -- Recreate with new name
    CREATE TRIGGER update_connections_updated_at
      BEFORE UPDATE ON public.connections
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- =====================================================
-- 7. Update user policy to reference connections table
-- =====================================================

-- Drop old user policies that reference matches
DROP POLICY IF EXISTS "users_select_matches" ON public.users;
DROP POLICY IF EXISTS "users_select_matched_by" ON public.users;
DROP POLICY IF EXISTS "Users can read own and matched profiles" ON public.users;
DROP POLICY IF EXISTS "Users can read matched user profiles" ON public.users;

-- Recreate user policies to reference connections table
CREATE POLICY "users_select_connections"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.connections
      WHERE connections.user_id = auth.uid()
        AND connections.matched_user_id = users.id
        AND connections.status IN ('recommended', 'saved', 'connected')
    )
  );

CREATE POLICY "users_select_connected_by"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.connections
      WHERE connections.matched_user_id = auth.uid()
        AND connections.user_id = users.id
        AND connections.status IN ('recommended', 'saved', 'connected')
    )
  );

-- =====================================================
-- 8. Grant permissions
-- =====================================================
GRANT ALL ON public.connections TO authenticated;
GRANT ALL ON public.connections TO service_role;

-- =====================================================
-- 9. Add comments
-- =====================================================
COMMENT ON TABLE public.connections IS 'Connections table: Stores user connection recommendations and statuses (renamed from matches)';
COMMENT ON COLUMN public.connections.user_id IS 'User who received the connection recommendation';
COMMENT ON COLUMN public.connections.matched_user_id IS 'User who was recommended as a connection';
COMMENT ON COLUMN public.connections.compatibility_score IS 'Compatibility score (0-100) from matching algorithm';
COMMENT ON COLUMN public.connections.match_reasons IS 'JSONB array of reasons for the connection match';
COMMENT ON COLUMN public.connections.status IS 'Connection status: recommended, passed, saved, connected';

-- =====================================================
-- 10. Verify the migration
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '   - Old connections/connections_history tables dropped';
  RAISE NOTICE '   - matches table renamed to connections';
  RAISE NOTICE '   - All constraints and indexes renamed';
  RAISE NOTICE '   - RLS policies updated';
  RAISE NOTICE '   - User policies updated to reference connections';
END $$;

-- Check the table exists
SELECT
  'connections table exists' as status,
  COUNT(*) as row_count
FROM public.connections;

-- Verify RLS policies
SELECT
  policyname,
  tablename,
  cmd as operation,
  roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'connections'
ORDER BY policyname;
