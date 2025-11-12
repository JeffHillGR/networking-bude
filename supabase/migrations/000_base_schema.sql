-- Base schema migration - Sets up all existing tables
-- Converted from remote schema dump with proper table ordering

-- Create users table first (referenced by other tables)
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  photo text,
  title text,
  company text,
  industry text,
  location text,
  networking_goals text,
  organizations_current TEXT[],
  organizations_interested TEXT[],
  professional_interests TEXT[],
  gender text,
  gender_preference text,
  age_range text,
  age_preference text,
  connection_count integer DEFAULT 0,
  max_connections integer DEFAULT 10,
  last_suggestion_sent_at timestamp with time zone,
  next_suggestion_due_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  first_name text,
  last_name text,
  username text,
  year_born integer,
  year_born_connect text,
  zip_code text,
  zip_code_radius integer,
  same_industry_preference text,
  organizations_other text,
  organizations_to_check_out_other text,
  professional_interests_other text,
  personal_interests text,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Now create tables that reference users
CREATE TABLE public.connection_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  suggested_user_id uuid,
  shown_at timestamp with time zone DEFAULT now(),
  action text CHECK (action = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'ignored'::text])),
  times_shown integer DEFAULT 1,
  CONSTRAINT connection_history_pkey PRIMARY KEY (id),
  CONSTRAINT connection_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT connection_history_suggested_user_id_fkey FOREIGN KEY (suggested_user_id) REFERENCES public.users(id)
);

CREATE TABLE public.connections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  connected_user_id uuid,
  status text NOT NULL CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT connections_pkey PRIMARY KEY (id),
  CONSTRAINT connections_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT connections_connected_user_id_fkey FOREIGN KEY (connected_user_id) REFERENCES public.users(id)
);

-- Events table references auth.users (built-in Supabase auth)
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  short_description text,
  full_description text,
  date text NOT NULL,
  time text NOT NULL,
  location_name text NOT NULL,
  full_address text,
  image_url text,
  event_badge text DEFAULT 'In-Person'::text CHECK (event_badge = ANY (ARRAY['In-Person'::text, 'Virtual'::text, 'Hybrid'::text])),
  organization text,
  organization_custom text,
  organizer_description text,
  tags text,
  registration_url text NOT NULL,
  is_featured boolean DEFAULT false,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  slot_number integer UNIQUE CHECK (slot_number >= 1 AND slot_number <= 7),
  CONSTRAINT events_pkey PRIMARY KEY (id)
  -- Note: Removed auth.users FK constraint as it may not exist in local dev
);

CREATE TABLE public.featured_content (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  link_url text,
  sponsor text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT featured_content_pkey PRIMARY KEY (id)
);

CREATE TABLE public.matches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  matched_user_id uuid NOT NULL,
  compatibility_score integer NOT NULL,
  match_reasons jsonb,
  status text DEFAULT 'recommended'::text,
  pending_since timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT matches_pkey PRIMARY KEY (id),
  CONSTRAINT matches_user_id_matched_user_id_key UNIQUE (user_id, matched_user_id),
  CONSTRAINT matches_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT matches_matched_user_id_fkey FOREIGN KEY (matched_user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  from_user_id uuid,
  type text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT notifications_from_user_id_fkey FOREIGN KEY (from_user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON public.matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_user_status ON public.matches(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read their own matches"
  ON public.matches FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own matches"
  ON public.matches FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow insert matches"
  ON public.matches FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (true);