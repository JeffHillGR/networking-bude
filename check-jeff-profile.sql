-- Check Jeff Hill's profile data
SELECT *
FROM public.users
WHERE first_name ILIKE '%Jeff%' AND last_name ILIKE '%Hill%';
