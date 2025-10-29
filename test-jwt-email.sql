-- Test what auth.jwt() returns to debug the RLS policy
-- Run this while logged in as Joe Blume

SELECT
  auth.uid() as current_user_id,
  auth.jwt()->>'email' as jwt_email,
  auth.jwt()->>'sub' as jwt_sub,
  auth.jwt() as full_jwt;
