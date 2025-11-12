-- Check for any auth hooks that might be blocking signups
SELECT
    id,
    hook_table_id,
    hook_name,
    created_at,
    request_url
FROM supabase_functions.hooks
WHERE hook_table_id IN (
    SELECT id
    FROM supabase_functions.hook_tables
    WHERE table_name = 'auth.users'
);

-- Alternative: Check if there are any auth schema triggers
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth';
