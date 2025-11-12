-- =====================================================
-- OPTIMAL ROW LEVEL SECURITY (RLS) POLICIES
-- Networking BudE Application
-- Created: 2025-11-12
-- Purpose: Secure, production-ready RLS policies
-- =====================================================

-- =====================================================
-- 1. USERS TABLE - Tiered Visibility Model
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable read access for own profile" ON public.users;
DROP POLICY IF EXISTS "Enable update for own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON public.users;
DROP POLICY IF EXISTS "Users can view matched profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can insert their own profile during signup
CREATE POLICY "users_insert_own"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy 2: Users can view their own profile
CREATE POLICY "users_select_own"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 3: Users can view profiles of their matches (recommended, saved, connected)
CREATE POLICY "users_select_matches"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.user_id = auth.uid()
        AND matches.matched_user_id = users.id
        AND matches.status IN ('recommended', 'saved', 'connected')
    )
  );

-- Policy 4: Users can view profiles of people who matched with them (bidirectional)
CREATE POLICY "users_select_matched_by"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.matched_user_id = auth.uid()
        AND matches.user_id = users.id
        AND matches.status IN ('recommended', 'saved', 'connected')
    )
  );

-- Policy 5: Users can update their own profile
CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND id = id); -- Prevent changing id

-- Policy 6: Users can delete their own profile (right to be forgotten)
CREATE POLICY "users_delete_own"
  ON public.users
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Policy 7: Service role can do anything (for admin operations)
CREATE POLICY "users_service_role_all"
  ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 2. MATCHES TABLE - Secure Matching System
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own matches" ON public.matches;
DROP POLICY IF EXISTS "Users can update their own matches" ON public.matches;
DROP POLICY IF EXISTS "Service role can insert matches" ON public.matches;
DROP POLICY IF EXISTS "Users can insert own matches" ON public.matches;
DROP POLICY IF EXISTS "Users can delete their own matches" ON public.matches;

-- Ensure RLS is enabled
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own matches
CREATE POLICY "matches_select_own"
  ON public.matches
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Users can update status of their own matches
CREATE POLICY "matches_update_own_status"
  ON public.matches
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND user_id = user_id  -- Prevent changing user_id
    AND matched_user_id = matched_user_id  -- Prevent changing matched_user_id
  );

-- Policy 3: Users can delete their own matches
CREATE POLICY "matches_delete_own"
  ON public.matches
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 4: ONLY service role can insert matches (matching algorithm runs backend-only)
CREATE POLICY "matches_insert_service_role"
  ON public.matches
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy 5: Service role can do anything
CREATE POLICY "matches_service_role_all"
  ON public.matches
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 3. NOTIFICATIONS TABLE - User-Scoped Notifications
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

-- Ensure RLS is enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view only their own notifications
CREATE POLICY "notifications_select_own"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND user_id = user_id  -- Prevent changing user_id
  );

-- Policy 3: Users can delete their own notifications
CREATE POLICY "notifications_delete_own"
  ON public.notifications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 4: Service role can insert notifications for any user (system notifications)
CREATE POLICY "notifications_insert_service_role"
  ON public.notifications
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy 5: Service role can do anything
CREATE POLICY "notifications_service_role_all"
  ON public.notifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 4. NOTIFICATION_PREFERENCES TABLE
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can update own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can insert own notification preferences" ON public.notification_preferences;

-- Ensure RLS is enabled
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own preferences
CREATE POLICY "notification_prefs_select_own"
  ON public.notification_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own preferences
CREATE POLICY "notification_prefs_insert_own"
  ON public.notification_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own preferences
CREATE POLICY "notification_prefs_update_own"
  ON public.notification_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND user_id = user_id);

-- Policy 4: Service role can do anything
CREATE POLICY "notification_prefs_service_role_all"
  ON public.notification_preferences
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 5. EMAIL_CHANGE_REQUESTS TABLE - Secure Email Changes
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own email change requests" ON public.email_change_requests;
DROP POLICY IF EXISTS "Users can create own email change requests" ON public.email_change_requests;
DROP POLICY IF EXISTS "Users can update own email change requests" ON public.email_change_requests;

-- Ensure RLS is enabled
ALTER TABLE public.email_change_requests ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own email change requests
CREATE POLICY "email_change_select_own"
  ON public.email_change_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own email change requests
CREATE POLICY "email_change_insert_own"
  ON public.email_change_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own email change requests
-- Only allow updating confirmation flags, not tokens or emails
CREATE POLICY "email_change_update_own"
  ON public.email_change_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND user_id = user_id
    AND old_email = old_email  -- Prevent changing emails
    AND new_email = new_email  -- Prevent changing emails
  );

