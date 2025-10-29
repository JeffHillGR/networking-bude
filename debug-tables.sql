-- Ultra simple - just count rows in each table

SELECT COUNT(*) FROM public.users;

SELECT COUNT(*) FROM public.matches;

SELECT COUNT(*) FROM public.notifications;

-- Show all notifications
SELECT * FROM public.notifications;

-- Show sample matches
SELECT * FROM public.matches LIMIT 10;
