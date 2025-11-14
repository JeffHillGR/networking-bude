-- ============================================================================
-- CREATE hero_banners TABLE for Dashboard hero carousel
-- Date: 2025-11-14
-- Purpose: Store rotating hero banner images for dashboard
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.hero_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_number INTEGER NOT NULL CHECK (slot_number BETWEEN 1 AND 3),
  image_url TEXT NOT NULL,
  click_url TEXT,
  alt_text TEXT,
  target_zip TEXT,
  target_radius TEXT DEFAULT '50',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure only one banner per slot
  UNIQUE(slot_number)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hero_banners_slot ON public.hero_banners(slot_number);
CREATE INDEX IF NOT EXISTS idx_hero_banners_active ON public.hero_banners(is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- NOTE: Run add-admin-role-to-users.sql first to add is_admin column!
-- ============================================================================

-- Policy 1: Anyone (authenticated or anonymous) can view active banners
CREATE POLICY "Anyone can view active hero banners"
ON public.hero_banners
FOR SELECT
TO authenticated, anon
USING (is_active = true);

-- Policy 2: Admin users can SELECT all banners (including inactive)
CREATE POLICY "Admin users can view all hero banners"
ON public.hero_banners
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- Policy 3: Admin users can INSERT new banners
CREATE POLICY "Admin users can insert hero banners"
ON public.hero_banners
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- Policy 4: Admin users can UPDATE banners
CREATE POLICY "Admin users can update hero banners"
ON public.hero_banners
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- Policy 5: Admin users can DELETE banners
CREATE POLICY "Admin users can delete hero banners"
ON public.hero_banners
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_hero_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hero_banners_updated_at
BEFORE UPDATE ON public.hero_banners
FOR EACH ROW
EXECUTE FUNCTION update_hero_banners_updated_at();

-- Insert default placeholders (optional)
INSERT INTO public.hero_banners (slot_number, image_url, alt_text, is_active)
VALUES
  (1, 'https://via.placeholder.com/1200x300?text=Hero+Banner+1', 'Hero Banner 1', false),
  (2, 'https://via.placeholder.com/1200x300?text=Hero+Banner+2', 'Hero Banner 2', false),
  (3, 'https://via.placeholder.com/1200x300?text=Hero+Banner+3', 'Hero Banner 3', false)
ON CONFLICT (slot_number) DO NOTHING;

-- Verify table creation
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'hero_banners';

-- List all policies
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'hero_banners'
ORDER BY cmd;
