-- Simple Analytics - Section by Section
-- Run each section separately in Supabase SQL Editor

-- === PLATFORM OVERVIEW ===
SELECT
  'Total Users' as metric,
  COUNT(*)::text as value
FROM public.users
UNION ALL
SELECT 'Total Potential Matches', COUNT(*)::text FROM public.matches
UNION ALL
SELECT 'Total Notifications Sent', COUNT(*)::text FROM public.notifications
UNION ALL
SELECT 'Notifications Read', COUNT(*)::text FROM public.notifications WHERE is_read = true
UNION ALL
SELECT 'Notifications Unread', COUNT(*)::text FROM public.notifications WHERE is_read = false;

-- === MATCH STATUS BREAKDOWN ===
SELECT
  status as metric,
  COUNT(*)::text as value
FROM public.matches
GROUP BY status
ORDER BY COUNT(*) DESC;

-- === MATCH QUALITY ===
SELECT
  'Average Compatibility Score' as metric,
  ROUND(AVG(compatibility_score), 1)::text || '%' as value
FROM public.matches
UNION ALL
SELECT 'Highest Match Score', MAX(compatibility_score)::text || '%' FROM public.matches
UNION ALL
SELECT 'Lowest Match Score', MIN(compatibility_score)::text || '%' FROM public.matches;

-- === USERS BY INDUSTRY ===
SELECT
  COALESCE(industry, 'Not specified') as metric,
  COUNT(*)::text as value
FROM public.users
GROUP BY industry
ORDER BY COUNT(*) DESC;

-- === TOP USERS WITH MOST MATCHES ===
SELECT
  u.first_name || ' ' || u.last_name || ' (' || COALESCE(u.company, 'No company') || ')' as user_name,
  COUNT(m.id)::text as total_matches
FROM public.users u
LEFT JOIN public.matches m ON u.id = m.user_id
GROUP BY u.id, u.first_name, u.last_name, u.company
ORDER BY COUNT(m.id) DESC
LIMIT 10;
