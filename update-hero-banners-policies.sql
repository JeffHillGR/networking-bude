-- ============================================================================
-- UPDATE HERO BANNERS RLS POLICIES
-- Date: 2025-11-14
-- Purpose: Drop old policies and recreate with admin role checks
-- Run this AFTER running add-admin-role-to-users.sql
-- ============================================================================

-- Drop all existing policies on hero_banners table
DROP POLICY IF EXISTS "Anyone can view active hero banners" ON public.hero_banners;
DROP POLICY IF EXISTS "Authenticated users can view all hero banners" ON public.hero_banners;
DROP POLICY IF EXISTS "Authenticated users can insert hero banners" ON public.hero_banners;
DROP POLICY IF EXISTS "Authenticated users can update hero banners" ON public.hero_banners;
DROP POLICY IF EXISTS "Authenticated users can delete hero banners" ON public.hero_banners;
DROP POLICY IF EXISTS "Admins can manage hero banners" ON public.hero_banners;
DROP POLICY IF EXISTS "Admin users can view all hero banners" ON public.hero_banners;
DROP POLICY IF EXISTS "Admin users can insert hero banners" ON public.hero_banners;
DROP POLICY IF EXISTS "Admin users can update hero banners" ON public.hero_banners;
DROP POLICY IF EXISTS "Admin users can delete hero banners" ON public.hero_banners;

-- Ensure RLS is enabled
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- NEW POLICIES WITH ADMIN ROLE CHECKS
-- ============================================================================

-- Policy 1: Anyone (authenticated or anonymous) can view active banners
CREATE POLICY "Anyone can view active hero banners"
ON public.hero_banners
FOR SELECT
TO authenticated, anon
USING (is_active = true);

-- Policy 2: Admin users can SELECT all banners (including inactive)
CREATE POLICY "Admin users can view all hero banners"
ON public.hero_banners
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- Policy 3: Admin users can INSERT new banners
CREATE POLICY "Admin users can insert hero banners"
ON public.hero_banners
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- Policy 4: Admin users can UPDATE banners
CREATE POLICY "Admin users can update hero banners"
ON public.hero_banners
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- Policy 5: Admin users can DELETE banners
CREATE POLICY "Admin users can delete hero banners"
ON public.hero_banners
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- List all policies on hero_banners table
SELECT
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'hero_banners'
ORDER BY cmd, policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Hero banner policies updated successfully!';
  RAISE NOTICE 'Total policies: %', (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'hero_banners');
END $$;
