-- ============================================================================
-- ANALYZE CONNECTION SUGGESTIONS AND COMPATIBILITY SCORES
-- Date: 2025-11-14
-- Purpose: Understand suggestion quality to decide if threshold should be raised
-- ============================================================================

-- Question 1: How many users have compatibility scores under 70%?
SELECT
  COUNT(DISTINCT user_id) as users_with_low_compatibility,
  ROUND(AVG(compatibility_score), 2) as avg_compatibility_for_these_users
FROM public.connection_flow
WHERE compatibility_score < 70;

-- Question 2: How many users have 0 suggested connections?
SELECT
  COUNT(*) as users_with_zero_suggestions
FROM (
  SELECT user_id, COUNT(*) as suggestion_count
  FROM public.connection_flow
  GROUP BY user_id
  HAVING COUNT(*) = 0
) zero_suggestions;

-- Alternative way to check users with zero suggestions (if some users aren't in the table at all)
SELECT
  (SELECT COUNT(*) FROM public.users) as total_users,
  (SELECT COUNT(DISTINCT user_id) FROM public.connection_flow) as users_with_suggestions,
  (SELECT COUNT(*) FROM public.users) - (SELECT COUNT(DISTINCT user_id) FROM public.connection_flow) as users_with_zero_suggestions;

-- Question 3: Average number of suggestions per user
SELECT
  ROUND(AVG(suggestion_count), 2) as avg_suggestions_per_user,
  MIN(suggestion_count) as min_suggestions,
  MAX(suggestion_count) as max_suggestions,
  ROUND(STDDEV(suggestion_count), 2) as std_deviation
FROM (
  SELECT user_id, COUNT(*) as suggestion_count
  FROM public.connection_flow
  GROUP BY user_id
) user_suggestions;

-- COMPREHENSIVE REPORT: All stats in one view
SELECT
  'Total Users in System' as metric,
  COUNT(*)::text as value
FROM public.users

UNION ALL

SELECT
  'Users with Suggestions' as metric,
  COUNT(DISTINCT user_id)::text as value
FROM public.connection_flow

UNION ALL

SELECT
  'Users with Zero Suggestions' as metric,
  ((SELECT COUNT(*) FROM public.users) - (SELECT COUNT(DISTINCT user_id) FROM public.connection_flow))::text as value

UNION ALL

SELECT
  'Total Suggested Connections' as metric,
  COUNT(*)::text as value
FROM public.connection_flow

UNION ALL

SELECT
  'Suggestions with Compatibility < 70%' as metric,
  COUNT(*)::text as value
FROM public.connection_flow
WHERE compatibility_score < 70

UNION ALL

SELECT
  'Avg Suggestions per User' as metric,
  ROUND(AVG(suggestion_count), 2)::text as value
FROM (
  SELECT user_id, COUNT(*) as suggestion_count
  FROM public.connection_flow
  GROUP BY user_id
) user_suggestions

UNION ALL

SELECT
  'Avg Compatibility Score (All)' as metric,
  ROUND(AVG(compatibility_score), 2)::text as value
FROM public.connection_flow

UNION ALL

SELECT
  'Avg Compatibility Score (< 70%)' as metric,
  ROUND(AVG(compatibility_score), 2)::text as value
FROM public.connection_flow
WHERE compatibility_score < 70;

-- Detailed breakdown by compatibility score ranges
SELECT
  CASE
    WHEN compatibility_score >= 90 THEN '90-100% (Excellent)'
    WHEN compatibility_score >= 80 THEN '80-89% (Very Good)'
    WHEN compatibility_score >= 70 THEN '70-79% (Good)'
    WHEN compatibility_score >= 60 THEN '60-69% (Fair)'
    WHEN compatibility_score >= 50 THEN '50-59% (Poor)'
    ELSE 'Below 50% (Very Poor)'
  END as compatibility_range,
  COUNT(*) as suggestion_count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.connection_flow), 2) as percentage_of_total
FROM public.connection_flow
GROUP BY
  CASE
    WHEN compatibility_score >= 90 THEN '90-100% (Excellent)'
    WHEN compatibility_score >= 80 THEN '80-89% (Very Good)'
    WHEN compatibility_score >= 70 THEN '70-79% (Good)'
    WHEN compatibility_score >= 60 THEN '60-69% (Fair)'
    WHEN compatibility_score >= 50 THEN '50-59% (Poor)'
    ELSE 'Below 50% (Very Poor)'
  END
ORDER BY MIN(compatibility_score) DESC;
