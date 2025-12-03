-- Create the trigger on the messages table to fire notify_new_message on INSERT
-- Run this in your Supabase SQL Editor

-- First, drop the trigger if it exists (to avoid duplicates)
DROP TRIGGER IF EXISTS trigger_notify_new_message ON messages;

-- Create the trigger
CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Verify the trigger was created
SELECT
    t.tgname AS trigger_name,
    c.relname AS table_name,
    p.proname AS function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'messages'
  AND NOT t.tgisinternal;
