-- Find users who have "Atenha" (typo) instead of "Athena"

-- Check in organizations_current
SELECT
  id,
  email,
  first_name,
  last_name,
  organizations_current,
  'organizations_current' as field_name
FROM users
WHERE 'Atenha' = ANY(organizations_current);

-- Check in organizations_interested
SELECT
  id,
  email,
  first_name,
  last_name,
  organizations_interested,
  'organizations_interested' as field_name
FROM users
WHERE 'Atenha' = ANY(organizations_interested);

-- To fix the typo, run this after identifying the users:
-- UPDATE users
-- SET organizations_current = array_replace(organizations_current, 'Atenha', 'Athena')
-- WHERE 'Atenha' = ANY(organizations_current);

-- UPDATE users
-- SET organizations_interested = array_replace(organizations_interested, 'Atenha', 'Athena')
-- WHERE 'Atenha' = ANY(organizations_interested);
