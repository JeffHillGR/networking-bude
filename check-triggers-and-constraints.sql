-- Check for triggers or constraints that might be affecting inserts
-- Run this in Supabase SQL Editor

-- Check for triggers on users table
SELECT
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'users';

-- Check for constraints
SELECT
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass;

-- Try to manually insert a test row to see if it works
INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    name
) VALUES (
    gen_random_uuid(),
    'manual-test@example.com',
    'Manual',
    'Test',
    'Manual Test'
) RETURNING *;

-- Check if the manual insert stayed
SELECT * FROM public.users WHERE email = 'manual-test@example.com';
