-- DIAGNOSTIC: Check if Joe Blume's data exists and is complete
-- This is step 1: Verify the data actually made it into the database

-- 1. Does Joe Blume exist in the users table?
SELECT
  'Joe Blume in users table?' as check_name,
  COUNT(*) as result
FROM public.users
WHERE email = 'joe@joeblume.com';

-- 2. What data does Joe Blume have? (show ALL fields)
SELECT *
FROM public.users
WHERE email = 'joe@joeblume.com';

-- 3. Does Joe Blume exist in auth.users?
SELECT
  'Joe Blume in auth.users?' as check_name,
  COUNT(*) as result
FROM auth.users
WHERE email = 'joe@joeblume.com';

-- 4. Do the IDs match between auth.users and public.users?
SELECT
  'ID Match Check' as check_name,
  au.id as auth_id,
  u.id as users_table_id,
  CASE WHEN au.id = u.id THEN 'MATCH' ELSE 'MISMATCH' END as status
FROM auth.users au
LEFT JOIN public.users u ON u.email = au.email
WHERE au.email = 'joe@joeblume.com';
