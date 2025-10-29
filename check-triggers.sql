-- Check if there's a trigger that should auto-create users table entries
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  OR event_object_schema = 'auth';
