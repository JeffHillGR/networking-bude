-- BudE Analytics Report v2 - Works with current data
-- Run this in Supabase SQL Editor

-- === PLATFORM OVERVIEW ===
SELECT
  'PLATFORM OVERVIEW' as section,
  '' as metric,
  '' as value
UNION ALL
SELECT '', 'Total Users', COUNT(*)::text FROM public.users
UNION ALL
SELECT '', 'Total Potential Matches', COUNT(*)::text FROM public.matches
UNION ALL
SELECT '', 'Total Notifications Sent', COUNT(*)::text FROM public.notifications
UNION ALL
SELECT '', 'Notifications Read', COUNT(*)::text FROM public.notifications WHERE is_read = true
UNION ALL
SELECT '', 'Notifications Unread', COUNT(*)::text FROM public.notifications WHERE is_read = false;

-- === MATCH STATUS BREAKDOWN ===
SELECT
  'MATCH STATUS BREAKDOWN' as section,
  status as metric,
  COUNT(*)::text as value
FROM public.matches
GROUP BY status
ORDER BY COUNT(*) DESC;

-- === MATCH QUALITY SCORES ===
SELECT
  'MATCH QUALITY' as section,
  'Average Compatibility Score' as metric,
  ROUND(AVG(compatibility_score), 1)::text || '%' as value
FROM public.matches
UNION ALL
SELECT '', 'Highest Match Score', MAX(compatibility_score)::text || '%' FROM public.matches
UNION ALL
SELECT '', 'Lowest Match Score', MIN(compatibility_score)::text || '%' FROM public.matches;

-- === USER SIGNUP TIMELINE ===
SELECT
  'USER SIGNUPS BY DATE' as section,
  TO_CHAR(DATE(created_at), 'Mon DD, YYYY') as metric,
  COUNT(*)::text as value
FROM public.users
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC;

-- === INDUSTRY DISTRIBUTION ===
SELECT
  'USERS BY INDUSTRY' as section,
  COALESCE(industry, 'Not specified') as metric,
  COUNT(*)::text as value
FROM public.users
GROUP BY industry
ORDER BY COUNT(*) DESC;

-- === TOP MATCHED USERS ===
SELECT
  'TOP 10 USERS WITH MOST POTENTIAL MATCHES' as section,
  u.first_name || ' ' || u.last_name || ' (' || u.company || ')' as metric,
  COUNT(m.id)::text as value
FROM public.users u
LEFT JOIN public.matches m ON u.id = m.user_id
GROUP BY u.id, u.first_name, u.last_name, u.company
ORDER BY COUNT(m.id) DESC
LIMIT 10;

-- === POTENTIAL CONNECTIONS AVAILABLE ===
SELECT
  'AVAILABLE CONNECTIONS' as section,
  'Total Potential Matches Created' as metric,
  COUNT(*)::text as value
FROM public.matches
WHERE status = 'recommended'
UNION ALL
SELECT '', 'Pending Connection Requests', COUNT(*)::text FROM public.matches WHERE status = 'pending'
UNION ALL
SELECT '', 'Mutual Connections Made', COUNT(*)::text FROM public.matches WHERE status = 'connected'
UNION ALL
SELECT '', 'Saved for Later', COUNT(*)::text FROM public.matches WHERE status = 'saved'
UNION ALL
SELECT '', 'Declined', COUNT(*)::text FROM public.matches WHERE status = 'rejected';

-- === PROFESSIONAL INTERESTS ===
SELECT
  'TOP PROFESSIONAL INTERESTS' as section,
  interest as metric,
  COUNT(*)::text as value
FROM public.users,
LATERAL unnest(professional_interests) AS interest
WHERE professional_interests IS NOT NULL AND array_length(professional_interests, 1) > 0
GROUP BY interest
ORDER BY COUNT(*) DESC
LIMIT 10;
