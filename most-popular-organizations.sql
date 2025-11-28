-- Query to find the most popular organizations chosen during onboarding
-- Shows how many users selected each organization in "Where You Can Find Me Networking Now"
-- Run this query to see the ranked list:

SELECT
  organization,
  COUNT(*) as user_count,
  ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users WHERE organizations_current IS NOT NULL AND array_length(organizations_current, 1) > 0)), 1) as percentage_of_active_users
FROM
  users,
  UNNEST(organizations_current) as organization
WHERE
  organizations_current IS NOT NULL
GROUP BY
  organization
ORDER BY
  user_count DESC, organization ASC;
