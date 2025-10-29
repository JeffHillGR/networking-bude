-- Add SELECT policy for users table to allow reading photo_url
-- Run this in Supabase SQL Editor

-- This policy allows authenticated users to read their own photo_url
CREATE POLICY IF NOT EXISTS "Users can read their own photo_url"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);
