-- Check if Joe Blume and Jeff Hill matched with each other
SELECT
  u1.first_name || ' ' || u1.last_name as user,
  u2.first_name || ' ' || u2.last_name as matched_with,
  m.compatibility_score,
  m.match_reasons,
  m.status
FROM public.matches m
JOIN public.users u1 ON m.user_id = u1.id
JOIN public.users u2 ON m.matched_user_id = u2.id
WHERE
  (u1.first_name ILIKE '%Joe%' AND u1.last_name ILIKE '%Blume%' AND u2.first_name ILIKE '%Jeff%' AND u2.last_name ILIKE '%Hill%')
  OR
  (u1.first_name ILIKE '%Jeff%' AND u1.last_name ILIKE '%Hill%' AND u2.first_name ILIKE '%Joe%' AND u2.last_name ILIKE '%Blume%');
