-- Create matches table to store connection recommendations
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matched_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  compatibility_score INTEGER NOT NULL,
  match_reasons JSONB,
  status TEXT DEFAULT 'recommended' CHECK (status IN ('recommended', 'passed', 'saved', 'connected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate matches
  UNIQUE(user_id, matched_user_id)
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON public.matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_user_status ON public.matches(user_id, status);

-- Enable RLS
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Users can read their own matches
CREATE POLICY "Users can read their own matches"
ON public.matches
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own matches (change status)
CREATE POLICY "Users can update their own matches"
ON public.matches
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- System can insert matches (we'll handle this via service role)
CREATE POLICY "Service role can insert matches"
ON public.matches
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
