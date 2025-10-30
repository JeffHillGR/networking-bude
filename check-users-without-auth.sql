-- Check for users in public.users who don't have auth.users entries
-- This identifies "public users" that need to be migrated to auth

-- ============================================
-- 1. Find users without auth entries
-- ============================================
SELECT
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.name,
  u.created_at,
  CASE
    WHEN au.id IS NULL THEN 'NO AUTH'
    ELSE 'HAS AUTH'
  END as auth_status
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE au.id IS NULL
ORDER BY u.created_at DESC;

-- ============================================
-- 2. Count users by auth status
-- ============================================
SELECT
  COUNT(CASE WHEN au.id IS NULL THEN 1 END) as users_without_auth,
  COUNT(CASE WHEN au.id IS NOT NULL THEN 1 END) as users_with_auth,
  COUNT(*) as total_users
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id;

-- ============================================
-- 3. Find users where public.users.id is NOT a UUID
-- ============================================
-- This will help identify if there are integer IDs vs UUID IDs
SELECT
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  pg_typeof(u.id) as id_type
FROM public.users u
LIMIT 10;
