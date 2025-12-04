-- Migration: Add Multi-Region Support
-- Run this in Supabase SQL Editor

-- 1. Add region column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS region TEXT;

-- 2. Add region_id column to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS region_id TEXT;

-- 3. Backfill existing users as grand-rapids (they're all GR users currently)
UPDATE public.users
SET region = 'grand-rapids'
WHERE region IS NULL;

-- 4. Backfill existing events as grand-rapids
UPDATE public.events
SET region_id = 'grand-rapids'
WHERE region_id IS NULL;

-- 5. Create index for faster region filtering
CREATE INDEX IF NOT EXISTS idx_users_region ON public.users(region);
CREATE INDEX IF NOT EXISTS idx_events_region_id ON public.events(region_id);

-- Verify the changes
SELECT 'Users with region' as check_type, COUNT(*) as count FROM public.users WHERE region IS NOT NULL
UNION ALL
SELECT 'Events with region_id', COUNT(*) FROM public.events WHERE region_id IS NOT NULL;
