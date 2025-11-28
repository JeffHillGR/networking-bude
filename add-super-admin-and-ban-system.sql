-- ============================================================================
-- ADD SUPER ADMIN LEVEL AND USER BAN SYSTEM
-- Date: 2025-11-27
-- Purpose: Add super admin level for permanent ban capability
-- Security: Only super admins can permanently ban users
-- ============================================================================

-- ============================================================================
-- 1. Add admin_level and account_status columns to users table
-- ============================================================================

-- Add admin_level column (none, admin, super_admin)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS admin_level TEXT DEFAULT 'none'
CHECK (admin_level IN ('none', 'admin', 'super_admin'));

-- Add account_status column (active, banned)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active'
CHECK (account_status IN ('active', 'banned'));

-- Add ban_reason and banned_at for audit trail
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS ban_reason TEXT,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES public.users(id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_users_admin_level ON public.users(admin_level);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON public.users(account_status);

-- ============================================================================
-- 2. Migrate existing is_admin users to admin_level
-- ============================================================================

-- Update existing admins to super_admin level
-- (You can adjust this to 'admin' if you want to manually promote to super_admin later)
UPDATE public.users
SET admin_level = 'super_admin'
WHERE is_admin = true;

-- Update all other users to 'none'
UPDATE public.users
SET admin_level = 'none'
WHERE is_admin = false OR is_admin IS NULL;

-- ============================================================================
-- 3. Create moderation_actions audit log table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL, -- 'ban', 'unban', 'delete_message', etc.
  performed_by UUID NOT NULL REFERENCES public.users(id),
  target_user_id UUID REFERENCES public.users(id),
  target_resource_type TEXT, -- 'user', 'message', 'report', etc.
  target_resource_id UUID,
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on moderation_actions
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

-- Only admins can view moderation actions
CREATE POLICY "Admins can view moderation actions"
ON public.moderation_actions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND admin_level IN ('admin', 'super_admin')
  )
);

-- Only super admins can insert moderation actions
CREATE POLICY "Super admins can insert moderation actions"
ON public.moderation_actions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND admin_level = 'super_admin'
  )
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_moderation_actions_performed_by ON public.moderation_actions(performed_by);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_target_user ON public.moderation_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_created_at ON public.moderation_actions(created_at DESC);

-- Grant permissions
GRANT ALL ON public.moderation_actions TO authenticated;
GRANT ALL ON public.moderation_actions TO service_role;

-- ============================================================================
-- 4. Create helper functions
-- ============================================================================

-- Check if current user is super admin
CREATE OR REPLACE FUNCTION public.is_current_user_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND admin_level = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to ban a user (only callable by super admins)
CREATE OR REPLACE FUNCTION public.ban_user(
  target_user_id UUID,
  ban_reason_text TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  is_super_admin BOOLEAN;
BEGIN
  -- Check if current user is super admin
  SELECT admin_level = 'super_admin' INTO is_super_admin
  FROM public.users
  WHERE id = auth.uid();

  IF NOT is_super_admin THEN
    RAISE EXCEPTION 'Only super admins can ban users';
  END IF;

  -- Prevent banning yourself
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot ban yourself';
  END IF;

  -- Prevent banning other admins
  IF EXISTS (
    SELECT 1 FROM public.users
    WHERE id = target_user_id
    AND admin_level IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Cannot ban admin users';
  END IF;

  -- Ban the user
  UPDATE public.users
  SET
    account_status = 'banned',
    ban_reason = ban_reason_text,
    banned_at = NOW(),
    banned_by = auth.uid()
  WHERE id = target_user_id;

  -- Log the action
  INSERT INTO public.moderation_actions (
    action_type,
    performed_by,
    target_user_id,
    target_resource_type,
    reason
  ) VALUES (
    'ban',
    auth.uid(),
    target_user_id,
    'user',
    ban_reason_text
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. Update RLS policies to exclude banned users
-- ============================================================================

-- Drop existing policies that need updating
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;

-- Recreate with banned check
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  AND account_status != 'banned'
);

-- ============================================================================
-- 6. VERIFICATION
-- ============================================================================

-- Check admin levels
SELECT
  email,
  first_name,
  last_name,
  is_admin,
  admin_level,
  account_status,
  created_at
FROM public.users
WHERE admin_level IN ('admin', 'super_admin')
ORDER BY admin_level DESC, created_at;

-- Show total counts
SELECT
  admin_level,
  COUNT(*) as count
FROM public.users
GROUP BY admin_level
ORDER BY admin_level;

-- Check moderation_actions table exists
SELECT
  'Moderation actions table created' as status,
  COUNT(*) as action_count
FROM public.moderation_actions;
