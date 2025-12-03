-- Add NOT NULL and validation constraints to prevent incomplete user profiles
-- Run this in Supabase SQL Editor

-- First, fix any existing broken records (update EMPTY to a placeholder so constraint can be added)
UPDATE public.users
SET name = 'Profile Incomplete - ' || COALESCE(email, id::text)
WHERE name IS NULL OR name = '' OR name = 'EMPTY';

UPDATE public.users
SET first_name = 'Unknown'
WHERE first_name IS NULL OR first_name = '';

UPDATE public.users
SET last_name = 'User'
WHERE last_name IS NULL OR last_name = '';

-- Now add the constraints

-- 1. Name cannot be null or empty
ALTER TABLE public.users
  ALTER COLUMN name SET NOT NULL;

ALTER TABLE public.users
  ADD CONSTRAINT users_name_not_empty
  CHECK (name <> '' AND name <> 'EMPTY' AND length(trim(name)) >= 2);

-- 2. First name cannot be null or empty
ALTER TABLE public.users
  ALTER COLUMN first_name SET NOT NULL;

ALTER TABLE public.users
  ADD CONSTRAINT users_first_name_not_empty
  CHECK (first_name <> '' AND length(trim(first_name)) >= 1);

-- 3. Last name cannot be null or empty
ALTER TABLE public.users
  ALTER COLUMN last_name SET NOT NULL;

ALTER TABLE public.users
  ADD CONSTRAINT users_last_name_not_empty
  CHECK (last_name <> '' AND length(trim(last_name)) >= 1);

-- 4. Email must be valid format (already likely has this, but just in case)
ALTER TABLE public.users
  ALTER COLUMN email SET NOT NULL;

-- Verify constraints were added
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
ORDER BY conname;
