-- Find all database functions related to notifications
SELECT proname FROM pg_proc WHERE proname ILIKE '%notif%';

-- Show all functions (look for notification-related ones)
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name ILIKE '%notif%';
