-- Create player applications table for CV uploads and application tracking
CREATE TABLE public.player_applications (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    position TEXT,
    experience_level TEXT,
    cv_file_path TEXT NOT NULL,
    cv_file_name TEXT NOT NULL,
    cv_file_size BIGINT,
    cv_mime_type TEXT NOT NULL,
    application_notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'shortlisted', 'rejected', 'contacted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on the table
ALTER TABLE public.player_applications ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for CV files
INSERT INTO storage.buckets (id, name, public)
VALUES ('player-cvs', 'player-cvs', false);

-- Grant table permissions to anon role for applications
GRANT SELECT, INSERT ON public.player_applications TO anon;
GRANT USAGE, SELECT ON SEQUENCE player_applications_id_seq TO anon;

-- Grant storage permissions to anon role for CV uploads
GRANT SELECT, INSERT ON storage.objects TO anon;

-- Create RLS policy for anon users to insert applications
CREATE POLICY "allow_anon_insert_applications" ON public.player_applications
FOR INSERT 
TO anon
WITH CHECK (true);

-- Create RLS policy for anon users to view their own applications (optional)
CREATE POLICY "allow_anon_select_applications" ON public.player_applications
FOR SELECT 
TO anon
USING (true);

-- Create storage policy for CV uploads - allow anon uploads to player-cvs bucket
CREATE POLICY "allow_cv_uploads" ON storage.objects
FOR INSERT 
TO anon
WITH CHECK (bucket_id = 'player-cvs' AND storage.extension(name) IN ('pdf', 'doc', 'docx', 'txt'));

-- Create storage policy for CV downloads - allow anon to view uploaded CVs (for preview/confirmation)
CREATE POLICY "allow_cv_downloads" ON storage.objects
FOR SELECT 
TO anon
USING (bucket_id = 'player-cvs');

-- Add index for better query performance
CREATE INDEX idx_player_applications_email ON public.player_applications (email);
CREATE INDEX idx_player_applications_status ON public.player_applications (status);
CREATE INDEX idx_player_applications_created_at ON public.player_applications (created_at);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_player_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_player_applications_updated_at
    BEFORE UPDATE ON public.player_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_player_applications_updated_at(); 