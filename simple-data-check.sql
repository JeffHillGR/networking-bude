-- Simple data check - see what data exists
-- Run this in Supabase SQL Editor

-- Check users table
SELECT 'Total Users' as metric, COUNT(*)::text as value FROM public.users
UNION ALL
SELECT 'Total Matches', COUNT(*)::text FROM public.matches
UNION ALL
SELECT 'Total Notifications', COUNT(*)::text FROM public.notifications
UNION ALL
SELECT 'Connected Matches', COUNT(*)::text FROM public.matches WHERE status = 'connected'
UNION ALL
SELECT 'Pending Matches', COUNT(*)::text FROM public.matches WHERE status = 'pending'
UNION ALL
SELECT 'Recommended Matches', COUNT(*)::text FROM public.matches WHERE status = 'recommended';

-- Show sample of matches table
SELECT
  'Sample Matches' as section,
  status,
  COUNT(*) as count
FROM public.matches
GROUP BY status
ORDER BY count DESC;

-- Show recent notifications
SELECT
  'Recent Notifications' as section,
  type,
  is_read,
  created_at
FROM public.notifications
ORDER BY created_at DESC
LIMIT 5;
