-- Verify Joe Blume's profile is now in the users table
SELECT
  id,
  email,
  first_name,
  last_name,
  title,
  company,
  industry,
  professional_interests,
  personal_interests,
  networking_goals
FROM public.users
WHERE email = 'joe@joeblume.com';
