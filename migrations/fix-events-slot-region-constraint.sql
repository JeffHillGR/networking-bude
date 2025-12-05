-- Migration: Fix Events Slot Number Constraint for Multi-Region Support
-- Run this in Supabase SQL Editor

-- 1. Drop the old unique constraint on slot_number alone
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_slot_number_unique;
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_slot_number_key;

-- 2. Create new unique constraint on (slot_number, region_id)
-- This allows each region to have their own set of event slots (1-7)
ALTER TABLE public.events
ADD CONSTRAINT events_slot_region_unique UNIQUE (slot_number, region_id);

-- Verify the changes
SELECT slot_number, region_id, title, is_featured
FROM public.events
WHERE slot_number IS NOT NULL
ORDER BY region_id, slot_number;
