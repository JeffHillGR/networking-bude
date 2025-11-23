-- ====================================================================
-- BudE Networking App - Database Migration
-- Remove: gender, gender_preference, year_born, year_born_connect
-- Add: groups_belong_to, looking_to_accomplish
-- ====================================================================

-- STEP 1: DROP old columns (gender and age related fields)
-- These columns are no longer used in the matching algorithm
ALTER TABLE users DROP COLUMN IF EXISTS gender;
ALTER TABLE users DROP COLUMN IF EXISTS gender_preference;
ALTER TABLE users DROP COLUMN IF EXISTS year_born;
ALTER TABLE users DROP COLUMN IF EXISTS year_born_connect;

-- STEP 2: ADD new columns (groups and goals)
-- groups_belong_to: Text field for comma-separated groups
ALTER TABLE users ADD COLUMN IF NOT EXISTS groups_belong_to TEXT;

-- looking_to_accomplish: Array field for user's networking goals (multi-select dropdown)
ALTER TABLE users ADD COLUMN IF NOT EXISTS looking_to_accomplish TEXT[];

-- photo: Text field for Supabase Storage public URL
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo TEXT;

-- ====================================================================
-- NOTES:
-- 1. Run this migration AFTER deploying the updated code to production
-- 2. The matching algorithm has been updated to use the new fields:
--    - Groups in Common: 12.5 points
--    - "Looking To" Overlap: 12.5 points
-- 3. New scoring breakdown (105 points total, capped at 100):
--    - Networking Goals: 25 (was 35)
--    - Organizations: 30 (was 40)
--    - Professional Interests: 15
--    - Industry: 5
--    - Groups in Common: 12.5 (NEW)
--    - "Looking To" Overlap: 12.5 (NEW)
--    - Personal Interests: 5
-- 4. After running this migration, re-run the matching algorithm for all users
-- ====================================================================
