-- Fix Photo Upload Issues
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Add photo column to users table if it doesn't exist
-- ============================================
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS photo TEXT;

-- ============================================
-- 2. Create profile-photos storage bucket if it doesn't exist
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. Enable RLS on storage.objects
-- ============================================
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. Drop existing storage policies to avoid conflicts
-- ============================================
DROP POLICY IF EXISTS "Users can upload their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile photos" ON storage.objects;

-- ============================================
-- 5. Create storage policies for profile-photos bucket
-- ============================================

-- Allow authenticated users to upload their own profile photos
-- File path structure: {auth_user_id}/profile.jpg
CREATE POLICY "Users can upload their own profile photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own profile photos
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

-- Allow authenticated users to delete their own profile photos
CREATE POLICY "Users can delete their own profile photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone (public) to view profile photos
CREATE POLICY "Anyone can view profile photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- ============================================
-- 6. Verify users table RLS policies allow photo updates
-- ============================================

-- Check if the update policy exists and covers photo column
-- The existing "Users can update their own profile" policy should work
-- But let's verify it's there
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'users'
    AND policyname = 'Users can update their own profile'
    AND cmd = 'UPDATE'
  ) THEN
    CREATE POLICY "Users can update their own profile"
    ON public.users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- ============================================
-- 7. Verify everything is set up correctly
-- ============================================

-- Check users table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'users'
AND column_name = 'photo';

-- Check users table policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'users';

-- Check storage bucket configuration
SELECT id, name, public
FROM storage.buckets
WHERE id = 'profile-photos';

-- Check storage policies
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%profile%'
ORDER BY policyname;
