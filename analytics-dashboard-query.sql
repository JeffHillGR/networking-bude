-- BudE Analytics Dashboard Report
-- Run this in Supabase SQL Editor to get comprehensive platform metrics
-- Great for investors, strategists, and monitoring growth

-- Overall Platform Metrics
SELECT
  '=== PLATFORM OVERVIEW ===' as section,
  (SELECT COUNT(*) FROM public.users) as total_users,
  (SELECT COUNT(*) FROM public.matches WHERE status = 'connected') as total_connections_made,
  (SELECT COUNT(*) FROM public.matches WHERE status = 'pending') as pending_connection_requests,
  (SELECT COUNT(*) FROM public.notifications WHERE type = 'connection_request') as total_notifications_sent,
  (SELECT COUNT(*) FROM public.notifications WHERE type = 'connection_request' AND is_read = true) as notifications_read,
  ROUND(
    (SELECT COUNT(*)::numeric FROM public.notifications WHERE type = 'connection_request' AND is_read = true) /
    NULLIF((SELECT COUNT(*)::numeric FROM public.notifications WHERE type = 'connection_request'), 0) * 100,
    2
  ) as notification_open_rate_percent;

-- Connection Metrics
SELECT
  '=== CONNECTION METRICS ===' as section,
  COUNT(*) FILTER (WHERE status = 'recommended') as available_to_connect,
  COUNT(*) FILTER (WHERE status = 'pending') as awaiting_response,
  COUNT(*) FILTER (WHERE status = 'connected') as mutual_connections,
  COUNT(*) FILTER (WHERE status = 'saved') as saved_for_later,
  COUNT(*) FILTER (WHERE status = 'rejected') as declined,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'connected')::numeric /
    NULLIF(COUNT(*) FILTER (WHERE status IN ('pending', 'connected'))::numeric, 0) * 100,
    2
  ) as acceptance_rate_percent
FROM public.matches;

-- Last 7 Days Activity
SELECT
  '=== LAST 7 DAYS ACTIVITY ===' as section,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_7d,
  (SELECT COUNT(*) FROM public.matches WHERE updated_at >= NOW() - INTERVAL '7 days' AND status = 'connected') as new_connections_7d,
  (SELECT COUNT(*) FROM public.matches WHERE updated_at >= NOW() - INTERVAL '7 days' AND status = 'pending') as connection_requests_sent_7d,
  (SELECT COUNT(*) FROM public.notifications WHERE created_at >= NOW() - INTERVAL '7 days') as notifications_sent_7d
FROM public.users;

-- Last 24 Hours Activity
SELECT
  '=== LAST 24 HOURS ACTIVITY ===' as section,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as new_users_24h,
  (SELECT COUNT(*) FROM public.matches WHERE updated_at >= NOW() - INTERVAL '24 hours' AND status = 'connected') as new_connections_24h,
  (SELECT COUNT(*) FROM public.matches WHERE updated_at >= NOW() - INTERVAL '24 hours' AND status = 'pending') as connection_requests_sent_24h,
  (SELECT COUNT(*) FROM public.notifications WHERE created_at >= NOW() - INTERVAL '24 hours') as notifications_sent_24h
FROM public.users;

-- Most Active Users (by connections made)
SELECT
  '=== TOP 10 MOST CONNECTED USERS ===' as section,
  u.first_name || ' ' || u.last_name as user_name,
  u.email,
  u.company,
  COUNT(*) as total_connections
FROM public.matches m
JOIN public.users u ON m.user_id = u.id
WHERE m.status = 'connected'
GROUP BY u.id, u.first_name, u.last_name, u.email, u.company
ORDER BY total_connections DESC
LIMIT 10;

-- User Engagement Levels
SELECT
  '=== USER ENGAGEMENT BREAKDOWN ===' as section,
  COUNT(*) FILTER (WHERE connection_count = 0) as users_with_0_connections,
  COUNT(*) FILTER (WHERE connection_count BETWEEN 1 AND 3) as users_with_1_to_3_connections,
  COUNT(*) FILTER (WHERE connection_count BETWEEN 4 AND 10) as users_with_4_to_10_connections,
  COUNT(*) FILTER (WHERE connection_count > 10) as users_with_10_plus_connections,
  ROUND(AVG(connection_count), 2) as avg_connections_per_user
FROM (
  SELECT
    u.id,
    COUNT(m.id) FILTER (WHERE m.status = 'connected') as connection_count
  FROM public.users u
  LEFT JOIN public.matches m ON u.id = m.user_id
  GROUP BY u.id
) user_stats;

-- Industry Distribution
SELECT
  '=== USER INDUSTRY BREAKDOWN ===' as section,
  industry,
  COUNT(*) as user_count,
  ROUND(COUNT(*)::numeric / (SELECT COUNT(*)::numeric FROM public.users) * 100, 2) as percentage
FROM public.users
WHERE industry IS NOT NULL AND industry != ''
GROUP BY industry
ORDER BY user_count DESC
LIMIT 10;

-- Daily Growth Trend (Last 30 Days)
SELECT
  '=== DAILY NEW USER SIGNUPS (LAST 30 DAYS) ===' as section,
  DATE(created_at) as signup_date,
  COUNT(*) as new_users,
  SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as cumulative_users
FROM public.users
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY signup_date DESC;

-- Connection Activity by Day (Last 30 Days)
SELECT
  '=== DAILY CONNECTION ACTIVITY (LAST 30 DAYS) ===' as section,
  DATE(updated_at) as connection_date,
  COUNT(*) as connections_made
FROM public.matches
WHERE status = 'connected' AND updated_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(updated_at)
ORDER BY connection_date DESC;

-- Average Match Quality Score
SELECT
  '=== MATCH QUALITY ===' as section,
  ROUND(AVG(compatibility_score), 2) as avg_compatibility_score,
  MIN(compatibility_score) as min_score,
  MAX(compatibility_score) as max_score,
  ROUND(AVG(compatibility_score) FILTER (WHERE status = 'connected'), 2) as avg_score_for_connections,
  ROUND(AVG(compatibility_score) FILTER (WHERE status = 'rejected'), 2) as avg_score_for_rejected
FROM public.matches;

-- Notification Engagement
SELECT
  '=== NOTIFICATION ENGAGEMENT ===' as section,
  COUNT(*) as total_notifications,
  COUNT(*) FILTER (WHERE is_read = true) as read_notifications,
  COUNT(*) FILTER (WHERE is_read = false) as unread_notifications,
  ROUND(
    COUNT(*) FILTER (WHERE is_read = true)::numeric /
    NULLIF(COUNT(*)::numeric, 0) * 100,
    2
  ) as read_rate_percent,
  ROUND(
    EXTRACT(EPOCH FROM AVG(updated_at - created_at) FILTER (WHERE is_read = true)) / 60,
    2
  ) as avg_minutes_to_read
FROM public.notifications;

-- User Retention (users who came back after first connection)
SELECT
  '=== USER RETENTION ===' as section,
  COUNT(DISTINCT user_id) as total_users_who_connected,
  COUNT(DISTINCT user_id) FILTER (WHERE connection_count > 1) as users_who_connected_multiple,
  ROUND(
    COUNT(DISTINCT user_id) FILTER (WHERE connection_count > 1)::numeric /
    NULLIF(COUNT(DISTINCT user_id)::numeric, 0) * 100,
    2
  ) as retention_rate_percent
FROM (
  SELECT user_id, COUNT(*) as connection_count
  FROM public.matches
  WHERE status = 'connected'
  GROUP BY user_id
) user_connections;
