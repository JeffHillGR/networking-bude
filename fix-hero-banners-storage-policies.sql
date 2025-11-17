-- ============================================================================
-- FIX SUPABASE STORAGE POLICIES FOR HERO BANNERS
-- Date: 2025-11-14
-- Purpose: Allow authenticated admins to upload hero banner images
-- ============================================================================

-- Note: Storage policies are different from table RLS policies
-- They control who can upload/download files from Storage buckets

-- ============================================================================
-- STORAGE BUCKET: Hero-Banners-Geotagged
-- ============================================================================

-- Policy 1: Allow public to view/download hero banner images
INSERT INTO storage.policies (bucket_id, name, definition)
VALUES (
  'Hero-Banners-Geotagged',
  'Public can view hero banners',
  '(bucket_id = ''Hero-Banners-Geotagged'')'
)
ON CONFLICT DO NOTHING;

-- Policy 2: Allow authenticated admins to upload hero banners
INSERT INTO storage.policies (bucket_id, name, definition)
VALUES (
  'Hero-Banners-Geotagged',
  'Admins can upload hero banners',
  '(bucket_id = ''Hero-Banners-Geotagged'') AND (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true))'
)
ON CONFLICT DO NOTHING;

-- Alternative: If the above doesn't work, use the Supabase storage policy functions
-- Drop any existing policies first
DO $$
BEGIN
  -- Try to drop policies if they exist (may fail silently if they don't exist)
  PERFORM storage.drop_policy('Hero-Banners-Geotagged', 'Public can view hero banners');
  PERFORM storage.drop_policy('Hero-Banners-Geotagged', 'Admins can upload hero banners');
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Create policies using Supabase storage functions
-- Policy for SELECT (viewing/downloading)
SELECT storage.create_policy(
  'Hero-Banners-Geotagged',
  'Public can view hero banners',
  'SELECT',
  'true', -- Anyone can view
  NULL
);

-- Policy for INSERT (uploading)
SELECT storage.create_policy(
  'Hero-Banners-Geotagged',
  'Admins can upload hero banners',
  'INSERT',
  'EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true)',
  NULL
);

-- Policy for UPDATE (updating/replacing files)
SELECT storage.create_policy(
  'Hero-Banners-Geotagged',
  'Admins can update hero banners',
  'UPDATE',
  'EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true)',
  NULL
);

-- Policy for DELETE (deleting files)
SELECT storage.create_policy(
  'Hero-Banners-Geotagged',
  'Admins can delete hero banners',
  'DELETE',
  'EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true)',
  NULL
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check if bucket exists
SELECT
  id,
  name,
  public
FROM storage.buckets
WHERE id = 'Hero-Banners-Geotagged';

-- List all policies on the bucket
SELECT
  id,
  bucket_id,
  name,
  definition
FROM storage.policies
WHERE bucket_id = 'Hero-Banners-Geotagged';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Storage policies updated for Hero-Banners-Geotagged bucket';
END $$;
