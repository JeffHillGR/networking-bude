-- Check Joe Blume's profile data and potential match with Jeff Hill
-- Find Joe Blume's profile
SELECT
  'Joe Blume Profile' as section,
  id,
  first_name,
  last_name,
  email,
  industry,
  professional_interests,
  personal_interests,
  networking_goals
FROM public.users
WHERE first_name ILIKE '%Joe%' AND last_name ILIKE '%Blume%';

-- Find Jeff Hill's profile
SELECT
  'Jeff Hill Profile' as section,
  id,
  first_name,
  last_name,
  email,
  industry,
  professional_interests,
  personal_interests,
  networking_goals
FROM public.users
WHERE first_name ILIKE '%Jeff%' AND last_name ILIKE '%Hill%';

-- Check if Joe has any matches at all
SELECT
  'Joe Blume Match Count' as section,
  COUNT(*) as total_matches
FROM public.matches
WHERE user_id = (SELECT id FROM public.users WHERE first_name ILIKE '%Joe%' AND last_name ILIKE '%Blume%');

-- Check if there's a match record between Joe and Jeff
SELECT
  'Match Between Joe and Jeff' as section,
  m.*
FROM public.matches m
WHERE m.user_id = (SELECT id FROM public.users WHERE first_name ILIKE '%Joe%' AND last_name ILIKE '%Blume%')
  AND m.matched_user_id = (SELECT id FROM public.users WHERE first_name ILIKE '%Jeff%' AND last_name ILIKE '%Hill%');
