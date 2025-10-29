-- Check if test users exist in various places
-- Run this in Supabase SQL Editor

-- Look for any test emails in users table
SELECT id, email, first_name, last_name, created_at
FROM public.users
WHERE email LIKE '%test%' OR email LIKE '%example%'
ORDER BY created_at DESC;

-- Count total users
SELECT COUNT(*) as total_users FROM public.users;

-- Show the most recent 5 users
SELECT id, email, first_name, last_name, created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 5;
