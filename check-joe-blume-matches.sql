-- Check Joe Blume's matching data and scores

-- First, find Joe Blume's user ID and profile
SELECT
  id,
  email,
  first_name,
  last_name,
  company,
  industry,
  professional_interests,
  personal_interests,
  networking_goals
FROM public.users
WHERE first_name ILIKE '%Joe%' OR last_name ILIKE '%Blume%' OR email ILIKE '%joe%';

-- Check if Joe has any matches at all
SELECT
  'Joe Blume Matches' as section,
  COUNT(*) as total_matches
FROM public.matches m
JOIN public.users u ON m.user_id = u.id
WHERE u.first_name ILIKE '%Joe%' OR u.last_name ILIKE '%Blume%';

-- Check if Jeff Hill has matches
SELECT
  'Jeff Hill Matches' as section,
  COUNT(*) as total_matches
FROM public.matches m
JOIN public.users u ON m.user_id = u.id
WHERE u.first_name ILIKE '%Jeff%' AND u.last_name ILIKE '%Hill%';

-- Show Joe's specific matches with scores
SELECT
  u1.first_name || ' ' || u1.last_name as joe_name,
  u2.first_name || ' ' || u2.last_name as matched_with,
  m.compatibility_score,
  m.status,
  m.created_at
FROM public.matches m
JOIN public.users u1 ON m.user_id = u1.id
JOIN public.users u2 ON m.matched_user_id = u2.id
WHERE u1.first_name ILIKE '%Joe%' OR u1.last_name ILIKE '%Blume%'
ORDER BY m.compatibility_score DESC;

-- Check if there's a match between Joe and Jeff
SELECT
  'Joe <-> Jeff Match Check' as section,
  u1.first_name || ' ' || u1.last_name as user1,
  u2.first_name || ' ' || u2.last_name as user2,
  m.compatibility_score,
  m.status
FROM public.matches m
JOIN public.users u1 ON m.user_id = u1.id
JOIN public.users u2 ON m.matched_user_id = u2.id
WHERE (u1.first_name ILIKE '%Joe%' AND u2.first_name ILIKE '%Jeff%')
   OR (u1.first_name ILIKE '%Jeff%' AND u2.first_name ILIKE '%Joe%');
