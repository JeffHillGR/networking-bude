-- Show Chantel's profile alongside all other users for manual comparison
-- Run this in Supabase SQL Editor

WITH chantel AS (
  SELECT
    networking_goals,
    organizations_current,
    organizations_interested,
    professional_interests,
    personal_interests,
    industry,
    gender,
    gender_preference,
    year_born,
    year_born_connect
  FROM users
  WHERE email = 'chantel@mittenhomeinfusion.com'
)
SELECT
  u.first_name || ' ' || u.last_name AS name,
  u.email,
  u.company,
  u.industry AS their_industry,
  c.industry AS chantel_industry,

  -- Show array overlaps
  COALESCE(array_length(
    ARRAY(SELECT unnest(u.organizations_current)
          INTERSECT
          SELECT unnest(c.organizations_current)), 1), 0) AS orgs_both_attend,

  COALESCE(array_length(
    ARRAY(SELECT unnest(u.organizations_current)
          INTERSECT
          SELECT unnest(c.organizations_interested)), 1), 0) AS they_attend_chantel_wants,

  COALESCE(array_length(
    ARRAY(SELECT unnest(c.organizations_current)
          INTERSECT
          SELECT unnest(u.organizations_interested)), 1), 0) AS chantel_attends_they_want,

  COALESCE(array_length(
    ARRAY(SELECT unnest(u.professional_interests)
          INTERSECT
          SELECT unnest(c.professional_interests)), 1), 0) AS prof_interests_overlap,

  COALESCE(array_length(
    ARRAY(SELECT unnest(u.personal_interests)
          INTERSECT
          SELECT unnest(c.personal_interests)), 1), 0) AS personal_interests_overlap,

  -- Show their data for manual review
  u.organizations_current AS their_orgs_current,
  u.organizations_interested AS their_orgs_interested,
  u.professional_interests AS their_prof_interests,
  u.personal_interests AS their_personal_interests,
  u.networking_goals AS their_goals,

  -- Show Chantel's data
  c.organizations_current AS chantel_orgs_current,
  c.organizations_interested AS chantel_orgs_interested,
  c.professional_interests AS chantel_prof_interests,
  c.personal_interests AS chantel_personal_interests,
  c.networking_goals AS chantel_goals

FROM users u
CROSS JOIN chantel c
WHERE u.email != 'chantel@mittenhomeinfusion.com'
ORDER BY
  orgs_both_attend DESC,
  they_attend_chantel_wants DESC,
  chantel_attends_they_want DESC,
  prof_interests_overlap DESC;
