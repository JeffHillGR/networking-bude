-- Migration: Add Region Support to Hero Banners + Add Slot 4
-- Run this in Supabase SQL Editor

-- 1. Add region_id column to hero_banners
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS region_id TEXT;

-- 2. Backfill existing banners as grand-rapids
UPDATE public.hero_banners
SET region_id = 'grand-rapids'
WHERE region_id IS NULL;

-- 3. Drop the old unique constraint on slot_number
ALTER TABLE public.hero_banners DROP CONSTRAINT IF EXISTS hero_banners_slot_number_key;

-- 4. Update CHECK constraint to allow slot 4 (for Regional Skyline Image)
-- First drop the old constraint
ALTER TABLE public.hero_banners DROP CONSTRAINT IF EXISTS hero_banners_slot_number_check;

-- Then add new constraint allowing 1-4
ALTER TABLE public.hero_banners ADD CONSTRAINT hero_banners_slot_number_check CHECK (slot_number BETWEEN 1 AND 4);

-- 5. Create new unique constraint on (slot_number, region_id)
-- This allows each region to have their own set of 4 banner slots
ALTER TABLE public.hero_banners
ADD CONSTRAINT hero_banners_slot_region_unique UNIQUE (slot_number, region_id);

-- 6. Create index for faster region filtering
CREATE INDEX IF NOT EXISTS idx_hero_banners_region_id ON public.hero_banners(region_id);

-- Verify the changes
SELECT slot_number, region_id, alt_text, is_active
FROM public.hero_banners
ORDER BY region_id, slot_number;
