-- Check all RLS policies on messages and conversations tables
SELECT
    tablename,
    policyname,
    cmd as operation,
    roles,
    CASE
        WHEN cmd = 'SELECT' THEN qual
        ELSE with_check
    END as policy_expression
FROM pg_policies
WHERE tablename IN ('messages', 'conversations')
ORDER BY tablename, cmd;

-- Check if RLS is enabled on these tables
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('messages', 'conversations')
  AND schemaname = 'public';
