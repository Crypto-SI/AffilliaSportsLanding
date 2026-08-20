-- Consolidated player_applications schema for fresh installs (self-hosted Supabase)
-- Supersedes: 005_create_player_applications.sql, 006_create_player_applications.sql,
--             006_make_cv_optional.sql, 010_add_date_of_birth_to_player_applications.sql
-- Why: those four migrations conflict (BIGSERIAL vs UUID, NOT NULL CV fields the form
-- no longer sends, a trigger function referenced but never created). This file is the
-- net schema the CURRENT application code actually expects.
-- Date: 2026-08-20

CREATE TABLE IF NOT EXISTS public.player_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    date_of_birth DATE NOT NULL,
    position TEXT NOT NULL,
    experience_level TEXT NOT NULL,
    application_notes TEXT,
    cv_file_path TEXT,
    cv_file_name TEXT,
    cv_file_size BIGINT,
    cv_mime_type TEXT,
    metadata JSONB,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'reviewing', 'shortlisted', 'rejected', 'contacted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security: anon may insert applications and read them
-- (read is required by the API route's duplicate pre-check and INSERT...RETURNING)
ALTER TABLE public.player_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_anon_insert_applications" ON public.player_applications;
CREATE POLICY "allow_anon_insert_applications" ON public.player_applications
    FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "allow_anon_select_applications" ON public.player_applications;
CREATE POLICY "allow_anon_select_applications" ON public.player_applications
    FOR SELECT TO anon USING (true);

GRANT SELECT, INSERT ON public.player_applications TO anon;

-- Enforce the duplicate guard the API route expects (it handles 23505 as a friendly 409)
CREATE UNIQUE INDEX IF NOT EXISTS idx_player_applications_email_dob
    ON public.player_applications (email, date_of_birth);
CREATE INDEX IF NOT EXISTS idx_player_applications_created_at
    ON public.player_applications (created_at);
CREATE INDEX IF NOT EXISTS idx_player_applications_status
    ON public.player_applications (status);

-- updated_at maintenance
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_player_applications_updated_at ON public.player_applications;
CREATE TRIGGER update_player_applications_updated_at
    BEFORE UPDATE ON public.player_applications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CV storage bucket (upload UI currently disabled in code, but fully wired)
INSERT INTO storage.buckets (id, name, public)
VALUES ('player-cvs', 'player-cvs', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "allow_cv_uploads" ON storage.objects;
CREATE POLICY "allow_cv_uploads" ON storage.objects
    FOR INSERT TO anon
    WITH CHECK (bucket_id = 'player-cvs'
                AND storage.extension(name) IN ('pdf', 'doc', 'docx', 'txt'));

DROP POLICY IF EXISTS "allow_cv_downloads" ON storage.objects;
CREATE POLICY "allow_cv_downloads" ON storage.objects
    FOR SELECT TO anon USING (bucket_id = 'player-cvs');

GRANT SELECT, INSERT ON storage.objects TO anon;