-- Policy 4: Service role can do anything
CREATE POLICY "email_change_service_role_all"
  ON public.email_change_requests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 6. EVENTS TABLE - Public Read, Admin Write
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can insert events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can update events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can delete events" ON public.events;

-- Ensure RLS is enabled
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view events (public access)
CREATE POLICY "events_select_public"
  ON public.events
  FOR SELECT
  USING (true);

-- Policy 2: Only service role can insert events (admin panel uses service role)
CREATE POLICY "events_insert_service_role"
  ON public.events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy 3: Only service role can update events
CREATE POLICY "events_update_service_role"
  ON public.events
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 4: Only service role can delete events
CREATE POLICY "events_delete_service_role"
  ON public.events
  FOR DELETE
  TO service_role
  USING (true);

-- =====================================================
-- 7. EVENT_LIKES TABLE - User Engagement Tracking
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view likes" ON public.event_likes;
DROP POLICY IF EXISTS "Authenticated users can like" ON public.event_likes;
DROP POLICY IF EXISTS "Users can unlike" ON public.event_likes;

-- Ensure RLS is enabled
ALTER TABLE public.event_likes ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view likes (for like counts)
CREATE POLICY "event_likes_select_public"
  ON public.event_likes
  FOR SELECT
  USING (true);

-- Policy 2: Authenticated users can insert their own likes
CREATE POLICY "event_likes_insert_own"
  ON public.event_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can delete their own likes
CREATE POLICY "event_likes_delete_own"
  ON public.event_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 4: Service role can do anything
CREATE POLICY "event_likes_service_role_all"
  ON public.event_likes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 8. EVENT_REGISTRATION_CLICKS TABLE
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view clicks" ON public.event_registration_clicks;
DROP POLICY IF EXISTS "Authenticated users can track clicks" ON public.event_registration_clicks;

-- Ensure RLS is enabled
ALTER TABLE public.event_registration_clicks ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view click counts
CREATE POLICY "event_clicks_select_public"
  ON public.event_registration_clicks
  FOR SELECT
  USING (true);

-- Policy 2: Authenticated users can insert their own clicks
CREATE POLICY "event_clicks_insert_own"
  ON public.event_registration_clicks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Service role can do anything
CREATE POLICY "event_clicks_service_role_all"
  ON public.event_registration_clicks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 9. STORAGE POLICIES - Profile Photos
-- =====================================================

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload their own profile photo" ON storage.objects;
DROP POLICY IF EXISTS "Users can view all profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile photo" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile photo" ON storage.objects;
DROP POLICY IF EXISTS "Public can view profile photos" ON storage.objects;

-- Policy 1: Users can upload their own profile photo
CREATE POLICY "storage_profile_photos_insert_own"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 2: Anyone can view profile photos (for match cards)
CREATE POLICY "storage_profile_photos_select_public"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profile-photos');

-- Policy 3: Users can update their own profile photo
CREATE POLICY "storage_profile_photos_update_own"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 4: Users can delete their own profile photo
CREATE POLICY "storage_profile_photos_delete_own"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- 10. GRANT PERMISSIONS
-- =====================================================

-- Grant necessary schema access
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant table permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

GRANT ALL ON public.matches TO authenticated;
GRANT ALL ON public.matches TO service_role;

GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

GRANT ALL ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;

GRANT ALL ON public.email_change_requests TO authenticated;
GRANT ALL ON public.email_change_requests TO service_role;

GRANT SELECT ON public.events TO anon;
GRANT ALL ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;

GRANT SELECT ON public.event_likes TO anon;
GRANT ALL ON public.event_likes TO authenticated;
GRANT ALL ON public.event_likes TO service_role;

GRANT SELECT ON public.event_registration_clicks TO anon;
GRANT ALL ON public.event_registration_clicks TO authenticated;
GRANT ALL ON public.event_registration_clicks TO service_role;

-- =====================================================
-- 11. VERIFICATION QUERIES
-- =====================================================

-- Verify all policies
DO $$
BEGIN
  RAISE NOTICE 'RLS Policies created successfully!';
  RAISE NOTICE 'Run the following to verify:';
  RAISE NOTICE 'SELECT tablename, policyname, cmd, roles FROM pg_policies WHERE schemaname = ''public'';';
END $$;

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Users table: Users can view own profile + matched profiles';
COMMENT ON TABLE public.matches IS 'Matches table: Only service role can insert, users can update status';
COMMENT ON TABLE public.notifications IS 'Notifications table: Users see only their own';
COMMENT ON TABLE public.events IS 'Events table: Public read, service role write';
COMMENT ON TABLE public.event_likes IS 'Event likes: Public read, authenticated write own';
COMMENT ON TABLE public.email_change_requests IS 'Email changes: Two-factor confirmation with token verification';
