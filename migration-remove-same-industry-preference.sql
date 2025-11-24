-- Migration: Remove same_industry_preference column
-- This field is no longer used in the matching algorithm
-- Run this in your Supabase SQL Editor

-- Drop the column from the users table
ALTER TABLE public.users DROP COLUMN IF EXISTS same_industry_preference;

-- Verify the column has been removed
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;
