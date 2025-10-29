-- Fix RLS policies for users table and profile-photos storage
-- Run this in Supabase SQL Editor

-- ========================================
-- 1. USERS TABLE - Allow users to update their own profile
-- ========================================

-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Create policy to allow users to update their own profile
-- This uses auth.uid() which is the UUID from auth.users table
-- We need to check if there's an auth_id column or if we match by email
-- Let's create a policy that works with email matching

CREATE POLICY "Users can update own profile by email"
ON public.users
FOR UPDATE
TO authenticated
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
WITH CHECK (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Also ensure users can SELECT their own data
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;

CREATE POLICY "Users can read own profile"
ON public.users
FOR SELECT
TO authenticated
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- ========================================
-- 2. STORAGE - Allow users to upload profile photos
-- ========================================

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view profile photos" ON storage.objects;

-- Allow users to upload their own profile photos
-- The folder structure is: {user_id}/profile.jpg
CREATE POLICY "Users can upload their own profile photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own profile photos
CREATE POLICY "Users can update their own profile photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow everyone to view profile photos (public bucket)
CREATE POLICY "Public can view profile photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- ========================================
-- 3. Verify the policies were created
-- ========================================

-- Check users table policies
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users';

-- Check storage policies
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
AND policyname LIKE '%profile%';
