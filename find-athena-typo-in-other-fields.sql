-- Find "Atenha" typo in the "Other" text fields

-- Check in organizations_other (the "Other organization" field for current orgs)
SELECT
  id,
  email,
  first_name,
  last_name,
  organizations_other,
  'organizations_other' as field_name
FROM users
WHERE organizations_other ILIKE '%Atenha%';

-- Check in organizations_to_check_out_other
SELECT
  id,
  email,
  first_name,
  last_name,
  organizations_to_check_out_other,
  'organizations_to_check_out_other' as field_name
FROM users
WHERE organizations_to_check_out_other ILIKE '%Atenha%';

-- Also check for any variations
SELECT
  id,
  email,
  first_name,
  last_name,
  organizations_other,
  organizations_to_check_out_other,
  organizations_current,
  organizations_interested
FROM users
WHERE
  organizations_other ILIKE '%athen%'
  OR organizations_to_check_out_other ILIKE '%athen%';
