-- BudE Networking App - Supabase Database Setup
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/moqhghbqapcppzydgqyt/sql/new

-- ============================================
-- 1. Create users table (if it doesn't exist)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  name TEXT,
  username TEXT,
  title TEXT,
  company TEXT,
  industry TEXT,
  zip_code TEXT,
  location TEXT,
  year_born INTEGER,
  year_born_connect TEXT,
  gender TEXT,
  gender_preference TEXT,
  same_industry_preference TEXT,
  organizations_current TEXT[],
  organizations_other TEXT,
  organizations_interested TEXT[],
  organizations_to_check_out_other TEXT,
  professional_interests TEXT[],
  professional_interests_other TEXT,
  personal_interests TEXT[],
  networking_goals TEXT,
  connection_count INTEGER DEFAULT 0,
  max_connections INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Enable Row Level Security
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. Drop existing policies if they exist
-- ============================================
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON public.users;

-- ============================================
-- 4. Create RLS Policies
-- ============================================

-- Allow users to insert their own profile during signup
CREATE POLICY "Allow authenticated users to insert"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- 5. Create function to auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. Create trigger for updated_at
-- ============================================
DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 7. Grant permissions
-- ============================================
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- ============================================
-- 8. Verify the setup
-- ============================================
SELECT
  'Users table exists' as status,
  COUNT(*) as row_count
FROM public.users;
