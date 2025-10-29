-- Check the exact schema of the users table
-- Run this in Supabase SQL Editor to see what columns exist

SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'users'
ORDER BY ordinal_position;
