-- Create flexible user_settings table with key-value pairs
-- This allows adding new settings without schema migrations

CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, setting_key)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_key ON public.user_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_key ON public.user_settings(user_id, setting_key);

-- Enable Row Level Security
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own settings"
  ON public.user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
  ON public.user_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to set default notification preferences for new users
CREATE OR REPLACE FUNCTION set_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default notification settings
  INSERT INTO public.user_settings (user_id, setting_key, setting_value) VALUES
    -- Email notifications (connection requests ON, others OFF)
    (NEW.id, 'email_connection_requests', 'true'),
    (NEW.id, 'email_new_matches', 'true'), 
    (NEW.id, 'email_messages', 'false'),
    (NEW.id, 'email_event_reminders', 'false'),
    (NEW.id, 'email_weekly_digest', 'false'),
    
    -- In-app notifications (connection requests always ON, new matches ON, others OFF)
    (NEW.id, 'inapp_connection_requests', 'true'),
    (NEW.id, 'inapp_new_matches', 'true'),
    (NEW.id, 'inapp_messages', 'false'),
    (NEW.id, 'inapp_event_reminders', 'false')
  ON CONFLICT (user_id, setting_key) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default settings for new users
DROP TRIGGER IF EXISTS trigger_set_default_user_settings ON public.users;
CREATE TRIGGER trigger_set_default_user_settings
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION set_default_user_settings();

-- Helper function to get user setting with default fallback
CREATE OR REPLACE FUNCTION get_user_setting(p_user_id UUID, p_setting_key TEXT, p_default_value TEXT DEFAULT 'false')
RETURNS TEXT AS $$
DECLARE
  setting_value TEXT;
BEGIN
  SELECT setting_value INTO setting_value
  FROM public.user_settings
  WHERE user_id = p_user_id AND setting_key = p_setting_key;
  
  RETURN COALESCE(setting_value, p_default_value);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to set user setting (upsert)
CREATE OR REPLACE FUNCTION set_user_setting(p_user_id UUID, p_setting_key TEXT, p_setting_value TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_settings (user_id, setting_key, setting_value, updated_at)
  VALUES (p_user_id, p_setting_key, p_setting_value, NOW())
  ON CONFLICT (user_id, setting_key)
  DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.user_settings IS 'Flexible user settings with key-value pairs. Default notification preferences: email_connection_requests=true, email_new_matches=true, all others=false';