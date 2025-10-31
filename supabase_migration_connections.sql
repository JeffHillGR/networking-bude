-- =====================================================
-- Supabase Migration: Connection Flow Improvements
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- This adds fields and functions for the new connection flow

-- Add timestamp columns to matches table
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS pending_since TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for better query performance on pending connections
CREATE INDEX IF NOT EXISTS idx_matches_pending_timeout
ON matches(user_id, status, pending_since)
WHERE status = 'pending';

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_matches_status
ON matches(user_id, status);

-- Function to reset stale pending connections (10+ days old)
CREATE OR REPLACE FUNCTION reset_stale_pending_connections()
RETURNS INTEGER AS $$
DECLARE
  rows_updated INTEGER;
BEGIN
  UPDATE matches
  SET status = 'recommended',
      pending_since = NULL
  WHERE status = 'pending'
    AND pending_since < NOW() - INTERVAL '10 days';

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run daily (requires pg_cron extension)
-- Uncomment if you want automatic cleanup:
/*
SELECT cron.schedule(
  'reset-stale-connections',
  '0 2 * * *',  -- Run at 2 AM daily
  $$SELECT reset_stale_pending_connections()$$
);
*/

-- Update any existing pending connections to have pending_since timestamp
UPDATE matches
SET pending_since = updated_at
WHERE status = 'pending'
  AND pending_since IS NULL
  AND updated_at IS NOT NULL;

-- Set updated_at for existing rows that don't have it
UPDATE matches
SET updated_at = NOW()
WHERE updated_at IS NULL;

-- =====================================================
-- Notes:
-- =====================================================
-- 1. The 'perhaps' status is now supported (no schema change needed, just using the status column)
-- 2. The 'passed' status already exists for "No Thanks" - connections won't be shown again
-- 3. The 'connected' status is used for mutual connections
-- 4. Connections automatically reset from 'pending' to 'recommended' after 10 days
