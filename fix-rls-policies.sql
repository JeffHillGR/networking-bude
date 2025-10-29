-- Fix RLS policies for new user signups
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/moqhghbqapcppzydgqyt/sql/new

-- ============================================
-- 1. Enable RLS (if not already enabled)
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Drop any existing policies
-- ============================================
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable read access for own profile" ON public.users;
DROP POLICY IF EXISTS "Enable update for own profile" ON public.users;

-- ============================================
-- 3. Create new policies for INSERT
-- ============================================
-- This is the KEY policy - allows new users to insert their profile during signup
CREATE POLICY "Enable insert for authenticated users only"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================
-- 4. Create policies for SELECT (viewing own profile)
-- ============================================
CREATE POLICY "Enable read access for own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- ============================================
-- 5. Create policies for UPDATE (editing own profile)
-- ============================================
CREATE POLICY "Enable update for own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- 6. Grant necessary permissions
-- ============================================
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ============================================
-- 7. Verify setup
-- ============================================
SELECT 'RLS policies created successfully!' as status;

-- Check policies
SELECT
    policyname,
    cmd as operation,
    roles
FROM pg_policies
WHERE tablename = 'users';
