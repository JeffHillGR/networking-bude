-- ============================================================================
-- MIGRATION: Rename 'matches' table to 'connection_flow'
-- Date: 2025-11-14
-- Purpose: Better semantic naming for the connection system
-- ============================================================================

-- Step 1: Rename the table
ALTER TABLE public.matches RENAME TO connection_flow;

-- Step 2: Update all RLS policies to reference the new table name
-- Drop old policies (they reference the old table name in metadata)
DROP POLICY IF EXISTS "Users can delete their own matches" ON public.connection_flow;
DROP POLICY IF EXISTS "Users can view their own matches" ON public.connection_flow;
DROP POLICY IF EXISTS "Users can read their own matches" ON public.connection_flow;
DROP POLICY IF EXISTS "Users can update their own matches" ON public.connection_flow;

-- Recreate policies with updated names
CREATE POLICY "Users can view their own connections"
ON public.connection_flow
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR matched_user_id = auth.uid());

CREATE POLICY "Users can update their own connections"
ON public.connection_flow
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR matched_user_id = auth.uid())
WITH CHECK (user_id = auth.uid() OR matched_user_id = auth.uid());

CREATE POLICY "Users can delete their own connections"
ON public.connection_flow
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Step 3: Update the "Users can view matched profiles" policy to reference new table
DROP POLICY IF EXISTS "Users can view matched profiles" ON public.users;

CREATE POLICY "Users can view matched profiles"
ON public.users
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT matched_user_id
    FROM public.connection_flow
    WHERE user_id = auth.uid()
  )
);

-- Step 4: Update any indexes (rename to match new table)
-- Check if there are indexes to rename
DO $$
DECLARE
  idx_name TEXT;
BEGIN
  FOR idx_name IN
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND tablename = 'connection_flow'
    AND indexname LIKE '%matches%'
  LOOP
    EXECUTE format('ALTER INDEX %I RENAME TO %I',
      idx_name,
      replace(idx_name, 'matches', 'connection_flow')
    );
  END LOOP;
END $$;

-- Step 5: Rename foreign key constraints for consistency
-- This updates constraint names from "matches_*" to "connection_flow_*"
DO $$
DECLARE
  constraint_name TEXT;
  new_constraint_name TEXT;
BEGIN
  FOR constraint_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.connection_flow'::regclass
    AND conname LIKE '%matches%'
  LOOP
    new_constraint_name := replace(constraint_name, 'matches', 'connection_flow');
    EXECUTE format('ALTER TABLE public.connection_flow RENAME CONSTRAINT %I TO %I',
      constraint_name,
      new_constraint_name
    );
    RAISE NOTICE 'Renamed constraint % to %', constraint_name, new_constraint_name;
  END LOOP;
END $$;

-- Step 6: Update any triggers that reference the matches table
-- (Your notify_mutual_connection trigger should automatically work with renamed table)

-- Step 7: Verify the migration
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'connection_flow';

-- List all policies on the new table
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'connection_flow'
ORDER BY cmd;

-- Check that users policy references the new table
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'users'
AND policyname = 'Users can view matched profiles';
