-- Verify Joe Blume's data actually exists in the database
SELECT
  id,
  email,
  first_name,
  last_name,
  name,
  title,
  company,
  industry,
  professional_interests,
  personal_interests,
  networking_goals,
  created_at
FROM public.users
WHERE email = 'joe@joeblume.com';
