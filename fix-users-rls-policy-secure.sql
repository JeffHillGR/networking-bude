-- Secure RLS policy for users table
-- Users can only see:
-- 1. Their own profile
-- 2. Profiles of people they've matched with (above threshold)

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can view matched profiles" ON public.users;

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to read profiles of people they've matched with
CREATE POLICY "Users can view matched profiles"
ON public.users
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT matched_user_id
    FROM public.matches
    WHERE user_id = auth.uid()
  )
);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Allow users to insert their own profile (for signup)
CREATE POLICY "Users can insert own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
