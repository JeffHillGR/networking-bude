-- Query to find the most popular organizations users want to check out
-- Shows how many users selected each organization in "Organizations I've Wanted to Check Out"
-- Run this query to see the ranked list:

SELECT
  organization,
  COUNT(*) as user_count,
  ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users WHERE organizations_interested IS NOT NULL AND array_length(organizations_interested, 1) > 0)), 1) as percentage_of_active_users
FROM
  users,
  UNNEST(organizations_interested) as organization
WHERE
  organizations_interested IS NOT NULL
GROUP BY
  organization
ORDER BY
  user_count DESC, organization ASC;
