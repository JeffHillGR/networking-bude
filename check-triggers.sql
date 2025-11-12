-- Check for all triggers on users table
SELECT
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'users';

-- Check pg_trigger directly for any triggers
SELECT
    t.tgname AS trigger_name,
    c.relname AS table_name,
    p.proname AS function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'users' AND NOT t.tgisinternal;
