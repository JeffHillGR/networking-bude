-- Comprehensive search for Athena typos (handles whitespace, case variations, etc.)

-- Find any organization that contains "athen" but isn't exactly "Athena"
WITH org_list AS (
  SELECT DISTINCT
    UNNEST(organizations_current) as org,
    'organizations_current' as source
  FROM users
  WHERE organizations_current IS NOT NULL
  UNION
  SELECT DISTINCT
    UNNEST(organizations_interested) as org,
    'organizations_interested' as source
  FROM users
  WHERE organizations_interested IS NOT NULL
)
SELECT
  org,
  source,
  length(org) as string_length,
  CASE
    WHEN org ILIKE '%athen%' THEN 'Contains Athen'
    ELSE 'Other'
  END as match_type
FROM org_list
WHERE org ILIKE '%athen%'
ORDER BY org;

-- Find specific users with the typo
SELECT
  id,
  email,
  first_name,
  last_name,
  organizations_current
FROM users
WHERE EXISTS (
  SELECT 1 FROM UNNEST(organizations_current) as org
  WHERE org ILIKE '%athen%' AND org != 'Athena'
);

-- Fix any variations of "Athena" typo in organizations_current
-- Uncomment to run:
-- UPDATE users
-- SET organizations_current = array(
--   SELECT CASE
--     WHEN elem ILIKE 'atenha' THEN 'Athena'
--     WHEN elem ILIKE '%athen%' AND elem != 'Athena' THEN 'Athena'
--     ELSE elem
--   END
--   FROM UNNEST(organizations_current) as elem
-- )
-- WHERE EXISTS (
--   SELECT 1 FROM UNNEST(organizations_current) as org
--   WHERE org ILIKE '%athen%' AND org != 'Athena'
-- );

-- Fix any variations in organizations_interested
-- UPDATE users
-- SET organizations_interested = array(
--   SELECT CASE
--     WHEN elem ILIKE 'atenha' THEN 'Athena'
--     WHEN elem ILIKE '%athen%' AND elem != 'Athena' THEN 'Athena'
--     ELSE elem
--   END
--   FROM UNNEST(organizations_interested) as elem
-- )
-- WHERE EXISTS (
--   SELECT 1 FROM UNNEST(organizations_interested) as org
--   WHERE org ILIKE '%athen%' AND org != 'Athena'
-- );
