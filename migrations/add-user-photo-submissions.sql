-- Migration: Add user_photo_submissions table for user-submitted event photos
-- This table stores photo submissions that need admin review before being added to Event Moments

-- 1. Create the user_photo_submissions table
CREATE TABLE IF NOT EXISTS public.user_photo_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Submitter info (from logged-in user)
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  submitter_name TEXT NOT NULL,
  submitter_email TEXT NOT NULL,

  -- Event info
  event_name TEXT NOT NULL,
  event_date TEXT,
  notes TEXT,

  -- Photo URLs (stored in Supabase storage)
  photo_urls TEXT[] DEFAULT '{}',

  -- Review status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  review_notes TEXT,

  -- Region for filtering
  region_id TEXT DEFAULT 'grand-rapids'
);

-- 2. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_photo_submissions_status ON public.user_photo_submissions(status);
CREATE INDEX IF NOT EXISTS idx_user_photo_submissions_user_id ON public.user_photo_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_photo_submissions_created_at ON public.user_photo_submissions(created_at DESC);

-- 3. Enable RLS
ALTER TABLE public.user_photo_submissions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions"
  ON public.user_photo_submissions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own submissions
CREATE POLICY "Users can insert own submissions"
  ON public.user_photo_submissions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all submissions (check if user is admin)
CREATE POLICY "Admins can view all submissions"
  ON public.user_photo_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admins can update submissions (for review)
CREATE POLICY "Admins can update submissions"
  ON public.user_photo_submissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admins can delete submissions
CREATE POLICY "Admins can delete submissions"
  ON public.user_photo_submissions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 5. Create storage bucket for user submissions (run this in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('user-submissions', 'user-submissions', true);
