-- Get Joe Blume's auth data to see if any metadata was stored
SELECT
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users
WHERE email = 'joe@joeblume.com';
