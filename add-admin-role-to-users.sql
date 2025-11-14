-- ============================================================================
-- ADD ADMIN ROLE SYSTEM TO USERS TABLE
-- Date: 2025-11-14
-- Purpose: Enable multiple authenticated admins with individual logins
-- Security: Replaces single shared admin login with role-based access control
-- ============================================================================

-- Add is_admin column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create index for faster admin checks
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin);

-- ============================================================================
-- HELPER FUNCTION: Check if current user is admin
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANT YOUR ADMIN USERS
-- Update the emails below to match your admin users
-- ============================================================================
-- Example: Make specific users admins by email
UPDATE public.users
SET is_admin = true
WHERE email IN (
  'connections@networkingbude.com',  -- Jeff's admin login
  'grjeff@gmail.com'  -- Add additional admin email(s) here if needed
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Check which users are admins
SELECT
  email,
  first_name,
  last_name,
  is_admin,
  created_at
FROM public.users
WHERE is_admin = true
ORDER BY created_at;

-- Show total admin count
SELECT
  COUNT(*) as total_admins
FROM public.users
WHERE is_admin = true;
