-- Fix the matches table to reference public.users instead of auth.users
-- Run this in Supabase SQL Editor

-- Drop the existing table
DROP TABLE IF EXISTS public.matches CASCADE;

-- Recreate with correct foreign keys to public.users
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  matched_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  compatibility_score INTEGER NOT NULL,
  match_reasons JSONB,
  status TEXT DEFAULT 'recommended' CHECK (status IN ('recommended', 'passed', 'saved', 'connected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, matched_user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON public.matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_user_status ON public.matches(user_id, status);

-- Enable Row Level Security
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read their own matches"
ON public.matches FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own matches"
ON public.matches FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow insert matches"
ON public.matches FOR INSERT TO authenticated
WITH CHECK (true);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_matches_timestamp
BEFORE UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION update_matches_updated_at();
