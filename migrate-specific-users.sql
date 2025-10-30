-- Migrate Specific Public Users to Auth Users
-- Run this in Supabase SQL Editor

-- ============================================
-- IMPORTANT: Run these steps in order!
-- ============================================

-- ============================================
-- Step 1: Backup the old IDs first (safety measure)
-- ============================================
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS old_id_backup UUID;

-- Update backup column before changing IDs
UPDATE public.users
SET old_id_backup = id
WHERE email IN (
  'rick@rickemail.com'
  -- Add more emails here as you get them
);

-- ============================================
-- Step 2: Update users table with new auth UUIDs
-- ============================================

UPDATE public.users
SET id = '6db16619-8406-40f2-8f3f-fae619cddd9f'
WHERE email = 'rick@rickemail.com';

-- Add more UPDATE statements below as you get user data:
-- UPDATE public.users
-- SET id = 'new-uuid-here'
-- WHERE email = 'user@example.com';


-- ============================================
-- Step 3: Update all foreign key references
-- ============================================

-- Get Rick's old ID to use in updates
DO $$
DECLARE
  rick_old_id UUID;
  rick_new_id UUID := '6db16619-8406-40f2-8f3f-fae619cddd9f';
BEGIN
  -- Get the old ID from backup
  SELECT old_id_backup INTO rick_old_id
  FROM public.users
  WHERE email = 'rick@rickemail.com';

  IF rick_old_id IS NOT NULL THEN
    -- Update matches table (user_id column)
    UPDATE public.matches
    SET user_id = rick_new_id
    WHERE user_id = rick_old_id;

    -- Update matches table (matched_user_id column)
    UPDATE public.matches
    SET matched_user_id = rick_new_id
    WHERE matched_user_id = rick_old_id;

    -- Update messages table (sender_id column)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
      UPDATE public.messages
      SET sender_id = rick_new_id
      WHERE sender_id = rick_old_id;

      -- Update messages table (recipient_id column)
      UPDATE public.messages
      SET recipient_id = rick_new_id
      WHERE recipient_id = rick_old_id;
    END IF;

    -- Update notifications table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
      UPDATE public.notifications
      SET user_id = rick_new_id
      WHERE user_id = rick_old_id;
    END IF;

    -- Update notification_preferences table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_preferences') THEN
      UPDATE public.notification_preferences
      SET user_id = rick_new_id
      WHERE user_id = rick_old_id;
    END IF;

    RAISE NOTICE 'Updated all references for Rick (old: %, new: %)', rick_old_id, rick_new_id;
  ELSE
    RAISE NOTICE 'No old_id_backup found for Rick - migration may have already been done';
  END IF;
END $$;

-- ============================================
-- REPEAT FOR EACH ADDITIONAL USER:
-- Copy this template and fill in the values
-- ============================================

-- DO $$
-- DECLARE
--   user_old_id UUID;
--   user_new_id UUID := 'NEW-UUID-HERE';
-- BEGIN
--   SELECT old_id_backup INTO user_old_id
--   FROM public.users
--   WHERE email = 'user@example.com';
--
--   IF user_old_id IS NOT NULL THEN
--     UPDATE public.matches SET user_id = user_new_id WHERE user_id = user_old_id;
--     UPDATE public.matches SET matched_user_id = user_new_id WHERE matched_user_id = user_old_id;
--     UPDATE public.messages SET sender_id = user_new_id WHERE sender_id = user_old_id;
--     UPDATE public.messages SET recipient_id = user_new_id WHERE recipient_id = user_old_id;
--     UPDATE public.notifications SET user_id = user_new_id WHERE user_id = user_old_id;
--     UPDATE public.notification_preferences SET user_id = user_new_id WHERE user_id = user_old_id;
--
--     RAISE NOTICE 'Updated all references for user (old: %, new: %)', user_old_id, user_new_id;
--   END IF;
-- END $$;


-- ============================================
-- Step 4: Verify the migration worked
-- ============================================

-- Check that Rick now has the new ID
SELECT
  id,
  email,
  first_name,
  last_name,
  old_id_backup,
  'Migration: ' || CASE
    WHEN old_id_backup IS NOT NULL AND old_id_backup != id
    THEN '✓ MIGRATED'
    ELSE '- NOT MIGRATED'
  END as status
FROM public.users
WHERE email = 'rick@rickemail.com';

-- Check that foreign keys were updated
SELECT
  'Rick''s matches as user_id' as description,
  COUNT(*) as count
FROM public.matches
WHERE user_id = '6db16619-8406-40f2-8f3f-fae619cddd9f'
UNION ALL
SELECT
  'Rick''s matches as matched_user_id',
  COUNT(*)
FROM public.matches
WHERE matched_user_id = '6db16619-8406-40f2-8f3f-fae619cddd9f';

-- Show all migrated users
SELECT
  id,
  email,
  first_name,
  last_name,
  old_id_backup,
  created_at
FROM public.users
WHERE old_id_backup IS NOT NULL
ORDER BY email;

-- Count summary
SELECT
  COUNT(*) as total_migrated_users
FROM public.users
WHERE old_id_backup IS NOT NULL;

-- ============================================
-- Step 5: Clean up (ONLY after verifying everything works!)
-- ============================================

-- Uncomment and run this ONLY after you've verified everything works:
-- ALTER TABLE public.users DROP COLUMN IF EXISTS old_id_backup;
