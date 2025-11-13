-- Fix the notify_new_message function to use action_url instead of link
CREATE OR REPLACE FUNCTION public.notify_new_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  sender_name TEXT;
  recipient_prefs RECORD;
BEGIN
  -- Get sender's name
  SELECT name INTO sender_name
  FROM users
  WHERE id = NEW.sender_id;

  -- Get recipient's notification preferences
  SELECT * INTO recipient_prefs
  FROM notification_preferences
  WHERE user_id = NEW.recipient_id;

  -- Only create notification if user has new_messages enabled (or no preferences set yet - default ON)
  IF recipient_prefs IS NULL OR recipient_prefs.new_messages = TRUE THEN
    -- Create notification
    INSERT INTO notifications (user_id, type, title, message, action_url)
    VALUES (
      NEW.recipient_id,
      'new_message',
      'New message from ' || COALESCE(sender_name, 'Someone'),
      LEFT(NEW.content, 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END,
      '/messages'
    );
  END IF;

  RETURN NEW;
END;
$function$;
