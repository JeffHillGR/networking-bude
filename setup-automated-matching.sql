-- Setup Automated Matching Algorithm
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Enable pg_cron extension for scheduled jobs
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================
-- 2. Create function to call the matching edge function
-- ============================================
CREATE OR REPLACE FUNCTION public.trigger_matching_algorithm()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  function_url text;
  service_role_key text;
BEGIN
  -- Get the Supabase project URL and service role key from environment
  -- You'll need to set these in your Supabase project settings
  function_url := current_setting('app.settings.supabase_url') || '/functions/v1/run-matching';
  service_role_key := current_setting('app.settings.service_role_key');

  -- Call the edge function using http extension
  PERFORM net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := '{}'::jsonb
  );

  RAISE NOTICE 'Matching algorithm triggered';
END;
$$;

-- ============================================
-- 3. Create trigger function for new user signups
-- ============================================
CREATE OR REPLACE FUNCTION public.run_matching_on_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Wait a moment for the user data to be fully committed
  PERFORM pg_sleep(2);

  -- Trigger the matching algorithm
  PERFORM public.trigger_matching_algorithm();

  RETURN NEW;
END;
$$;

-- ============================================
-- 4. Create trigger function for profile updates
-- ============================================
CREATE OR REPLACE FUNCTION public.run_matching_on_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only run if key matching fields were updated
  IF (
    OLD.organizations_current IS DISTINCT FROM NEW.organizations_current OR
    OLD.organizations_interested IS DISTINCT FROM NEW.organizations_interested OR
    OLD.professional_interests IS DISTINCT FROM NEW.professional_interests OR
    OLD.personal_interests IS DISTINCT FROM NEW.personal_interests OR
    OLD.networking_goals IS DISTINCT FROM NEW.networking_goals OR
    OLD.industry IS DISTINCT FROM NEW.industry OR
    OLD.gender_preference IS DISTINCT FROM NEW.gender_preference
  ) THEN
    -- Wait a moment for the update to be fully committed
    PERFORM pg_sleep(2);

    -- Trigger the matching algorithm
    PERFORM public.trigger_matching_algorithm();

    RAISE NOTICE 'Profile updated, matching algorithm triggered for user %', NEW.email;
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================
-- 5. Drop existing triggers if they exist
-- ============================================
DROP TRIGGER IF EXISTS trigger_matching_on_new_user ON public.users;
DROP TRIGGER IF EXISTS trigger_matching_on_profile_update ON public.users;

-- ============================================
-- 6. Create triggers on users table
-- ============================================

-- Trigger on new user signup (INSERT)
CREATE TRIGGER trigger_matching_on_new_user
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.run_matching_on_new_user();

-- Trigger on profile update (UPDATE)
CREATE TRIGGER trigger_matching_on_profile_update
  AFTER UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.run_matching_on_profile_update();

-- ============================================
-- 7. Schedule daily matching at 3 AM UTC
-- ============================================

-- Remove existing cron job if it exists
SELECT cron.unschedule('daily-matching-algorithm');

-- Schedule new cron job to run daily at 3 AM UTC
SELECT cron.schedule(
  'daily-matching-algorithm',
  '0 3 * * *', -- Every day at 3 AM UTC
  $$
  SELECT public.trigger_matching_algorithm();
  $$
);

-- ============================================
-- 8. Verify the setup
-- ============================================

-- Check that triggers were created
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table = 'users'
  AND trigger_name LIKE '%matching%';

-- Check that cron job was scheduled
SELECT * FROM cron.job
WHERE jobname = 'daily-matching-algorithm';

-- ============================================
-- NOTES:
-- ============================================
-- 1. You need to enable the http extension in Supabase:
--    - Go to Database > Extensions
--    - Enable "pg_net" or "http" extension
--
-- 2. Set environment variables in Supabase:
--    - Go to Project Settings > Custom Config
--    - Add: app.settings.supabase_url = your-project-url
--    - Add: app.settings.service_role_key = your-service-role-key
--
-- 3. Deploy the edge function first:
--    npx supabase functions deploy run-matching
--
-- 4. The function will run:
--    - When a new user signs up
--    - When a user updates their profile (key fields only)
--    - Daily at 3 AM UTC (backup)
