-- Drop the trigger on auth.users (not public.users!)
DROP TRIGGER IF EXISTS trigger_initialize_notification_preferences ON auth.users;

-- Then drop the function with CASCADE
DROP FUNCTION IF EXISTS initialize_notification_preferences() CASCADE;
