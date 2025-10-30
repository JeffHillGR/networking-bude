-- Migrate Public Users to Auth Users
-- Fill in the user data below and run in Supabase SQL Editor

-- ============================================
-- INSTRUCTIONS:
-- 1. For each user, fill in their email and new UUID
-- 2. The script will create auth entries and migrate their data
-- 3. All existing connections, matches, etc. will be preserved
-- ============================================

-- ============================================
-- Step 1: Create temporary table to hold migration data
-- ============================================
CREATE TEMP TABLE user_migrations (
  old_id UUID,
  new_auth_id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  temp_password TEXT DEFAULT 'ChangeMe123!' -- They'll need to reset this
);

-- ============================================
-- Step 2: Insert migration data
-- Format: INSERT INTO user_migrations (old_id, new_auth_id, email, first_name, last_name) VALUES
-- ============================================

-- EXAMPLE (replace with actual data):
-- INSERT INTO user_migrations (old_id, new_auth_id, email, first_name, last_name) VALUES
-- ('old-uuid-1', 'new-uuid-1', 'user1@example.com', 'John', 'Doe'),
-- ('old-uuid-2', 'new-uuid-2', 'user2@example.com', 'Jane', 'Smith');

-- ADD YOUR USER DATA HERE:
INSERT INTO user_migrations (old_id, new_auth_id, email, first_name, last_name) VALUES
-- PASTE USER DATA BELOW THIS LINE:


-- END OF USER DATA

;

-- ============================================
-- Step 3: Verify the migration data
-- ============================================
SELECT * FROM user_migrations;

-- ============================================
-- Step 4: Create auth.users entries
-- NOTE: This requires admin privileges or use Supabase Dashboard
-- You may need to create these users manually in Supabase Auth UI
-- ============================================

-- Display SQL to create auth users (run these individually if needed)
SELECT
  format(
    'INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
     VALUES (%L, ''00000000-0000-0000-0000-000000000000'', %L, crypt(%L, gen_salt(''bf'')), now(), now(), now(), ''authenticated'', ''authenticated'');',
    new_auth_id,
    email,
    temp_password
  ) as create_auth_user_sql
FROM user_migrations;

-- ============================================
-- Step 5: Update public.users table
-- ============================================

-- First, let's backup the old data by creating new columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS old_id_backup UUID;

-- Update users table with new IDs
UPDATE public.users u
SET
  old_id_backup = u.id,
  id = m.new_auth_id
FROM user_migrations m
WHERE u.id = m.old_id;

-- ============================================
-- Step 6: Update all foreign key references
-- ============================================

-- Update matches table (user_id)
UPDATE public.matches
SET user_id = m.new_auth_id
FROM user_migrations m
WHERE matches.user_id = m.old_id;

-- Update matches table (matched_user_id)
UPDATE public.matches
SET matched_user_id = m.new_auth_id
FROM user_migrations m
WHERE matches.matched_user_id = m.old_id;

-- Update messages table (sender_id)
UPDATE public.messages
SET sender_id = m.new_auth_id
FROM user_migrations m
WHERE messages.sender_id = m.old_id;

-- Update messages table (recipient_id)
UPDATE public.messages
SET recipient_id = m.new_auth_id
FROM user_migrations m
WHERE messages.recipient_id = m.old_id;

-- Update notifications table
UPDATE public.notifications
SET user_id = m.new_auth_id
FROM user_migrations m
WHERE notifications.user_id = m.old_id;

-- Update notification_preferences table
UPDATE public.notification_preferences
SET user_id = m.new_auth_id
FROM user_migrations m
WHERE notification_preferences.user_id = m.old_id;

-- Add more UPDATE statements for any other tables with user references
-- Format:
-- UPDATE public.table_name
-- SET user_id_column = m.new_auth_id
-- FROM user_migrations m
-- WHERE table_name.user_id_column = m.old_id;

-- ============================================
-- Step 7: Verify the migration
-- ============================================

-- Check that all users now have auth entries
SELECT
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.old_id_backup,
  CASE WHEN au.id IS NOT NULL THEN '✓ HAS AUTH' ELSE '✗ NO AUTH' END as auth_status
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.old_id_backup IS NOT NULL;

-- Count migrated users
SELECT COUNT(*) as migrated_users
FROM public.users
WHERE old_id_backup IS NOT NULL;

-- Check that foreign keys were updated correctly
SELECT
  (SELECT COUNT(*) FROM public.matches WHERE user_id IN (SELECT new_auth_id FROM user_migrations)) as matches_user_id_updated,
  (SELECT COUNT(*) FROM public.matches WHERE matched_user_id IN (SELECT new_auth_id FROM user_migrations)) as matches_matched_user_id_updated,
  (SELECT COUNT(*) FROM public.messages WHERE sender_id IN (SELECT new_auth_id FROM user_migrations)) as messages_sender_updated,
  (SELECT COUNT(*) FROM public.messages WHERE recipient_id IN (SELECT new_auth_id FROM user_migrations)) as messages_recipient_updated;

-- ============================================
-- Step 8: Clean up (OPTIONAL - run after verifying everything works)
-- ============================================

-- Drop the backup column after you're sure everything works
-- ALTER TABLE public.users DROP COLUMN old_id_backup;

-- Drop the temp table
-- DROP TABLE IF EXISTS user_migrations;
