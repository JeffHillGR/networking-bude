-- Reset connection between Joe and Jeff for testing
-- Run this in Supabase SQL Editor before each test

-- First, let's find the user IDs
DO $$
DECLARE
  joe_id UUID;
  jeff_id UUID;
BEGIN
  -- Get Joe's user ID
  SELECT id INTO joe_id FROM public.users WHERE email = 'joe@joemail.com';

  -- Get Jeff's user ID
  SELECT id INTO jeff_id FROM public.users WHERE email = 'connections@networkingbude.com';

  -- Display the IDs
  RAISE NOTICE 'Joe ID: %', joe_id;
  RAISE NOTICE 'Jeff ID: %', jeff_id;

  -- Reset BOTH match rows to 'recommended' status
  -- This clears any pending/connected state
  UPDATE public.matches
  SET
    status = 'recommended',
    initiated_by_user_id = NULL,
    pending_since = NULL,
    perhaps_since = NULL,
    updated_at = NOW()
  WHERE (user_id = joe_id AND matched_user_id = jeff_id)
     OR (user_id = jeff_id AND matched_user_id = joe_id);

  RAISE NOTICE 'Reset % match rows', FOUND;
END $$;

-- Verify the reset
SELECT
  u1.email as user_email,
  u2.email as matched_user_email,
  m.status,
  m.initiated_by_user_id,
  m.pending_since
FROM public.matches m
JOIN public.users u1 ON m.user_id = u1.id
JOIN public.users u2 ON m.matched_user_id = u2.id
WHERE (u1.email = 'joe@joemail.com' AND u2.email = 'connections@networkingbude.com')
   OR (u1.email = 'connections@networkingbude.com' AND u2.email = 'joe@joemail.com')
ORDER BY u1.email;
