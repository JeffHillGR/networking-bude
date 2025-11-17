-- ============================================================================
-- CHECK HERO BANNERS STATUS
-- Run this to see if your uploaded banners are saved and active
-- ============================================================================

-- Check all hero banners in the database
SELECT
  slot_number,
  image_url,
  click_url,
  alt_text,
  is_active,
  CASE
    WHEN is_active = true THEN '✅ ACTIVE - Will show in carousel'
    WHEN is_active = false THEN '❌ INACTIVE - Will NOT show'
    ELSE '⚠️ NULL - Will NOT show'
  END as status,
  created_at,
  updated_at
FROM public.hero_banners
ORDER BY slot_number;

-- Count active vs inactive banners
SELECT
  COUNT(*) FILTER (WHERE is_active = true) as active_banners,
  COUNT(*) FILTER (WHERE is_active = false OR is_active IS NULL) as inactive_banners,
  COUNT(*) as total_banners
FROM public.hero_banners;
