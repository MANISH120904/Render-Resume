-- Render Resume — InsForge database schema (Feature 04)
-- Apply via InsForge MCP `run-raw-sql` or `insforge` CLI.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text,
  email text,
  current_credits integer NOT NULL DEFAULT 0,
  region_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title text,
  resume_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  selected_template text,
  target_storage_url text,
  last_downloaded_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS resumes_user_id_updated_at_idx
  ON public.resumes (user_id, updated_at DESC);

-- ---------------------------------------------------------------------------
-- Row level security — profiles
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ---------------------------------------------------------------------------
-- Row level security — resumes
-- ---------------------------------------------------------------------------

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY resumes_select_own ON public.resumes
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY resumes_insert_own ON public.resumes
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY resumes_update_own ON public.resumes
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY resumes_delete_own ON public.resumes
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Auto-create profile on OAuth signup
-- InsForge auth.users uses `profile` jsonb (e.g. { "name": "..." }), not Supabase raw_user_meta_data.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.profile ->> 'name', ''),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Storage RLS — resumes bucket (private, authenticated owner only)
-- Object key: resumes/{user_id}/{resume_id}.pdf
-- InsForge storage.objects uses `bucket` + `key` (not Supabase bucket_id/name).
-- ---------------------------------------------------------------------------

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY resumes_storage_select_own ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket = 'resumes'
    AND (storage.foldername(key))[1] = 'resumes'
    AND (storage.foldername(key))[2] = auth.uid()::text
  );

CREATE POLICY resumes_storage_insert_own ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket = 'resumes'
    AND (storage.foldername(key))[1] = 'resumes'
    AND (storage.foldername(key))[2] = auth.uid()::text
  );

CREATE POLICY resumes_storage_update_own ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket = 'resumes'
    AND (storage.foldername(key))[1] = 'resumes'
    AND (storage.foldername(key))[2] = auth.uid()::text
  )
  WITH CHECK (
    bucket = 'resumes'
    AND (storage.foldername(key))[1] = 'resumes'
    AND (storage.foldername(key))[2] = auth.uid()::text
  );

CREATE POLICY resumes_storage_delete_own ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket = 'resumes'
    AND (storage.foldername(key))[1] = 'resumes'
    AND (storage.foldername(key))[2] = auth.uid()::text
  );
