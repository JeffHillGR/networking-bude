-- ============================================================================
-- VERIFY ADMIN STATUS AND AUTH ID MATCHING
-- Run this to troubleshoot RLS policy issues
-- ============================================================================

-- Check 1: Find your user record by email
SELECT
  id as user_id,
  email,
  is_admin,
  first_name,
  last_name,
  created_at
FROM public.users
WHERE email = 'connections@networkingbude.com';

-- Check 2: Get your current Supabase auth ID
SELECT auth.uid() as current_auth_id;

-- Check 3: Compare - do they match?
SELECT
  users.id as users_table_id,
  users.email,
  users.is_admin,
  auth.uid() as supabase_auth_id,
  CASE
    WHEN users.id = auth.uid() THEN '✅ IDs MATCH - RLS should work'
    ELSE '❌ IDs DO NOT MATCH - This is the problem!'
  END as id_comparison
FROM public.users
WHERE email = 'connections@networkingbude.com';

-- Check 4: List all users with is_admin column
SELECT
  email,
  is_admin,
  CASE
    WHEN is_admin IS NULL THEN '⚠️ NULL (column might not exist)'
    WHEN is_admin = true THEN '✅ TRUE'
    WHEN is_admin = false THEN '❌ FALSE'
  END as admin_status
FROM public.users
WHERE email = 'connections@networkingbude.com';
