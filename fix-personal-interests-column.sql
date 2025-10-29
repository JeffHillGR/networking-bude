-- Fix personal_interests column type from text[] array to text string
-- The matching algorithm searches for keywords in the string, and all existing user data is stored as strings

ALTER TABLE public.users
ALTER COLUMN personal_interests TYPE text;

-- Verify the change
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name = 'personal_interests';
